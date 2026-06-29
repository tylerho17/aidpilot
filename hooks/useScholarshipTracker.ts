"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toFriendlyError } from "@/lib/friendly-errors";
import {
  SCHOLARSHIP_LOAD_ERROR,
  SCHOLARSHIP_SAVE_ERROR,
} from "@/lib/scholarships/getScholarshipUrgency";
import {
  SCHOLARSHIP_PRIORITIES,
  USER_SCHOLARSHIP_STATUSES,
  type CatalogScholarship,
  type ScholarshipPriority,
  type UserScholarshipMatch,
  type UserScholarshipStatus,
} from "@/lib/types";

export type AddCustomScholarshipInput = {
  name: string;
  provider?: string;
  amount?: number;
  deadline?: string;
  application_url?: string;
  match_reason?: string;
  priority: ScholarshipPriority;
  notes?: string;
};

export type UpdateScholarshipMatchInput = {
  status?: UserScholarshipStatus;
  priority?: ScholarshipPriority;
  notes?: string;
  match_reason?: string;
  custom_name?: string;
  custom_provider?: string;
  custom_amount?: number;
  custom_deadline?: string | null;
  custom_application_url?: string;
};

const isDev = process.env.NODE_ENV === "development";

function devLog(message: string, detail?: unknown) {
  if (!isDev) return;
  if (detail === undefined) console.log(message);
  else console.log(message, detail);
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeNumeric(value: number | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.max(0, value);
}

function sanitizeStatus(status: UserScholarshipStatus): UserScholarshipStatus {
  return USER_SCHOLARSHIP_STATUSES.includes(status) ? status : "saved";
}

function sanitizePriority(priority: ScholarshipPriority): ScholarshipPriority {
  return SCHOLARSHIP_PRIORITIES.includes(priority) ? priority : "medium";
}

function mapScholarship(row: Record<string, unknown>): CatalogScholarship {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    provider: row.provider ? String(row.provider) : null,
    description: row.description ? String(row.description) : null,
    amount_min: toNumber(row.amount_min),
    amount_max: toNumber(row.amount_max),
    deadline: row.deadline ? String(row.deadline) : null,
    eligibility_summary: row.eligibility_summary ? String(row.eligibility_summary) : null,
    application_url: row.application_url ? String(row.application_url) : null,
    scholarship_type: (row.scholarship_type as CatalogScholarship["scholarship_type"]) ?? "general",
    is_active: row.is_active !== false,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapMatch(row: Record<string, unknown>): UserScholarshipMatch {
  const scholarshipRaw = row.scholarships;
  const scholarship =
    scholarshipRaw && typeof scholarshipRaw === "object" && !Array.isArray(scholarshipRaw)
      ? mapScholarship(scholarshipRaw as Record<string, unknown>)
      : null;

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    scholarship_id: row.scholarship_id ? String(row.scholarship_id) : null,
    custom_name: row.custom_name ? String(row.custom_name) : null,
    custom_provider: row.custom_provider ? String(row.custom_provider) : null,
    custom_amount: toNumber(row.custom_amount),
    custom_deadline: row.custom_deadline ? String(row.custom_deadline) : null,
    custom_application_url: row.custom_application_url ? String(row.custom_application_url) : null,
    match_reason: row.match_reason ? String(row.match_reason) : null,
    fit_score: toNumber(row.fit_score),
    status: sanitizeStatus((row.status as UserScholarshipStatus) ?? "saved"),
    priority: sanitizePriority((row.priority as ScholarshipPriority) ?? "medium"),
    notes: row.notes ? String(row.notes) : null,
    submitted_at: row.submitted_at ? String(row.submitted_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    scholarship,
  };
}

export function useScholarshipTracker() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<UserScholarshipMatch[]>([]);
  const [catalog, setCatalog] = useState<CatalogScholarship[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const loadVersionRef = useRef(0);

  const loadMatchesForUser = useCallback(
    async (resolvedUserId: string | null) => {
      const loadVersion = ++loadVersionRef.current;

      if (!resolvedUserId) {
        setMatches([]);
        return;
      }

      devLog("Scholarship matches query started");

      const { data, error } = await supabase
        .from("user_scholarship_matches")
        .select("*, scholarships(*)")
        .eq("user_id", resolvedUserId)
        .order("created_at", { ascending: false });

      if (loadVersion !== loadVersionRef.current) return;
      if (error) throw error;

      const rows = (data ?? []).map((row) => mapMatch(row as Record<string, unknown>));
      setMatches(rows);
      devLog("Scholarship matches loaded", rows.length);
    },
    [supabase]
  );

  const loadCatalog = useCallback(async () => {
    devLog("Scholarship catalog query started");

    const { data, error } = await supabase
      .from("scholarships")
      .select("*")
      .eq("is_active", true)
      .order("deadline", { ascending: true, nullsFirst: false });

    if (error) throw error;

    const rows = (data ?? []).map((row) => mapScholarship(row as Record<string, unknown>));
    setCatalog(rows);
    devLog("Scholarship catalog loaded", rows.length);
  }, [supabase]);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const resolvedUserId = (user ?? session?.user)?.id ?? null;
      setUserId(resolvedUserId);
      setAuthReady(true);
      await Promise.all([loadCatalog(), loadMatchesForUser(resolvedUserId)]);
    } catch (error) {
      console.error("Scholarship tracker reload failed:", error);
      devLog("Scholarship tracker query failed");
      setLoadError(toFriendlyError(error, SCHOLARSHIP_LOAD_ERROR));
    } finally {
      setLoading(false);
    }
  }, [loadCatalog, loadMatchesForUser, supabase]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoadError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const resolvedUserId = (user ?? session?.user)?.id ?? null;

      if (cancelled) return;

      devLog("Scholarship tracker user loaded", resolvedUserId ?? "logged-out");
      setUserId(resolvedUserId);
      setAuthReady(true);

      try {
        await loadCatalog();
        if (resolvedUserId) {
          await loadMatchesForUser(resolvedUserId);
        } else {
          setMatches([]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Scholarship tracker load failed:", error);
        devLog("Scholarship tracker query failed");
        setMatches([]);
        setLoadError(toFriendlyError(error, SCHOLARSHIP_LOAD_ERROR));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;

      if (event === "INITIAL_SESSION") {
        const initialUserId = session?.user?.id ?? null;
        setUserId(initialUserId);
        setAuthReady(true);
        if (initialUserId) {
          void loadMatchesForUser(initialUserId);
        }
        return;
      }

      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);
      setAuthReady(true);

      if (!nextUserId) {
        setMatches([]);
        setLoadError(null);
        setLoading(false);
        return;
      }

      void loadMatchesForUser(nextUserId);
    });

    return () => {
      cancelled = true;
      loadVersionRef.current += 1;
      subscription.unsubscribe();
    };
  }, [loadCatalog, loadMatchesForUser, supabase]);

  const saveCatalogScholarship = useCallback(
    async (scholarshipId: string) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(scholarshipId);

      const existing = matches.find((match) => match.scholarship_id === scholarshipId);
      if (existing) return existing;

      const scholarship = catalog.find((item) => item.id === scholarshipId);
      const now = new Date().toISOString();

      try {
        const { data, error } = await supabase
          .from("user_scholarship_matches")
          .insert({
            user_id: userId,
            scholarship_id: scholarshipId,
            match_reason: scholarship?.eligibility_summary ?? null,
            status: "saved",
            priority: "medium",
            updated_at: now,
          })
          .select("*, scholarships(*)")
          .single();

        if (error) throw error;
        const saved = mapMatch(data as Record<string, unknown>);
        setMatches((prev) => [saved, ...prev]);
        return saved;
      } catch (error) {
        console.error("saveCatalogScholarship failed:", error);
        setActionError(toFriendlyError(error, SCHOLARSHIP_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [catalog, matches, supabase, userId]
  );

  const addCustomScholarship = useCallback(
    async (input: AddCustomScholarshipInput) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId("new");

      const now = new Date().toISOString();
      const payload = {
        user_id: userId,
        custom_name: input.name.trim(),
        custom_provider: input.provider?.trim() || null,
        custom_amount: sanitizeNumeric(input.amount),
        custom_deadline: input.deadline?.trim() || null,
        custom_application_url: input.application_url?.trim() || null,
        match_reason: input.match_reason?.trim() || null,
        priority: sanitizePriority(input.priority),
        notes: input.notes?.trim() || null,
        status: "saved" as const,
        updated_at: now,
      };

      try {
        const { data, error } = await supabase
          .from("user_scholarship_matches")
          .insert(payload)
          .select("*, scholarships(*)")
          .single();

        if (error) throw error;
        const saved = mapMatch(data as Record<string, unknown>);
        setMatches((prev) => [saved, ...prev]);
        return saved;
      } catch (error) {
        console.error("addCustomScholarship failed:", error);
        setActionError(toFriendlyError(error, SCHOLARSHIP_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const updateMatch = useCallback(
    async (matchId: string, input: UpdateScholarshipMatchInput) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(matchId);

      const now = new Date().toISOString();
      const payload: Record<string, unknown> = { updated_at: now };

      if (input.status) payload.status = sanitizeStatus(input.status);
      if (input.priority) payload.priority = sanitizePriority(input.priority);
      if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;
      if (input.match_reason !== undefined) payload.match_reason = input.match_reason?.trim() || null;
      if (input.custom_name !== undefined) payload.custom_name = input.custom_name.trim();
      if (input.custom_provider !== undefined) payload.custom_provider = input.custom_provider?.trim() || null;
      if (input.custom_amount !== undefined) payload.custom_amount = sanitizeNumeric(input.custom_amount);
      if (input.custom_deadline !== undefined) payload.custom_deadline = input.custom_deadline || null;
      if (input.custom_application_url !== undefined) {
        payload.custom_application_url = input.custom_application_url?.trim() || null;
      }

      if (input.status === "submitted") {
        payload.submitted_at = now;
      }

      try {
        const { data, error } = await supabase
          .from("user_scholarship_matches")
          .update(payload)
          .eq("id", matchId)
          .eq("user_id", userId)
          .select("*, scholarships(*)")
          .single();

        if (error) throw error;
        const saved = mapMatch(data as Record<string, unknown>);
        setMatches((prev) => prev.map((match) => (match.id === matchId ? saved : match)));
        return saved;
      } catch (error) {
        console.error("updateMatch failed:", error);
        setActionError(toFriendlyError(error, SCHOLARSHIP_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const removeMatch = useCallback(
    async (matchId: string) => {
      if (!userId) return false;
      setActionError(null);
      setSavingId(matchId);

      try {
        const { error } = await supabase
          .from("user_scholarship_matches")
          .delete()
          .eq("id", matchId)
          .eq("user_id", userId);

        if (error) throw error;
        setMatches((prev) => prev.filter((match) => match.id !== matchId));
        return true;
      } catch (error) {
        console.error("removeMatch failed:", error);
        setActionError(toFriendlyError(error, SCHOLARSHIP_SAVE_ERROR));
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const trackedScholarshipIds = useMemo(
    () => new Set(matches.map((match) => match.scholarship_id).filter(Boolean) as string[]),
    [matches]
  );

  return {
    authReady,
    userId,
    loading,
    matches,
    catalog,
    trackedScholarshipIds,
    loadError,
    actionError,
    savingId,
    saveCatalogScholarship,
    addCustomScholarship,
    updateMatch,
    removeMatch,
    reload,
    clearActionError: () => setActionError(null),
  };
}
