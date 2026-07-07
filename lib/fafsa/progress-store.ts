export const FAFSA_PROGRESS_LOCAL_KEY = "aidpilot:fafsa-progress:v1";

export type FafsaProgressRecord = {
  completedPlanKeys: string[];
  savedAt: string;
  userId?: string | null;
};

function emptyProgressRecord(): FafsaProgressRecord {
  return { completedPlanKeys: [], savedAt: new Date().toISOString() };
}

function storageKeyForUser(userId?: string | null): string {
  return userId ? `${FAFSA_PROGRESS_LOCAL_KEY}:${userId}` : FAFSA_PROGRESS_LOCAL_KEY;
}

export function canUseFafsaProgressStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readFafsaProgressLocal(userId?: string | null): FafsaProgressRecord {
  if (!canUseFafsaProgressStorage()) {
    return emptyProgressRecord();
  }

  try {
    const raw = window.localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return emptyProgressRecord();
    const parsed = JSON.parse(raw) as FafsaProgressRecord;
    if (userId && parsed.userId && parsed.userId !== userId) {
      return emptyProgressRecord();
    }
    return {
      completedPlanKeys: Array.isArray(parsed.completedPlanKeys) ? parsed.completedPlanKeys : [],
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      userId: parsed.userId ?? userId ?? null,
    };
  } catch (error) {
    console.error("Failed to read FAFSA progress from localStorage", error);
    return emptyProgressRecord();
  }
}

export function writeFafsaProgressLocal(completedPlanKeys: string[], userId?: string | null) {
  if (!canUseFafsaProgressStorage()) return;
  const record: FafsaProgressRecord = {
    completedPlanKeys,
    savedAt: new Date().toISOString(),
    userId: userId ?? null,
  };
  window.localStorage.setItem(storageKeyForUser(userId), JSON.stringify(record));
}
