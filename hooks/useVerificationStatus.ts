"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";
import {
  readLocalStatus,
  readLocalStatusSnapshot,
  writeLocalStatus,
  fetchCloudStatus,
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
  const [status, setStatus] = useState<VerificationStatus>(readLocalStatus);
  const touchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate(userId: string | null) {
      if (!userId || touchedRef.current) return;
      const cloud = await fetchCloudStatus(userId);
      if (cancelled || !cloud || touchedRef.current) return;
      const local = readLocalStatusSnapshot();
      if (!hasData(cloud.status)) return;

      if (hasData(local.status) && !sameStatus(local.status, cloud.status)) {
        const cloudIsNewer =
          local.updatedAt !== null &&
          cloud.updatedAt !== null &&
          new Date(cloud.updatedAt).getTime() > new Date(local.updatedAt).getTime();
        if (!cloudIsNewer) {
          void upsertCloudStatus(local.status);
          return;
        }
      }

      if (!sameStatus(local.status, cloud.status)) {
        setStatus(cloud.status);
        writeLocalStatus(cloud.status, cloud.updatedAt ?? undefined);
      }
    }

    void (async () => {
      const uid = await getAuthenticatedUserId();
      if (!cancelled) await hydrate(uid);
    })();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) void hydrate(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const update = useCallback((patch: Partial<VerificationStatus>) => {
    touchedRef.current = true;
    setStatus((prev) => {
      const next = { ...prev, ...patch };
      writeLocalStatus(next);
      void upsertCloudStatus(next);
      return next;
    });
  }, []);

  return { status, update };
}

function hasData(status: VerificationStatus): boolean {
  return Boolean(status.group || status.schoolName || status.filer !== "unsure");
}

function sameStatus(a: VerificationStatus, b: VerificationStatus): boolean {
  return a.group === b.group && a.filer === b.filer && a.schoolName === b.schoolName;
}
