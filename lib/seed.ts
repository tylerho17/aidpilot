import type { SupabaseClient } from "@supabase/supabase-js";
import { CHECKLIST_TASKS, DOCUMENTS, SCHOLARSHIPS } from "@/lib/demo-data";

const TASK_DUE_DATES: Record<string, string | null> = {
  "fafsa-submitted": "2026-01-14",
  "fafsa-correction": "2026-07-15",
  "cal-grant-gpa": null,
  "parent-tax": "2026-07-18",
  "non-filing": "2026-07-20",
  "enrollment": null,
  "parent-fsa": null,
  "sai-review": null,
  "aid-offer": null,
  "accept-cal": "2026-07-15",
  "accept-pell": null,
  "work-study": null,
  "loan-offer": null,
  "entrance-counseling": "2026-08-10",
  "mpn": "2026-08-12",
  "dependency-form": null,
  "residency": null,
  "portal-messages": null,
  "sap": null,
  "fafsa-reminder": "2026-10-01",
};

const DOC_DUE_DATES: Record<string, string | null> = {
  "doc-tax": "2026-07-18",
  "doc-nonfiling": "2026-07-20",
  "doc-enrollment": null,
  "doc-dependency": null,
  "doc-gpa": null,
  "doc-id": null,
};

const SCHOLARSHIP_DEADLINES: Record<string, string | null> = {
  fgff: "2026-07-25",
  "women-stem": "2026-08-20",
  anteater: "2026-07-12",
  "ca-dream": "2026-07-18",
  "stem-excel": "2026-08-01",
  "community-leaders": "2026-07-14",
  "pell-match": "2026-08-15",
  "irvine-transfer": "2026-08-05",
  "golden-essay": "2026-07-19",
  "fg-stem": "2026-08-10",
  "socal-service": "2026-07-16",
  "local-rotary": "2026-07-22",
  "csu-transfer": "2026-08-30",
  "women-eng": "2026-09-01",
  "bio-research": "2026-09-15",
  "public-health": "2026-09-10",
  "low-income-bridge": "2026-08-25",
  "creative-writing": "2026-09-20",
  "campus-employ": "2026-09-05",
  "health-careers": "2026-09-12",
};

function buildAidTasks(userId: string) {
  return CHECKLIST_TASKS.map((task) => ({
    user_id: userId,
    title: task.title,
    description: task.description,
    status: task.status,
    due_date: TASK_DUE_DATES[task.id] ?? null,
    category: task.category,
    priority: task.priority,
  }));
}

function buildDocuments(userId: string) {
  return DOCUMENTS.map((doc) => ({
    user_id: userId,
    title: doc.name,
    status: doc.status,
    source: "Financial aid office",
    due_date: DOC_DUE_DATES[doc.id] ?? null,
    note: `Linked to task: ${doc.linkedTaskId}`,
  }));
}

function buildScholarships(userId: string) {
  return SCHOLARSHIPS.map((s) => ({
    user_id: userId,
    name: s.name,
    amount: s.amount,
    match_percent: s.match,
    deadline: SCHOLARSHIP_DEADLINES[s.id] ?? null,
    category: s.category,
    why_it_fits: s.whyItFits,
    status: s.newThisWeek ? "new" : "saved",
    is_saved: s.status === "Saved",
    is_started: false,
  }));
}

export async function seedUserData(supabase: SupabaseClient, userId: string) {
  const [{ count: taskCount }, { count: docCount }, { count: scholarshipCount }] =
    await Promise.all([
      supabase.from("aid_tasks").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("document_items").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("scholarship_matches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  if (!taskCount) {
    const { error } = await supabase.from("aid_tasks").insert(buildAidTasks(userId));
    if (error) throw error;
  }

  if (!docCount) {
    const { error } = await supabase.from("document_items").insert(buildDocuments(userId));
    if (error) throw error;
  }

  if (!scholarshipCount) {
    const { error } = await supabase.from("scholarship_matches").insert(buildScholarships(userId));
    if (error) throw error;
  }
}
