/**
 * Demo-mode switch - the single seam between mock and real data.
 *
 * The app's screens read data through `demoFallback(real, fixture)` (see
 * lib/demo/index.ts). Turning demo mode OFF - or simply having real rows in
 * Supabase - makes every screen render live data with no code changes.
 *
 * Resolution order:
 *   1. localStorage "aidpilot-demo" ("on" | "off") - runtime override for a
 *      quick toggle mid-demo without a rebuild.
 *   2. "aidpilot-demo" cookie ("on" | "off") - matches middleware access.
 *   3. NEXT_PUBLIC_DEMO_MODE env var ("true" | "false") - deploy-time default.
 *   4. Default: ON in development, OFF in production.
 */

const STORAGE_KEY = "aidpilot-demo";

function readDemoCookie(): "on" | "off" | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STORAGE_KEY}=`));
  const value = entry ? decodeURIComponent(entry.slice(STORAGE_KEY.length + 1)) : "";
  return value === "on" || value === "off" ? value : null;
}

export function isDemoEnabled(): boolean {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "on") return true;
      if (stored === "off") return false;
    } catch {
      // localStorage unavailable (private mode) - fall through to env.
    }
  }
  const cookie = readDemoCookie();
  if (cookie === "on") return true;
  if (cookie === "off") return false;

  const env = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (env === "true") return true;
  if (env === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function setDemoEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Ignore - env default still applies.
  }
  try {
    document.cookie = `${STORAGE_KEY}=${on ? "on" : "off"}; path=/; max-age=86400; samesite=lax`;
  } catch {
    // Ignore - cookie support may be disabled, but localStorage/env can still work.
  }
}

/** Ids of demo fixtures all start with this prefix so mutations can be
 * handled locally instead of hitting Supabase. */
export const DEMO_ID_PREFIX = "demo-";

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}
