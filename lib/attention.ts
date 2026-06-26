import type {
  AidTask,
  Deadline,
  DocumentItem,
  FafsaWorkflowStep,
  IntelligenceUserData,
  ScholarshipMatch,
  UserFafsaStep,
} from "@/lib/types";

export type AttentionSeverity = "critical" | "due_soon" | "needs_review" | "upcoming" | "info";

export type AttentionCategory =
  | "fafsa"
  | "documents"
  | "deadlines"
  | "eligibility"
  | "scholarships"
  | "aid_letter";

export type AttentionSource =
  | "task"
  | "document"
  | "deadline"
  | "fafsa"
  | "scholarship"
  | "aid_letter";

export type AttentionItem = {
  id: string;
  source: AttentionSource;
  title: string;
  category: AttentionCategory;
  severity: AttentionSeverity;
  status: string;
  dueDate?: string | null;
  amountAtRisk?: number | null;
  whyItMatters: string;
  nextStep: string;
  actionLabel: string;
  href: string;
};

const TASK_ATTENTION_STATUSES = new Set(["Due Soon", "Missing", "Needs Review", "Upcoming"]);

function normalizeAidTaskStatus(status: string): string {
  const map: Record<string, string> = {
    complete: "Complete",
    completed: "Complete",
    in_progress: "Due Soon",
    "due soon": "Due Soon",
    due_soon: "Due Soon",
    missing: "Missing",
    blocked: "Missing",
    not_started: "Upcoming",
    "needs review": "Needs Review",
    needs_review: "Needs Review",
    optional: "Optional",
    upcoming: "Upcoming",
  };
  if (TASK_ATTENTION_STATUSES.has(status) || status === "Complete" || status === "Optional") return status;
  return map[status.toLowerCase()] ?? "Upcoming";
}

function isTaskAttentionStatus(status: string): boolean {
  return TASK_ATTENTION_STATUSES.has(normalizeAidTaskStatus(status));
}

function normalizeDeadlineStatus(status: string): string {
  const map: Record<string, string> = {
    complete: "completed",
    completed: "completed",
    in_progress: "due soon",
    due_soon: "due soon",
    "due soon": "due soon",
    missed: "needs attention",
    "needs attention": "needs attention",
    needs_attention: "needs attention",
    upcoming: "upcoming",
  };
  return map[status.toLowerCase()] ?? status.toLowerCase();
}

const SEVERITY_ORDER: Record<AttentionSeverity, number> = {
  critical: 0,
  due_soon: 1,
  needs_review: 2,
  upcoming: 3,
  info: 4,
};

const SOURCE_ORDER: Record<AttentionSource, number> = {
  fafsa: 0,
  document: 1,
  deadline: 2,
  task: 3,
  scholarship: 4,
  aid_letter: 5,
};

const STRONG_MATCH_PERCENT = 80;
const SCHOLARSHIP_DEADLINE_WINDOW_DAYS = 30;
const DUE_SOON_DAYS = 14;

const FAFSA_ATTENTION_STATUSES = new Set(["not_started", "in_progress", "needs_review", "blocked"]);

const DOCUMENT_ATTENTION_STATUSES = new Set(["needed", "submitted", "needs review", "needs_review"]);

const DEADLINE_ATTENTION_STATUSES = new Set(["due soon", "needs attention", "upcoming"]);

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDocumentStatus(status: string): string {
  const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "missing") return "needed";
  if (normalized === "needs_review") return "needs_review";
  return normalized;
}

function isDocumentAttentionStatus(status: string): boolean {
  const normalized = normalizeDocumentStatus(status);
  return (
    DOCUMENT_ATTENTION_STATUSES.has(normalized) ||
    DOCUMENT_ATTENTION_STATUSES.has(status.trim().toLowerCase())
  );
}

function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isWithinDays(date: string | null | undefined, days: number): boolean {
  const remaining = daysUntil(date);
  return remaining !== null && remaining >= 0 && remaining <= days;
}

function isExpired(date: string | null | undefined): boolean {
  const remaining = daysUntil(date);
  return remaining !== null && remaining < 0;
}

function severityFromTask(status: string, dueDate?: string | null): AttentionSeverity {
  const normalized = normalizeAidTaskStatus(status);
  if (normalized === "Missing") return "critical";
  if (normalized === "Due Soon" || isWithinDays(dueDate, DUE_SOON_DAYS)) return "due_soon";
  if (normalized === "Needs Review") return "needs_review";
  if (normalized === "Upcoming") return "upcoming";
  return "info";
}

function severityFromDocument(status: string): AttentionSeverity {
  const normalized = normalizeDocumentStatus(status);
  if (normalized === "needed") return "critical";
  if (normalized === "needs_review" || status.toLowerCase() === "needs review") return "needs_review";
  if (normalized === "submitted") return "needs_review";
  return "info";
}

function severityFromDeadline(status: string, deadlineDate?: string | null): AttentionSeverity {
  const normalized = normalizeDeadlineStatus(status);
  if (normalized === "needs attention") return "critical";
  if (normalized === "due soon" || isWithinDays(deadlineDate, DUE_SOON_DAYS)) return "due_soon";
  if (normalized === "upcoming") return "upcoming";
  return "info";
}

