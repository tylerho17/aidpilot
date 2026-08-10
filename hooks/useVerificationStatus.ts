"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";
import {
  EMPTY_STATUS,
  readLocalStatus,
  writeLocalStatus,
  fetchCloudStatus,
  upsertCloudStatus,
  type VerificationStatus,
} from "@/lib/verification/status";

/**
 * Owns the verification helper's remembered state. Lazy-inits from device-local
 * storage for the active user, then best-effort hydrates from the cloud for a
 * signed-in user. Signed-out state is intentionally session-only so one
 * student's verification details do not leak to the next browser user.
 */
export function useVerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus>({ ...EMPTY_STATUS });
  const userIdRef = useRef<string | null>(null);
  const touchedRef = useRef(false);
  const hydrateSeqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function hydrate(userId: string | null) {
      const seq = hydrateSeqRef.current + 1;
      hydrateSeqRef.current = seq;
      const userChanged = userIdRef.current !== userId;
      userIdRef.current = userId;
      if (userChanged) touchedRef.current = false;

      if (!userId) {
        setStatus({ ...EMPTY_STATUS });
        return;
      }

      const local = readLocalStatus(userId);
      setStatus(local);

      const cloud = await fetchCloudStatus(userId);
      if (cancelled || hydrateSeqRef.current !== seq || touchedRef.current) return;
      if (cloud.error) return;

      const next = cloud.status ?? { ...EMPTY_STATUS };
      setStatus(next);
      writeLocalStatus(next, userId);
    }

    void (async () => {
      const uid = await getAuthenticatedUserId();
      if (!cancelled) {
        await hydrate(uid);
      }
    })();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "TOKEN_REFRESHED") return;
      if (!cancelled) void hydrate(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      hydrateSeqRef.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  const update = useCallback((patch: Partial<VerificationStatus>) => {
    touchedRef.current = true;
    const userId = userIdRef.current;
    setStatus((prev) => {
      const next = { ...prev, ...patch };
      writeLocalStatus(next, userId);
      void upsertCloudStatus(next, userId);
      return next;
    });
  }, []);

  return { status, update };
}
