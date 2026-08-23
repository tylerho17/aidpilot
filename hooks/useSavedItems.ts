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
 * Per-user saved/handled flags for a given item type. Lazy-inits from device
 * storage, then merges in the signed-in user's cloud set while preserving any
 * removals made during an in-flight hydrate, and pushes local-only keys up.
 * Toggling writes local + best-effort cloud. Only sets state inside
 * async/subscription callbacks. Safe under AppChrome (client-only render).
 */
export function useSavedItems(type: SavedItemType) {
  const [ids, setIds] = useState<Set<string>>(() => readLocalSet(type));
  const locallyRemovedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    locallyRemovedRef.current.clear();

    async function hydrate(userId: string | null) {
      if (!userId) return;
      const cloud = await fetchCloudSet(userId, type);
      if (cancelled || !cloud) return;
      const local = readLocalSet(type);
      const locallyRemoved = locallyRemovedRef.current;
      const removedSnapshot = new Set(locallyRemoved);
      const merged = new Set([...local].filter((key) => !removedSnapshot.has(key)));
      for (const key of cloud) {
        if (!removedSnapshot.has(key)) merged.add(key);
      }
      setIds(merged);
      writeLocalSet(type, merged);
      const localOnly = [...local].filter((k) => !cloud.has(k) && !removedSnapshot.has(k));
      if (localOnly.length > 0) void pushLocalOnly(type, localOnly);
      for (const key of removedSnapshot) {
        if (!cloud.has(key)) locallyRemoved.delete(key);
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
  }, [type]);

  const toggle = useCallback(
    (key: string) => {
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          locallyRemovedRef.current.add(key);
          void removeCloudItem(type, key);
        } else {
          next.add(key);
          locallyRemovedRef.current.delete(key);
          void addCloudItem(type, key);
        }
        writeLocalSet(type, next);
        return next;
      });
    },
    [type]
  );

  const has = useCallback((key: string) => ids.has(key), [ids]);

  return { ids, has, toggle, count: ids.size };
}