function severityFromFafsa(status: string): AttentionSeverity {
  const normalized = status.trim().toLowerCase();
  if (normalized === "blocked") return "critical";
  if (normalized === "needs_review") return "needs_review";
  if (normalized === "in_progress") return "due_soon";
  if (normalized === "not_started") return "upcoming";
  return "info";
}

function severityFromScholarship(deadline: string | null | undefined, matchPercent: number | null): AttentionSeverity {
  if (isWithinDays(deadline, DUE_SOON_DAYS)) return "due_soon";
  if ((matchPercent ?? 0) >= STRONG_MATCH_PERCENT) return "needs_review";
  return "info";
}

export function getSeverityLabel(severity: AttentionSeverity): string {
  switch (severity) {
    case "critical":
      return "Needs attention";
    case "due_soon":
      return "Due soon";
    case "needs_review":
      return "Review this";
    case "upcoming":
      return "Upcoming";
    default:
      return "Note";
  }
}

export function attentionSeverityToTone(
  severity: AttentionSeverity
): "green" | "amber" | "coral" | "blue" | "gray" {
  switch (severity) {
    case "critical":
      return "coral";
    case "due_soon":
      return "amber";
    case "needs_review":
      return "blue";
    case "upcoming":
      return "blue";
    default:
      return "gray";
  }
}

export function sortAttentionItems(items: AttentionItem[]): AttentionItem[] {
  return [...items].sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;

    const aDays = daysUntil(a.dueDate);
    const bDays = daysUntil(b.dueDate);
    if (aDays !== null && bDays !== null && aDays !== bDays) return aDays - bDays;
    if (aDays !== null && bDays === null) return -1;
    if (aDays === null && bDays !== null) return 1;

    return SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source];
  });
}

export function getTaskAttentionItems(tasks: AidTask[] | null | undefined): AttentionItem[] {
  return safeArray(tasks)
    .filter((task) => isTaskAttentionStatus(task.status))
    .map((task) => {
      const status = normalizeAidTaskStatus(task.status);
      const severity = severityFromTask(status, task.due_date);

      return {
        id: `task-${task.id}`,
        source: "task" as const,
        title: task.title,
        category: "eligibility" as const,
        severity,
        status,
        dueDate: task.due_date,
        amountAtRisk: null,
        whyItMatters:
          status === "Missing"
            ? "An incomplete checklist step can delay verification or disbursement."
            : "This checklist step may affect your aid timing if it stays unresolved.",
        nextStep:
          status === "Missing"
            ? "Open your checklist and gather what is needed for this step."
            : "Review this task on your checklist and update its status when done.",
        actionLabel: "View checklist",
        href: "/checklist",
      };
    });
}

export function getDocumentAttentionItems(documents: DocumentItem[] | null | undefined): AttentionItem[] {
  return safeArray(documents)
    .filter((doc) => isDocumentAttentionStatus(doc.status))
    .map((doc) => {
      const normalized = normalizeDocumentStatus(doc.status);
      const displayStatus =
        normalized === "needs_review" ? "Needs Review" : normalized.replace(/_/g, " ");
      const severity = severityFromDocument(doc.status);

      return {
        id: `document-${doc.id}`,
        source: "document" as const,
        title: doc.title,
        category: "documents" as const,
        severity,
        status: displayStatus,
        dueDate: doc.due_date,
        amountAtRisk: null,
        whyItMatters:
          normalized === "needed"
            ? "Schools often hold aid until required documents are received."
            : normalized === "submitted"
              ? "Submitted documents may still need review before aid can move forward."
              : "This document may need a closer look before your aid file is complete.",
        nextStep:
          normalized === "needed"
            ? "Upload or submit this document through your school portal."
            : "Check your school portal for updates or follow up if review is taking longer than expected.",
        actionLabel: "View documents",
        href: "/documents",
      };
    });
}

export function getDeadlineAttentionItems(deadlines: Deadline[] | null | undefined): AttentionItem[] {
  return safeArray(deadlines)
    .filter((deadline) => DEADLINE_ATTENTION_STATUSES.has(normalizeDeadlineStatus(deadline.status)))
    .map((deadline) => {
      const status = normalizeDeadlineStatus(deadline.status);
      const severity = severityFromDeadline(status, deadline.deadline_date);

      return {
        id: `deadline-${deadline.id}`,
        source: "deadline" as const,
        title: deadline.title,
        category: "deadlines" as const,
        severity,
        status,
        dueDate: deadline.deadline_date,
        amountAtRisk: null,
        whyItMatters:
          status === "needs attention"
            ? "This deadline may affect your aid eligibility or enrollment if it passes unresolved."
            : "Staying ahead of aid deadlines helps protect grants, loans, and enrollment status.",
        nextStep: "Confirm the official date and mark progress on your deadlines page.",
        actionLabel: "View deadlines",
        href: "/deadlines",
      };
    });
}

