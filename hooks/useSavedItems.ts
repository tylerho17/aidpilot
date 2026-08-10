"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";
import {
  readLocalSet,
  writeLocalSet,
  fetchCloudSet,
  addCloudItem,
  removeCloudItem,
  pushLocalOnly,
  type SavedItemType,
} from "@/lib/saved-items/store";

/**
 * Per-user saved/handled flags for a given item type. Signed-out users get an
 * anonymous device-local set; signed-in users get a user-scoped device cache
 * merged with their cloud set. Toggling writes local + best-effort cloud.
 */
export function useSavedItems(type: SavedItemType) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const userIdRef = useRef<string | null>(null);
  const hydrateSeqRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function hydrate(userId: string | null) {
      const seq = hydrateSeqRef.current + 1;
      hydrateSeqRef.current = seq;
      userIdRef.current = userId;
      if (!userId) {
        setIds(readLocalSet(type, null));
        return;
      }
      const local = readLocalSet(type, userId);
      setIds(local);
      const cloud = await fetchCloudSet(userId, type);
      if (cancelled || hydrateSeqRef.current !== seq || !cloud) return;
      const merged = new Set([...local, ...cloud]);
      setIds(merged);
      writeLocalSet(type, merged, userId);
      const localOnly = [...local].filter((k) => !cloud.has(k));
      if (localOnly.length > 0) void pushLocalOnly(type, localOnly, userId);
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
  }, [type]);

  const toggle = useCallback(
    (key: string) => {
      const userId = userIdRef.current;
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          void removeCloudItem(type, key, userId);
        } else {
          next.add(key);
          void addCloudItem(type, key, userId);
        }
        writeLocalSet(type, next, userId);
        return next;
      });
    },
    [type]
  );

  const has = useCallback((key: string) => ids.has(key), [ids]);

  return { ids, has, toggle, count: ids.size };
}
