import type { AidTask, Deadline, DocumentItem, ScholarshipMatch, StudentProfile, WeeklyReport } from "@/lib/types";
import { getChecklistAttentionTasks } from "@/lib/attention";
import { AID_TASK_STATUSES, DEADLINE_STATUSES, DOCUMENT_STATUSES } from "@/lib/types";

export { AID_TASK_STATUSES, DEADLINE_STATUSES, DOCUMENT_STATUSES };

const STATUS_ORDER: Record<string, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function parseCommaSeparated(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinCommaSeparated(values: string[] | null | undefined): string {
  return (values ?? []).join(", ");
}

export function normalizeAidTaskStatus(status: string): (typeof AID_TASK_STATUSES)[number] {
  const map: Record<string, (typeof AID_TASK_STATUSES)[number]> = {
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
  if ((AID_TASK_STATUSES as readonly string[]).includes(status)) return status as (typeof AID_TASK_STATUSES)[number];
  return map[status.toLowerCase()] ?? "Upcoming";
}

export function normalizeDeadlineStatus(status: string): (typeof DEADLINE_STATUSES)[number] {
  const map: Record<string, (typeof DEADLINE_STATUSES)[number]> = {
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
  if ((DEADLINE_STATUSES as readonly string[]).includes(status)) return status as (typeof DEADLINE_STATUSES)[number];
  return map[status.toLowerCase()] ?? "upcoming";
}

export function isAidTaskComplete(status: string) {
  return normalizeAidTaskStatus(status) === "Complete";
}

export function isDeadlineCompleted(status: string) {
  return normalizeDeadlineStatus(status) === "completed";
}

export function formatDueDate(date: string | null | undefined, fallback = "No date") {
  if (!date) return fallback;
  const parsed = new Date(date + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(name: string | null | undefined) {
  if (!name?.trim()) return "AP";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getCompletedTaskCount(tasks: AidTask[]) {
  return tasks.filter((t) => isAidTaskComplete(t.status)).length;
}

export function getChecklistProgressFromTasks(tasks: AidTask[]) {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => isAidTaskComplete(t.status)).length;
  return Math.round((done / tasks.length) * 100);
}

export function getAttentionCountFromTasks(tasks: AidTask[]) {
  return tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(normalizeAidTaskStatus(t.status))).length;
}

export const CHECKLIST_ATTENTION_STATUSES = ["Due Soon", "Missing", "Needs Review", "Upcoming"] as const;

export function isChecklistAttentionStatus(status: string) {
  const normalized = normalizeAidTaskStatus(status);
  return (CHECKLIST_ATTENTION_STATUSES as readonly string[]).includes(normalized);
}

export function getChecklistItemsNeedingAttention(tasks: AidTask[]) {
  return getChecklistAttentionTasks(tasks);
}

export function getMissingDocumentCountFromDocs(docs: DocumentItem[]) {
  return docs.filter((d) => d.status === "needed" || d.status === "Missing").length;
}

export function documentStatusToTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  switch (status) {
    case "verified":
    case "Uploaded":
    case "Complete":
      return "green";
    case "submitted":
    case "Needs Review":
      return "amber";
    case "needed":
    case "Missing":
      return "coral";
    case "not_started":
    case "Upcoming":
      return "blue";
    default:
      return "gray";
  }
}

export function formatDocumentStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function getUrgentTasksFromDb(tasks: AidTask[], limit = 3) {
  return [...tasks]
    .filter((t) => !isAidTaskComplete(t.status))
    .sort((a, b) => {
      const statusDiff =
        (STATUS_ORDER[normalizeAidTaskStatus(a.status)] ?? 99) -
        (STATUS_ORDER[normalizeAidTaskStatus(b.status)] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      return (PRIORITY_ORDER[a.priority ?? "Low"] ?? 99) - (PRIORITY_ORDER[b.priority ?? "Low"] ?? 99);
    })
    .slice(0, limit);
}

export function getNextDeadlineFromTasks(tasks: AidTask[]) {
  const urgent = getUrgentTasksFromDb(tasks, 1)[0];
  if (!urgent) return "None";
  return formatDueDate(urgent.due_date, urgent.status);
}

export function resolveScholarshipMatches(matches: ScholarshipMatch[]) {
  const engineMatches = matches.filter((m) => m.scholarship_id);
  return engineMatches.length > 0 ? engineMatches : matches;
}

export function isNewScholarshipMatch(match: ScholarshipMatch) {
  if (match.ignored || match.applied || match.is_saved) return false;
  if (match.status === "ignored" || match.status === "applied" || match.status === "saved") return false;
  return true;
}

export type ScholarshipMatchTab = "new" | "saved" | "applied" | "ignored";

export function filterScholarshipMatchesByTab(matches: ScholarshipMatch[], tab: ScholarshipMatchTab) {
  switch (tab) {
    case "saved":
      return matches.filter((m) => m.is_saved && !m.applied && !m.ignored);
    case "applied":
      return matches.filter((m) => m.applied);
    case "ignored":
      return matches.filter((m) => m.ignored);
    default:
      return matches.filter((m) => isNewScholarshipMatch(m));
  }
}

export function getScholarshipStatsFromDb(scholarships: ScholarshipMatch[]) {
  const visible = resolveScholarshipMatches(scholarships);
  const newMatches = visible.filter((m) => isNewScholarshipMatch(m));
  const active = visible.filter((m) => !m.ignored);
  const totalPotential = newMatches.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const strongMatches = active.filter((s) => (s.match_percent ?? 0) >= 80).length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const deadlinesThisMonth = active.filter((s) => {
    if (!s.deadline) return false;
    const d = new Date(s.deadline + "T12:00:00");
    return d >= monthStart && d <= monthEnd;
  }).length;

  return {
    newCount: newMatches.length,
    totalPotential,
    totalPotentialLabel: `$${totalPotential.toLocaleString()}`,
    strongMatches,
    deadlinesThisMonth,
  };
}

export function getFeaturedScholarshipFromDb(scholarships: ScholarshipMatch[]) {
  const visible = resolveScholarshipMatches(scholarships);
  const newMatches = visible.filter((m) => isNewScholarshipMatch(m));
  return (
    [...newMatches].sort((a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0))[0] ?? null
  );
}

export function formatScholarshipDeadline(deadline: string | null) {
  if (!deadline) return "Plenty of time";
  const d = new Date(deadline + "T12:00:00");
  const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Closed";
  if (days <= 14) return `Closes in ${days} days`;
  if (days <= 30) return `Closes in ${days} days`;
  return "Plenty of time";
}

export function isDeadlineUrgent(deadline: string | null) {
  if (!deadline) return false;
  const d = new Date(deadline + "T12:00:00");
  const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 30;
}

export function statusToTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  const taskStatus = normalizeAidTaskStatus(status);
  const deadlineStatus = normalizeDeadlineStatus(status);

  switch (taskStatus) {
    case "Complete":
      return "green";
    case "Due Soon":
      return "amber";
    case "Missing":
      return "coral";
    case "Needs Review":
    case "Upcoming":
      return "blue";
    case "Optional":
      return "gray";
    default:
      break;
  }

  switch (deadlineStatus) {
    case "completed":
      return "green";
    case "due soon":
      return "amber";
    case "needs attention":
      return "coral";
    case "upcoming":
      return "blue";
    default:
      break;
  }

  switch (status) {
    case "verified":
    case "submitted":
    case "needed":
    case "not_started":
      return status === "verified" ? "green" : status === "submitted" ? "amber" : status === "needed" ? "coral" : "blue";
    default:
      return "gray";
  }
}

export function deadlineStatusToTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  return statusToTone(status);
}

export function getWeekStartMonday(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function sortDeadlinesByDate(deadlines: Deadline[]) {
  return [...deadlines].sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));
}

export function getUpcomingDeadlines(deadlines: Deadline[], limit = 3) {
  return sortDeadlinesByDate(deadlines)
    .filter((d) => !isDeadlineCompleted(d.status))
    .slice(0, limit);
}

export function getNextDeadlineFromDeadlines(deadlines: Deadline[]) {
  const next = getUpcomingDeadlines(deadlines, 1)[0];
  if (!next) return "None";
  return formatDueDate(next.deadline_date);
}

export function getDeadlinesThisMonthCount(deadlines: Deadline[]) {
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return deadlines.filter((d) => {
    if (isDeadlineCompleted(d.status)) return false;
    const parsed = new Date(d.deadline_date + "T12:00:00");
    return parsed >= now && parsed <= monthEnd;
  }).length;
}

export function getDashboardSummary(
  profile: StudentProfile | null,
  tasks: AidTask[],
  deadlines: Deadline[] = [],
  weeklyReport: WeeklyReport | null = null
) {
  const attention = getAttentionCountFromTasks(tasks);
  const nextDeadline = deadlines.length ? getNextDeadlineFromDeadlines(deadlines) : getNextDeadlineFromTasks(tasks);
  const aidStatus = weeklyReport?.aid_status ?? (attention <= 2 ? "Protected" : "Needs attention");
  const protectedStatus = aidStatus === "Protected" ? "Protected" : aidStatus === "At risk" ? "At risk" : "Needs attention";

  return {
    aidStatus: protectedStatus,
    aidAtRisk: "$2,400",
    nextDeadline,
    weeklyCheckIn: profile?.is_onboarded ? "On track" : "Getting started",
    protectedMessage:
      protectedStatus === "Protected"
        ? "Your aid is protected this week."
        : protectedStatus === "At risk"
          ? "Your aid may be at risk this week."
          : "Your aid needs a little attention this week.",
  };
}

export function buildClientWeeklyReport(
  tasks: AidTask[],
  documents: DocumentItem[],
  scholarships: ScholarshipMatch[],
  deadlines: Deadline[]
) {
  const tasksDue = tasks.filter((t) =>
    ["Due Soon", "Missing", "Needs Review"].includes(normalizeAidTaskStatus(t.status))
  ).length;
  const missingDocs = getMissingDocumentCountFromDocs(documents);
  const scholarshipCount = scholarships.length;
  const potentialAmount = scholarships
    .filter((s) => s.status === "new" || s.status === "saved" || s.is_saved)
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const attentionDeadlines = deadlines.filter((d) =>
    ["due soon", "needs attention"].includes(normalizeDeadlineStatus(d.status))
  ).length;
  const aidStatus = attentionDeadlines >= 2 || missingDocs >= 2 ? "Needs attention" : "Protected";

  return {
    aid_status: aidStatus,
    summary:
      aidStatus === "Protected"
        ? "Your aid is protected this week. Review upcoming deadlines and scholarship matches."
        : "Your aid needs attention this week. Check deadlines, documents, and verification tasks.",
    tasks_due_count: tasksDue,
    missing_documents_count: missingDocs,
    scholarship_count: scholarshipCount,
    potential_scholarship_amount: potentialAmount,
    recommendations: [
      {
        title: "Review school portal",
        body: "Check for missing documents or verification requests this week.",
      },
      {
        title: "Start one scholarship",
        body: "Pick one strong scholarship match and begin the application.",
      },
      {
        title: "Confirm Cal Grant status",
        body: "California students should confirm state aid status before priority deadlines.",
      },
    ],
  };
}
