/**
 * Aid-path profile: the student's answers to a short triage that personalizes
 * the whole app (which form to file, which parent, what to do now). Stored
 * client-side only (localStorage) - no names, no SSNs, no finances, just three
 * coarse categorical answers. Storage is scoped per signed-in user so shared
 * browsers never feed one student's path into another student's AI context.
 * Exposed as a useSyncExternalStore-compatible module store.
 */

export const AID_PATH_LOCAL_KEY = "aidpilot:aid-path:v1";
const AID_PATH_GUEST_SCOPE = "guest";

/** Which application the student files. "unsure" = show both / route to triage. */
export type AidForm = "fafsa" | "cadaa" | "unsure";
/** Parent situation - drives which-parent / contributor guidance. */
export type ParentSituation = "together" | "divorced" | "single" | "cant_provide";
/** Where the student is in the timeline. */
export type Timeline = "senior" | "junior" | "underclass" | "college";

export type AidPathProfile = {
  form: AidForm | null;
  parents: ParentSituation | null;
  timeline: Timeline | null;
  updatedAt: string | null;
};

export const EMPTY_AID_PATH: AidPathProfile = { form: null, parents: null, timeline: null, updatedAt: null };

let storageKey = scopedStorageKey(null);
let snapshot: AidPathProfile = EMPTY_AID_PATH;
let hydrated = false;
const listeners = new Set<() => void>();

function scopedStorageKey(userId: string | null): string {
  return `${AID_PATH_LOCAL_KEY}:${userId ?? AID_PATH_GUEST_SCOPE}`;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const FORMS: AidForm[] = ["fafsa", "cadaa", "unsure"];
const PARENTS: ParentSituation[] = ["together", "divorced", "single", "cant_provide"];
const TIMELINES: Timeline[] = ["senior", "junior", "underclass", "college"];

function readFromStorage(key: string): AidPathProfile {
  if (!canUseStorage()) return EMPTY_AID_PATH;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_AID_PATH;
    const parsed = JSON.parse(raw) as Partial<AidPathProfile>;
    return {
      form: FORMS.includes(parsed.form as AidForm) ? (parsed.form as AidForm) : null,
      parents: PARENTS.includes(parsed.parents as ParentSituation) ? (parsed.parents as ParentSituation) : null,
      timeline: TIMELINES.includes(parsed.timeline as Timeline) ? (parsed.timeline as Timeline) : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return EMPTY_AID_PATH;
  }
}

function ensureHydrated(): void {
  if (hydrated) return;
  snapshot = readFromStorage(storageKey);
  hydrated = true;
}

export function clearLegacyAidPathProfile(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(AID_PATH_LOCAL_KEY);
  } catch {
    /* ignore */
  }
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function setStorageScope(userId: string | null): void {
  const nextKey = scopedStorageKey(userId);
  if (storageKey === nextKey && hydrated) return;
  storageKey = nextKey;
  snapshot = readFromStorage(storageKey);
  hydrated = true;
}

function persist(next: AidPathProfile): void {
  snapshot = next;
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      window.localStorage.removeItem(AID_PATH_LOCAL_KEY);
    } catch {
      // Storage disabled/full - keep the in-memory snapshot so the UI still works.
    }
  }
  notify();
}

export function subscribeAidPath(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAidPathSnapshot(userId: string | null): AidPathProfile {
  setStorageScope(userId);
  ensureHydrated();
  return snapshot;
}

export function getAidPathServerSnapshot(): AidPathProfile {
  return EMPTY_AID_PATH;
}

/** Merge a partial answer set into the profile. */
export function updateAidPath(patch: Partial<Omit<AidPathProfile, "updatedAt">>): void {
  ensureHydrated();
  persist({ ...snapshot, ...patch, updatedAt: new Date().toISOString() });
}

export function resetAidPath(): void {
  persist({ ...EMPTY_AID_PATH });
}

export function isAidPathComplete(p: AidPathProfile): boolean {
  return p.form !== null && p.parents !== null && p.timeline !== null;
}
