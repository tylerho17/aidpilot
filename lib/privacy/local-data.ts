const AIDPILOT_STORAGE_PREFIX = "aidpilot";
const AIDPILOT_DEMO_COOKIE = "aidpilot-demo";

function clearStorageNamespace(storage: Storage | undefined): void {
  if (!storage) return;

  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith(AIDPILOT_STORAGE_PREFIX)) {
        storage.removeItem(key);
      }
    }
  } catch {
    // Storage can be blocked in private browsing or by browser policy.
  }
}

export function clearAidPilotBrowserData(): void {
  if (typeof window === "undefined") return;

  clearStorageNamespace(window.localStorage);
  clearStorageNamespace(window.sessionStorage);

  document.cookie = `${AIDPILOT_DEMO_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
