"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { checkScholarshipAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";
import {
  formatScholarshipError,
  isScholarshipSchemaError,
  SCHOLARSHIP_SCHEMA_OUT_OF_DATE_MESSAGE,
} from "@/lib/scholarship-errors";
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

type UserDataContextValue = ReturnType<typeof useUserDataState>;

const UserDataContext = createContext<UserDataContextValue | null>(null);

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

function useUserDataState() {
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
  const [isScholarshipAdmin, setIsScholarshipAdmin] = useState(false);
  const [scholarshipSchemaError, setScholarshipSchemaError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const hasLoadedOnceRef = useRef(false);
  const adminCacheRef = useRef<{ userId: string; isAdmin: boolean } | null>(null);
  const loadInFlightRef = useRef<Promise<void> | null>(null);

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

  const loadData = useCallback(
    async (options?: { silent?: boolean }) => {
      if (loadInFlightRef.current) {
        await loadInFlightRef.current;
        return;
      }

      const run = async () => {
        const isInitialLoad = !hasLoadedOnceRef.current;
        if (isInitialLoad && !options?.silent) {
          setLoading(true);
        }

        if (!options?.silent) {
          setLoadError(null);
          setScholarshipSchemaError(null);
        }

        try {
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
            setIsScholarshipAdmin(false);
            adminCacheRef.current = null;
            return;
          }

          setUser(authUser);

          const cachedAdmin = adminCacheRef.current;
          const adminPromise =
            cachedAdmin?.userId === authUser.id
              ? Promise.resolve(cachedAdmin.isAdmin)
              : checkScholarshipAdmin(supabase).then((isAdmin) => {
                  adminCacheRef.current = { userId: authUser.id, isAdmin };
                  return isAdmin;
                });

          const [
            adminFlag,
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
            adminPromise,
            supabase.from("student_profiles").select("*").eq("id", authUser.id).maybeSingle(),
            supabase.from("aid_tasks").select("*").eq("user_id", authUser.id).order("created_at"),
            supabase.from("document_items").select("*").eq("user_id", authUser.id).order("created_at"),
            supabase
              .from("scholarship_matches")
              .select("*")
              .eq("user_id", authUser.id)
              .order("match_percent", { ascending: false }),
            supabase.from("deadlines").select("*").eq("user_id", authUser.id).order("deadline_date"),
            supabase.from("aid_letters").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
            supabase.from("weekly_reports").select("*").eq("user_id", authUser.id).order("report_week_start", { ascending: false }),
            supabase.from("aid_recommendations").select("*").eq("user_id", authUser.id).eq("status", "active").order("priority"),
            supabase.from("user_fafsa_steps").select("*").eq("user_id", authUser.id).order("created_at"),
            supabase.from("fafsa_workflow_steps").select("*").order("step_order"),
            supabase.from("scholarship_sources").select("*").eq("active", true).order("deadline"),
          ]);

          setIsScholarshipAdmin(adminFlag);

          const errors = [
            profileRes.error,
            tasksRes.error,
            docsRes.error,
            scholarshipsRes.error,
            deadlinesRes.error,
            aidLettersRes.error,
            reportsRes.error,
            recsRes.error,
            userStepsRes.error,
            workflowRes.error,
            sourcesRes.error,
          ].filter(Boolean);

          if (errors.length > 0) {
            console.error("useUserData: some queries failed", errors);
            if (errors.some((err) => isScholarshipSchemaError(err))) {
              setScholarshipSchemaError(SCHOLARSHIP_SCHEMA_OUT_OF_DATE_MESSAGE);
            } else if (!options?.silent) {
              setLoadError("Some data could not be loaded. You can still use AidPilot — try refreshing the page.");
            }
          }

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

          const workflowCount = (workflowRes.data ?? []).length;
          const userStepCount = (userStepsRes.data ?? []).length;
          if (workflowCount > 0 && userStepCount < workflowCount) {
            void (async () => {
              try {
                await seedUserFafsaSteps(supabase, authUser.id);
                const { data: seededSteps } = await supabase
                  .from("user_fafsa_steps")
                  .select("*")
                  .eq("user_id", authUser.id)
                  .order("created_at");
                setUserFafsaSteps((seededSteps ?? []) as UserFafsaStep[]);
              } catch (err) {
                console.error("Failed to seed user FAFSA steps:", err);
              }
            })();
          }
        } catch (err) {
          console.error("useUserData: loadData failed", err);
          if (!options?.silent) {
            setLoadError(err instanceof Error ? err.message : "Could not load your data. Please refresh the page.");
          }
        } finally {
          hasLoadedOnceRef.current = true;
          setLoading(false);
          loadInFlightRef.current = null;
        }
      };

      loadInFlightRef.current = run();
      await loadInFlightRef.current;
    },
    [supabase]
  );

  useEffect(() => {
    void loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      void loadData({ silent: true });
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

  const ensureUserFafsaSteps = async () => {
    if (!user) return;
    try {
      await seedUserFafsaSteps(supabase, user.id);
      const { data } = await supabase
        .from("user_fafsa_steps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
      setUserFafsaSteps((data ?? []) as UserFafsaStep[]);
    } catch (err) {
      console.error("Failed to ensure user FAFSA steps:", err);
    }
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

  const updateFafsaStepByWorkflowId = async (workflowStepId: string, status: string) => {
    if (!user) throw new Error("Not logged in");

    const existing = userFafsaSteps.find((s) => s.workflow_step_id === workflowStepId);
    if (existing) {
      return updateFafsaStepStatus(existing.id, status);
    }

    const { data, error } = await supabase
      .from("user_fafsa_steps")
      .upsert(
        {
          user_id: user.id,
          workflow_step_id: workflowStepId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,workflow_step_id", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw new Error(error?.message ?? JSON.stringify(error));
    setUserFafsaSteps((prev) => {
      const without = prev.filter((s) => s.workflow_step_id !== workflowStepId);
      return [...without, data as UserFafsaStep];
    });
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
    try {
      await seedUserFafsaSteps(supabase, user.id);
    } catch (err) {
      console.error("Failed to seed user FAFSA steps before recommendations:", err);
    }
    const userData = getIntelligenceUserData();
    const recs = await upsertAidRecommendationsForUser(supabase, user.id, userData);
    setRecommendations(recs);
    return recs;
  };

  const generateScholarshipMatches = async () => {
    if (!user) throw new Error("Not logged in");
    if (!profile) throw new Error("Complete onboarding before generating scholarship matches.");
    try {
      await generateScholarshipMatchesForUser(supabase, user.id, getIntelligenceUserData());
    } catch (err) {
      throw new Error(formatScholarshipError(err, "Could not generate scholarship matches."));
    }
    const { data, error } = await supabase
      .from("scholarship_matches")
      .select("*")
      .eq("user_id", user.id)
      .order("match_percent", { ascending: false });
    if (error) throw new Error(formatScholarshipError(error));
    const matches = (data ?? []) as ScholarshipMatch[];
    setScholarships(matches);
    return matches;
  };

  const generateWeeklyReport = async () => {
    if (!user) throw new Error("Not logged in");
    let recs = recommendations;
    try {
      recs = await refreshRecommendations();
    } catch (err) {
      console.error("Failed to refresh recommendations before weekly report:", err);
    }
    const userData = { ...getIntelligenceUserData(), recommendations: recs };
    const report = await saveWeeklyReportForUser(supabase, user.id, userData);
    setWeeklyReports((prev) => [report, ...prev.filter((r) => r.id !== report.id)]);
    return report;
  };

  const saveScholarship = async (scholarshipId: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({
        is_saved: true,
        status: "saved",
        saved_at: now,
        ignored: false,
        ignored_at: null,
        updated_at: now,
      })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(formatScholarshipError(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const applyScholarship = async (scholarshipId: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({
        applied: true,
        is_started: true,
        is_saved: true,
        applied_at: now,
        saved_at: now,
        status: "applied",
        ignored: false,
        ignored_at: null,
        updated_at: now,
      })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(formatScholarshipError(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const ignoreScholarship = async (scholarshipId: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({
        ignored: true,
        ignored_at: now,
        status: "ignored",
        updated_at: now,
      })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(formatScholarshipError(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const startScholarship = async (scholarshipId: string) => applyScholarship(scholarshipId);

  const logout = async () => {
    await supabase.auth.signOut();
    hasLoadedOnceRef.current = false;
    adminCacheRef.current = null;
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
    isScholarshipAdmin,
    scholarshipSchemaError,
    loadError,
    loadData,
    getIntelligenceUserData,
    updateTaskStatus,
    updateDocumentStatus,
    updateDeadlineStatus,
    updateFafsaStepStatus,
    updateFafsaStepByWorkflowId,
    ensureUserFafsaSteps,
    updateProfile,
    saveAidLetter,
    refreshRecommendations,
    generateScholarshipMatches,
    generateWeeklyReport,
    saveScholarship,
    applyScholarship,
    ignoreScholarship,
    startScholarship,
    logout,
  };
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const value = useUserDataState();
  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
}
