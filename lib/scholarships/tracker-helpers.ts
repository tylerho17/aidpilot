import type { CatalogScholarship, UserScholarshipMatch } from "@/lib/types";
import { formatScholarshipAmount, isDeadlineWithinDays } from "@/lib/scholarships/getScholarshipUrgency";

export type ScholarshipTrackerItem = {
  matchId?: string;
  scholarshipId?: string | null;
  name: string;
  provider: string | null;
  amountLabel: string;
  deadline: string | null;
  applicationUrl: string | null;
  matchReason: string | null;
  notes: string | null;
  status?: UserScholarshipMatch["status"];
  priority?: UserScholarshipMatch["priority"];
  isSample: boolean;
  isTracked: boolean;
};

export function resolveMatchName(match: UserScholarshipMatch): string {
  if (match.custom_name?.trim()) return match.custom_name.trim();
  if (match.scholarship?.name) return match.scholarship.name;
  return "Scholarship";
}

export function resolveMatchProvider(match: UserScholarshipMatch): string | null {
  if (match.custom_provider?.trim()) return match.custom_provider.trim();
  return match.scholarship?.provider ?? null;
}

export function resolveMatchDeadline(match: UserScholarshipMatch): string | null {
  return match.custom_deadline ?? match.scholarship?.deadline ?? null;
}

export function resolveMatchApplicationUrl(match: UserScholarshipMatch): string | null {
  return match.custom_application_url ?? match.scholarship?.application_url ?? null;
}

export function resolveMatchAmountLabel(match: UserScholarshipMatch): string {
  if (match.custom_amount != null && match.custom_amount > 0) {
    return formatScholarshipAmount(match.custom_amount);
  }
  const scholarship = match.scholarship;
  return formatScholarshipAmount(null, scholarship?.amount_min, scholarship?.amount_max);
}

export function matchToTrackerItem(match: UserScholarshipMatch): ScholarshipTrackerItem {
  const name = resolveMatchName(match);
  return {
    matchId: match.id,
    scholarshipId: match.scholarship_id,
    name,
    provider: resolveMatchProvider(match),
    amountLabel: resolveMatchAmountLabel(match),
    deadline: resolveMatchDeadline(match),
    applicationUrl: resolveMatchApplicationUrl(match),
    matchReason: match.match_reason ?? match.scholarship?.eligibility_summary ?? null,
    notes: match.notes,
    status: match.status,
    priority: match.priority,
    isSample: name.includes("[Sample]") || match.scholarship?.name?.includes("[Sample]") === true,
    isTracked: true,
  };
}

export function catalogToTrackerItem(scholarship: CatalogScholarship, isTracked: boolean): ScholarshipTrackerItem {
  return {
    scholarshipId: scholarship.id,
    name: scholarship.name,
    provider: scholarship.provider,
    amountLabel: formatScholarshipAmount(null, scholarship.amount_min, scholarship.amount_max),
    deadline: scholarship.deadline,
    applicationUrl: scholarship.application_url,
    matchReason: scholarship.eligibility_summary,
    notes: null,
    isSample: scholarship.name.includes("[Sample]"),
    isTracked,
  };
}

export function getNextScholarshipDeadline(matches: UserScholarshipMatch[]): UserScholarshipMatch | null {
  const active = matches.filter((match) => !["submitted", "won", "rejected", "skipped"].includes(match.status));
  const withDeadlines = active
    .map((match) => ({ match, deadline: resolveMatchDeadline(match) }))
    .filter((item): item is { match: UserScholarshipMatch; deadline: string } => Boolean(item.deadline))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  return withDeadlines[0]?.match ?? null;
}

export function countScholarshipsDueWithinDays(matches: UserScholarshipMatch[], withinDays: number): number {
  return matches.filter((match) => {
    if (["submitted", "won", "rejected", "skipped"].includes(match.status)) return false;
    return isDeadlineWithinDays(resolveMatchDeadline(match), withinDays);
  }).length;
}
