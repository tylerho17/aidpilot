import type { SupabaseClient } from "@supabase/supabase-js";
import { getWeekStartMonday } from "@/lib/data-helpers";
import { getTopRecommendations } from "@/lib/intelligence/recommendations";
import type { AidTask, DocumentItem, IntelligenceUserData, ScholarshipMatch, WeeklyReport } from "@/lib/types";

function normalizeFafsaStatus(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();
  if (value === "yes" || value === "completed") return "Submitted";
  if (value === "in_progress" || value === "in progress") return "In progress";
  if (value === "not yet" || value === "i am not sure") return "Not started";
  return status ?? "Unknown";
}

function countTasksDue(tasks: AidTask[]) {
  return tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(t.status)).length;
}

function countMissingDocs(docs: DocumentItem[]) {
  return docs.filter((d) => d.status === "needed" || d.status === "not_started" || d.status === "Missing").length;
}

function sumScholarshipPotential(scholarships: ScholarshipMatch[]) {
  return scholarships.reduce((sum, s) => sum + (s.amount ?? 0), 0);
}

function upcomingDeadlineSummary(deadlines: IntelligenceUserData["deadlines"]) {
  const active = deadlines
    .filter((d) => d.status !== "complete" && d.status !== "completed")
    .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));
  if (!active.length) return "No upcoming deadlines tracked.";
  const next = active.slice(0, 3).map((d) => d.title).join(", ");
  return `Upcoming: ${next}.`;
}

function aidLetterSummary(aidLetter: IntelligenceUserData["aidLetters"][0] | undefined) {
  if (!aidLetter) return "No aid letter entered yet. Suggested next step: add your aid offer details.";
  const freeMoney = (aidLetter.grants_amount ?? 0) + (aidLetter.scholarships_amount ?? 0);
  const net = aidLetter.estimated_net_cost ?? 0;
  return `${aidLetter.school_name ?? "Your school"}: $${freeMoney.toLocaleString()} in grants and scholarships. Estimated net cost: $${net.toLocaleString()}. Verify with your aid office.`;
}

export function generateWeeklyReport(userData: IntelligenceUserData): Omit<WeeklyReport, "id" | "created_at" | "updated_at" | "user_id"> {
  const weekStart = getWeekStartMonday();
  const profile = userData.profile;
  const topRecs = getTopRecommendations(userData.recommendations, 3);
  const topScholarships = [...userData.scholarships]
    .sort((a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0))
    .slice(0, 3);

  const missingDocs = countMissingDocs(userData.documents);
  const tasksDue = countTasksDue(userData.tasks);
  const fafsaLabel = normalizeFafsaStatus(profile?.fafsa_status);

  const summaryParts = [
    `FAFSA status: ${fafsaLabel}.`,
    missingDocs > 0 ? `${missingDocs} document${missingDocs === 1 ? "" : "s"} still need attention.` : "Documents look on track.",
    upcomingDeadlineSummary(userData.deadlines),
    aidLetterSummary(userData.aidLetters[0]),
  ];

  const aidStatus = missingDocs > 2 || tasksDue > 5 ? "Needs attention" : "Protected";

  return {
    report_week_start: weekStart,
    aid_status: aidStatus,
    summary: summaryParts.join(" "),
    tasks_due_count: tasksDue,
    missing_documents_count: missingDocs,
    scholarship_count: userData.scholarships.length,
    potential_scholarship_amount: sumScholarshipPotential(userData.scholarships),
    top_task_ids: userData.tasks.slice(0, 3).map((t) => t.id),
    top_scholarship_match_ids: topScholarships.map((s) => s.id),
    recommendations: topRecs.map((r) => ({
      title: r.title,
      body: r.description ?? "Suggested next step from AidPilot.",
    })),
  };
}

export async function saveWeeklyReportForUser(
  supabase: SupabaseClient,
  userId: string,
  userData: IntelligenceUserData
) {
  const report = generateWeeklyReport(userData);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("weekly_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("report_week_start", report.report_week_start)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("weekly_reports")
      .update({ ...report, updated_at: now })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    return data as WeeklyReport;
  }

  const { data, error } = await supabase
    .from("weekly_reports")
    .insert({ ...report, user_id: userId, updated_at: now })
    .select()
    .single();

  if (error) throw new Error(error?.message ?? JSON.stringify(error));
  return data as WeeklyReport;
}
