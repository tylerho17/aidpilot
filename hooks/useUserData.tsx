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
import { formatScholarshipError, isScholarshipSchemaError } from "@/lib/scholarship-errors";
import {
  buildScholarshipMatchActionUpdate,
  loadScholarshipMatches,
  loadScholarshipSources,
  type ScholarshipSchemaMode,
} from "@/lib/scholarship-queries";
import { upsertAidRecommendationsForUser } from "@/lib/intelligence/recommendations";
import { generateScholarshipMatchesForUser } from "@/lib/intelligence/scholarship-matching";
import { seedUserFafsaSteps } from "@/lib/intelligence/seed-global";
import { saveWeeklyReportForUser } from "@/lib/intelligence/weekly-report";
import { saveFafsaIntakeAndPlan as persistFafsaIntakeAndPlan } from "@/lib/fafsa-plan-persist";
import { parseIntakeRow } from "@/lib/fafsa-intake-map";
import {
  applyFafsaDemoFallbackForUser,
  buildDemoFafsaPlanTasks,
  canUseFafsaDemoStorage,
  clearFafsaDemoFallback,
  FAFSA_DEMO_GUEST_USER_ID,
  formToDemoIntake,
  isDemoFafsaTaskId,
  resolveFafsaDemoFallback,
  saveFafsaDemoFallback,
  updateFafsaDemoTaskStatus,
} from "@/lib/fafsa-demo-fallback";
import { normalizeRequiredInfo } from "@/lib/required-info";
import {
  aidLetterFromLocalStore,
  resolveAidLetterFromSources,
  saveAidLetterLocal,
} from "@/lib/aid-letter-local";
import { withCanonicalProfileFields } from "@/lib/student-profile-payload";
import { isRecoverableWithLocalFallback, isSchemaColumnError, toFriendlyError } from "@/lib/friendly-errors";
import { getFafsaPlanTasks, isFafsaPlanTask, FAFSA_TASK_SOURCE } from "@/lib/fafsa-plan";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type {
  AidLetter,
  AidRecommendation,
  AidTask,
  Deadline,
  DocumentItem,
  FafsaWorkflowStep,
  FafsaIntakeFormData,
  FafsaIntakeResponse,
  IntelligenceUserData,
  ScholarshipMatch,
  ScholarshipSource,
  StudentProfile,
  UserFafsaStep,
  WeeklyReport,
} from "@/lib/types";

type UserDataContextValue = ReturnType<typeof useUserDataState>;

const UserDataContext = createContext<UserDataContextValue | null>(null);

function normalizeAidTask(task: AidTask): AidTask {
  const requiredInfo = normalizeRequiredInfo(task.required_info);
  return {
    ...task,
    required_info: requiredInfo || null,
  };
}

function normalizeAidTasks(tasks: AidTask[]) {
  return tasks.map(normalizeAidTask);
}

