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

function buildDeadlines(userId: string, schoolId: string | null, schoolName: string) {
  const isCommunityCollege = schoolName === "Santa Monica College";

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
      title: "Cal Grant priority deadline",
      description: "California students should confirm Cal Grant requirements before the state priority deadline.",
      deadline_date: "2026-03-02",
      category: "State Aid",
      priority: "High",
      status: "upcoming",
      source_type: "State",
      source_name: "California Student Aid Commission",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Cal Grant community college deadline",
      description: isCommunityCollege
        ? "California community college students may have an additional Cal Grant deadline."
        : "Informational for California community college students. Confirm if this applies to you.",
      deadline_date: "2026-09-02",
      category: "State Aid",
      priority: isCommunityCollege ? "High" : "Low",
      status: "upcoming",
      source_type: "State",
      source_name: "California Student Aid Commission",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "School document review",
      description: "Check your school aid portal for missing documents and verification requests.",
      deadline_date: "2026-07-18",
      category: "School Portal",
      priority: "High",
      status: "due soon",
      source_type: "School",
      source_name: "Aid office portal",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Verification response deadline",
      description: "If selected for verification, submit requested forms before aid is delayed.",
      deadline_date: "2026-07-22",
      category: "Verification",
      priority: "High",
      status: "needs attention",
      source_type: "School",
      source_name: "Aid office portal",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Aid offer review",
      description: "Review grants, scholarships, work-study, loans, and estimated out-of-pocket cost.",
      deadline_date: "2026-08-01",
      category: "Aid Offer",
      priority: "Medium",
      status: "upcoming",
      source_type: "School",
      source_name: "Aid offer",
      action_url: null,
    },
    {
      user_id: userId,
      school_id: schoolId,
      title: "Scholarship application sprint",
      description: "Review weekly scholarship matches and start the strongest applications.",
      deadline_date: "2026-07-30",
      category: "Scholarships",
      priority: "Medium",
      status: "upcoming",
      source_type: "AidPilot",
      source_name: "Weekly scholarship report",
      action_url: null,
    },
  ];
}

function countTasksDue(tasks: AidTask[]) {
  return tasks.filter((t) => ["Due Soon", "Missing", "Needs Review"].includes(t.status)).length;
}

function countMissingDocs(docs: DocumentItem[]) {
  return docs.filter((d) => d.status === "Missing").length;
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
  const tasksDue = countTasksDue(tasks);
  const missingDocs = countMissingDocs(documents);
  const scholarshipCount = scholarships.length;
  const potentialAmount = sumScholarshipPotential(scholarships);

  return {
    user_id: userId,
    report_week_start: weekStart,
    aid_status: "Protected",
    summary:
      "Your aid is protected this week. Two items need attention soon: school document review and verification response.",
    tasks_due_count: tasksDue,
    missing_documents_count: missingDocs,
    scholarship_count: scholarshipCount,
    potential_scholarship_amount: potentialAmount,
    top_task_ids: tasks.slice(0, 3).map((t) => t.id),
    top_scholarship_match_ids: scholarships.slice(0, 3).map((s) => s.id),
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

export async function seedUserData(
  supabase: SupabaseClient,
  userId: string,
  options?: { schoolName?: string }
) {
  const [{ count: taskCount }, { count: docCount }, { count: scholarshipCount }] = await Promise.all([
    supabase.from("aid_tasks").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("document_items").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("scholarship_matches").select("*", { count: "exact", head: true }).eq("user_id", userId),
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

  const { count: deadlineCount } = await supabase
    .from("deadlines")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!deadlineCount) {
    let schoolId: string | null = null;
    const schoolName = options?.schoolName ?? "";
    if (schoolName) {
      const { data: school } = await supabase.from("schools").select("id").eq("name", schoolName).maybeSingle();
      schoolId = school?.id ?? null;
    }
    const { error } = await supabase.from("deadlines").insert(buildDeadlines(userId, schoolId, schoolName));
    if (error) throw error;
  }

  const weekStart = getWeekStartMonday();
  const { count: reportCount } = await supabase
    .from("weekly_reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("report_week_start", weekStart);

  if (!reportCount) {
    const [tasksRes, docsRes, scholarshipsRes] = await Promise.all([
      supabase.from("aid_tasks").select("*").eq("user_id", userId),
      supabase.from("document_items").select("*").eq("user_id", userId),
      supabase.from("scholarship_matches").select("*").eq("user_id", userId).order("match_percent", { ascending: false }),
    ]);

    const { error } = await supabase
      .from("weekly_reports")
      .insert(
        buildWeeklyReportRow(
          userId,
          weekStart,
          (tasksRes.data ?? []) as AidTask[],
          (docsRes.data ?? []) as DocumentItem[],
          (scholarshipsRes.data ?? []) as ScholarshipMatch[]
        )
      );
    if (error) throw error;
  }
}
