"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isRecoverableWithLocalFallback } from "@/lib/friendly-errors";
import {
  canUseFafsaProgressStorage,
  readFafsaProgressLocal,
  writeFafsaProgressLocal,
} from "@/lib/fafsa/progress-store";
import {
  FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE,
  fetchCloudFafsaProgress,
  getAuthenticatedUserId,
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
  return isRecoverableWithLocalFallback(error) ? "local-only" : "sync-error";
}

export function useFafsaProgress() {
  const [completedPlanKeys, setCompletedPlanKeys] = useState<string[]>(readInitialCompletedKeys);
  const [syncStatus, setSyncStatus] = useState<FafsaProgressSyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const applySyncFailure = useCallback((error: unknown) => {
    console.error("FAFSA progress cloud sync failed:", error);
    setSyncStatus(syncStatusForError(error));
    setSyncMessage(FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE);
  }, []);

  const persistLocal = useCallback((keys: string[], userId?: string | null) => {
    const normalized = normalizeCompletedKeys(keys);
    setCompletedPlanKeys(normalized);
    writeFafsaProgressLocal(normalized, userId ?? userIdRef.current);
    return normalized;
  }, []);

  const hydrateFromCloud = useCallback(
    async (userId: string) => {
      userIdRef.current = userId;
      const localKeys = normalizeCompletedKeys(readFafsaProgressLocal(userId).completedPlanKeys);
      setCompletedPlanKeys(localKeys);
      const { completedPlanKeys: cloudKeys, error } = await fetchCloudFafsaProgress(userId);

      if (userIdRef.current !== userId) {
        return;
      }

      if (error) {
        applySyncFailure(error);
        return;
      }

      const merged = mergeCompletedPlanKeys(localKeys, normalizeCompletedKeys(cloudKeys));
      persistLocal(merged, userId);
      setSyncStatus("synced");
      setSyncMessage(null);

      const onlyLocal = merged.filter((key) => !cloudKeys.includes(key));
      if (onlyLocal.length > 0) {
        const pushResult = await pushCloudFafsaProgress(userId, onlyLocal);
        if (userIdRef.current !== userId) {
          return;
        }
        if (pushResult.error) {
          applySyncFailure(pushResult.error);
        }
      }
    },
    [applySyncFailure, persistLocal]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const userId = await getAuthenticatedUserId();
      if (cancelled) return;

      if (!userId) {
        userIdRef.current = null;
        setCompletedPlanKeys(normalizeCompletedKeys(readFafsaProgressLocal().completedPlanKeys));
        setSyncStatus("local-only");
        setSyncMessage(null);
        return;
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
      userIdRef.current = userId;

      if (!userId) {
        setCompletedPlanKeys(normalizeCompletedKeys(readFafsaProgressLocal().completedPlanKeys));
        setSyncStatus("local-only");
        setSyncMessage(null);
        return;
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
      const { error } = await upsertCloudFafsaStep(userId, planKey, completed);
      if (userIdRef.current !== userId) {
        return;
      }
      if (error) {
        applySyncFailure(error);
        return;
      }

      setSyncStatus("synced");
      setSyncMessage(null);
    },
    [applySyncFailure]
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
        writeFafsaProgressLocal(next, userIdRef.current);
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
        writeFafsaProgressLocal(next, userIdRef.current);
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
