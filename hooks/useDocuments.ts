"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserData } from "@/hooks/useUserData";
import { listDocs, uploadDoc, removeDoc, type StoredDoc, type UploadResult } from "@/lib/documents/vault";

/**
 * Loads and mutates the signed-in student's private documents. No-ops when
 * signed out (the vault is auth-gated). Only sets state inside async callbacks.
 */
export function useDocuments() {
  const { user, authReady } = useUserData();
  const [docs, setDocs] = useState<StoredDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async (uid: string) => {
    const list = await listDocs(uid);
    setDocs(list);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void (async () => {
      if (!user) {
        setDocs([]);
        return;
      }
      setLoading(true);
      const list = await listDocs(user.id);
      if (!cancelled) {
        setDocs(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!user) return { ok: false, reason: "failed" };
      setBusy(true);
      const res = await uploadDoc(user.id, file);
      if (res.ok) await refresh(user.id);
      setBusy(false);
      return res;
    },
    [user, refresh]
  );

  const remove = useCallback(
    async (path: string) => {
      if (!user) return;
      setBusy(true);
      await removeDoc(path);
      await refresh(user.id);
      setBusy(false);
    },
    [user, refresh]
  );

  return { signedIn: !!user, authReady, docs, loading, busy, upload, remove };
}
