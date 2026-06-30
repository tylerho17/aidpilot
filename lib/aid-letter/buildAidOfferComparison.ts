import {
  AID_OFFER_STATUS_LABELS,
  calculateAidOfferFromRecord,
  type AidOfferCalculation,
} from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

export const AID_OFFER_COMPARE_HREF = "/aid-letter/compare";

export type AidOfferRiskLevel = "Low" | "Medium" | "High";

export type AidOfferComparisonRow = {
  offer: UserAidOffer;
  calculation: AidOfferCalculation;
  riskLevel: AidOfferRiskLevel;
  loanReliancePct: number;
  isLowestGap: boolean;
  isHighestGiftAid: boolean;
  isHighestLoanReliance: boolean;
  isHighLoanReliance: boolean;
  missingAcademicYear: boolean;
  isDraft: boolean;
};

export type AidOfferComparison = {
  rows: AidOfferComparisonRow[];
  lowestGap: AidOfferComparisonRow | null;
  highestGiftAid: AidOfferComparisonRow | null;
  highestLoanReliance: AidOfferComparisonRow | null;
  draftOffers: AidOfferComparisonRow[];
  missingYearOffers: AidOfferComparisonRow[];
  recommendation: string;
  focusOffer: UserAidOffer | null;
  officeQuestions: string[];
};

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function getLoanReliancePct(offer: UserAidOffer, calc: AidOfferCalculation): number {
  if (offer.cost_of_attendance > 0) {
    return Math.round((calc.loanTotal / offer.cost_of_attendance) * 100);
  }
  if (calc.totalAidShown > 0) {
    return Math.round((calc.loanTotal / calc.totalAidShown) * 100);
  }
  return 0;
}

export function getAidOfferRiskLevel(offer: UserAidOffer, calc: AidOfferCalculation): AidOfferRiskLevel {
  const missingYear = !offer.academic_year?.trim();
  const isDraft = offer.offer_status === "draft";
  const hasGap = calc.remainingGapAfterAllAid > 0;
  const loansExceedGift = calc.loanTotal > calc.giftAid && calc.loanTotal > 0;
  const largeGap = offer.cost_of_attendance > 0 && calc.remainingGapAfterAllAid / offer.cost_of_attendance > 0.15;

  if (isDraft || (hasGap && loansExceedGift) || largeGap) {
    return "High";
  }

  if (hasGap || missingYear || offer.offer_status === "estimated") {
    return "Medium";
  }

  return "Low";
}

function pickExtreme<T extends { offer: UserAidOffer }>(
  rows: T[],
  compare: (a: T, b: T) => number
): T | null {
  if (rows.length === 0) return null;
  return [...rows].sort(compare)[0];
}

export const AID_OFFICE_QUESTIONS = [
  "Are my grants and scholarships renewable?",
  "Are there additional institutional grants available?",
  "What steps do I need to complete before this aid is finalized?",
] as const;

const HIGH_LOAN_RELIANCE_PCT = 40;

export function isHighLoanReliance(offer: UserAidOffer, calc: AidOfferCalculation, loanReliancePct: number): boolean {
  return (
    (calc.loanTotal > calc.giftAid && calc.loanTotal > 0) ||
    (offer.cost_of_attendance > 0 && loanReliancePct >= HIGH_LOAN_RELIANCE_PCT)
  );
}

export function buildAidOfficeQuestions(): string[] {
  return [...AID_OFFICE_QUESTIONS];
}

