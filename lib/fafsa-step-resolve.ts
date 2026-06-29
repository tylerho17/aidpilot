import { getFafsaPlanTasks } from "@/lib/fafsa-plan";
import { getFafsaStepGuide } from "@/lib/fafsa-step-guides";
import { isAidTaskComplete } from "@/lib/data-helpers";
import { normalizeRequiredInfo } from "@/lib/required-info";
import type { AidTask } from "@/lib/types";

export type FafsaStepSource = "task" | "static";

export type FafsaStepNavTarget = {
  planKey: string;
  title: string;
};

export type ResolvedFafsaStep = {
  planKey: string;
  source: FafsaStepSource;
  task: AidTask | null;
  title: string;
  stage: string;
  status: string | null;
  whyItMatters: string;
  beforeYouStart: string[];
  instructions: string[];
  commonMistakes: string[];
  ifStuck: string[];
  privacyReminder: string;
  actionUrl: string | null;
  blockingReason: string | null;
  stepNumber: number | null;
  totalSteps: number | null;
  nextStep: FafsaStepNavTarget | null;
};

export function getNextFafsaStepInPlan(planKey: string, tasks: AidTask[]): FafsaStepNavTarget | null {
  const planTasks = getFafsaPlanTasks(tasks);
  const currentIndex = planTasks.findIndex((row) => row.plan_key === planKey);
  if (currentIndex < 0) return null;

  const remaining = planTasks.slice(currentIndex + 1);
  const nextOpen = remaining.find((row) => !isAidTaskComplete(row.status));
  const next = nextOpen ?? remaining[0];
  if (!next?.plan_key) return null;

  return { planKey: next.plan_key, title: next.title };
}

export function resolveFafsaStep(planKey: string, tasks: AidTask[]): ResolvedFafsaStep | null {
  const guide = getFafsaStepGuide(planKey);
  if (!guide) return null;

  const planTasks = getFafsaPlanTasks(tasks);
  const task = planTasks.find((row) => row.plan_key === planKey) ?? null;
  const currentIndex = planTasks.findIndex((row) => row.plan_key === planKey);

  const beforeYouStart = [...guide.before_you_start];
  const personalizedRequiredInfo = normalizeRequiredInfo(task?.required_info);
  if (personalizedRequiredInfo) {
    if (!beforeYouStart.some((item) => item.includes(personalizedRequiredInfo))) {
      beforeYouStart.unshift(personalizedRequiredInfo);
    }
  }

  if (beforeYouStart.length === 0) {
    beforeYouStart.push("A few quiet minutes and access to StudentAid.gov or your school portal.");
  }

  const instructions = [...guide.instructions];
  if (task?.instructions?.trim()) {
    instructions.unshift(`From your plan: ${task.instructions.trim()}`);
  }

  return {
    planKey,
    source: task ? "task" : "static",
    task,
    title: task?.title?.trim() || guide.title,
    stage: task?.stage?.trim() || guide.stage,
    status: task?.status ?? null,
    whyItMatters: task?.why_it_matters?.trim() || guide.why_it_matters,
    beforeYouStart,
    instructions,
    commonMistakes: guide.common_mistakes,
    ifStuck: guide.if_stuck,
    privacyReminder: guide.privacy_reminder,
    actionUrl: task?.action_url ?? guide.action_url ?? null,
    blockingReason: task?.blocking_reason ?? null,
    stepNumber: currentIndex >= 0 ? currentIndex + 1 : null,
    totalSteps: planTasks.length > 0 ? planTasks.length : null,
    nextStep: getNextFafsaStepInPlan(planKey, tasks),
  };
}

export function isFafsaPlanStepKey(planKey: string, tasks: AidTask[]) {
  return getFafsaPlanTasks(tasks).some((row) => row.plan_key === planKey);
}

export function countFafsaPlanSteps(tasks: AidTask[]) {
  return getFafsaPlanTasks(tasks).length;
}
