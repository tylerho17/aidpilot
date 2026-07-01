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
 *   2. NEXT_PUBLIC_DEMO_MODE env var ("true" | "false") - deploy-time default.
 *   3. Default: ON in development, OFF in production.
 */

const STORAGE_KEY = "aidpilot-demo";

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
}

/** Ids of demo fixtures all start with this prefix so mutations can be
 * handled locally instead of hitting Supabase. */
export const DEMO_ID_PREFIX = "demo-";

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}
