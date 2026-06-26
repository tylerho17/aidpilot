import type { ScholarshipMatch, ScholarshipSource, StudentProfile } from "@/lib/types";
import { formatScholarshipDeadline, isNewScholarshipMatch, resolveScholarshipMatches } from "@/lib/data-helpers";

function daysUntil(dateStr: string | null | undefined) {
  if (!dateStr) return 9999;
  const date = new Date(dateStr + "T12:00:00");
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isExpired(deadline: string | null | undefined) {
  const days = daysUntil(deadline);
  return days < 0;
}

export function getApplyUrl(match: ScholarshipMatch, sources: ScholarshipSource[]) {
  const source = sources.find((s) => s.id === match.scholarship_id);
  const fromAction = match.recommended_action?.match(/https?:\/\/\S+/)?.[0];
  return source?.application_url ?? source?.url ?? fromAction ?? null;
}

export function selectWeeklyScholarshipMatches(matches: ScholarshipMatch[], limit = 7) {
  return [...resolveScholarshipMatches(matches)]
    .filter((m) => isNewScholarshipMatch(m) && !isExpired(m.deadline))
    .sort((a, b) => {
      const matchDiff = (b.match_percent ?? 0) - (a.match_percent ?? 0);
      if (matchDiff !== 0) return matchDiff;
      const deadlineDiff = daysUntil(a.deadline) - daysUntil(b.deadline);
      if (deadlineDiff !== 0) return deadlineDiff;
      return (b.amount ?? 0) - (a.amount ?? 0);
    })
    .slice(0, limit);
}

export function buildScholarshipEmailReport(
  profile: StudentProfile | null,
  matches: ScholarshipMatch[],
  sources: ScholarshipSource[]
) {
  const firstName = profile?.first_name ?? "there";
  const subject = "Your AidPilot scholarship report for this week";
  const top = selectWeeklyScholarshipMatches(matches, 7);

  const lines = top.map((match, index) => {
    const applyUrl = getApplyUrl(match, sources) ?? "See scholarship provider";
    const amount = match.amount ? `$${match.amount.toLocaleString()}` : "Amount varies";
    const deadline = formatScholarshipDeadline(match.deadline);
    return `${index + 1}. ${match.name}
   Amount: ${amount}
   Deadline: ${deadline}
   Why you match: ${match.why_it_fits ?? "Based on your profile."}
   Effort level: ${match.effort_level ?? "medium"}
   Essay angle: ${match.essay_angle ?? "Review requirements with the provider."}
   Apply: ${applyUrl}`;
  });

  const body = `Hi ${firstName},

Here are ${top.length} scholarship${top.length === 1 ? "" : "ies"} worth applying to this week:

${lines.join("\n\n")}

AidPilot is an organizational tool, not official financial aid advice. Always confirm eligibility and deadlines with the scholarship provider.`;

  return { subject, body };
}
