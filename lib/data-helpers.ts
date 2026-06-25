import type { AidTask, DocumentItem, ScholarshipMatch, StudentProfile } from "@/lib/types";

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
  return docs.filter((d) => d.status === "Missing").length;
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
  const weekly = scholarships.filter((s) => s.status === "new");
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
  return (
    scholarships.find((s) => s.status === "new" && (s.match_percent ?? 0) >= 90) ??
    scholarships[0] ??
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

export function getDashboardSummary(profile: StudentProfile | null, tasks: AidTask[]) {
  const attention = getAttentionCountFromTasks(tasks);
  const nextDeadline = getNextDeadlineFromTasks(tasks);
  const protectedStatus = attention <= 2 ? "Protected" : "Needs attention";

  return {
    aidStatus: protectedStatus,
    aidAtRisk: "$2,400",
    nextDeadline,
    weeklyCheckIn: profile?.is_onboarded ? "On track" : "Getting started",
    protectedMessage:
      protectedStatus === "Protected"
        ? "Your aid is protected this week."
        : "Your aid needs a little attention this week.",
  };
}

export function statusToTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  switch (status) {
    case "Complete":
    case "Uploaded":
      return "green";
    case "Due Soon":
      return "amber";
    case "Missing":
      return "coral";
    case "Needs Review":
      return "blue";
    default:
      return "gray";
  }
}
