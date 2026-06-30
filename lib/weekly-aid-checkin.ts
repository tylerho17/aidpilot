import { AID_OFFER_TASK_SOURCE, getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import { getPrimaryGapOffer } from "@/lib/aid-letter/buildScholarshipGapPlan";
import {
  getMissingDocumentCountFromDocs,
  isAidTaskComplete,
  isDeadlineCompleted,
  isDeadlineUrgent,
  normalizeAidTaskStatus,
  sortDeadlinesByDate,
} from "@/lib/data-helpers";
import { getChecklistOnlyTasks } from "@/lib/fafsa-plan";
import type { AidTask, Deadline, DocumentItem, FafsaIntakeResponse, ScholarshipMatch, UserAidOffer } from "@/lib/types";

export type WeeklyAidRiskStatus = "Protected" | "Needs attention" | "At risk";

export type WeeklyAidCheckInItem = {
  id: string;
  label: string;
  href?: string;
};

export type WeeklyAidCheckIn = {
  isEmpty: boolean;
  riskStatus: WeeklyAidRiskStatus;
  urgentTaskCount: number;
  upcomingDeadlineCount: number;
  missingDocumentCount: number;
  aidOffersNeedingReviewCount: number;
  recommendedNextAction: string;
  recommendedNextActionHref?: string;
  recommendedThisWeek: WeeklyAidCheckInItem[];
};

export type WeeklyAidCheckInInput = {
  tasks: AidTask[];
  documents: DocumentItem[];
  deadlines: Deadline[];
  aidOffers: UserAidOffer[];
  scholarships: ScholarshipMatch[];
  fafsaIntake: FafsaIntakeResponse | null;
  protectAction?: WeeklyAidCheckInItem | null;
};

function isMissingDocument(doc: DocumentItem): boolean {
  const status = String(doc.status).toLowerCase();
  return status === "needed" || status === "missing" || status === "not_started";
}

function isOpenAidOfferTask(task: AidTask): boolean {
  return task.task_source === AID_OFFER_TASK_SOURCE && !isAidTaskComplete(task.status);
}

function isRemainingGapTask(task: AidTask): boolean {
  return Boolean(task.plan_key?.endsWith(":remaining_gap"));
}

function offerIdFromPlanKey(planKey?: string | null): string | null {
  if (!planKey?.startsWith("aid_offer:")) return null;
  const parts = planKey.split(":");
  return parts.length >= 3 ? parts[1] : null;
}

function taskHref(task: AidTask): string | undefined {
  if (task.action_url) return task.action_url;
  const offerId = offerIdFromPlanKey(task.plan_key);
  if (offerId) return getAidOfferReportHref(offerId);
  return undefined;
}

function countUrgentTasks(tasks: AidTask[]): number {
  return tasks.filter((task) => {
    if (isAidTaskComplete(task.status)) return false;
    const status = normalizeAidTaskStatus(task.status);
    return status === "Due Soon" || status === "Missing" || status === "Needs Review";
  }).length;
}

function getUrgentDeadlines(deadlines: Deadline[]): Deadline[] {
  return sortDeadlinesByDate(deadlines).filter(
    (deadline) => !isDeadlineCompleted(deadline.status) && isDeadlineUrgent(deadline.deadline_date)
  );
}

function getUpcomingDeadlines(deadlines: Deadline[]): Deadline[] {
  return sortDeadlinesByDate(deadlines).filter((deadline) => {
    if (isDeadlineCompleted(deadline.status)) return false;
    if (isDeadlineUrgent(deadline.deadline_date)) return false;
    const parsed = new Date(deadline.deadline_date + "T12:00:00");
    return !Number.isNaN(parsed.getTime()) && parsed.getTime() >= Date.now();
  });
}

function getRiskStatus(input: {
  missingDocumentCount: number;
  urgentDeadlineCount: number;
  hasRemainingGapTasks: boolean;
  draftOfferCount: number;
  upcomingDeadlineCount: number;
  openAidOfferTaskCount: number;
}): WeeklyAidRiskStatus {
  if (
    input.missingDocumentCount > 0 ||
    input.urgentDeadlineCount > 0 ||
    input.hasRemainingGapTasks
  ) {
    return "At risk";
  }

  if (
    input.draftOfferCount > 0 ||
    input.upcomingDeadlineCount > 0 ||
    input.openAidOfferTaskCount > 0
  ) {
    return "Needs attention";
  }

  return "Protected";
}

function getRecommendedNextAction(input: {
  missingDocuments: DocumentItem[];
  urgentDeadlines: Deadline[];
  remainingGapTasks: AidTask[];
  draftOffers: UserAidOffer[];
  scholarships: ScholarshipMatch[];
}): { label: string; href?: string } {
  const missingDoc = input.missingDocuments[0];
  if (missingDoc) {
    return {
      label: `Upload or track missing document: ${missingDoc.title}`,
      href: "/documents",
    };
  }

  const urgentDeadline = input.urgentDeadlines[0];
  if (urgentDeadline) {
    return {
      label: `Deadline coming up: ${urgentDeadline.title}`,
      href: "/deadlines",
    };
  }

  const gapTask = input.remainingGapTasks[0];
  if (gapTask) {
    return {
      label: gapTask.title,
      href: taskHref(gapTask) ?? "/aid-letter",
    };
  }

  const draftOffer = input.draftOffers[0];
  if (draftOffer) {
    return {
      label: `Finish reviewing draft aid offer for ${draftOffer.school_name}`,
      href: getAidOfferReportHref(draftOffer.id),
    };
  }

  const scholarship = input.scholarships.find((match) => match.status === "new" || match.status === "matched");
  if (scholarship) {
    return {
      label: `Review scholarship opportunity: ${scholarship.name}`,
      href: "/scholarships",
    };
  }

  return {
    label: "You're protected this week. Check again when new aid updates arrive.",
  };
}

function buildRecommendedThisWeek(input: {
  missingDocuments: DocumentItem[];
  urgentDeadlines: Deadline[];
  upcomingDeadlines: Deadline[];
  openAidOfferTasks: AidTask[];
  draftOffers: UserAidOffer[];
  scholarships: ScholarshipMatch[];
  protectAction?: WeeklyAidCheckInItem | null;
  primaryGapOffer?: { offer: UserAidOffer; calculation: ReturnType<typeof calculateAidOfferFromRecord> } | null;
}): WeeklyAidCheckInItem[] {
  const items: WeeklyAidCheckInItem[] = [];

  const missingDoc = input.missingDocuments[0];
  if (missingDoc) {
    items.push({
      id: `doc-${missingDoc.id}`,
      label: `Missing document: ${missingDoc.title}`,
      href: "/documents",
    });
  }

  for (const deadline of input.urgentDeadlines.slice(0, 2)) {
    items.push({
      id: `deadline-urgent-${deadline.id}`,
      label: `Deadline due soon: ${deadline.title}`,
      href: "/deadlines",
    });
  }

  if (input.primaryGapOffer) {
    items.push({
      id: `scholarship-gap-${input.primaryGapOffer.offer.id}`,
      label: "Start your scholarship gap plan",
      href: getAidOfferReportHref(input.primaryGapOffer.offer.id),
    });
  }

  for (const task of input.openAidOfferTasks.slice(0, 2)) {
    items.push({
      id: `aid-task-${task.id}`,
      label: task.title,
      href: taskHref(task),
    });
  }

  if (input.protectAction) {
    items.push(input.protectAction);
  }

  for (const offer of input.draftOffers.slice(0, 1)) {
    items.push({
      id: `draft-offer-${offer.id}`,
      label: `Review draft aid offer: ${offer.school_name}`,
      href: getAidOfferReportHref(offer.id),
    });
  }

  for (const deadline of input.upcomingDeadlines.slice(0, 1)) {
    items.push({
      id: `deadline-upcoming-${deadline.id}`,
      label: `Upcoming deadline: ${deadline.title}`,
      href: "/deadlines",
    });
  }

  const scholarship = input.scholarships.find((match) => match.status === "new" || match.status === "matched");
  if (scholarship) {
    items.push({
      id: `scholarship-${scholarship.id}`,
      label: `Scholarship to review: ${scholarship.name}`,
      href: "/scholarships",
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 5);
}

function hasWeeklyCheckInData(input: WeeklyAidCheckInInput): boolean {
  return (
    input.aidOffers.length > 0 ||
    Boolean(input.fafsaIntake) ||
    input.tasks.length > 0 ||
    input.deadlines.length > 0 ||
    input.documents.length > 0 ||
    input.scholarships.length > 0
  );
}

export function buildWeeklyAidCheckIn(input: WeeklyAidCheckInInput): WeeklyAidCheckIn {
  if (!hasWeeklyCheckInData(input)) {
    return {
      isEmpty: true,
      riskStatus: "Protected",
      urgentTaskCount: 0,
      upcomingDeadlineCount: 0,
      missingDocumentCount: 0,
      aidOffersNeedingReviewCount: 0,
      recommendedNextAction: "Add your first aid offer or FAFSA step to get your weekly aid check-in.",
      recommendedThisWeek: [],
    };
  }

  const checklistTasks = getChecklistOnlyTasks(input.tasks);
  const allCountableTasks = [...checklistTasks, ...input.tasks.filter((task) => task.task_source === AID_OFFER_TASK_SOURCE)];
  const missingDocuments = input.documents.filter(isMissingDocument);
  const urgentDeadlines = getUrgentDeadlines(input.deadlines);
  const upcomingDeadlines = getUpcomingDeadlines(input.deadlines);
  const openAidOfferTasks = input.tasks.filter(isOpenAidOfferTask);
  const remainingGapTasks = openAidOfferTasks.filter(isRemainingGapTask);
  const draftOffers = input.aidOffers.filter((offer) => offer.offer_status === "draft");
  const aidOffersNeedingReview = input.aidOffers.filter((offer) => offer.offer_status !== "reviewed");
  const primaryGapOffer = getPrimaryGapOffer(input.aidOffers, calculateAidOfferFromRecord);

  const nextAction = getRecommendedNextAction({
    missingDocuments,
    urgentDeadlines,
    remainingGapTasks,
    draftOffers,
    scholarships: input.scholarships,
  });

  return {
    isEmpty: false,
    riskStatus: getRiskStatus({
      missingDocumentCount: missingDocuments.length,
      urgentDeadlineCount: urgentDeadlines.length,
      hasRemainingGapTasks: remainingGapTasks.length > 0,
      draftOfferCount: draftOffers.length,
      upcomingDeadlineCount: upcomingDeadlines.length,
      openAidOfferTaskCount: openAidOfferTasks.length,
    }),
    urgentTaskCount: countUrgentTasks(allCountableTasks),
    upcomingDeadlineCount: upcomingDeadlines.length + urgentDeadlines.length,
    missingDocumentCount: getMissingDocumentCountFromDocs(input.documents),
    aidOffersNeedingReviewCount: aidOffersNeedingReview.length,
    recommendedNextAction: nextAction.label,
    recommendedNextActionHref: nextAction.href,
    recommendedThisWeek: buildRecommendedThisWeek({
      missingDocuments,
      urgentDeadlines,
      upcomingDeadlines,
      openAidOfferTasks,
      draftOffers,
      scholarships: input.scholarships,
      protectAction: input.protectAction,
      primaryGapOffer,
    }),
  };
}