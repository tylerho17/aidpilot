import type { FafsaStep } from "@/lib/fafsa/steps";
import { getFafsaStepHref } from "@/lib/fafsa/steps";
import { calculateAidOfferFromRecord, normalizeSchoolName } from "@/lib/aid-letter/calculateAidOffer";
import type { Deadline, DocumentItem, UserAidOffer, UserSchoolAidStatus, UserSchoolAidTask } from "@/lib/types";
import type { AidAction, AidActionPriority } from "@/lib/aid-actions/types";

export type AidActionsInput = {
  fafsaSteps: FafsaStep[];
  completedFafsaPlanKeys: string[];
  schoolAidStatuses: UserSchoolAidStatus[];
  schoolAidTasks: UserSchoolAidTask[];
  userAidOffers?: UserAidOffer[];
  deadlines?: Deadline[];
  documents?: DocumentItem[];
};

const PRIORITY_RANK: Record<AidActionPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const TASK_TYPE_SOURCE: Record<UserSchoolAidTask["task_type"], AidAction["source"]> = {
  portal_check: "school_follow_up",
  document_request: "document",
  verification: "verification",
  aid_offer: "aid_offer",
  general: "school_follow_up",
};

function sortActions(actions: AidAction[]): AidAction[] {
  return [...actions].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
}

