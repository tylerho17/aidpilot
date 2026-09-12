"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUserData } from "@/hooks/useUserData";
import { listDocs, uploadDoc, removeDoc, type StoredDoc, type UploadResult } from "@/lib/documents/vault";

/**
 * Loads and mutates the signed-in student's private documents. No-ops when
 * signed out (the vault is auth-gated). Only sets state inside async callbacks.
 */
export function useDocuments() {
  const { user, authReady } = useUserData();
  const [docSnapshot, setDocSnapshot] = useState<{ userId: string | null; docs: StoredDoc[] }>({
    userId: null,
    docs: [],
  });
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const currentUserIdRef = useRef<string | null>(null);
  const loadVersionRef = useRef(0);
  const mutationVersionRef = useRef(0);

  const refresh = useCallback(async (uid: string) => {
    const version = ++loadVersionRef.current;
    const list = await listDocs(uid);
    if (currentUserIdRef.current === uid && loadVersionRef.current === version) {
      setDocSnapshot({ userId: uid, docs: list });
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const uid = user?.id ?? null;
    currentUserIdRef.current = uid;
    const version = ++loadVersionRef.current;
    mutationVersionRef.current += 1;
    let cancelled = false;
    void (async () => {
      setBusy(false);
      setLoading(!!uid);
      if (!uid) {
        setDocSnapshot({ userId: null, docs: [] });
        return;
      }
      const list = await listDocs(uid);
      if (!cancelled && currentUserIdRef.current === uid && loadVersionRef.current === version) {
        setDocSnapshot({ userId: uid, docs: list });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      const uid = user?.id;
      if (!uid) return { ok: false, reason: "failed" };
      const mutationVersion = ++mutationVersionRef.current;
      setBusy(true);
      try {
        const res = await uploadDoc(uid, file);
        if (res.ok) await refresh(uid);
        return res;
      } finally {
        if (currentUserIdRef.current === uid && mutationVersionRef.current === mutationVersion) {
          setBusy(false);
        }
      }
    },
    [user?.id, refresh]
  );

  const remove = useCallback(
    async (path: string) => {
      const uid = user?.id;
      if (!uid) return;
      const mutationVersion = ++mutationVersionRef.current;
      setBusy(true);
      try {
        await removeDoc(path);
        await refresh(uid);
      } finally {
        if (currentUserIdRef.current === uid && mutationVersionRef.current === mutationVersion) {
          setBusy(false);
        }
      }
    },
    [user?.id, refresh]
  );

  const uid = user?.id ?? null;
  const docs = docSnapshot.userId === uid ? docSnapshot.docs : [];

  return { signedIn: !!user, authReady, docs, loading, busy, upload, remove };
}
