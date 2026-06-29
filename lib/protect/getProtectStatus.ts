import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import { FAFSA_STEPS, getNextIncompleteStep } from "@/lib/fafsa/steps";
import type { AidAction } from "@/lib/aid-actions/types";
import type { UserAidOffer, UserSchoolAidStatus, UserSchoolAidTask } from "@/lib/types";

export type ProtectCategoryStatus =
  | "protected"
  | "in_progress"
  | "needs_attention"
  | "needs_setup"
  | "waiting";

export type ProtectOverallStatus = "protected" | "in_progress" | "needs_attention" | "needs_setup";

export type ProtectCategoryKey = "fafsa" | "school_follow_up" | "verification" | "aid_offers";

export type ProtectCategorySnapshot = {
  key: ProtectCategoryKey;
  title: string;
  status: ProtectCategoryStatus;
  href: string;
  ctaLabel: string;
  summaryLines: string[];
  emptyMessage?: string;
};

export type ProtectStatusSnapshot = {
  overallStatus: ProtectOverallStatus;
  headline: string;
  description: string;
  categories: ProtectCategorySnapshot[];
  topAction: AidAction | null;
};

export type ProtectStatusInput = {
  completedFafsaPlanKeys: string[];
  schoolAidStatuses: UserSchoolAidStatus[];
  schoolAidTasks: UserSchoolAidTask[];
  userAidOffers: UserAidOffer[];
  topAction: AidAction | null;
};

const OVERALL_COPY: Record<
  ProtectOverallStatus,
  { headline: string; description: string }
> = {
  needs_attention: {
    headline: "Your aid needs attention",
    description:
      "You have at least one FAFSA, school portal, verification, or aid offer item that could affect your aid.",
  },
  needs_setup: {
    headline: "Set up your aid protection",
    description: "Add your FAFSA progress, schools, and aid offers so AidPilot can track what matters.",
  },
  in_progress: {
    headline: "Your aid protection is in progress",
    description:
      "You are tracking the right things. Keep checking for school portal, verification, and offer updates.",
  },
  protected: {
    headline: "No urgent aid protection issues found",
    description: "Keep checking your school portals and deadlines because aid requirements can change.",
  },
};

function categoryToOverall(status: ProtectCategoryStatus): ProtectOverallStatus {
  if (status === "waiting") return "needs_setup";
  return status;
}

function worstOverallStatus(statuses: ProtectCategoryStatus[]): ProtectOverallStatus {
  const overalls = statuses.map(categoryToOverall);
  if (overalls.includes("needs_attention")) return "needs_attention";
  if (overalls.includes("needs_setup")) return "needs_setup";
  if (overalls.includes("in_progress")) return "in_progress";
  return "protected";
}

export function getFafsaCategoryStatus(completedCount: number): ProtectCategoryStatus {
  if (completedCount >= FAFSA_STEPS.length) return "protected";
  if (completedCount >= 5) return "in_progress";
  return "needs_attention";
}

export function getSchoolFollowUpCategoryStatus(statuses: UserSchoolAidStatus[]): ProtectCategoryStatus {
  if (statuses.length === 0) return "needs_setup";

  const hasAttention = statuses.some(
    (school) =>
      school.documents_requested_status === "requested" ||
      school.fafsa_received_status === "not_received" ||
      school.fafsa_received_status === "action_needed"
  );
  if (hasAttention) return "needs_attention";

  const hasUncheckedPortal = statuses.some((school) => school.portal_checked_status === "not_checked");
  if (hasUncheckedPortal) return "in_progress";

  return "protected";
}

export function getVerificationCategoryStatus(statuses: UserSchoolAidStatus[]): ProtectCategoryStatus {
  if (statuses.length === 0) return "needs_setup";

  const hasAttention = statuses.some(
    (school) => school.verification_status === "requested" || school.verification_status === "action_needed"
  );
  if (hasAttention) return "needs_attention";

  const hasSubmitted = statuses.some((school) => school.verification_status === "submitted");
  if (hasSubmitted) return "in_progress";

  return "protected";
}

export function getAidOffersCategoryStatus(offers: UserAidOffer[]): ProtectCategoryStatus {
  if (offers.length === 0) return "waiting";

  const hasUnreviewedOfficial = offers.some((offer) => offer.offer_status === "official");
  if (hasUnreviewedOfficial) return "needs_attention";

  const hasDraftOrEstimated = offers.some(
    (offer) => offer.offer_status === "draft" || offer.offer_status === "estimated"
  );
  if (hasDraftOrEstimated) return "in_progress";

  if (offers.every((offer) => offer.offer_status === "reviewed")) return "protected";

  return "in_progress";
}

