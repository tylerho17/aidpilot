import type { UserAidOffer } from "@/lib/types";

export type AidOfferCalculationInput = Pick<
  UserAidOffer,
  | "cost_of_attendance"
  | "tuition_and_fees"
  | "housing_and_food"
  | "grants_and_scholarships"
  | "work_study"
  | "federal_student_loans"
  | "parent_plus_loans"
  | "private_loans"
  | "other_aid"
  | "renewal_notes"
>;

export type AidOfferCalculation = {
  giftAid: number;
  selfHelpAid: number;
  totalAidShown: number;
  directCostEstimate: number;
  netCostAfterGiftAid: number;
  remainingGapAfterAllAid: number;
  loanTotal: number;
  workStudy: number;
  flags: string[];
};

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateAidOffer(input: AidOfferCalculationInput): AidOfferCalculation {
  const cost_of_attendance = nonNegative(input.cost_of_attendance);
  const tuition_and_fees = nonNegative(input.tuition_and_fees);
  const housing_and_food = nonNegative(input.housing_and_food);
  const grants_and_scholarships = nonNegative(input.grants_and_scholarships);
  const other_aid = nonNegative(input.other_aid);
  const work_study = nonNegative(input.work_study);
  const federal_student_loans = nonNegative(input.federal_student_loans);
  const parent_plus_loans = nonNegative(input.parent_plus_loans);
  const private_loans = nonNegative(input.private_loans);

  const giftAid = grants_and_scholarships + other_aid;
  const loanTotal = federal_student_loans + parent_plus_loans + private_loans;
  const selfHelpAid = work_study + loanTotal;
  const totalAidShown = giftAid + selfHelpAid;
  const directCostEstimate = tuition_and_fees + housing_and_food;
  const netCostAfterGiftAid = Math.max(0, cost_of_attendance - giftAid);
  const remainingGapAfterAllAid = Math.max(0, cost_of_attendance - totalAidShown);

  const flags: string[] = [];

  if (loanTotal > grants_and_scholarships && loanTotal > 0) {
    flags.push("Most of this offer is debt, not free aid.");
  }

  if (work_study > 0) {
    flags.push("Work-study is earned through a job and may not reduce your bill upfront.");
  }

  if (remainingGapAfterAllAid > 0) {
    flags.push("You still need a plan for the remaining gap.");
  }

  if (!input.renewal_notes?.trim()) {
    flags.push("Check whether scholarships renew next year.");
  }

  return {
    giftAid,
    selfHelpAid,
    totalAidShown,
    directCostEstimate,
    netCostAfterGiftAid,
    remainingGapAfterAllAid,
    loanTotal,
    workStudy: work_study,
    flags,
  };
}

export function calculateAidOfferFromRecord(offer: UserAidOffer): AidOfferCalculation {
  return calculateAidOffer(offer);
}

export const AID_OFFER_LOAD_ERROR = "We couldn't load your aid offers right now. Please try again in a moment.";
export const AID_OFFER_SAVE_ERROR = "We couldn't save this aid offer right now. Please try again.";

export const AID_OFFER_STATUS_LABELS: Record<UserAidOffer["offer_status"], string> = {
  draft: "Draft",
  estimated: "Estimated",
  official: "Official",
  reviewed: "Reviewed",
};

export function parseDollarInput(value: string): number {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

export function formatDollarInput(value: number): string {
  return value > 0 ? String(value) : "";
}

export function normalizeSchoolName(name: string): string {
  return name.trim().toLowerCase();
}

export function compareOffersByNetCost(
  a: { calculation: AidOfferCalculation },
  b: { calculation: AidOfferCalculation }
): number {
  return a.calculation.netCostAfterGiftAid - b.calculation.netCostAfterGiftAid;
}
