export const FAFSA_PROGRESS_LOCAL_KEY = "aidpilot:fafsa-progress:v1";
const FAFSA_PROGRESS_LOCAL_KEY_PREFIX = "aidpilot:fafsa-progress:v2";
const ANONYMOUS_SCOPE = "anonymous";

export type FafsaProgressRecord = {
  completedPlanKeys: string[];
  savedAt: string;
};

export function canUseFafsaProgressStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function localKey(userId: string | null = null): string {
  return `${FAFSA_PROGRESS_LOCAL_KEY_PREFIX}:${userId ?? ANONYMOUS_SCOPE}`;
}

function emptyRecord(): FafsaProgressRecord {
  return { completedPlanKeys: [], savedAt: new Date().toISOString() };
}

function normalizeRecord(parsed: Partial<FafsaProgressRecord> | null | undefined): FafsaProgressRecord {
  return {
    completedPlanKeys: Array.isArray(parsed?.completedPlanKeys) ? parsed.completedPlanKeys : [],
    savedAt: parsed?.savedAt ?? new Date().toISOString(),
  };
}

function readRecordAtKey(key: string): FafsaProgressRecord | null {
  const raw = window.localStorage.getItem(key);
  return raw ? normalizeRecord(JSON.parse(raw)) : null;
}

export function readFafsaProgressLocal(userId: string | null = null): FafsaProgressRecord {
  if (!canUseFafsaProgressStorage()) {
    return emptyRecord();
  }

  try {
    const scoped = readRecordAtKey(localKey(userId));
    if (scoped) return scoped;

    // The v1 key had no owner. Preserve it only for signed-out progress; never
    // hydrate unknown browser state into an authenticated student's account.
    if (!userId) {
      const legacy = readRecordAtKey(FAFSA_PROGRESS_LOCAL_KEY);
      if (legacy) {
        window.localStorage.setItem(localKey(null), JSON.stringify(legacy));
        window.localStorage.removeItem(FAFSA_PROGRESS_LOCAL_KEY);
        return legacy;
      }
    }

    return emptyRecord();
  } catch (error) {
    console.error("Failed to read FAFSA progress from localStorage", error);
    return emptyRecord();
  }
}

export function writeFafsaProgressLocal(completedPlanKeys: string[], userId: string | null = null) {
  if (!canUseFafsaProgressStorage()) return;
  const record: FafsaProgressRecord = {
    completedPlanKeys,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(localKey(userId), JSON.stringify(record));
  window.localStorage.removeItem(FAFSA_PROGRESS_LOCAL_KEY);
}