export function buildComparisonRecommendation(
  comparison: Pick<
    AidOfferComparison,
    "lowestGap" | "highestLoanReliance" | "draftOffers" | "missingYearOffers"
  >
): string {
  if (!comparison.lowestGap) {
    return "Add aid offers to see which school leaves you with the lowest remaining gap.";
  }

  const school = comparison.lowestGap.offer.school_name;
  const gap = comparison.lowestGap.calculation.remainingGapAfterAllAid;
  const parts: string[] = [];

  if (gap === 0) {
    parts.push(
      `${school} currently shows no remaining gap after all aid listed. Before deciding, confirm whether grants are renewable and whether work-study is guaranteed.`
    );
  } else {
    parts.push(
      `${school} currently has the lowest remaining gap. Before deciding, confirm whether grants are renewable and whether work-study is guaranteed.`
    );
  }

  if (comparison.highestLoanReliance && comparison.highestLoanReliance.offer.id !== comparison.lowestGap.offer.id) {
    parts.push(
      `${comparison.highestLoanReliance.offer.school_name} relies most on loans (${money(comparison.highestLoanReliance.calculation.loanTotal)}). Compare that against gift aid before committing.`
    );
  }

  if (comparison.draftOffers.length > 0) {
    const names = comparison.draftOffers.map((row) => row.offer.school_name).join(", ");
    parts.push(`Draft offers (${names}) still need confirmed numbers before you compare final out-of-pocket cost.`);
  }

  if (comparison.missingYearOffers.length > 0) {
    const names = comparison.missingYearOffers.map((row) => row.offer.school_name).join(", ");
    parts.push(`Add the academic year for ${names} so you are comparing the same aid year.`);
  }

  return parts.join(" ");
}

export function buildAidOfferComparison(
  offers: UserAidOffer[],
  focusOfferId?: string | null
): AidOfferComparison {
  const baseRows = offers.map((offer) => {
    const calculation = calculateAidOfferFromRecord(offer);
    const loanReliancePct = getLoanReliancePct(offer, calculation);
    return {
      offer,
      calculation,
      riskLevel: getAidOfferRiskLevel(offer, calculation),
      loanReliancePct,
      isLowestGap: false,
      isHighestGiftAid: false,
      isHighestLoanReliance: false,
      isHighLoanReliance: isHighLoanReliance(offer, calculation, loanReliancePct),
      missingAcademicYear: !offer.academic_year?.trim(),
      isDraft: offer.offer_status === "draft",
    };
  });

  const lowestGap = pickExtreme(baseRows, (a, b) => a.calculation.remainingGapAfterAllAid - b.calculation.remainingGapAfterAllAid);
  const highestGiftAid = pickExtreme(baseRows, (a, b) => b.calculation.giftAid - a.calculation.giftAid);
  const highestLoanReliance = pickExtreme(baseRows, (a, b) => b.loanReliancePct - a.loanReliancePct);

  const rows = baseRows
    .map((row) => ({
      ...row,
      isLowestGap: lowestGap?.offer.id === row.offer.id,
      isHighestGiftAid: highestGiftAid?.offer.id === row.offer.id,
      isHighestLoanReliance: highestLoanReliance?.offer.id === row.offer.id,
    }))
    .sort((a, b) => a.calculation.remainingGapAfterAllAid - b.calculation.remainingGapAfterAllAid);

  const draftOffers = rows.filter((row) => row.isDraft);
  const missingYearOffers = rows.filter((row) => row.missingAcademicYear);

  const focusOffer =
    (focusOfferId ? rows.find((row) => row.offer.id === focusOfferId)?.offer : null) ??
    lowestGap?.offer ??
    null;

  const comparisonBase = {
    lowestGap,
    highestGiftAid,
    highestLoanReliance,
    draftOffers,
    missingYearOffers,
  };

  return {
    rows,
    ...comparisonBase,
    recommendation: buildComparisonRecommendation(comparisonBase),
    focusOffer,
    officeQuestions: buildAidOfficeQuestions(),
  };
}

export function riskLevelTone(level: AidOfferRiskLevel): "green" | "amber" | "red" {
  switch (level) {
    case "Low":
      return "green";
    case "Medium":
      return "amber";
    case "High":
      return "red";
  }
}

export function formatOfferStatus(offer: UserAidOffer): string {
  return AID_OFFER_STATUS_LABELS[offer.offer_status];
}
