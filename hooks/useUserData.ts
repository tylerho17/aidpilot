"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { upsertAidRecommendationsForUser } from "@/lib/intelligence/recommendations";
import { generateScholarshipMatchesForUser } from "@/lib/intelligence/scholarship-matching";
import { seedUserFafsaSteps } from "@/lib/intelligence/seed-global";
import { saveWeeklyReportForUser } from "@/lib/intelligence/weekly-report";
import type {
  AidLetter,
  AidRecommendation,
  AidTask,
  Deadline,
  DocumentItem,
  FafsaWorkflowStep,
  IntelligenceUserData,
  ScholarshipMatch,
  ScholarshipSource,
  StudentProfile,
  UserFafsaStep,
  WeeklyReport,
} from "@/lib/types";

function buildIntelligenceUserData(state: {
  profile: StudentProfile | null;
  tasks: AidTask[];
  documents: DocumentItem[];
  scholarships: ScholarshipMatch[];
  deadlines: Deadline[];
  aidLetters: AidLetter[];
  weeklyReports: WeeklyReport[];
  recommendations: AidRecommendation[];
  userFafsaSteps: UserFafsaStep[];
  workflowSteps: FafsaWorkflowStep[];
  scholarshipSources: ScholarshipSource[];
}): IntelligenceUserData {
  return { ...state };
}

