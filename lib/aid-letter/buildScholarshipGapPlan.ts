import type { AidOfferCalculation } from "@/lib/aid-letter/calculateAidOffer";
import {
  AID_OFFER_TASK_SOURCE,
  getAidOfferReportHref,
  type AidOfferRecommendedTask,
} from "@/lib/aid-letter/buildAidHealthReport";
import type { AidTask, FafsaIntakeResponse, StudentProfile, UserAidOffer } from "@/lib/types";

export type ScholarshipGapPlanType = "none" | "small" | "medium" | "large";

export type ScholarshipSearchCategory = {
  id: string;
  title: string;
  why: string;
  action: string;
  searchPhrase: string;
};

export type ScholarshipGapPlan = {
  hasGap: boolean;
  remainingGap: number;
  planType: ScholarshipGapPlanType;
  planTypeLabel: string;
  recommendation: string;
  monthlyTargetLow: number;
  monthlyTargetHigh: number;
  scholarshipsToApplyCount: number;
  weeklyPlan: string[];
  categories: ScholarshipSearchCategory[];
  zeroGapMessage?: string;
};

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

function roundToHundred(value: number): number {
  return Math.max(100, Math.round(value / 100) * 100);
}

export function scholarshipGapTaskPrefix(offerId: string): string {
  return `aid_offer:${offerId}:scholarship_gap:`;
}

function gapTaskPlanKey(offerId: string, key: string): string {
  return `${scholarshipGapTaskPrefix(offerId)}${key}`;
}

export function getPlanType(gap: number): ScholarshipGapPlanType {
  if (gap <= 0) return "none";
  if (gap < 2500) return "small";
  if (gap <= 7500) return "medium";
  return "large";
}

function getLocationLabel(profile: StudentProfile | null | undefined, fafsaIntake: FafsaIntakeResponse | null | undefined): string | null {
  const fromProfile = profile?.state?.trim();
  if (fromProfile) return fromProfile;
  const fromIntake = fafsaIntake?.state?.trim();
  if (fromIntake) return fromIntake;
  return null;
}

function searchYear(): number {
  return new Date().getFullYear() + 1;
}

function buildSearchPhrase(base: string, location: string | null): string {
  const year = searchYear();
  if (location) {
    return `${location} ${base} ${year}`;
  }
  return `${base} ${year}`;
}

export function buildScholarshipSearchCategories(
  profile: StudentProfile | null | undefined,
  fafsaIntake: FafsaIntakeResponse | null | undefined,
  offer: UserAidOffer
): ScholarshipSearchCategory[] {
  const location = getLocationLabel(profile, fafsaIntake);
  const major = profile?.majors?.[0] ?? profile?.interests?.[0] ?? null;
  const school = offer.school_name?.trim() || profile?.school_name?.trim() || null;

  return [
    {
      id: "local",
      title: "Local community scholarships",
      why: "Smaller local awards usually have less competition.",
      action: location
        ? `Search your city, county, and ${location} community foundations.`
        : "Search your city, high school district, and local foundations.",
      searchPhrase: buildSearchPhrase("local community scholarship", location),
    },
    {
      id: "major",
      title: "Major or department scholarships",
      why: "Department awards often match your field of study.",
      action: major
        ? `Ask ${school ?? "your school"}'s ${major} department about awards for current students.`
        : "Check your academic department and college website for major-specific awards.",
      searchPhrase: major
        ? buildSearchPhrase(`${major} department scholarship`, location)
        : buildSearchPhrase("college major department scholarship", location),
    },
    {
      id: "need_based",
      title: "First-generation or need-based scholarships",
      why: "Many awards target first-generation or financial-need students.",
      action: profile?.first_generation
        ? "Prioritize first-generation and need-based scholarships you may qualify for."
        : "Search need-based scholarships tied to FAFSA eligibility and family income.",
      searchPhrase: buildSearchPhrase("first generation need-based scholarship", location),
    },
    {
      id: "employer",
      title: "Employer or foundation scholarships",
      why: "Employers, unions, and foundations often fund students in their community.",
      action: "Check parent employers, local nonprofits, and community foundations.",
      searchPhrase: buildSearchPhrase("employer foundation scholarship", location),
    },
  ];
}

function monthlyTargets(gap: number, planType: ScholarshipGapPlanType): { low: number; high: number } {
  if (planType === "small") {
    return { low: roundToHundred(gap / 3), high: roundToHundred(gap / 2) };
  }
  if (planType === "medium") {
    return { low: 1500, high: 2000 };
  }
  return { low: 2000, high: roundToHundred(Math.min(gap, gap / 3)) };
}

function scholarshipsToApplyCount(planType: ScholarshipGapPlanType): number {
  switch (planType) {
    case "small":
      return 3;
    case "medium":
      return 5;
    case "large":
      return 8;
    default:
      return 0;
  }
}

