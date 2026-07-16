"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getStreakServerSnapshot,
  getStreakSnapshot,
  recordStreakVisit,
  subscribeStreak,
  type StreakRecord,
} from "@/lib/streak/streak-store";

/**
 * Reads the daily streak and counts today's visit once on mount. The visit is
 * recorded via a store mutation (not a React setState in the effect), so it
 * doesn't trip react-hooks/set-state-in-effect; useSyncExternalStore then
 * propagates the update.
 */
export function useStreak(): StreakRecord {
  const streak = useSyncExternalStore(subscribeStreak, getStreakSnapshot, getStreakServerSnapshot);

  useEffect(() => {
    recordStreakVisit();
  }, []);

  return streak;
}
