import type { SupabaseClient } from "@supabase/supabase-js";
import { CHECKLIST_TASKS, DOCUMENTS, SCHOLARSHIPS } from "@/lib/demo-data";
import type { AidTask, DocumentItem, ScholarshipMatch } from "@/lib/types";
import { getWeekStartMonday } from "@/lib/data-helpers";

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

function mapDocumentStatus(status: string) {
  switch (status) {
    case "Missing":
      return "needed";
    case "Uploaded":
      return "submitted";
    case "Needs Review":
      return "submitted";
    default:
      return "not_started";
  }
}

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
    status: mapDocumentStatus(doc.status),
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

function buildDeadlines(userId: string, schoolId: string | null) {
  return [
    {
      user_id: userId,
      school_id: schoolId,
      title: "FAFSA priority deadline",
      description: "Submit FAFSA before your school and state priority deadline.",
      deadline_date: "2026-03-02",
      category: "FAFSA",
      priority: "High",
      status: "upcoming",
      source_type: "Federal",
      source_name: "StudentAid.gov",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "School verification deadline",
      description: "Complete verification documents requested by your school aid office.",
      deadline_date: "2026-07-22",
      category: "Verification",
      priority: "High",
      status: "due soon",
      source_type: "School",
      source_name: "Aid office portal",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Scholarship application deadline",
      description: "Start your strongest weekly scholarship match before the deadline passes.",
      deadline_date: "2026-07-30",
      category: "Scholarships",
      priority: "Medium",
      status: "upcoming",
      source_type: "AidPilot",
      source_name: "Weekly scholarship report",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Aid appeal deadline",
      description: "If you plan to appeal your aid offer, confirm your school appeal deadline.",
      deadline_date: "2026-08-15",
      category: "Aid Offer",
      priority: "Medium",
      status: "upcoming",
      source_type: "School",
      source_name: "Aid office",
      action_url: null,
    },
  ];
}

function buildAidLetter(userId: string, schoolName?: string) {
  return {
    user_id: userId,
    school_name: schoolName || "Your school",
    aid_year: "2026-2027",
    cost_of_attendance: 33100,
    grants_amount: 18400,
    scholarships_amount: 3500,
    loans_amount: 5500,
    work_study_amount: 2000,
    estimated_net_cost: 4200,
    status: "sample",
    notes: "Placeholder aid letter for demonstration. Not official financial advice.",
  };
}

function countTasksDue(tasks: AidTask[]) {
  return tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(t.status)).length;
}

function countMissingDocs(docs: DocumentItem[]) {
  return docs.filter((d) => d.status === "needed" || d.status === "Missing").length;
}

function sumScholarshipPotential(scholarships: ScholarshipMatch[]) {
  return scholarships
    .filter((s) => s.status === "new" || s.status === "saved" || s.is_saved)
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);
}

function buildWeeklyReportRow(
  userId: string,
  weekStart: string,
  tasks: AidTask[],
  documents: DocumentItem[],
  scholarships: ScholarshipMatch[]
) {
  return {
    user_id: userId,
    report_week_start: weekStart,
    aid_status: "Protected",
    summary:
      "Your aid is protected this week. Review deadlines, documents, and scholarship matches.",
    tasks_due_count: countTasksDue(tasks),
    missing_documents_count: countMissingDocs(documents),
    scholarship_count: scholarships.length,
    potential_scholarship_amount: sumScholarshipPotential(scholarships),
    top_task_ids: tasks.slice(0, 3).map((t) => t.id).filter(Boolean),
    top_scholarship_match_ids: scholarships.slice(0, 3).map((s) => s.id).filter(Boolean),
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
        title: "Review your aid letter",
        body: "Understand grants, scholarships, loans, and estimated net cost.",
      },
    ],
  };
}

function logSeedError(step: string, error: unknown) {
  console.error(`seedUserData: ${step} failed`, error);
}

async function runSeedStep(step: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (error) {
    logSeedError(step, error);
  }
}

/**
 * Seeds basic user-owned starter data. Never throws.
 * Does not run Phase 4 intelligence (recommendations, FAFSA steps, scholarship matching).
 */
export async function seedUserData(
  supabase: SupabaseClient,
  userId: string,
  options?: { schoolName?: string }
) {
  try {
    await runSeedStep("aid_tasks", async () => {
      const { count } = await supabase
        .from("aid_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (count) return;
      const { error } = await supabase.from("aid_tasks").insert(buildAidTasks(userId));
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });

    await runSeedStep("document_items", async () => {
      const { count } = await supabase
        .from("document_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (count) return;
      const { error } = await supabase.from("document_items").insert(buildDocuments(userId));
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });

    await runSeedStep("scholarship_matches", async () => {
      const { count } = await supabase
        .from("scholarship_matches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (count) return;
      const { error } = await supabase.from("scholarship_matches").insert(buildScholarships(userId));
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });

    await runSeedStep("deadlines", async () => {
      const { count } = await supabase
        .from("deadlines")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (count) return;

      let schoolId: string | null = null;
      const schoolName = options?.schoolName ?? "";
      if (schoolName) {
        const { data: school } = await supabase.from("schools").select("id").eq("name", schoolName).maybeSingle();
        schoolId = school?.id ?? null;
      }
      const { error } = await supabase.from("deadlines").insert(buildDeadlines(userId, schoolId));
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });

    await runSeedStep("weekly_reports", async () => {
      const weekStart = getWeekStartMonday();
      const { count } = await supabase
        .from("weekly_reports")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("report_week_start", weekStart);
      if (count) return;

      const [tasksRes, docsRes, scholarshipsRes] = await Promise.all([
        supabase.from("aid_tasks").select("*").eq("user_id", userId),
        supabase.from("document_items").select("*").eq("user_id", userId),
        supabase.from("scholarship_matches").select("*").eq("user_id", userId).order("match_percent", { ascending: false }),
      ]);

      const tasks = (tasksRes.data ?? []) as AidTask[];
      const { error } = await supabase.from("weekly_reports").insert(
        buildWeeklyReportRow(
          userId,
          weekStart,
          tasks,
          (docsRes.data ?? []) as DocumentItem[],
          (scholarshipsRes.data ?? []) as ScholarshipMatch[]
        )
      );
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });

    await runSeedStep("aid_letters", async () => {
      const { count } = await supabase
        .from("aid_letters")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (count) return;
      const { error } = await supabase.from("aid_letters").insert(buildAidLetter(userId, options?.schoolName));
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
    });
  } catch (error) {
    console.error("seedUserData: unexpected failure", error);
  }
}
