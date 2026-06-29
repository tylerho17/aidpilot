import type {
  AidOfferStatus,
  DocumentsRequestedStatus,
  FafsaReceivedStatus,
  PortalCheckedStatus,
  SchoolAidTaskPriority,
  SchoolAidTaskType,
  UserSchoolAidStatus,
  UserSchoolAidTask,
  VerificationStatus,
} from "@/lib/types";
import {
  AID_OFFER_STATUSES,
  DOCUMENTS_REQUESTED_STATUSES,
  FAFSA_RECEIVED_STATUSES,
  PORTAL_CHECKED_STATUSES,
  SCHOOL_AID_TASK_TYPES,
  VERIFICATION_STATUSES,
} from "@/lib/types";

export const SCHOOL_AID_LOAD_ERROR = "We couldn't load your school tracker right now. Please try again in a moment.";
export const SCHOOL_AID_SAVE_ERROR = "We couldn't save that update right now. Your tracker was not changed.";

const PRIORITY_RANK: Record<SchoolAidTaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function isFafsaReceivedStatus(value: string): value is FafsaReceivedStatus {
  return (FAFSA_RECEIVED_STATUSES as readonly string[]).includes(value);
}

export function isPortalCheckedStatus(value: string): value is PortalCheckedStatus {
  return (PORTAL_CHECKED_STATUSES as readonly string[]).includes(value);
}

export function isDocumentsRequestedStatus(value: string): value is DocumentsRequestedStatus {
  return (DOCUMENTS_REQUESTED_STATUSES as readonly string[]).includes(value);
}

export function isVerificationStatus(value: string): value is VerificationStatus {
  return (VERIFICATION_STATUSES as readonly string[]).includes(value);
}

export function isAidOfferStatus(value: string): value is AidOfferStatus {
  return (AID_OFFER_STATUSES as readonly string[]).includes(value);
}

export function isSchoolAidTaskType(value: string): value is SchoolAidTaskType {
  return (SCHOOL_AID_TASK_TYPES as readonly string[]).includes(value);
}

export function getSchoolAidNextAction(status: UserSchoolAidStatus): string {
  if (status.portal_checked_status === "not_checked") {
    return "Log in to your school portal and check Financial Aid, Documents, Requirements, or Student Center.";
  }
  if (status.fafsa_received_status === "not_received") {
    return "Check whether your FAFSA was sent to this school and confirm the school is listed on your FAFSA.";
  }
  if (status.documents_requested_status === "requested") {
    return "Submit only the documents this school requested through its official portal.";
  }
  if (status.verification_status === "requested") {
    return "Complete verification using this school's instructions. Aid may not be final until this is done.";
  }
  if (status.aid_offer_status === "official") {
    return "Review your offer and separate grants, scholarships, work-study, loans, and remaining cost.";
  }
  if (status.aid_offer_status === "not_received") {
    return "Keep checking your school portal and email for your aid offer.";
  }
  return "No urgent action found. Check again later.";
}

export type SuggestedSchoolAidTask = {
  title: string;
  task_type: SchoolAidTaskType;
  priority: SchoolAidTaskPriority;
  description?: string;
};

export function getSuggestedTasksForStatus(
  status: UserSchoolAidStatus,
  existingTasks: UserSchoolAidTask[]
): SuggestedSchoolAidTask[] {
  const openTypes = new Set(
    existingTasks
      .filter((task) => task.school_aid_status_id === status.id && task.status === "todo")
      .map((task) => task.task_type)
  );

  const suggestions: SuggestedSchoolAidTask[] = [];

  if (!openTypes.has("portal_check")) {
    suggestions.push({
      title: "Check school portal",
      task_type: "portal_check",
      priority: "high",
      description: `Log in to ${status.school_name}'s official portal and review financial aid updates.`,
    });
  }

  if (status.documents_requested_status === "requested" && !openTypes.has("document_request")) {
    suggestions.push({
      title: "Submit requested financial aid documents",
      task_type: "document_request",
      priority: "urgent",
      description: "Use the school's official portal to submit only what was requested.",
    });
  }

  if (status.verification_status === "requested" && !openTypes.has("verification")) {
    suggestions.push({
      title: "Complete verification request",
      task_type: "verification",
      priority: "urgent",
      description: "Follow the school's verification instructions through official channels.",
    });
  }

  if (status.aid_offer_status === "official" && !openTypes.has("aid_offer")) {
    suggestions.push({
      title: "Review aid offer",
      task_type: "aid_offer",
      priority: "high",
      description: "Compare grants, scholarships, work-study, loans, and remaining cost.",
    });
  }

  return suggestions;
}

export function countUrgentFollowUpTasks(tasks: UserSchoolAidTask[]): number {
  return tasks.filter((task) => task.status === "todo" && task.priority === "urgent").length;
}

export function getMostUrgentFollowUpAction(
  statuses: UserSchoolAidStatus[],
  tasks: UserSchoolAidTask[]
): { schoolName: string; action: string } | null {
  const openTasks = tasks
    .filter((task) => task.status === "todo")
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);

  if (openTasks.length > 0) {
    const topTask = openTasks[0];
    const school = statuses.find((status) => status.id === topTask.school_aid_status_id);
    return {
      schoolName: school?.school_name ?? "A school on your list",
      action: topTask.title,
    };
  }

  for (const status of statuses) {
    const action = getSchoolAidNextAction(status);
    if (action !== "No urgent action found. Check again later.") {
      return { schoolName: status.school_name, action };
    }
  }

  return null;
}

export const FAFSA_RECEIVED_LABELS: Record<FafsaReceivedStatus, string> = {
  unknown: "Unknown",
  received: "Received",
  not_received: "Not received",
  action_needed: "Action needed",
};

export const PORTAL_CHECKED_LABELS: Record<PortalCheckedStatus, string> = {
  not_checked: "Not checked",
  checked: "Checked",
  action_needed: "Action needed",
};

export const DOCUMENTS_REQUESTED_LABELS: Record<DocumentsRequestedStatus, string> = {
  unknown: "Unknown",
  none: "None requested",
  requested: "Requested",
  submitted: "Submitted",
  completed: "Completed",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  not_requested: "Not requested",
  requested: "Requested",
  submitted: "Submitted",
  approved: "Approved",
  action_needed: "Action needed",
};

export const AID_OFFER_LABELS: Record<AidOfferStatus, string> = {
  not_received: "Not received",
  estimated: "Estimated",
  official: "Official offer",
  reviewed: "Reviewed",
  accepted_or_declined: "Accepted or declined",
};

export function formatLastCheckedAt(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