export function getProtectStatus(input: ProtectStatusInput): ProtectStatusSnapshot {
  const completedCount = input.completedFafsaPlanKeys.filter((key) =>
    FAFSA_STEPS.some((step) => step.planKey === key)
  ).length;
  const nextFafsaStep = getNextIncompleteStep(input.completedFafsaPlanKeys);

  const schoolsNotChecked = input.schoolAidStatuses.filter(
    (school) => school.portal_checked_status === "not_checked"
  ).length;
  const schoolsWithDocumentsRequested = input.schoolAidStatuses.filter(
    (school) => school.documents_requested_status === "requested"
  ).length;

  const verificationRequests = input.schoolAidStatuses.filter(
    (school) => school.verification_status === "requested" || school.verification_status === "action_needed"
  ).length;
  const verificationTasksOpen = input.schoolAidTasks.filter(
    (task) => task.task_type === "verification" && task.status === "todo"
  ).length;

  const unreviewedOffers = input.userAidOffers.filter((offer) => offer.offer_status !== "reviewed").length;
  const highestGapOffer = [...input.userAidOffers]
    .map((offer) => ({ offer, calculation: calculateAidOfferFromRecord(offer) }))
    .sort((a, b) => b.calculation.remainingGapAfterAllAid - a.calculation.remainingGapAfterAllAid)[0];

  const fafsaStatus = getFafsaCategoryStatus(completedCount);
  const schoolStatus = getSchoolFollowUpCategoryStatus(input.schoolAidStatuses);
  const verificationStatus = getVerificationCategoryStatus(input.schoolAidStatuses);
  const aidOffersStatus = getAidOffersCategoryStatus(input.userAidOffers);

  const categories: ProtectCategorySnapshot[] = [
    {
      key: "fafsa",
      title: "FAFSA Guide",
      status: fafsaStatus,
      href: nextFafsaStep ? `/fafsa/steps/${nextFafsaStep.planKey}` : "/fafsa",
      ctaLabel: "Continue FAFSA",
      summaryLines: [
        `${completedCount} of ${FAFSA_STEPS.length} steps complete`,
        nextFafsaStep ? `Next: ${nextFafsaStep.title}` : "All FAFSA guide steps complete",
      ],
      emptyMessage:
        completedCount === 0 ? "Start the FAFSA guide so AidPilot can track your progress." : undefined,
    },
    {
      key: "school_follow_up",
      title: "School Follow-Up",
      status: schoolStatus,
      href: "/fafsa/follow-up",
      ctaLabel: "Open Follow-Up Tracker",
      summaryLines: [
        `${input.schoolAidStatuses.length} school${input.schoolAidStatuses.length === 1 ? "" : "s"} tracked`,
        `${schoolsNotChecked} portal${schoolsNotChecked === 1 ? "" : "s"} not checked`,
        `${schoolsWithDocumentsRequested} document request${schoolsWithDocumentsRequested === 1 ? "" : "s"}`,
      ],
      emptyMessage:
        input.schoolAidStatuses.length === 0
          ? "Add schools to track whether each one received your FAFSA, requested documents, selected you for verification, or posted an aid offer."
          : undefined,
    },
    {
      key: "verification",
      title: "Verification",
      status: verificationStatus,
      href: "/fafsa/follow-up",
      ctaLabel: "Track Verification",
      summaryLines: [
        `${verificationRequests} verification request${verificationRequests === 1 ? "" : "s"}`,
        `${verificationTasksOpen} verification task${verificationTasksOpen === 1 ? "" : "s"} needing action`,
        "Aid may not be final until verification is complete.",
      ],
    },
    {
      key: "aid_offers",
      title: "Aid Offers",
      status: aidOffersStatus,
      href: "/aid-letter",
      ctaLabel: "Open Aid Offer Decoder",
      summaryLines: [
        `${input.userAidOffers.length} aid offer${input.userAidOffers.length === 1 ? "" : "s"} added`,
        `${unreviewedOffers} unreviewed offer${unreviewedOffers === 1 ? "" : "s"}`,
        highestGapOffer && highestGapOffer.calculation.remainingGapAfterAllAid > 0
          ? `Highest remaining gap: $${highestGapOffer.calculation.remainingGapAfterAllAid.toLocaleString()} (${highestGapOffer.offer.school_name})`
          : "Review grants, work-study, loans, and remaining cost.",
      ],
      emptyMessage:
        input.userAidOffers.length === 0
          ? "Add aid offers when schools post them so AidPilot can help you separate grants, work-study, loans, and remaining cost."
          : undefined,
    },
  ];

  const overallStatus = worstOverallStatus(categories.map((category) => category.status));
  const copy = OVERALL_COPY[overallStatus];

  return {
    overallStatus,
    headline: copy.headline,
    description: copy.description,
    categories,
    topAction: input.topAction,
  };
}
