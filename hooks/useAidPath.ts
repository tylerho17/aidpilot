"use client";

import { useSyncExternalStore } from "react";
import {
  getAidPathServerSnapshot,
  getAidPathSnapshot,
  subscribeAidPath,
  type AidPathProfile,
} from "@/lib/aid-path/profile-store";

/** Reads the triage profile, re-rendering when it changes. */
export function useAidPath(): AidPathProfile {
  return useSyncExternalStore(subscribeAidPath, getAidPathSnapshot, getAidPathServerSnapshot);
}

/**
 * Aid-path triage answers are promised as device-local, so AI requests must not
 * receive a serialized copy of them. Keep this hook as the compatibility seam
 * for callers that already include an optional `context` field.
 */
export function useAidPathContext(): string {
  return "";
}
