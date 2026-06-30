import {
  AID_OFFER_STATUS_LABELS,
  calculateAidOfferFromRecord,
  type AidOfferCalculation,
} from "@/lib/aid-letter/calculateAidOffer";
import type { AidTask, UserAidOffer } from "@/lib/types";
import { isAidTaskComplete } from "@/lib/data-helpers";

export const AID_OFFER_TASK_SOURCE = "aid_offer";

export type AidOfferRecommendedTask = {
  plan_key: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Due Soon" | "Needs Review" | "Optional";
  category: string;
  action_url: string;
};

export type AidHealthReport = {
  offer: UserAidOffer;
  calculation: AidOfferCalculation;
  flags: string[];
  recommendedTasks: AidOfferRecommendedTask[];
  summary: string;
};

export function getAidOfferReportHref(offerId: string): string {
  return `/aid-letter/${offerId}/report`;
}

function taskPlanKey(offerId: string, key: string): string {
  return `aid_offer:${offerId}:${key}`;
}

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function buildRecommendedAidOfferTasks(
  offer: UserAidOffer,
  calc: AidOfferCalculation
): AidOfferRecommendedTask[] {
  const tasks: AidOfferRecommendedTask[] = [];
  const reportUrl = getAidOfferReportHref(offer.id);

  if (calc.remainingGapAfterAllAid > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "remaining_gap"),
      title: "Ask the aid office about your remaining gap",
      description:
        "Your aid offer still leaves a gap. Ask whether additional grants, emergency aid, or institutional aid are available.",
      priority: "High",
      status: "Due Soon",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (offer.federal_student_loans > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "review_loans"),
      title: "Review your loan amount before accepting",
      description: "Make sure you understand how much you are borrowing before accepting loans.",
      priority: "High",
      status: "Needs Review",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (offer.grants_and_scholarships > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "confirm_gift_aid"),
      title: "Confirm whether your grants are renewable",
      description: "Some grants only apply for one year. Ask whether this aid continues in future years.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (offer.work_study > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "understand_work_study"),
      title: "Check how work-study is awarded",
      description: "Work-study may require finding an eligible campus job before you receive money.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (offer.offer_status === "draft") {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "finalize_status"),
      title: "Finish reviewing this aid offer",
      description: "This aid offer is still marked as draft. Review the numbers and confirm the academic year.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: "/aid-letter",
    });
  }

  if (!offer.academic_year?.trim()) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "academic_year"),
      title: "Confirm the academic year for this offer",
      description: "Make sure this offer applies to the correct school year.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: "/aid-letter",
    });
  }

  return tasks;
}

export const buildAidActionPlanTasks = buildRecommendedAidOfferTasks;

export function buildAidHealthReport(offer: UserAidOffer): AidHealthReport {
  const calculation = calculateAidOfferFromRecord(offer);
  const flags = [...calculation.flags];

  if (!offer.academic_year?.trim()) {
    flags.push("Academic year is missing — add it so you can track this offer by year.");
  }

  if (offer.offer_status === "draft") {
    flags.push("This offer is still in draft. Confirm the numbers and update the status when ready.");
  }

  const recommendedTasks = buildRecommendedAidOfferTasks(offer, calculation);
  const statusLabel = AID_OFFER_STATUS_LABELS[offer.offer_status];

  const summary =
    calculation.remainingGapAfterAllAid > 0
      ? `${offer.school_name} shows ${money(calculation.giftAid)} in gift aid and ${money(calculation.loanTotal)} in loans. After all aid shown, you may still need ${money(calculation.remainingGapAfterAllAid)}. Status: ${statusLabel}.`
      : `${offer.school_name} shows ${money(calculation.giftAid)} in gift aid and ${money(calculation.loanTotal)} in loans. Aid shown covers the listed cost of attendance. Status: ${statusLabel}.`;

  return {
    offer,
    calculation,
    flags,
    recommendedTasks,
    summary,
  };
}

export function aidOfferTaskPrefix(offerId: string): string {
  return `aid_offer:${offerId}:`;
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function getAidOfferActionTasks(tasks: AidTask[], offerId: string): AidTask[] {
  const prefix = aidOfferTaskPrefix(offerId);
  return tasks
    .filter((task) => task.task_source === AID_OFFER_TASK_SOURCE && task.plan_key?.startsWith(prefix))
    .sort((a, b) => {
      const priorityDiff =
        (PRIORITY_ORDER[a.priority ?? "Low"] ?? 99) - (PRIORITY_ORDER[b.priority ?? "Low"] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.title ?? "").localeCompare(b.title ?? "");
    });
}

export function getOpenAidOfferActionTasks(tasks: AidTask[], limit = 3): AidTask[] {
  return tasks
    .filter((task) => task.task_source === AID_OFFER_TASK_SOURCE && !isAidTaskComplete(task.status))
    .sort((a, b) => {
      const priorityDiff =
        (PRIORITY_ORDER[a.priority ?? "Low"] ?? 99) - (PRIORITY_ORDER[b.priority ?? "Low"] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.title ?? "").localeCompare(b.title ?? "");
    })
    .slice(0, limit);
}
