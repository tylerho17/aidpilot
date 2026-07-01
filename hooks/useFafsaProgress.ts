"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  canUseFafsaProgressStorage,
  readFafsaProgressLocal,
  writeFafsaProgressLocal,
} from "@/lib/fafsa/progress-store";
import {
  FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE,
  fetchCloudFafsaProgress,
  getAuthenticatedUserId,
  isFafsaCloudSyncPaused,
  isFafsaProgressSyncRecoverable,
  markFafsaCloudSyncSuccess,
  mergeCompletedPlanKeys,
  pushCloudFafsaProgress,
  upsertCloudFafsaStep,
  type FafsaProgressSyncStatus,
} from "@/lib/fafsa/progress-sync";
import { FAFSA_STEPS, getNextIncompleteStep, type FafsaStep } from "@/lib/fafsa/steps";

function normalizeCompletedKeys(keys: string[]): string[] {
  const valid = new Set(FAFSA_STEPS.map((step) => step.planKey));
  return [...new Set(keys)].filter((key) => valid.has(key));
}

function readInitialCompletedKeys(): string[] {
  if (!canUseFafsaProgressStorage()) return [];
  return normalizeCompletedKeys(readFafsaProgressLocal().completedPlanKeys);
}

function syncStatusForError(error: unknown): FafsaProgressSyncStatus {
  return isFafsaProgressSyncRecoverable(error) ? "local-only" : "sync-error";
}

export function useFafsaProgress() {
  const [completedPlanKeys, setCompletedPlanKeys] = useState<string[]>(readInitialCompletedKeys);
  const [syncStatus, setSyncStatus] = useState<FafsaProgressSyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const hydrateInFlightRef = useRef<Promise<void> | null>(null);
  const syncFailureShownRef = useRef(false);

  const applyLocalOnlyFallback = useCallback((error?: unknown) => {
    setSyncStatus(error ? syncStatusForError(error) : "local-only");
    if (!syncFailureShownRef.current) {
      syncFailureShownRef.current = true;
      setSyncMessage(FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE);
    }
  }, []);

  const persistLocal = useCallback((keys: string[]) => {
    const normalized = normalizeCompletedKeys(keys);
    setCompletedPlanKeys(normalized);
    writeFafsaProgressLocal(normalized);
    return normalized;
  }, []);

  const hydrateFromCloud = useCallback(
    async (userId: string) => {
      if (hydrateInFlightRef.current) {
        await hydrateInFlightRef.current;
        return;
      }

      const hydratePromise = (async () => {
        userIdRef.current = userId;
        const localKeys = normalizeCompletedKeys(readFafsaProgressLocal().completedPlanKeys);

        if (isFafsaCloudSyncPaused()) {
          persistLocal(localKeys);
          applyLocalOnlyFallback();
          return;
        }

        const { completedPlanKeys: cloudKeys, error, skipped } = await fetchCloudFafsaProgress(userId);

        if (skipped) {
          persistLocal(localKeys);
          applyLocalOnlyFallback();
          return;
        }

        if (error) {
          persistLocal(localKeys);
          applyLocalOnlyFallback(error);
          return;
        }

        const merged = mergeCompletedPlanKeys(localKeys, normalizeCompletedKeys(cloudKeys));
        persistLocal(merged);
        setSyncStatus("synced");
        setSyncMessage(null);
        syncFailureShownRef.current = false;

        const onlyLocal = merged.filter((key) => !cloudKeys.includes(key));
        if (onlyLocal.length > 0) {
          const pushResult = await pushCloudFafsaProgress(userId, onlyLocal);
          if (pushResult.error) {
            applyLocalOnlyFallback(pushResult.error);
          }
        }
      })();

      hydrateInFlightRef.current = hydratePromise;
      try {
        await hydratePromise;
      } finally {
        if (hydrateInFlightRef.current === hydratePromise) {
          hydrateInFlightRef.current = null;
        }
      }
    },
    [applyLocalOnlyFallback, persistLocal]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const userId = await getAuthenticatedUserId();
      if (cancelled) return;

      if (!userId) {
        userIdRef.current = null;
        markFafsaCloudSyncSuccess();
        syncFailureShownRef.current = false;
        setSyncStatus("local-only");
        setSyncMessage(null);
        return;
      }

      if (userIdRef.current && userIdRef.current !== userId) {
        markFafsaCloudSyncSuccess();
        syncFailureShownRef.current = false;
      }

      await hydrateFromCloud(userId);
    }

    void bootstrap();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      const userId = session?.user?.id ?? null;

      if (!userId) {
        userIdRef.current = null;
        markFafsaCloudSyncSuccess();
        syncFailureShownRef.current = false;
        setSyncStatus("local-only");
        setSyncMessage(null);
        return;
      }

      if (userIdRef.current && userIdRef.current !== userId) {
        markFafsaCloudSyncSuccess();
        syncFailureShownRef.current = false;
      }

      void hydrateFromCloud(userId);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateFromCloud]);

  const syncStepToCloud = useCallback(
    async (planKey: string, completed: boolean) => {
      const userId = userIdRef.current ?? (await getAuthenticatedUserId());
      if (!userId) {
        setSyncStatus("local-only");
        setSyncMessage(null);
        return;
      }

      userIdRef.current = userId;

      if (isFafsaCloudSyncPaused()) {
        applyLocalOnlyFallback();
        return;
      }

      const { error, skipped } = await upsertCloudFafsaStep(userId, planKey, completed);
      if (skipped) {
        applyLocalOnlyFallback();
        return;
      }

      if (error) {
        applyLocalOnlyFallback(error);
        return;
      }

      setSyncStatus("synced");
      setSyncMessage(null);
      syncFailureShownRef.current = false;
    },
    [applyLocalOnlyFallback]
  );

  const isCompleted = useCallback(
    (planKey: string) => completedPlanKeys.includes(planKey),
    [completedPlanKeys]
  );

  const markComplete = useCallback(
    (planKey: string) => {
      if (!FAFSA_STEPS.some((step) => step.planKey === planKey)) return;
      let changed = false;
      setCompletedPlanKeys((prev) => {
        if (prev.includes(planKey)) return prev;
        changed = true;
        const next = normalizeCompletedKeys([...prev, planKey]);
        writeFafsaProgressLocal(next);
        return next;
      });
      if (changed) {
        void syncStepToCloud(planKey, true);
      }
    },
    [syncStepToCloud]
  );

  const markIncomplete = useCallback(
    (planKey: string) => {
      let changed = false;
      setCompletedPlanKeys((prev) => {
        if (!prev.includes(planKey)) return prev;
        changed = true;
        const next = normalizeCompletedKeys(prev.filter((key) => key !== planKey));
        writeFafsaProgressLocal(next);
        return next;
      });
      if (changed) {
        void syncStepToCloud(planKey, false);
      }
    },
    [syncStepToCloud]
  );

  const completionCount = completedPlanKeys.length;
  const nextIncompleteStep: FafsaStep | null = getNextIncompleteStep(completedPlanKeys);

  return {
    completedPlanKeys,
    completionCount,
    nextIncompleteStep,
    isCompleted,
    markComplete,
    markIncomplete,
    syncStatus,
    syncMessage,
  };
}
