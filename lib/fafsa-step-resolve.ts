import { getFafsaPlanTasks } from "@/lib/fafsa-plan";
import { getFafsaStepGuide } from "@/lib/fafsa-step-guides";
import { normalizeRequiredInfo } from "@/lib/required-info";
import type { AidTask } from "@/lib/types";

export type FafsaStepSource = "task" | "static";

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
};

export function resolveFafsaStep(planKey: string, tasks: AidTask[]): ResolvedFafsaStep | null {
  const guide = getFafsaStepGuide(planKey);
  if (!guide) return null;

  const task = getFafsaPlanTasks(tasks).find((row) => row.plan_key === planKey) ?? null;
  const beforeYouStart = [...guide.before_you_start];
  const personalizedRequiredInfo = normalizeRequiredInfo(task?.required_info);
  if (personalizedRequiredInfo) {
    if (!beforeYouStart.some((item) => item.includes(personalizedRequiredInfo))) {
      beforeYouStart.unshift(personalizedRequiredInfo);
    }
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
  };
}
