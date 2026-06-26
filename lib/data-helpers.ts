import type { AidTask, Deadline, DocumentItem, ScholarshipMatch, StudentProfile, WeeklyReport } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function formatDueDate(date: string | null | undefined, fallback = "No date") {
  if (!date) return fallback;
  const parsed = new Date(date + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getInitials(name: string | null | undefined) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getCompletedTaskCount(tasks: AidTask[]) {
  return tasks.filter((t) => t.status === "Complete").length;
}

export function getChecklistProgressFromTasks(tasks: AidTask[]) {
  if (!tasks.length) return 0;
  return Math.round((getCompletedTaskCount(tasks) / tasks.length) * 100);
}

export function getAttentionCountFromTasks(tasks: AidTask[]) {
  return tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(t.status)).length;
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
    .filter((t) => t.status !== "Complete")
    .sort((a, b) => {
      const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
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

export function getScholarshipStatsFromDb(scholarships: ScholarshipMatch[]) {
  const weekly = scholarships.filter((s) => s.status === "new" && !s.ignored && !s.applied);
  const totalPotential = weekly.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const strongMatches = weekly.filter((s) => (s.match_percent ?? 0) >= 88).length;
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const deadlinesThisMonth = weekly.filter((s) => {
    if (!s.deadline) return false;
    const d = new Date(s.deadline + "T12:00:00");
    return d >= now && d <= monthEnd;
  }).length;

  return {
    newCount: weekly.length,
    totalPotential,
    totalPotentialLabel: `$${totalPotential.toLocaleString()}`,
    strongMatches,
    deadlinesThisMonth,
  };
}

export function getFeaturedScholarshipFromDb(scholarships: ScholarshipMatch[]) {
  const eligible = scholarships.filter((s) => !s.ignored && !s.applied && !s.is_saved);
  return (
    eligible.find((s) => (s.match_percent ?? 0) >= 90) ??
    eligible[0] ??
    null
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
  switch (status) {
    case "Complete":
    case "Uploaded":
    case "complete":
    case "completed":
      return "green";
    case "Due Soon":
    case "due soon":
      return "amber";
    case "Missing":
    case "needs attention":
      return "coral";
    case "Needs Review":
    case "upcoming":
      return "blue";
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
    .filter((d) => d.status !== "complete" && d.status !== "completed")
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
    if (d.status === "complete" || d.status === "completed") return false;
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
  const tasksDue = tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(t.status)).length;
  const missingDocs = getMissingDocumentCountFromDocs(documents);
  const scholarshipCount = scholarships.length;
  const potentialAmount = scholarships
    .filter((s) => s.status === "new" || s.status === "saved" || s.is_saved)
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const attentionDeadlines = deadlines.filter((d) =>
    ["due soon", "needs attention"].includes(d.status)
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
