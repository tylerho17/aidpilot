"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type {
  AidLetter,
  AidTask,
  Deadline,
  DocumentItem,
  ScholarshipMatch,
  StudentProfile,
  WeeklyReport,
} from "@/lib/types";

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
  const [isDemo, setIsDemo] = useState(true);

  const supabase = useMemo(() => createClient(), []);

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
      setIsDemo(true);
      setLoading(false);
      return;
    }

    setUser(authUser);
    setIsDemo(false);

    const [profileRes, tasksRes, docsRes, scholarshipsRes, deadlinesRes, aidLettersRes, reportsRes] =
      await Promise.all([
        supabase.from("student_profiles").select("*").eq("id", authUser.id).maybeSingle(),
        supabase.from("aid_tasks").select("*").eq("user_id", authUser.id).order("created_at"),
        supabase.from("document_items").select("*").eq("user_id", authUser.id).order("created_at"),
        supabase.from("scholarship_matches").select("*").eq("user_id", authUser.id).order("match_percent", { ascending: false }),
        supabase.from("deadlines").select("*").eq("user_id", authUser.id).order("deadline_date"),
        supabase.from("aid_letters").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
        supabase.from("weekly_reports").select("*").eq("user_id", authUser.id).order("report_week_start", { ascending: false }),
      ]);

    setProfile(profileRes.data);
    setTasks(tasksRes.data ?? []);
    setDocuments(docsRes.data ?? []);
    setScholarships(scholarshipsRes.data ?? []);
    setDeadlines(deadlinesRes.data ?? []);
    setAidLetters((aidLettersRes.data ?? []) as AidLetter[]);
    setWeeklyReports((reportsRes.data ?? []) as WeeklyReport[]);
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

    if (error) throw error;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? (data as AidTask) : t)));
  };

  const updateDocumentStatus = async (docId: string, status: string) => {
    const { data, error } = await supabase
      .from("document_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw error;
    setDocuments((prev) => prev.map((d) => (d.id === docId ? (data as DocumentItem) : d)));
  };

  const updateDeadlineStatus = async (deadlineId: string, status: string) => {
    const { data, error } = await supabase
      .from("deadlines")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", deadlineId)
      .select()
      .single();

    if (error) throw error;
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

    if (error) throw error;
    setProfile(data as StudentProfile);
    return data as StudentProfile;
  };

  const saveScholarship = async (scholarshipId: string) => {
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({ is_saved: true, status: "saved", updated_at: new Date().toISOString() })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw error;
    setScholarships((prev) => prev.map((s) => (s.id === scholarshipId ? (data as ScholarshipMatch) : s)));
  };

  const startScholarship = async (scholarshipId: string) => {
    const { data, error } = await supabase
      .from("scholarship_matches")
      .update({ is_started: true, status: "started", updated_at: new Date().toISOString() })
      .eq("id", scholarshipId)
      .select()
      .single();

    if (error) throw error;
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
    isDemo,
    loadData,
    updateTaskStatus,
    updateDocumentStatus,
    updateDeadlineStatus,
    updateProfile,
    saveScholarship,
    startScholarship,
    logout,
  };
}
