import { generateFafsaPlan, FAFSA_TASK_SOURCE, getFafsaPlanTasks } from "@/lib/fafsa-plan";
import { isAidTaskComplete } from "@/lib/data-helpers";
import { normalizeFafsaAnswer } from "@/lib/fafsa-intake-map";
import type { AidTask, FafsaIntakeFormData, FafsaIntakeResponse } from "@/lib/types";

export const FAFSA_DEMO_MODE_KEY = "aidpilot_fafsa_demo_mode";
export const FAFSA_DEMO_STORE_KEY = "aidpilot_fafsa_demo_store";
export const FAFSA_DEMO_GUEST_USER_ID = "demo-user";

export const FAFSA_DEMO_BANNER_MESSAGE =
  "Demo mode: your FAFSA plan is saved on this device. Account syncing coming soon.";

type FafsaDemoStore = {
  userId: string;
  intake: FafsaIntakeResponse;
  tasks: AidTask[];
  savedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function canUseFafsaDemoStorage() {
  return canUseStorage();
}

export function applyFafsaDemoFallbackForUser(
  userId: string,
  form: FafsaIntakeFormData
): { ok: true; intake: FafsaIntakeResponse; planTasks: AidTask[] } | { ok: false } {
  if (!canUseStorage()) return { ok: false };

  const intake = formToDemoIntake(userId, form);
  const planTasks = buildDemoFafsaPlanTasks(userId, form);
  saveFafsaDemoFallback(userId, intake, planTasks);
  return { ok: true, intake, planTasks };
}

export function isFafsaDemoMode(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(FAFSA_DEMO_MODE_KEY) === "true";
}

export function setFafsaDemoMode(enabled: boolean) {
  if (!canUseStorage()) return;
  if (enabled) {
    window.localStorage.setItem(FAFSA_DEMO_MODE_KEY, "true");
  } else {
    window.localStorage.removeItem(FAFSA_DEMO_MODE_KEY);
  }
}

export function clearFafsaDemoFallback() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(FAFSA_DEMO_STORE_KEY);
  setFafsaDemoMode(false);
}

export function isDemoFafsaTaskId(taskId: string) {
  return taskId.startsWith("demo-fafsa-");
}

export function formToDemoIntake(userId: string, form: FafsaIntakeFormData): FafsaIntakeResponse {
  const now = new Date().toISOString();
  const contributorRequired = normalizeFafsaAnswer(form.contributor_required);
  const parentAccount =
    contributorRequired === "yes" || contributorRequired === "not_sure"
      ? normalizeFafsaAnswer(form.parent_has_student_aid_account)
      : null;

  return {
    id: `demo-intake-${userId}`,
    created_at: now,
    updated_at: now,
    user_id: userId,
    aid_year: form.aid_year,
    student_situation: form.student_situation,
    state: form.state,
    schools: form.schools.trim() || "Not set yet",
    fafsa_progress: form.fafsa_progress,
    has_student_aid_account: normalizeFafsaAnswer(form.has_student_aid_account),
    contributor_required: contributorRequired,
    parent_has_student_aid_account: parentAccount,
    has_tax_info: normalizeFafsaAnswer(form.has_tax_info),
    has_school_portal_access: normalizeFafsaAnswer(form.has_school_portal_access),
    has_aid_offer: normalizeFafsaAnswer(form.has_aid_offer, "no"),
    has_verification_request: normalizeFafsaAnswer(form.has_verification_request),
    plan_generated_at: now,
  };
}

export function buildDemoFafsaPlanTasks(userId: string, intake: FafsaIntakeFormData | FafsaIntakeResponse): AidTask[] {
  const now = new Date().toISOString();
  return generateFafsaPlan(intake).map((task) => ({
    id: `demo-fafsa-${task.plan_key}`,
    created_at: now,
    updated_at: now,
    user_id: userId,
    title: task.title,
    description: task.description ?? task.instructions,
    status: task.status,
    due_date: null,
    category: "FAFSA",
    priority: task.priority,
    task_source: FAFSA_TASK_SOURCE,
    stage: task.stage,
    step_order: task.step_order,
    why_it_matters: task.why_it_matters,
    instructions: task.instructions,
    required_info: task.required_info,
    blocking_reason: task.blocking_reason,
    action_url: task.action_url,
    plan_key: task.plan_key,
  }));
}

export function saveFafsaDemoFallback(userId: string, intake: FafsaIntakeResponse, tasks: AidTask[]) {
  if (!canUseStorage()) return;
  const store: FafsaDemoStore = {
    userId,
    intake,
    tasks,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(FAFSA_DEMO_STORE_KEY, JSON.stringify(store));
  setFafsaDemoMode(true);
  console.error("FAFSA demo fallback saved to localStorage", {
    keys: [FAFSA_DEMO_MODE_KEY, FAFSA_DEMO_STORE_KEY],
    taskCount: tasks.length,
    intakeId: intake.id,
  });
}

export function loadFafsaDemoFallback(userId: string): FafsaDemoStore | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(FAFSA_DEMO_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FafsaDemoStore;
    if (!parsed.intake || !Array.isArray(parsed.tasks)) {
      return null;
    }
    if (parsed.userId !== userId) {
      clearFafsaDemoFallback();
      return null;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to parse FAFSA demo fallback from localStorage", error);
    return null;
  }
}

export function updateFafsaDemoTaskStatus(userId: string, taskId: string, status: string): AidTask[] | null {
  const store = loadFafsaDemoFallback(userId);
  if (!store) return null;

  const now = new Date().toISOString();
  let nextTasks = store.tasks.map((task) =>
    task.id === taskId ? { ...task, status, updated_at: now } : task
  );

  const updatedTask = nextTasks.find((task) => task.id === taskId);
  if (updatedTask && updatedTask.task_source === FAFSA_TASK_SOURCE && isAidTaskComplete(status)) {
    const planTasks = getFafsaPlanTasks(nextTasks);
    const nextOpen = planTasks.find((task) => task.id !== taskId && !isAidTaskComplete(task.status));
    if (nextOpen && nextOpen.status !== "Due Soon") {
      nextTasks = nextTasks.map((task) =>
        task.id === nextOpen.id ? { ...task, status: "Due Soon", updated_at: now } : task
      );
    }
  }

  saveFafsaDemoFallback(store.userId, store.intake, nextTasks);
  return nextTasks;
}

export function resolveFafsaDemoFallback(
  userId: string,
  tasks: AidTask[],
  intake: FafsaIntakeResponse | null
): { tasks: AidTask[]; intake: FafsaIntakeResponse | null; demoMode: boolean } {
  const supabasePlanTasks = getFafsaPlanTasks(tasks);
  if (supabasePlanTasks.length > 0) {
    if (isFafsaDemoMode()) {
      clearFafsaDemoFallback();
    }
    return { tasks, intake, demoMode: false };
  }

  const demo = loadFafsaDemoFallback(userId);
  if (!demo) {
    return { tasks, intake, demoMode: false };
  }

  const withoutPlan = tasks.filter((task) => task.task_source !== FAFSA_TASK_SOURCE);
  return {
    tasks: [...withoutPlan, ...demo.tasks],
    intake: intake ?? demo.intake,
    demoMode: true,
  };
}
