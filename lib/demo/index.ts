"use client";

import { useCallback, useState } from "react";
import { isDemoEnabled, isDemoId, setDemoEnabled, DEMO_ID_PREFIX } from "./config";

export { isDemoEnabled, isDemoId, setDemoEnabled, DEMO_ID_PREFIX };
export {
  makeDemoTasks,
  makeDemoDeadlines,
  makeDemoDocuments,
  makeDemoScholarships,
  makeDemoOffers,
  makeDemoFafsaSteps,
  makeDemoProtectSnapshot,
  DEMO_PROTECT_PANEL,
} from "./fixtures";

/**
 * The mock ↔ real seam. Screens read every collection through this:
 *
 *   const deadlines = demoFallback(userData.deadlines, makeDemoDeadlines);
 *
 * Real rows always win - the moment Supabase has data (or demo mode is off),
 * fixtures disappear with zero code changes. Fixtures only fill in for
 * signed-out demo visitors when the real collection is empty.
 */
export function demoFallback<T>(
  real: T[] | null | undefined,
  fixture: () => T[],
  options?: { userId?: string | null },
): T[] {
  if (real && real.length > 0) return real;
  if (options?.userId) return real ?? [];
  if (!isDemoEnabled()) return real ?? [];
  return fixture();
}

/**
 * Local mutation handling for demo rows. Demo ids must never reach Supabase -
 * this hook tracks locally-toggled/patched demo ids so screens can render
 * optimistic state, while real ids flow to the real mutation untouched.
 *
 *   const demo = useDemoMutations();
 *   const done = demo.has(task.id) ? !startsDone : startsDone;
 *   onToggle={() => demo.isDemo(task.id) ? demo.toggle(task.id) : updateTaskStatus(task.id, "Complete")}
 */
export function useDemoMutations() {
  const [toggled, setToggled] = useState<ReadonlySet<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => toggled.has(id), [toggled]);

  return { isDemo: isDemoId, toggle, has };
}