function planRecommendation(planType: ScholarshipGapPlanType): string {
  switch (planType) {
    case "small":
      return "Focus on local scholarships, department awards, and emergency grants.";
    case "medium":
      return "Focus on local scholarships, institutional aid questions, and a monthly scholarship target.";
    case "large":
      return "Consider a financial aid appeal, compare schools, build a scholarship plan, and review loan options carefully.";
    default:
      return "Your current offer does not show a remaining gap. Keep checking for renewal requirements and deadlines.";
  }
}

function weeklyPlanItems(planType: ScholarshipGapPlanType): string[] {
  switch (planType) {
    case "small":
      return [
        "Review 2 scholarships",
        "Apply to 1 local scholarship",
        "Save 1 backup scholarship",
        "Ask about department or emergency grants",
      ];
    case "medium":
      return [
        "Review 3 scholarships",
        "Apply to 1 local scholarship",
        "Save 2 backup scholarships",
        "Check school-specific aid options",
      ];
    case "large":
      return [
        "Review 4 scholarships",
        "Apply to 2 scholarships this week",
        "Save 2 backup scholarships",
        "Compare aid offers and ask about appeals",
      ];
    default:
      return [];
  }
}

export function buildScholarshipGapPlan(
  offer: UserAidOffer,
  calc: AidOfferCalculation,
  profile?: StudentProfile | null,
  fafsaIntake?: FafsaIntakeResponse | null
): ScholarshipGapPlan {
  const remainingGap = calc.remainingGapAfterAllAid;
  const planType = getPlanType(remainingGap);

  if (remainingGap <= 0) {
    return {
      hasGap: false,
      remainingGap: 0,
      planType: "none",
      planTypeLabel: "No gap",
      recommendation: planRecommendation("none"),
      monthlyTargetLow: 0,
      monthlyTargetHigh: 0,
      scholarshipsToApplyCount: 0,
      weeklyPlan: [],
      categories: [],
      zeroGapMessage:
        "No gap detected from this aid offer. Keep monitoring deadlines and renewal requirements.",
    };
  }

  const targets = monthlyTargets(remainingGap, planType);
  const planTypeLabel =
    planType === "small" ? "Small gap" : planType === "medium" ? "Medium gap" : "Large gap";

  return {
    hasGap: true,
    remainingGap,
    planType,
    planTypeLabel,
    recommendation: planRecommendation(planType),
    monthlyTargetLow: targets.low,
    monthlyTargetHigh: targets.high,
    scholarshipsToApplyCount: scholarshipsToApplyCount(planType),
    weeklyPlan: weeklyPlanItems(planType),
    categories: buildScholarshipSearchCategories(profile, fafsaIntake, offer),
  };
}

export function buildScholarshipGapTasks(
  offer: UserAidOffer,
  calc: AidOfferCalculation
): AidOfferRecommendedTask[] {
  if (calc.remainingGapAfterAllAid <= 0) return [];

  const reportUrl = getAidOfferReportHref(offer.id);

  return [
    {
      plan_key: gapTaskPlanKey(offer.id, "build_list"),
      title: "Build a scholarship list for this aid gap",
      description: `List scholarships that could help cover ${money(calc.remainingGapAfterAllAid)} remaining after aid on this offer.`,
      priority: "High",
      status: "Due Soon",
      category: "Scholarship gap",
      action_url: reportUrl,
    },
    {
      plan_key: gapTaskPlanKey(offer.id, "apply_local"),
      title: "Apply to one local scholarship this week",
      description: "Start with a local or community scholarship with a realistic deadline.",
      priority: "High",
      status: "Due Soon",
      category: "Scholarship gap",
      action_url: "/scholarships",
    },
    {
      plan_key: gapTaskPlanKey(offer.id, "institutional_grants"),
      title: "Ask the aid office about institutional grants",
      description: `Ask ${offer.school_name} whether additional institutional grants are available.`,
      priority: "Medium",
      status: "Needs Review",
      category: "Scholarship gap",
      action_url: reportUrl,
    },
    {
      plan_key: gapTaskPlanKey(offer.id, "review_loans"),
      title: "Review whether loans are needed after scholarships",
      description: "Compare how much gap remains after scholarships before accepting additional loans.",
      priority: "Medium",
      status: "Needs Review",
      category: "Scholarship gap",
      action_url: reportUrl,
    },
  ];
}

export function getPrimaryGapOffer(
  offers: UserAidOffer[],
  getCalc: (offer: UserAidOffer) => AidOfferCalculation
): { offer: UserAidOffer; calculation: AidOfferCalculation } | null {
  const withGap = offers
    .map((offer) => ({ offer, calculation: getCalc(offer) }))
    .filter((row) => row.calculation.remainingGapAfterAllAid > 0);

  if (withGap.length === 0) return null;

  return [...withGap].sort(
    (a, b) => b.calculation.remainingGapAfterAllAid - a.calculation.remainingGapAfterAllAid
  )[0];
}

export function getScholarshipGapActionTasks(tasks: AidTask[], offerId: string): AidTask[] {
  const prefix = scholarshipGapTaskPrefix(offerId);
  return tasks.filter(
    (task) => task.task_source === AID_OFFER_TASK_SOURCE && task.plan_key?.startsWith(prefix)
  );
}