export function getFafsaAttentionItems(
  userFafsaSteps: UserFafsaStep[] | null | undefined,
  workflowSteps: FafsaWorkflowStep[] | null | undefined = []
): AttentionItem[] {
  const stepsByWorkflowId = new Map(safeArray(userFafsaSteps).map((step) => [step.workflow_step_id, step]));
  const workflow = safeArray(workflowSteps);

  if (workflow.length === 0) {
    return safeArray(userFafsaSteps)
      .filter((step) => FAFSA_ATTENTION_STATUSES.has(step.status.trim().toLowerCase()))
      .map((step) => {
        const status = step.status.trim().toLowerCase();
        const title = step.workflow_step?.title ?? "FAFSA step";
        const severity = severityFromFafsa(status);

        return {
          id: `fafsa-${step.id}`,
          source: "fafsa" as const,
          title,
          category: "fafsa" as const,
          severity,
          status: status.replace(/_/g, " "),
          dueDate: null,
          amountAtRisk: null,
          whyItMatters: "FAFSA steps connect directly to federal and school aid eligibility.",
          nextStep: "Continue this step on the official FAFSA workflow page.",
          actionLabel: "View FAFSA steps",
          href: "/fafsa",
        };
      });
  }

  return workflow
    .map((workflowStep) => {
      const userStep = stepsByWorkflowId.get(workflowStep.id);
      const status = (userStep?.status ?? "not_started").trim().toLowerCase();
      return { workflowStep, userStep, status };
    })
    .filter(({ status }) => FAFSA_ATTENTION_STATUSES.has(status))
    .map(({ workflowStep, userStep, status }) => {
      const severity = severityFromFafsa(status);

      return {
        id: `fafsa-${userStep?.id ?? workflowStep.id}`,
        source: "fafsa" as const,
        title: workflowStep.title,
        category: "fafsa" as const,
        severity,
        status: status.replace(/_/g, " "),
        dueDate: null,
        amountAtRisk: null,
        whyItMatters: "Completing FAFSA steps on time helps schools calculate and release your aid package.",
        nextStep: "Work through this step using official StudentAid.gov resources.",
        actionLabel: "View FAFSA steps",
        href: "/fafsa",
      };
    });
}

function isScholarshipAttentionMatch(match: ScholarshipMatch): boolean {
  if (match.ignored || match.applied) return false;
  if (isExpired(match.deadline)) return false;

  const saved = match.is_saved || match.status === "saved";
  const strong = (match.match_percent ?? 0) >= STRONG_MATCH_PERCENT;
  const closingSoon = isWithinDays(match.deadline, SCHOLARSHIP_DEADLINE_WINDOW_DAYS);

  return saved || strong || closingSoon;
}

export function getScholarshipAttentionItems(
  scholarships: ScholarshipMatch[] | null | undefined
): AttentionItem[] {
  return safeArray(scholarships)
    .filter(isScholarshipAttentionMatch)
    .map((match) => {
      const severity = severityFromScholarship(match.deadline, match.match_percent);
      const saved = match.is_saved || match.status === "saved";

      return {
        id: `scholarship-${match.id}`,
        source: "scholarship" as const,
        title: match.name,
        category: "scholarships" as const,
        severity,
        status: saved ? "saved" : match.status,
        dueDate: match.deadline,
        amountAtRisk: match.amount,
        whyItMatters: saved
          ? "A saved scholarship is only useful if you follow through before the deadline."
          : "Strong or time-sensitive scholarships can reduce what you need to borrow.",
        nextStep: saved
          ? "Review requirements and start the application while there is still time."
          : "Open this match and decide whether to save or start an application.",
        actionLabel: "View scholarships",
        href: "/scholarships",
      };
    });
}

export function getAttentionItems(
  userData: Pick<
    IntelligenceUserData,
    "tasks" | "documents" | "deadlines" | "userFafsaSteps" | "workflowSteps" | "scholarships"
  >
): AttentionItem[] {
  const items = [
    ...getFafsaAttentionItems(userData.userFafsaSteps, userData.workflowSteps),
    ...getDocumentAttentionItems(userData.documents),
    ...getDeadlineAttentionItems(userData.deadlines),
    ...getTaskAttentionItems(userData.tasks),
    ...getScholarshipAttentionItems(userData.scholarships),
  ];

  return sortAttentionItems(items);
}

export function getTopAttentionItems(
  userData: Pick<
    IntelligenceUserData,
    "tasks" | "documents" | "deadlines" | "userFafsaSteps" | "workflowSteps" | "scholarships"
  >,
  limit = 5
): AttentionItem[] {
  return getAttentionItems(userData).slice(0, Math.max(0, limit));
}

export function getChecklistAttentionTasks(tasks: AidTask[] | null | undefined): AidTask[] {
  const taskItems = getTaskAttentionItems(tasks);
  const order = new Map(taskItems.map((item, index) => [item.id.replace(/^task-/, ""), index]));

  return safeArray(tasks)
    .filter((task) => order.has(task.id))
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
}
