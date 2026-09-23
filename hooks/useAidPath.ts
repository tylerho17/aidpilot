"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useUserData } from "@/hooks/useUserData";
import {
  clearLegacyAidPathProfile,
  EMPTY_AID_PATH,
  getAidPathServerSnapshot,
  getAidPathSnapshot,
  subscribeAidPath,
  type AidPathProfile,
} from "@/lib/aid-path/profile-store";
import { describeAidPath } from "@/lib/aid-path/guidance";

/** Reads the triage profile, re-rendering when it changes. */
export function useAidPath(): AidPathProfile {
  const { authReady, user } = useUserData();
  const userId = user?.id ?? null;
  const getSnapshot = useCallback(
    () => (authReady ? getAidPathSnapshot(userId) : EMPTY_AID_PATH),
    [authReady, userId]
  );
  useEffect(() => {
    if (authReady) clearLegacyAidPathProfile();
  }, [authReady, userId]);
  return useSyncExternalStore(subscribeAidPath, getSnapshot, getAidPathServerSnapshot);
}

/**
 * A compact, non-PII context string for personalizing AI answers - empty until
 * the student has done the triage (at least picked a form). Send it as the
 * `context` field to the ask endpoint.
 */
export function useAidPathContext(): string {
  const profile = useAidPath();
  if (profile.form === null) return "";
  return describeAidPath(profile).aiContext;
}
