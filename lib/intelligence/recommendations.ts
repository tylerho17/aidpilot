import type { SupabaseClient } from "@supabase/supabase-js";
import { getWeekStartMonday } from "@/lib/data-helpers";
import { seedUserFafsaSteps } from "@/lib/intelligence/seed-global";
import type { AidRecommendation, IntelligenceUserData } from "@/lib/types";

export type RecommendationDraft = Omit<AidRecommendation, "id" | "created_at" | "updated_at" | "user_id">;

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

function normalizeFafsaStatus(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();
  if (value === "yes" || value === "completed" || value === "submitted") return "completed";
  if (value === "in_progress" || value === "in progress" || value === "started") return "in_progress";
  return "not_started";
}

function isDeadlineCompleted(status: string) {
  return status === "complete" || status === "completed";
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function missingDocumentsCount(documents: IntelligenceUserData["documents"]) {
  return documents.filter((d) => d.status === "needed" || d.status === "not_started").length;
}

export function generateAidRecommendations(userData: IntelligenceUserData): RecommendationDraft[] {
  const recs: RecommendationDraft[] = [];
  const profile = userData.profile;
  const fafsaStatus = normalizeFafsaStatus(profile?.fafsa_status);
  const aidLetter = userData.aidLetters[0] ?? null;
  const weekStart = getWeekStartMonday();
  const hasCurrentReport = userData.weeklyReports.some((r) => r.report_week_start === weekStart);

  if (fafsaStatus === "not_started") {
    recs.push({
      title: "Complete your FAFSA",
      description: "Suggested next step: start your FAFSA at StudentAid.gov before priority deadlines pass. Verify deadlines with your school aid office.",
      category: "FAFSA",
      priority: "high",
      status: "active",
      source: "rule_engine",
      related_table: null,
      related_id: null,
      due_date: null,
      confidence: 90,
    });
  }

  if (fafsaStatus === "in_progress") {
    recs.push({
      title: "Finish and submit your FAFSA",
      description: "Suggested next step: complete remaining FAFSA sections and submit on StudentAid.gov. AidPilot does not submit FAFSA for you.",
      category: "FAFSA",
      priority: "high",
      status: "active",
      source: "rule_engine",
      related_table: null,
      related_id: null,
      due_date: null,
      confidence: 88,
    });
  }

  const missingDocs = missingDocumentsCount(userData.documents);
  if (missingDocs > 0) {
    recs.push({
      title: "Submit missing verification documents",
      description: `Suggested next step: ${missingDocs} document${missingDocs === 1 ? "" : "s"} still need attention. Upload through your school portal, not AidPilot.`,
      category: "Documents",
      priority: "high",
      status: "active",
      source: "rule_engine",
      related_table: "document_items",
      related_id: null,
      due_date: null,
      confidence: 85,
    });
  }

  for (const deadline of userData.deadlines) {
    if (isDeadlineCompleted(deadline.status)) continue;
    const days = daysUntil(deadline.deadline_date);
    if (days >= 0 && days <= 14) {
      recs.push({
        title: `Urgent: ${deadline.title}`,
        description: deadline.description ?? `This deadline is in ${days} day${days === 1 ? "" : "s"}. Verify details with your school aid office.`,
        category: deadline.category ?? "Deadlines",
        priority: "high",
        status: "active",
        source: "rule_engine",
        related_table: "deadlines",
        related_id: deadline.id,
        due_date: deadline.deadline_date,
        confidence: 92,
      });
    }
  }

  if (!aidLetter || aidLetter.status === "draft") {
    recs.push({
      title: "Add your aid letter details",
      description: "Suggested next step: enter grants, scholarships, loans, and work-study from your school aid offer to see a plain-language breakdown.",
      category: "Aid Letter",
      priority: "medium",
      status: "active",
      source: "rule_engine",
      related_table: "aid_letters",
      related_id: aidLetter?.id ?? null,
      due_date: null,
      confidence: 80,
    });
  }

  if (aidLetter && (aidLetter.estimated_net_cost ?? 0) > 5000) {
    recs.push({
      title: "Review appeal and scholarship options",
      description: "Suggested next step: your estimated net cost is above $5,000. Consider asking your financial aid office about appeal options and additional scholarships. AidPilot does not guarantee more aid.",
      category: "Aid Letter",
      priority: "medium",
      status: "active",
      source: "rule_engine",
      related_table: "aid_letters",
      related_id: aidLetter.id,
      due_date: null,
      confidence: 75,
    });
  }

  if (userData.scholarships.length < 5) {
    recs.push({
      title: "Apply to more scholarships",
      description: "Suggested next step: generate scholarship matches and start at least one application this week.",
      category: "Scholarships",
      priority: "medium",
      status: "active",
      source: "rule_engine",
      related_table: "scholarship_matches",
      related_id: null,
      due_date: null,
      confidence: 82,
    });
  }

  if (!hasCurrentReport) {
    recs.push({
      title: "Generate your weekly aid report",
      description: "Suggested next step: create this week's aid summary to track FAFSA status, documents, deadlines, and scholarship matches.",
      category: "Weekly Report",
      priority: "medium",
      status: "active",
      source: "rule_engine",
      related_table: "weekly_reports",
      related_id: null,
      due_date: null,
      confidence: 78,
    });
  }

  return recs.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export async function upsertAidRecommendationsForUser(
  supabase: SupabaseClient,
  userId: string,
  userData: IntelligenceUserData
) {
  await seedUserFafsaSteps(supabase, userId);

  const drafts = generateAidRecommendations(userData);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("aid_recommendations")
    .select("id, title, status")
    .eq("user_id", userId)
    .eq("status", "active");

  const existingTitles = new Set((existing ?? []).map((r) => r.title));

  for (const draft of drafts) {
    if (existingTitles.has(draft.title)) {
      const row = (existing ?? []).find((r) => r.title === draft.title);
      if (row) {
        await supabase
          .from("aid_recommendations")
          .update({
            description: draft.description,
            category: draft.category,
            priority: draft.priority,
            due_date: draft.due_date,
            confidence: draft.confidence,
            related_table: draft.related_table,
            related_id: draft.related_id,
            updated_at: now,
          })
          .eq("id", row.id);
      }
      continue;
    }

    await supabase.from("aid_recommendations").insert({
      ...draft,
      user_id: userId,
      updated_at: now,
    });
  }

  const draftTitles = new Set(drafts.map((d) => d.title));
  const stale = (existing ?? []).filter((r) => !draftTitles.has(r.title));
  for (const row of stale) {
    await supabase
      .from("aid_recommendations")
      .update({ status: "dismissed", updated_at: now })
      .eq("id", row.id);
  }

  const { data, error } = await supabase
    .from("aid_recommendations")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("priority")
    .order("confidence", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AidRecommendation[];
}

export function getTopRecommendations(recommendations: AidRecommendation[], limit = 3) {
  return [...recommendations]
    .filter((r) => r.status === "active")
    .sort((a, b) => {
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      return b.confidence - a.confidence;
    })
    .slice(0, limit);
}