export function useUserData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<AidTask[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [aidLetters, setAidLetters] = useState<AidLetter[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [recommendations, setRecommendations] = useState<AidRecommendation[]>([]);
  const [userFafsaSteps, setUserFafsaSteps] = useState<UserFafsaStep[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<FafsaWorkflowStep[]>([]);
  const [scholarshipSources, setScholarshipSources] = useState<ScholarshipSource[]>([]);
  const [isDemo, setIsDemo] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const getIntelligenceUserData = useCallback(
    (): IntelligenceUserData =>
      buildIntelligenceUserData({
        profile,
        tasks,
        documents,
        scholarships,
        deadlines,
        aidLetters,
        weeklyReports,
        recommendations,
        userFafsaSteps,
        workflowSteps,
        scholarshipSources,
      }),
    [
      profile,
      tasks,
      documents,
      scholarships,
      deadlines,
      aidLetters,
      weeklyReports,
      recommendations,
      userFafsaSteps,
      workflowSteps,
      scholarshipSources,
    ]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setProfile(null);
      setTasks([]);
      setDocuments([]);
      setScholarships([]);
      setDeadlines([]);
      setAidLetters([]);
      setWeeklyReports([]);
      setRecommendations([]);
      setUserFafsaSteps([]);
      setWorkflowSteps([]);
      setScholarshipSources([]);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    setUser(authUser);
    setIsDemo(false);

    const [
      profileRes,
      tasksRes,
      docsRes,
      scholarshipsRes,
      deadlinesRes,
      aidLettersRes,
      reportsRes,
      recsRes,
      userStepsRes,
      workflowRes,
      sourcesRes,
    ] = await Promise.all([
      supabase.from("student_profiles").select("*").eq("id", authUser.id).maybeSingle(),
      supabase.from("aid_tasks").select("*").eq("user_id", authUser.id).order("created_at"),
      supabase.from("document_items").select("*").eq("user_id", authUser.id).order("created_at"),
      supabase.from("scholarship_matches").select("*").eq("user_id", authUser.id).order("match_percent", { ascending: false }),
      supabase.from("deadlines").select("*").eq("user_id", authUser.id).order("deadline_date"),
      supabase.from("aid_letters").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
      supabase.from("weekly_reports").select("*").eq("user_id", authUser.id).order("report_week_start", { ascending: false }),
      supabase.from("aid_recommendations").select("*").eq("user_id", authUser.id).eq("status", "active").order("priority"),
      supabase.from("user_fafsa_steps").select("*").eq("user_id", authUser.id).order("created_at"),
      supabase.from("fafsa_workflow_steps").select("*").order("step_order"),
      supabase.from("scholarship_sources").select("*").eq("active", true).order("deadline"),
    ]);

    setProfile(profileRes.data);
    setTasks(tasksRes.data ?? []);
    setDocuments(docsRes.data ?? []);
    setScholarships(scholarshipsRes.data ?? []);
    setDeadlines(deadlinesRes.data ?? []);
    setAidLetters((aidLettersRes.data ?? []) as AidLetter[]);
    setWeeklyReports((reportsRes.data ?? []) as WeeklyReport[]);
    setRecommendations((recsRes.data ?? []) as AidRecommendation[]);
    setUserFafsaSteps((userStepsRes.data ?? []) as UserFafsaStep[]);
    setWorkflowSteps((workflowRes.data ?? []) as FafsaWorkflowStep[]);
    setScholarshipSources((sourcesRes.data ?? []) as ScholarshipSource[]);

    if ((userStepsRes.data ?? []).length === 0 && (workflowRes.data ?? []).length > 0) {
      await seedUserFafsaSteps(supabase, authUser.id);
      const { data: seededSteps } = await supabase
        .from("user_fafsa_steps")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at");
      setUserFafsaSteps((seededSteps ?? []) as UserFafsaStep[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void supabase.auth.getSession().then(() => {
      loadData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    return () => subscription.unsubscribe();
  }, [loadData, supabase]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    const { data, error } = await supabase
      .from("aid_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setTasks((prev) => prev.map((t) => (t.id === taskId ? (data as AidTask) : t)));
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    const { data, error } = await supabase
      .from("document_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setDocuments((prev) => prev.map((d) => (d.id === docId ? (data as DocumentItem) : d)));
  };

  const updateDeadlineStatus = async (deadlineId: string, status: string) => {
    const { data, error } = await supabase
      .from("deadlines")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", deadlineId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setDeadlines((prev) => prev.map((d) => (d.id === deadlineId ? (data as Deadline) : d)));
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("student_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setProfile(data as StudentProfile);
    return data as StudentProfile;
  };

  const updateFafsaStepStatus = async (stepId: string, status: string) => {
    const { data, error } = await supabase
      .from("user_fafsa_steps")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", stepId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setUserFafsaSteps((prev) => prev.map((s) => (s.id === stepId ? (data as UserFafsaStep) : s)));
  };

  const saveAidLetter = async (input: {
    school_name: string;
    aid_year: string;
    cost_of_attendance: number;
    grants_amount: number;
    scholarships_amount: number;
    loans_amount: number;
    work_study_amount: number;
    estimated_net_cost: number;
  }) => {
    if (!user) throw new Error("Not logged in");
    const now = new Date().toISOString();
    const payload = {
      ...input,
      user_id: user.id,
      status: "entered",
      notes: "Entered manually. Verify all amounts with your school financial aid office.",
      updated_at: now,
    };

    const existing = aidLetters[0];
    if (existing) {
      const { data, error } = await supabase
        .from("aid_letters")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error?.message ?? JSON.stringify(error));
      setAidLetters([data as AidLetter, ...aidLetters.filter((l) => l.id !== existing.id)]);
      return data as AidLetter;
    }

    const { data, error } = await supabase.from("aid_letters").insert(payload).select().single();
    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setAidLetters([data as AidLetter, ...aidLetters]);
    return data as AidLetter;
  };

  const refreshRecommendations = async () => {
    if (!user) throw new Error("Not logged in");
    await seedUserFafsaSteps(supabase, user.id);
    const userData = getIntelligenceUserData();
    const recs = await upsertAidRecommendationsForUser(supabase, user.id, userData);
    setRecommendations(recs);
    return recs;
  };

  const generateScholarshipMatches = async () => {
    if (!user) throw new Error("Not logged in");
    const matches = await generateScholarshipMatchesForUser(supabase, user.id, getIntelligenceUserData());
    setScholarships(matches);
    return matches;
  };

  const generateWeeklyReport = async () => {
    if (!user) throw new Error("Not logged in");
    const recs = await refreshRecommendations();
    const userData = { ...getIntelligenceUserData(), recommendations: recs };
    const report = await saveWeeklyReportForUser(supabase, user.id, userData);
    setWeeklyReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    return report;
  };

  const saveScholarship = async (scholarshipId: string) => {
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({ is_saved: true, status: "saved", updated_at: new Date().toISOString() })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const startScholarship = async (scholarshipId: string) => {
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({ is_started: true, status: "started", updated_at: new Date().toISOString() })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await loadData();
  };

  const weeklyReport = weeklyReports[0] ?? null;
  const aidLetter = aidLetters[0] ?? null;

  return {
    loading,
    user,
    profile,
    tasks,
    documents,
    scholarships,
    deadlines,
    aidLetters,
    aidLetter,
    weeklyReports,
    weeklyReport,
    recommendations,
    userFafsaSteps,
    workflowSteps,
    scholarshipSources,
    isDemo,
    loadData,
    getIntelligenceUserData,
    updateTaskStatus,
    updateDocumentStatus,
    updateDeadlineStatus,
    updateFafsaStepStatus,
    updateProfile,
    saveAidLetter,
    refreshRecommendations,
    generateScholarshipMatches,
    generateWeeklyReport,
    saveScholarship,
    startScholarship,
    logout,
  };
}