function shouldSurfaceLoadError(
  error: unknown,
  options?: { optionalFeature?: boolean; schemaWarning?: string | null }
): boolean {
  if (!error) return false;
  if (options?.schemaWarning && isScholarshipSchemaError(error)) return false;
  if (options?.optionalFeature && (isScholarshipSchemaError(error) || isSchemaColumnError(error))) {
    return false;
  }
  return true;
}

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
  const [authReady, setAuthReady] = useState(false);
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
  const [fafsaIntake, setFafsaIntake] = useState<FafsaIntakeResponse | null>(null);
  const [fafsaDemoMode, setFafsaDemoMode] = useState(false);
  const [aidLetterLocalMode, setAidLetterLocalMode] = useState(false);
  const [isScholarshipAdmin, setIsScholarshipAdmin] = useState(false);
  const [scholarshipSchemaError, setScholarshipSchemaError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const hasLoadedOnceRef = useRef(false);
  const adminCacheRef = useRef<{ userId: string; isAdmin: boolean } | null>(null);
  const loadInFlightRef = useRef<Promise<void> | null>(null);
  const scholarshipSchemaModeRef = useRef<ScholarshipSchemaMode>("extended");

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
            data: { session },
          } = await supabase.auth.getSession();
          const sessionUser = session?.user ?? null;
          if (sessionUser) {
            setUser(sessionUser);
          }

          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          const resolvedUser = authUser ?? sessionUser;

          if (!resolvedUser) {
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
            setFafsaIntake(null);
            setFafsaDemoMode(false);
            setAidLetterLocalMode(false);
            setIsScholarshipAdmin(false);
            adminCacheRef.current = null;
            setAuthReady(true);
            return;
          }

          setUser(resolvedUser);
          setAuthReady(true);

          const cachedAdmin = adminCacheRef.current;
          const adminPromise =
            cachedAdmin?.userId === resolvedUser.id
              ? Promise.resolve(cachedAdmin.isAdmin)
              : checkScholarshipAdmin(supabase).then((isAdmin) => {
                  adminCacheRef.current = { userId: resolvedUser.id, isAdmin };
                  return isAdmin;
                });

          const [
            adminFlag,
            profileRes,
            tasksRes,
            docsRes,
            scholarshipsLoad,
            deadlinesRes,
            aidLettersRes,
            reportsRes,
            recsRes,
            userStepsRes,
            workflowRes,
            sourcesLoad,
            intakeRes,
          ] = await Promise.all([
            adminPromise,
            supabase.from("student_profiles").select("*").eq("id", resolvedUser.id).maybeSingle(),
            supabase.from("aid_tasks").select("*").eq("user_id", resolvedUser.id).order("created_at"),
            supabase.from("document_items").select("*").eq("user_id", resolvedUser.id).order("created_at"),
            loadScholarshipMatches(supabase, resolvedUser.id),
            supabase.from("deadlines").select("*").eq("user_id", resolvedUser.id).order("deadline_date"),
            supabase.from("aid_letters").select("*").eq("user_id", resolvedUser.id).order("created_at", { ascending: false }),
            supabase.from("weekly_reports").select("*").eq("user_id", resolvedUser.id).order("report_week_start", { ascending: false }),
            supabase.from("aid_recommendations").select("*").eq("user_id", resolvedUser.id).eq("status", "active").order("priority"),
            supabase.from("user_fafsa_steps").select("*").eq("user_id", resolvedUser.id).order("created_at"),
            supabase.from("fafsa_workflow_steps").select("*").order("step_order"),
            loadScholarshipSources(supabase),
            supabase.from("fafsa_intake_responses").select("*").eq("user_id", resolvedUser.id).maybeSingle(),
          ]);

          setIsScholarshipAdmin(adminFlag);

          const scholarshipSchemaWarning =
            scholarshipsLoad.schemaWarning ?? sourcesLoad.schemaWarning ?? null;
          scholarshipSchemaModeRef.current =
            scholarshipsLoad.schemaMode === "extended" && sourcesLoad.schemaMode === "extended"
              ? "extended"
              : "base";

          if (!options?.silent) {
            setScholarshipSchemaError(scholarshipSchemaWarning);
          }

          const errors = [
            profileRes.error,
            tasksRes.error,
            docsRes.error,
            shouldSurfaceLoadError(scholarshipsLoad.error, {
              optionalFeature: true,
              schemaWarning: scholarshipsLoad.schemaWarning,
            })
              ? scholarshipsLoad.error
              : null,
            deadlinesRes.error,
            shouldSurfaceLoadError(aidLettersRes.error, { optionalFeature: true }) ? aidLettersRes.error : null,
            shouldSurfaceLoadError(reportsRes.error, { optionalFeature: true }) ? reportsRes.error : null,
            shouldSurfaceLoadError(recsRes.error, { optionalFeature: true }) ? recsRes.error : null,
            shouldSurfaceLoadError(userStepsRes.error, { optionalFeature: true }) ? userStepsRes.error : null,
            workflowRes.error,
            shouldSurfaceLoadError(sourcesLoad.error, {
              optionalFeature: true,
              schemaWarning: sourcesLoad.schemaWarning,
            })
              ? sourcesLoad.error
              : null,
            intakeRes.error,
          ].filter(Boolean);

          if (errors.length > 0) {
            console.error("useUserData: some queries failed", errors);
            if (!options?.silent) {
              setLoadError("Some data could not be loaded. You can still use AidPilot — try refreshing the page.");
            }
          }

          const parsedIntake =
            intakeRes.error || !intakeRes.data
              ? null
              : parseIntakeRow(intakeRes.data as Record<string, unknown>);
          const fafsaResolved = resolveFafsaDemoFallback(
            resolvedUser.id,
            normalizeAidTasks(tasksRes.data ?? []),
            parsedIntake
          );

          const remoteAidLetter = ((aidLettersRes.data ?? []) as AidLetter[])[0] ?? null;
          const aidLetterResolved = resolveAidLetterFromSources(resolvedUser.id, remoteAidLetter);

          setProfile(profileRes.data);
          setTasks(normalizeAidTasks(fafsaResolved.tasks));
          setDocuments(docsRes.data ?? []);
          setScholarships(scholarshipsLoad.data);
          setDeadlines(deadlinesRes.data ?? []);
          setAidLetters(aidLetterResolved.letter ? [aidLetterResolved.letter] : []);
          setAidLetterLocalMode(aidLetterResolved.localMode);
          setWeeklyReports((reportsRes.data ?? []) as WeeklyReport[]);
          setRecommendations((recsRes.data ?? []) as AidRecommendation[]);
          setUserFafsaSteps((userStepsRes.data ?? []) as UserFafsaStep[]);
          setWorkflowSteps((workflowRes.data ?? []) as FafsaWorkflowStep[]);
          setScholarshipSources(sourcesLoad.data);
          setFafsaIntake(fafsaResolved.intake);
          setFafsaDemoMode(fafsaResolved.demoMode);

          const workflowCount = (workflowRes.data ?? []).length;
          const userStepCount = (userStepsRes.data ?? []).length;
          if (workflowCount > 0 && userStepCount < workflowCount) {
            void (async () => {
              try {
                await seedUserFafsaSteps(supabase, resolvedUser.id);
                const { data: seededSteps } = await supabase
                  .from("user_fafsa_steps")
                  .select("*")
                  .eq("user_id", resolvedUser.id)
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
            setLoadError(toFriendlyError(err, "Could not load your data. Please refresh the page."));
          }
        } finally {
          hasLoadedOnceRef.current = true;
          setAuthReady(true);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          setUser(session.user);
          setAuthReady(true);
        }
        return;
      }
      void loadData({ silent: true });
    });

    return () => subscription.unsubscribe();
  }, [loadData, supabase]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    const demoUserId = user?.id ?? FAFSA_DEMO_GUEST_USER_ID;
    if (isDemoFafsaTaskId(taskId)) {
      const demoTasks = updateFafsaDemoTaskStatus(demoUserId, taskId, status);
      if (demoTasks) {
        setTasks((prev) => {
          const withoutPlan = prev.filter((task) => !isFafsaPlanTask(task));
          return normalizeAidTasks([...withoutPlan, ...demoTasks]);
        });
        return;
      }
    }

    const { data, error } = await supabase
      .from("aid_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw new Error(toFriendlyError(error, "Could not update this task. Please try again."));

    let nextTasks = tasks.map((t) => (t.id === taskId ? (data as AidTask) : t));

    if (isFafsaPlanTask(data as AidTask) && isAidTaskComplete(status)) {
      const planTasks = getFafsaPlanTasks(nextTasks);
      const nextOpen = planTasks.find((t) => t.id !== taskId && !isAidTaskComplete(t.status));
      if (nextOpen && nextOpen.status !== "Due Soon") {
        const { data: promoted, error: promoteError } = await supabase
          .from("aid_tasks")
          .update({ status: "Due Soon", updated_at: new Date().toISOString() })
          .eq("id", nextOpen.id)
          .select()
          .single();
        if (!promoteError && promoted) {
          nextTasks = nextTasks.map((t) => (t.id === nextOpen.id ? (promoted as AidTask) : t));
        }
      }
    }

    setTasks(normalizeAidTasks(nextTasks));
  };

  const applyFafsaDemoFallback = useCallback(
    (form: FafsaIntakeFormData, overrideUserId?: string): boolean => {
      const resolvedUserId = overrideUserId ?? user?.id ?? FAFSA_DEMO_GUEST_USER_ID;
      const result = applyFafsaDemoFallbackForUser(resolvedUserId, form);
      if (!result.ok) return false;

      setFafsaDemoMode(true);
      setFafsaIntake(result.intake);
      setTasks((prev) => {
        const withoutPlan = prev.filter((task) => task.task_source !== FAFSA_TASK_SOURCE);
        return normalizeAidTasks([...withoutPlan, ...result.planTasks]);
      });
      return true;
    },
    [user]
  );

  const saveFafsaIntakeAndGeneratePlan = async (form: FafsaIntakeFormData) => {
    const resolvedUserId = user?.id ?? FAFSA_DEMO_GUEST_USER_ID;

    const applyDemoFallback = (reason: unknown, intake: FafsaIntakeResponse) => {
      console.error("FAFSA save using localStorage demo fallback:", reason);
      const planTasks = buildDemoFafsaPlanTasks(resolvedUserId, form);
      if (canUseFafsaDemoStorage()) {
        saveFafsaDemoFallback(resolvedUserId, intake, planTasks);
      }
      setFafsaDemoMode(true);
      setFafsaIntake(intake);
      setTasks((prev) => {
        const withoutPlan = prev.filter((task) => task.task_source !== FAFSA_TASK_SOURCE);
        return normalizeAidTasks([...withoutPlan, ...planTasks]);
      });
      return { intake, planTasks, planError: null, demoMode: true as const };
    };

    if (!user) {
      const intake = formToDemoIntake(resolvedUserId, form);
      return applyDemoFallback(new Error("No authenticated user session"), intake);
    }

    try {
      const { intake, planTasks, planError } = await persistFafsaIntakeAndPlan(supabase, user.id, form);
      const normalizedPlanTasks = normalizeAidTasks(planTasks);

      if (normalizedPlanTasks.length > 0) {
        clearFafsaDemoFallback();
        setFafsaDemoMode(false);
        setFafsaIntake(intake);
        setTasks((prev) => {
          const withoutPlan = prev.filter((task) => task.task_source !== FAFSA_TASK_SOURCE);
          return [...withoutPlan, ...normalizedPlanTasks];
        });
        return { intake, planTasks: normalizedPlanTasks, planError, demoMode: false as const };
      }

      if (planError) {
        return applyDemoFallback(planError, intake);
      }

      return applyDemoFallback(new Error("No FAFSA plan tasks returned from save"), intake);
    } catch (err) {
      console.error("saveFafsaIntakeAndGeneratePlan failed:", err);
      if (!isRecoverableWithLocalFallback(err)) {
        throw new Error(toFriendlyError(err, "We couldn't save your FAFSA plan. Please try again."));
      }
      const intake = formToDemoIntake(resolvedUserId, form);
      return applyDemoFallback(err, intake);
    }
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    const { data, error } = await supabase
      .from("document_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw new Error(toFriendlyError(error, "Could not update this document. Please try again."));
    setDocuments((prev) => prev.map((d) => (d.id === docId ? (data as DocumentItem) : d)));
  };

  const updateDeadlineStatus = async (deadlineId: string, status: string) => {
    const { data, error } = await supabase
      .from("deadlines")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", deadlineId)
      .select()
      .single();

    if (error) throw new Error(toFriendlyError(error, "Could not update this deadline. Please try again."));
    setDeadlines((prev) => prev.map((d) => (d.id === deadlineId ? (data as Deadline) : d)));
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!user) throw new Error("Not logged in");

    const safeUpdates = withCanonicalProfileFields({ ...updates, id: user.id });
    const { data, error } = await supabase
      .from("student_profiles")
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(toFriendlyError(error, "We couldn't save your settings. Please try again."));
    }
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

    if (error) throw new Error(toFriendlyError(error, "Could not update this task. Please try again."));
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

    if (error) throw new Error(toFriendlyError(error, "Could not update this task. Please try again."));
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
    work_study_amount: number;
    subsidized_loans_amount: number;
    unsubsidized_loans_amount: number;
    parent_plus_loans_amount: number;
    private_loans_amount: number;
    loans_amount: number;
    estimated_net_cost: number;
  }) => {
    if (!user) throw new Error("Not logged in");

    const offerInput = {
      school_name: input.school_name,
      cost_of_attendance: input.cost_of_attendance,
      grants: input.grants_amount,
      scholarships: input.scholarships_amount,
      work_study: input.work_study_amount,
      subsidized_loans: input.subsidized_loans_amount,
      unsubsidized_loans: input.unsubsidized_loans_amount,
      parent_plus_loans: input.parent_plus_loans_amount,
      private_loans: input.private_loans_amount,
    };

    saveAidLetterLocal(user.id, input.aid_year, offerInput);

    const now = new Date().toISOString();
    const payload = {
      school_name: input.school_name,
      aid_year: input.aid_year,
      cost_of_attendance: input.cost_of_attendance,
      grants_amount: input.grants_amount,
      scholarships_amount: input.scholarships_amount,
      loans_amount: input.loans_amount,
      work_study_amount: input.work_study_amount,
      estimated_net_cost: input.estimated_net_cost,
      user_id: user.id,
      status: "entered",
      notes: "Entered manually. Verify all amounts with your school financial aid office.",
      updated_at: now,
    };

    try {
      const existing = aidLetters[0]?.id?.startsWith("local-aid-letter-") ? null : aidLetters[0];

      if (existing) {
        const { data, error } = await supabase
          .from("aid_letters")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        const merged: AidLetter = {
          ...(data as AidLetter),
          subsidized_loans_amount: input.subsidized_loans_amount,
          unsubsidized_loans_amount: input.unsubsidized_loans_amount,
          parent_plus_loans_amount: input.parent_plus_loans_amount,
          private_loans_amount: input.private_loans_amount,
        };
        setAidLetterLocalMode(false);
        setAidLetters([merged]);
        return { letter: merged, savedLocally: false as const };
      }

      const { data, error } = await supabase.from("aid_letters").insert(payload).select().single();
      if (error) throw error;
      const merged: AidLetter = {
        ...(data as AidLetter),
        subsidized_loans_amount: input.subsidized_loans_amount,
        unsubsidized_loans_amount: input.unsubsidized_loans_amount,
        parent_plus_loans_amount: input.parent_plus_loans_amount,
        private_loans_amount: input.private_loans_amount,
      };
      setAidLetterLocalMode(false);
      setAidLetters([merged]);
      return { letter: merged, savedLocally: false as const };
    } catch (err) {
      console.error("saveAidLetter failed:", err);
      if (!isRecoverableWithLocalFallback(err)) {
        throw new Error(toFriendlyError(err, "Could not save your aid offer. Please try again."));
      }
      console.error("saveAidLetter using local device storage after recoverable error:", err);
      const localLetter = aidLetterFromLocalStore(user.id, {
        userId: user.id,
        aid_year: input.aid_year,
        input: offerInput,
        savedAt: now,
      });
      setAidLetterLocalMode(true);
      setAidLetters([localLetter]);
      return { letter: localLetter, savedLocally: true as const };
    }
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
      await generateScholarshipMatchesForUser(
        supabase,
        user.id,
        getIntelligenceUserData(),
        scholarshipSchemaModeRef.current
      );
    } catch (err) {
      throw new Error(formatScholarshipError(err, "Could not generate scholarship matches."));
    }
    const refreshed = await loadScholarshipMatches(supabase, user.id);
    if (refreshed.schemaWarning && !refreshed.error) {
      setScholarshipSchemaError(refreshed.schemaWarning);
    }
    if (refreshed.error) {
      throw new Error(formatScholarshipError(refreshed.error));
    }
    setScholarships(refreshed.data);
    return refreshed.data;
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
    const update = buildScholarshipMatchActionUpdate("save", now, scholarshipSchemaModeRef.current);
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update(update)
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(formatScholarshipError(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const applyScholarship = async (scholarshipId: string) => {
    const now = new Date().toISOString();
    const update = buildScholarshipMatchActionUpdate("apply", now, scholarshipSchemaModeRef.current);
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update(update)
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw new Error(formatScholarshipError(error));
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const ignoreScholarship = async (scholarshipId: string) => {
    const now = new Date().toISOString();
    const update = buildScholarshipMatchActionUpdate("ignore", now, scholarshipSchemaModeRef.current);
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update(update)
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
    setAuthReady(false);
    await loadData();
  };

  const weeklyReport = weeklyReports[0] ?? null;
  const aidLetter = aidLetters[0] ?? null;

  return {
    loading,
    authReady,
    user,
    profile,
    tasks,
    documents,
    scholarships,
    deadlines,
    aidLetters,
    aidLetter,
    aidLetterLocalMode,
    weeklyReports,
    weeklyReport,
    recommendations,
    userFafsaSteps,
    workflowSteps,
    scholarshipSources,
    fafsaIntake,
    fafsaDemoMode,
    isScholarshipAdmin,
    scholarshipSchemaError,
    loadError,
    loadData,
    getIntelligenceUserData,
    updateTaskStatus,
    saveFafsaIntakeAndGeneratePlan,
    applyFafsaDemoFallback,
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
