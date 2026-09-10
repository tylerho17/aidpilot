"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";
import {
  EMPTY_STATUS,
  readLocalStatus,
  writeLocalStatus,
  fetchCloudStatus,
  hasVerificationStatus,
  upsertCloudStatus,
  type VerificationStatus,
} from "@/lib/verification/status";

/**
 * Owns the verification helper's remembered state. Lazy-inits from device-local
 * storage (instant, works signed-out), then best-effort hydrates from the cloud
 * for a signed-in user — but only if they haven't started interacting yet, so a
 * returning device never gets its in-progress answers overwritten. Every change
 * writes local + upserts the cloud. Safe under AppChrome (client-only render),
 * and only ever calls setState inside async/subscription callbacks.
 */
export function useVerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus>({ ...EMPTY_STATUS });
  const touchedRef = useRef(false);
  const activeUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    function enterScope(userId: string | null) {
      if (activeUserIdRef.current === userId) return;
      activeUserIdRef.current = userId;
      touchedRef.current = false;
      setStatus(readLocalStatus(userId));
    }

    async function hydrate(userId: string | null) {
      enterScope(userId);
      if (!userId || touchedRef.current) return;
      const local = readLocalStatus(userId);
      const cloud = await fetchCloudStatus(userId);
      if (cancelled || activeUserIdRef.current !== userId || touchedRef.current) return;
      if (hasVerificationStatus(cloud)) {
        setStatus(cloud);
        writeLocalStatus(cloud, userId);
      } else if (hasVerificationStatus(local)) {
        void upsertCloudStatus(local, userId);
      }
    }

    void (async () => {
      const uid = await getAuthenticatedUserId();
      if (!cancelled) await hydrate(uid);
    })();

    const subscription = (() => {
      try {
        const supabase = createClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!cancelled) void hydrate(session?.user?.id ?? null);
        });
        return subscription;
      } catch {
        return null;
      }
    })();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const update = useCallback((patch: Partial<VerificationStatus>) => {
    touchedRef.current = true;
    setStatus((prev) => {
      const next = { ...prev, ...patch };
      const userId = activeUserIdRef.current ?? null;
      writeLocalStatus(next, userId);
      void upsertCloudStatus(next, userId);
      return next;
    });
  }, []);

  return { status, update };
}
