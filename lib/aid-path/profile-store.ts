/**
 * Aid-path profile: the student's answers to a short triage that personalizes
 * the whole app (which form to file, which parent, what to do now). Stored
 * client-side only (localStorage) - no names, no SSNs, no finances, just three
 * coarse categorical answers - matching AidPilot's privacy posture (see
 * lib/fafsa/progress-store.ts, lib/streak/streak-store.ts). Exposed as a
 * useSyncExternalStore-compatible module store.
 */

export const AID_PATH_LOCAL_KEY = "aidpilot:aid-path:v1";

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

const EMPTY: AidPathProfile = { form: null, parents: null, timeline: null, updatedAt: null };

let snapshot: AidPathProfile = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const FORMS: AidForm[] = ["fafsa", "cadaa", "unsure"];
const PARENTS: ParentSituation[] = ["together", "divorced", "single", "cant_provide"];
const TIMELINES: Timeline[] = ["senior", "junior", "underclass", "college"];

function readFromStorage(): AidPathProfile {
  if (!canUseStorage()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(AID_PATH_LOCAL_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AidPathProfile>;
    return {
      form: FORMS.includes(parsed.form as AidForm) ? (parsed.form as AidForm) : null,
      parents: PARENTS.includes(parsed.parents as ParentSituation) ? (parsed.parents as ParentSituation) : null,
      timeline: TIMELINES.includes(parsed.timeline as Timeline) ? (parsed.timeline as Timeline) : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return EMPTY;
  }
}

function ensureHydrated(): void {
  if (hydrated) return;
  snapshot = readFromStorage();
  hydrated = true;
}

function persist(next: AidPathProfile): void {
  snapshot = next;
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(AID_PATH_LOCAL_KEY, JSON.stringify(next));
    } catch {
      // Storage disabled/full - keep the in-memory snapshot so the UI still works.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAidPath(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAidPathSnapshot(): AidPathProfile {
  ensureHydrated();
  return snapshot;
}

export function getAidPathServerSnapshot(): AidPathProfile {
  return EMPTY;
}

/** Merge a partial answer set into the profile. */
export function updateAidPath(patch: Partial<Omit<AidPathProfile, "updatedAt">>): void {
  ensureHydrated();
  persist({ ...snapshot, ...patch, updatedAt: new Date().toISOString() });
}

export function resetAidPath(): void {
  persist({ ...EMPTY });
}

export function isAidPathComplete(p: AidPathProfile): boolean {
  return p.form !== null && p.parents !== null && p.timeline !== null;
}
