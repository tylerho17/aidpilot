import {
  AID_OFFER_STATUS_LABELS,
  calculateAidOfferFromRecord,
  type AidOfferCalculation,
} from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

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
      title: `Make a plan for ${offer.school_name}'s remaining gap`,
      description: `You still have ${money(calc.remainingGapAfterAllAid)} to cover after all aid shown on this offer.`,
      priority: "High",
      status: "Due Soon",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (calc.loanTotal > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "review_loans"),
      title: `Review loans in ${offer.school_name}'s offer`,
      description: `This offer includes ${money(calc.loanTotal)} in loans that must be repaid with interest.`,
      priority: "High",
      status: "Needs Review",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (calc.giftAid > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "confirm_gift_aid"),
      title: `Confirm gift aid from ${offer.school_name}`,
      description: `Verify ${money(calc.giftAid)} in grants and scholarships and check whether they renew each year.`,
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (calc.workStudy > 0) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "understand_work_study"),
      title: `Understand work-study at ${offer.school_name}`,
      description: `${money(calc.workStudy)} in work-study is earned through a job and may not reduce your bill upfront.`,
      priority: "Medium",
      status: "Optional",
      category: "Aid offer",
      action_url: reportUrl,
    });
  }

  if (!offer.academic_year?.trim()) {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "academic_year"),
      title: `Add academic year for ${offer.school_name}`,
      description: "Add the aid year so you can track this offer alongside deadlines and renewal planning.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: "/aid-letter",
    });
  }

  if (offer.offer_status === "draft") {
    tasks.push({
      plan_key: taskPlanKey(offer.id, "finalize_status"),
      title: `Update ${offer.school_name} offer status`,
      description: "This offer is still in draft. Confirm the numbers and mark it estimated or official when ready.",
      priority: "Medium",
      status: "Needs Review",
      category: "Aid offer",
      action_url: "/aid-letter",
    });
  }

  return tasks;
}

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
