"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toFriendlyError } from "@/lib/friendly-errors";
import {
  getSuggestedTasksForStatus,
  SCHOOL_AID_LOAD_ERROR,
  SCHOOL_AID_SAVE_ERROR,
} from "@/lib/fafsa/school-aid-tracker";
import type { SuggestedSchoolAidTask } from "@/lib/fafsa/school-aid-tracker";
import type { UserSchoolAidStatus, UserSchoolAidTask } from "@/lib/types";

export type AddSchoolInput = {
  school_name: string;
  portal_url?: string;
  school_email?: string;
};

export type UpdateSchoolInput = Partial<
  Pick<
    UserSchoolAidStatus,
    | "school_name"
    | "portal_url"
    | "school_email"
    | "fafsa_received_status"
    | "portal_checked_status"
    | "documents_requested_status"
    | "verification_status"
    | "aid_offer_status"
    | "notes"
    | "last_checked_at"
  >
>;

function groupTasksBySchool(tasks: UserSchoolAidTask[]): Record<string, UserSchoolAidTask[]> {
  return tasks.reduce<Record<string, UserSchoolAidTask[]>>((acc, task) => {
    const list = acc[task.school_aid_status_id] ?? [];
    list.push(task);
    acc[task.school_aid_status_id] = list;
    return acc;
  }, {});
}

export function useSchoolAidTracker() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<UserSchoolAidStatus[]>([]);
  const [tasks, setTasks] = useState<UserSchoolAidTask[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const createTasksIfNeeded = useCallback(
    async (status: UserSchoolAidStatus, currentTasks: UserSchoolAidTask[]) => {
      const suggestions = getSuggestedTasksForStatus(status, currentTasks);
      if (suggestions.length === 0 || !userId) return currentTasks;

      const now = new Date().toISOString();
      const rows = suggestions.map((suggestion: SuggestedSchoolAidTask) => ({
        user_id: userId,
        school_aid_status_id: status.id,
        title: suggestion.title,
        description: suggestion.description ?? null,
        task_type: suggestion.task_type,
        status: "todo" as const,
        priority: suggestion.priority,
        updated_at: now,
      }));

      const { data, error } = await supabase.from("user_school_aid_tasks").insert(rows).select();
      if (error) {
        console.error("Failed to create suggested school aid tasks:", error);
        return currentTasks;
      }

      return [...currentTasks, ...((data ?? []) as UserSchoolAidTask[])];
    },
    [supabase, userId]
  );

  const loadTracker = useCallback(async () => {
    setLoadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);
      setAuthReady(true);

      if (!user) {
        setStatuses([]);
        setTasks([]);
        return;
      }

      const [statusRes, taskRes] = await Promise.all([
        supabase
          .from("user_school_aid_statuses")
          .select("*")
          .eq("user_id", user.id)
          .order("school_name"),
        supabase
          .from("user_school_aid_tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at"),
      ]);

      if (statusRes.error) throw statusRes.error;
      if (taskRes.error) throw taskRes.error;

      setStatuses((statusRes.data ?? []) as UserSchoolAidStatus[]);
      setTasks((taskRes.data ?? []) as UserSchoolAidTask[]);
    } catch (error) {
      console.error("useSchoolAidTracker load failed:", error);
      setLoadError(toFriendlyError(error, SCHOOL_AID_LOAD_ERROR));
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;

        setUserId(user?.id ?? null);
        setAuthReady(true);

        if (!user) {
          setStatuses([]);
          setTasks([]);
          return;
        }

        const [statusRes, taskRes] = await Promise.all([
          supabase
            .from("user_school_aid_statuses")
            .select("*")
            .eq("user_id", user.id)
            .order("school_name"),
          supabase
            .from("user_school_aid_tasks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at"),
        ]);

        if (cancelled) return;
        if (statusRes.error) throw statusRes.error;
        if (taskRes.error) throw taskRes.error;

        setStatuses((statusRes.data ?? []) as UserSchoolAidStatus[]);
        setTasks((taskRes.data ?? []) as UserSchoolAidTask[]);
      } catch (error) {
        if (cancelled) return;
        console.error("useSchoolAidTracker load failed:", error);
        setLoadError(toFriendlyError(error, SCHOOL_AID_LOAD_ERROR));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const addSchool = useCallback(
    async (input: AddSchoolInput) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId("new");

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("user_school_aid_statuses")
          .insert({
            user_id: userId,
            school_name: input.school_name.trim(),
            portal_url: input.portal_url?.trim() || null,
            school_email: input.school_email?.trim() || null,
            updated_at: now,
          })
          .select()
          .single();

        if (error) throw error;

        const status = data as UserSchoolAidStatus;
        setStatuses((prev) => [...prev, status].sort((a, b) => a.school_name.localeCompare(b.school_name)));
        const nextTasks = await createTasksIfNeeded(status, tasks);
        setTasks(nextTasks);
        return status;
      } catch (error) {
        console.error("addSchool failed:", error);
        setActionError(toFriendlyError(error, SCHOOL_AID_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [createTasksIfNeeded, supabase, tasks, userId]
  );

  const updateSchool = useCallback(
    async (statusId: string, updates: UpdateSchoolInput) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(statusId);

      const previousStatuses = statuses;
      const previousTasks = tasks;

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("user_school_aid_statuses")
          .update({ ...updates, updated_at: now })
          .eq("id", statusId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        const updated = data as UserSchoolAidStatus;
        setStatuses((prev) =>
          prev.map((status) => (status.id === statusId ? updated : status)).sort((a, b) => a.school_name.localeCompare(b.school_name))
        );

        const nextTasks = await createTasksIfNeeded(updated, tasks);
        setTasks(nextTasks);
        return updated;
      } catch (error) {
        console.error("updateSchool failed:", error);
        setStatuses(previousStatuses);
        setTasks(previousTasks);
        setActionError(toFriendlyError(error, SCHOOL_AID_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [createTasksIfNeeded, statuses, supabase, tasks, userId]
  );

  const markPortalCheckedToday = useCallback(
    async (statusId: string) => {
      const now = new Date().toISOString();
      return updateSchool(statusId, {
        portal_checked_status: "checked",
        last_checked_at: now,
      });
    },
    [updateSchool]
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: UserSchoolAidTask["status"]) => {
      if (!userId) return;
      setActionError(null);
      setSavingId(taskId);

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("user_school_aid_tasks")
          .update({
            status,
            completed_at: status === "done" ? now : null,
            updated_at: now,
          })
          .eq("id", taskId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        setTasks((prev) => prev.map((task) => (task.id === taskId ? (data as UserSchoolAidTask) : task)));
      } catch (error) {
        console.error("updateTaskStatus failed:", error);
        setActionError(toFriendlyError(error, SCHOOL_AID_SAVE_ERROR));
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const tasksBySchool = groupTasksBySchool(tasks);

  return {
    authReady,
    userId,
    loading,
    statuses,
    tasks,
    tasksBySchool,
    loadError,
    actionError,
    savingId,
    addSchool,
    updateSchool,
    markPortalCheckedToday,
    updateTaskStatus,
    reload: async () => {
      setLoading(true);
      await loadTracker();
      setLoading(false);
    },
    clearActionError: () => setActionError(null),
  };
}
