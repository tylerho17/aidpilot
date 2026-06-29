import type { UserScholarshipStatus } from "@/lib/types";

export type ScholarshipUrgencyLevel = "urgent" | "high" | "medium" | "low";

export type ScholarshipUrgency = {
  level: ScholarshipUrgencyLevel;
  label: string;
  daysUntil: number | null;
};

const TERMINAL_STATUSES = new Set<UserScholarshipStatus>(["submitted", "won", "rejected", "skipped"]);

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function daysUntilDeadline(deadline: string | null | undefined, now = new Date()): number | null {
  if (!deadline) return null;
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = startOfDay(now);
  const due = startOfDay(parsed);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getScholarshipUrgency(
  deadline: string | null | undefined,
  status?: UserScholarshipStatus
): ScholarshipUrgency {
  const days = daysUntilDeadline(deadline);

  if (!deadline || days === null) {
    return { level: "low", label: "No deadline", daysUntil: null };
  }

  if (status && TERMINAL_STATUSES.has(status)) {
    return { level: "low", label: "Deadline passed tracking not needed", daysUntil: days };
  }

  if (days < 0) {
    return { level: "urgent", label: "Past due", daysUntil: days };
  }

  if (days <= 3) {
    return { level: "urgent", label: days === 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}`, daysUntil: days };
  }

  if (days <= 7) {
    return { level: "high", label: `Due in ${days} days`, daysUntil: days };
  }

  if (days <= 30) {
    return { level: "medium", label: `Due in ${days} days`, daysUntil: days };
  }

  return { level: "low", label: `Due in ${days} days`, daysUntil: days };
}

export function isDeadlineWithinDays(deadline: string | null | undefined, withinDays: number): boolean {
  const days = daysUntilDeadline(deadline);
  if (days === null) return false;
  return days >= 0 && days <= withinDays;
}

export const SCHOLARSHIP_LOAD_ERROR = "We couldn't load your scholarships right now. Please try again in a moment.";
export const SCHOLARSHIP_SAVE_ERROR = "We couldn't save this scholarship right now. Please try again.";

export const SCHOLARSHIP_STATUS_LABELS: Record<UserScholarshipStatus, string> = {
  saved: "Saved",
  researching: "Researching",
  applying: "Applying",
  submitted: "Submitted",
  won: "Won",
  rejected: "Rejected",
  skipped: "Skipped",
};

export const SCHOLARSHIP_PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function formatScholarshipAmount(
  amount: number | null | undefined,
  amountMin?: number | null,
  amountMax?: number | null
): string {
  if (amountMin != null && amountMax != null && amountMin !== amountMax) {
    return `$${amountMin.toLocaleString()}–$${amountMax.toLocaleString()}`;
  }
  if (amountMin != null) return `$${amountMin.toLocaleString()}`;
  if (amount != null && amount > 0) return `$${amount.toLocaleString()}`;
  return "Amount varies";
}

export function formatScholarshipDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "No deadline listed";
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return "No deadline listed";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