function daysUntil(dateValue: string): number | null {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function deadlinePriority(days: number): AidActionPriority {
  if (days <= 3) return "urgent";
  if (days <= 7) return "high";
  return "medium";
}

function isOpenDocument(doc: DocumentItem): boolean {
  const status = String(doc.status).toLowerCase();
  return status === "needed" || status === "not_started" || status === "missing";
}

function isUpcomingDeadline(deadline: Deadline): boolean {
  const status = String(deadline.status).toLowerCase();
  return status !== "completed";
}

export function getAidActions(input: AidActionsInput): AidAction[] {
  const actions: AidAction[] = [];
  const {
    fafsaSteps,
    completedFafsaPlanKeys,
    schoolAidStatuses,
    schoolAidTasks,
    userAidOffers = [],
    deadlines = [],
    documents = [],
  } = input;

  const completed = new Set(completedFafsaPlanKeys);
  const nextFafsaStep = fafsaSteps.find((step) => !completed.has(step.planKey)) ?? null;
  if (nextFafsaStep) {
    actions.push({
      id: `fafsa-step-${nextFafsaStep.planKey}`,
      title: `Continue FAFSA guide: ${nextFafsaStep.title}`,
      description: "Stay on track by completing the next FAFSA step.",
      priority: "medium",
      source: "fafsa_step",
      href: getFafsaStepHref(nextFafsaStep.planKey),
      ctaLabel: "Continue FAFSA",
    });
  }

  const offerBySchool = new Map(userAidOffers.map((offer) => [normalizeSchoolName(offer.school_name), offer]));
  const addedOfferSchools = new Set<string>();

  for (const school of schoolAidStatuses) {
    if (school.portal_checked_status === "not_checked") {
      actions.push({
        id: `portal-not-checked-${school.id}`,
        title: `Check ${school.school_name} financial aid portal`,
        description:
          "Schools may post document requests, verification tasks, or aid offers in their own portals.",
        priority: "high",
        source: "school_follow_up",
        href: "/fafsa/follow-up",
        ctaLabel: "Open tracker",
      });
    }

    if (school.fafsa_received_status === "not_received" || school.fafsa_received_status === "action_needed") {
      actions.push({
        id: `fafsa-not-received-${school.id}`,
        title: `Confirm FAFSA status for ${school.school_name}`,
        description:
          "This school may not have received your FAFSA yet. Confirm the school is listed on your FAFSA and check the portal.",
        priority: "urgent",
        source: "school_follow_up",
        href: "/fafsa/follow-up",
        ctaLabel: "Fix FAFSA status",
      });
    }

    if (school.documents_requested_status === "requested") {
      actions.push({
        id: `documents-requested-${school.id}`,
        title: `Submit requested documents for ${school.school_name}`,
        description: "Submit only the documents this school requested through its official portal.",
        priority: "urgent",
        source: "document",
        href: "/fafsa/follow-up",
        ctaLabel: "Track documents",
      });
    }

    if (school.verification_status === "requested" || school.verification_status === "action_needed") {
      actions.push({
        id: `verification-requested-${school.id}`,
        title: `Complete verification for ${school.school_name}`,
        description: "Aid may not be final until verification is complete.",
        priority: "urgent",
        source: "verification",
        href: "/fafsa/follow-up",
        ctaLabel: "Track verification",
      });
    }

    if (school.aid_offer_status === "official") {
      const key = normalizeSchoolName(school.school_name);
      if (!offerBySchool.has(key)) {
        actions.push({
          id: `aid-offer-official-${school.id}`,
          title: `Review aid offer from ${school.school_name}`,
          description: "Separate grants, scholarships, work-study, loans, and remaining cost before deciding.",
          priority: "high",
          source: "aid_offer",
          href: "/aid-letter",
          ctaLabel: "Decode offer",
        });
      }
    }
  }

  for (const offer of userAidOffers) {
    const key = normalizeSchoolName(offer.school_name);
    const calc = calculateAidOfferFromRecord(offer);

    if (offer.offer_status !== "reviewed" && !addedOfferSchools.has(key)) {
      actions.push({
        id: `aid-offer-review-${offer.id}`,
        title: `Review ${offer.school_name} aid offer`,
        description: "Make sure you understand gift aid, work-study, loans, and your remaining gap.",
        priority: "high",
        source: "aid_offer",
        href: "/aid-letter",
        ctaLabel: "Review offer",
      });
      addedOfferSchools.add(key);
    }

    if (calc.remainingGapAfterAllAid > 0) {
      actions.push({
        id: `aid-offer-gap-${offer.id}`,
        title: `Make a plan for ${offer.school_name}'s remaining gap`,
        description: "This offer still has an uncovered cost after aid shown.",
        priority: "medium",
        source: "aid_offer",
        href: "/aid-letter",
        ctaLabel: "View gap",
      });
    }
  }

  for (const task of schoolAidTasks) {
    if (task.status !== "todo") continue;

    actions.push({
      id: `school-task-${task.id}`,
      title: task.title,
      description: task.description?.trim() || "Review this financial aid task.",
      priority: task.priority,
      source: TASK_TYPE_SOURCE[task.task_type],
      href: "/fafsa/follow-up",
      ctaLabel: "Open task",
    });
  }

  for (const deadline of deadlines) {
    if (!isUpcomingDeadline(deadline)) continue;
    const days = daysUntil(deadline.deadline_date);
    if (days === null || days < 0) continue;

    actions.push({
      id: `deadline-${deadline.id}`,
      title: deadline.title,
      description: deadline.description?.trim() || "A financial aid deadline is coming up.",
      priority: deadlinePriority(days),
      source: "deadline",
      href: deadline.action_url?.trim() || "/deadlines",
      ctaLabel: "View deadline",
    });
  }

  for (const document of documents) {
    if (!isOpenDocument(document)) continue;

    const days = document.due_date ? daysUntil(document.due_date) : null;
    const priority: AidActionPriority =
      days !== null && days <= 3 ? "urgent" : days !== null && days <= 7 ? "high" : "medium";

    actions.push({
      id: `document-${document.id}`,
      title: `Gather document: ${document.title}`,
      description: document.note?.trim() || "This document is still needed for your aid process.",
      priority,
      source: "document",
      href: "/documents",
      ctaLabel: "View documents",
    });
  }

  return sortActions(actions);
}

export function getTopAidAction(input: AidActionsInput): AidAction | null {
  const actions = getAidActions(input);
  return actions[0] ?? null;
}

export function getFollowUpRelatedActions(actions: AidAction[]): AidAction[] {
  return actions.filter(
    (action) =>
      (action.priority === "urgent" || action.priority === "high") &&
      (action.source === "school_follow_up" ||
        action.source === "verification" ||
        action.source === "document" ||
        action.source === "aid_offer" ||
        action.href === "/fafsa/follow-up")
  );
}
