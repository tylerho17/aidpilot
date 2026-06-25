"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AidTask, DocumentItem, ScholarshipMatch, StudentProfile } from "@/lib/types";

export function useUserData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<AidTask[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
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
      setIsDemo(true);
      setLoading(false);
      return;
    }

    setUser(authUser);
    setIsDemo(false);

    const [profileRes, tasksRes, docsRes, scholarshipsRes] = await Promise.all([
      supabase.from("student_profiles").select("*").eq("id", authUser.id).maybeSingle(),
      supabase.from("aid_tasks").select("*").eq("user_id", authUser.id).order("created_at"),
      supabase.from("document_items").select("*").eq("user_id", authUser.id).order("created_at"),
      supabase.from("scholarship_matches").select("*").eq("user_id", authUser.id).order("match_percent", { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setTasks(tasksRes.data ?? []);
    setDocuments(docsRes.data ?? []);
    setScholarships(scholarshipsRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();

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

  return {
    loading,
    user,
    profile,
    tasks,
    documents,
    scholarships,
    isDemo,
    loadData,
    updateTaskStatus,
    updateDocumentStatus,
    saveScholarship,
    startScholarship,
    logout,
  };
}
