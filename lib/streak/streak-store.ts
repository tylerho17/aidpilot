/**
 * Duolingo-style daily streak, stored client-side only (localStorage) - mirrors
 * the privacy posture of lib/fafsa/progress-store.ts. A "visit" is any day the
 * student opens the app; consecutive calendar days grow the streak, a skipped
 * day resets it. Exposed as a useSyncExternalStore-compatible module store so
 * components read it without set-state-in-effect.
 */

export const STREAK_LOCAL_KEY = "aidpilot:streak:v1";

export type StreakRecord = {
  current: number;
  longest: number;
  /** Last day counted, as a local YYYY-MM-DD key. "" when never visited. */
  lastActiveDate: string;
};

const EMPTY: StreakRecord = { current: 0, longest: 0, lastActiveDate: "" };

let snapshot: StreakRecord = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Local calendar day (not UTC) so "today" matches the student's wall clock. */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole calendar days from one YYYY-MM-DD key to another (DST-safe via UTC). */
export function calendarDaysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / 86_400_000);
}

function readFromStorage(): StreakRecord {
  if (!canUseStorage()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(STREAK_LOCAL_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StreakRecord>;
    return {
      current: typeof parsed.current === "number" ? parsed.current : 0,
      longest: typeof parsed.longest === "number" ? parsed.longest : 0,
      lastActiveDate: typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : "",
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

function persist(next: StreakRecord): void {
  snapshot = next;
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STREAK_LOCAL_KEY, JSON.stringify(next));
    } catch {
      // Storage disabled or full - keep the in-memory snapshot so the UI still works.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeStreak(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStreakSnapshot(): StreakRecord {
  ensureHydrated();
  return snapshot;
}

/** SSR / first client render before hydration: a stable empty reference. */
export function getStreakServerSnapshot(): StreakRecord {
  return EMPTY;
}

/**
 * Count `now` toward the streak. Idempotent within a calendar day: the first
 * visit of the day advances (consecutive) or resets (gap) the streak; later
 * visits the same day are no-ops.
 */
export function recordStreakVisit(now: Date = new Date()): void {
  ensureHydrated();
  const today = localDateKey(now);
  if (snapshot.lastActiveDate === today) return;

  let current: number;
  if (snapshot.lastActiveDate) {
    const gap = calendarDaysBetween(snapshot.lastActiveDate, today);
    current = gap === 1 ? snapshot.current + 1 : 1;
  } else {
    current = 1;
  }

  persist({
    current,
    longest: Math.max(snapshot.longest, current),
    lastActiveDate: today,
  });
}
