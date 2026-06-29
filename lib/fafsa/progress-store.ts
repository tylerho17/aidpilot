export const FAFSA_PROGRESS_LOCAL_KEY = "aidpilot:fafsa-progress:v1";

export type FafsaProgressRecord = {
  completedPlanKeys: string[];
  savedAt: string;
};

export function canUseFafsaProgressStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readFafsaProgressLocal(): FafsaProgressRecord {
  if (!canUseFafsaProgressStorage()) {
    return { completedPlanKeys: [], savedAt: new Date().toISOString() };
  }

  try {
    const raw = window.localStorage.getItem(FAFSA_PROGRESS_LOCAL_KEY);
    if (!raw) return { completedPlanKeys: [], savedAt: new Date().toISOString() };
    const parsed = JSON.parse(raw) as FafsaProgressRecord;
    return {
      completedPlanKeys: Array.isArray(parsed.completedPlanKeys) ? parsed.completedPlanKeys : [],
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to read FAFSA progress from localStorage", error);
    return { completedPlanKeys: [], savedAt: new Date().toISOString() };
  }
}

export function writeFafsaProgressLocal(completedPlanKeys: string[]) {
  if (!canUseFafsaProgressStorage()) return;
  const record: FafsaProgressRecord = {
    completedPlanKeys,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(FAFSA_PROGRESS_LOCAL_KEY, JSON.stringify(record));
}
