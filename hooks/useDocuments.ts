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
  const [docs, setDocs] = useState<StoredDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const activeUserIdRef = useRef<string | null>(null);
  const loadVersionRef = useRef(0);

  const refresh = useCallback(async (uid: string, loadVersion: number) => {
    const list = await listDocs(uid);
    if (activeUserIdRef.current === uid && loadVersionRef.current === loadVersion) {
      setDocs(list);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const loadVersion = ++loadVersionRef.current;
    activeUserIdRef.current = user?.id ?? null;

    void (async () => {
      if (!user) {
        setDocs([]);
        setLoading(false);
        setBusy(false);
        return;
      }
      setLoading(true);
      const list = await listDocs(user.id);
      if (activeUserIdRef.current === user.id && loadVersionRef.current === loadVersion) {
        setDocs(list);
        setLoading(false);
      }
    })();

    return () => {
      if (loadVersionRef.current === loadVersion) {
        loadVersionRef.current += 1;
      }
    };
  }, [authReady, user]);

  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      if (!user) return { ok: false, reason: "failed" };
      const uid = user.id;
      const loadVersion = loadVersionRef.current;
      setBusy(true);
      const res = await uploadDoc(uid, file);
      if (res.ok) await refresh(uid, loadVersion);
      if (activeUserIdRef.current === uid && loadVersionRef.current === loadVersion) {
        setBusy(false);
      }
      return res;
    },
    [user, refresh]
  );

  const remove = useCallback(
    async (path: string) => {
      if (!user) return;
      const uid = user.id;
      const loadVersion = loadVersionRef.current;
      setBusy(true);
      await removeDoc(path);
      await refresh(uid, loadVersion);
      if (activeUserIdRef.current === uid && loadVersionRef.current === loadVersion) {
        setBusy(false);
      }
    },
    [user, refresh]
  );

  return { signedIn: !!user, authReady, docs, loading, busy, upload, remove };
}
