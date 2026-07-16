"use client";

import { useSyncExternalStore } from "react";
import {
  getAidPathServerSnapshot,
  getAidPathSnapshot,
  subscribeAidPath,
  type AidPathProfile,
} from "@/lib/aid-path/profile-store";
import { describeAidPath } from "@/lib/aid-path/guidance";

/** Reads the triage profile, re-rendering when it changes. */
export function useAidPath(): AidPathProfile {
  return useSyncExternalStore(subscribeAidPath, getAidPathSnapshot, getAidPathServerSnapshot);
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
