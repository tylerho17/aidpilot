"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toFriendlyError } from "@/lib/friendly-errors";
import { AID_OFFER_LOAD_ERROR, AID_OFFER_SAVE_ERROR, AID_OFFER_UPDATE_ERROR } from "@/lib/aid-letter/calculateAidOffer";
import { completeAidOfferTasks, syncAidOfferTasks } from "@/lib/aid-letter/sync-aid-offer-tasks";
import { AID_OFFER_RECORD_STATUSES, type AidOfferRecordStatus, type UserAidOffer } from "@/lib/types";

export type AidOfferInput = {
  school_name: string;
  offer_status: AidOfferRecordStatus;
  academic_year?: string;
  cost_of_attendance: number;
  tuition_and_fees: number;
  housing_and_food: number;
  books_and_supplies: number;
  transportation: number;
  personal_expenses: number;
  grants_and_scholarships: number;
  work_study: number;
  federal_student_loans: number;
  parent_plus_loans: number;
  private_loans: number;
  other_aid: number;
  renewal_notes?: string;
  notes?: string;
};

const isDev = process.env.NODE_ENV === "development";

function devLog(message: string, detail?: unknown) {
  if (!isDev) return;
  if (detail === undefined) {
    console.log(message);
  } else {
    console.log(message, detail);
  }
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sanitizeNumeric(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

function sanitizeOfferStatus(status: AidOfferRecordStatus): AidOfferRecordStatus {
  return AID_OFFER_RECORD_STATUSES.includes(status) ? status : "draft";
}

function mapRow(row: Record<string, unknown>): UserAidOffer {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    school_name: String(row.school_name ?? ""),
    offer_status: sanitizeOfferStatus((row.offer_status as AidOfferRecordStatus) ?? "draft"),
    academic_year: row.academic_year ? String(row.academic_year) : null,
    cost_of_attendance: toNumber(row.cost_of_attendance),
    tuition_and_fees: toNumber(row.tuition_and_fees),
    housing_and_food: toNumber(row.housing_and_food),
    books_and_supplies: toNumber(row.books_and_supplies),
    transportation: toNumber(row.transportation),
    personal_expenses: toNumber(row.personal_expenses),
    grants_and_scholarships: toNumber(row.grants_and_scholarships),
    work_study: toNumber(row.work_study),
    federal_student_loans: toNumber(row.federal_student_loans),
    parent_plus_loans: toNumber(row.parent_plus_loans),
    private_loans: toNumber(row.private_loans),
    other_aid: toNumber(row.other_aid),
    renewal_notes: row.renewal_notes ? String(row.renewal_notes) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function buildPayload(userId: string, input: AidOfferInput) {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    school_name: input.school_name.trim(),
    offer_status: sanitizeOfferStatus(input.offer_status),
    academic_year: input.academic_year?.trim() || null,
    cost_of_attendance: sanitizeNumeric(input.cost_of_attendance),
    tuition_and_fees: sanitizeNumeric(input.tuition_and_fees),
    housing_and_food: sanitizeNumeric(input.housing_and_food),
    books_and_supplies: sanitizeNumeric(input.books_and_supplies),
    transportation: sanitizeNumeric(input.transportation),
    personal_expenses: sanitizeNumeric(input.personal_expenses),
    grants_and_scholarships: sanitizeNumeric(input.grants_and_scholarships),
    work_study: sanitizeNumeric(input.work_study),
    federal_student_loans: sanitizeNumeric(input.federal_student_loans),
    parent_plus_loans: sanitizeNumeric(input.parent_plus_loans),
    private_loans: sanitizeNumeric(input.private_loans),
    other_aid: sanitizeNumeric(input.other_aid),
    renewal_notes: input.renewal_notes?.trim() || null,
    notes: input.notes?.trim() || null,
    updated_at: now,
  };
}

export function useAidOffers() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<UserAidOffer[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const loadVersionRef = useRef(0);
  const authChangeVersionRef = useRef(0);
  const currentUserIdRef = useRef<string | null>(null);

  const updateUserId = useCallback((nextUserId: string | null) => {
    currentUserIdRef.current = nextUserId;
    setUserId(nextUserId);
  }, []);

  const invalidatePendingLoads = useCallback(() => {
    loadVersionRef.current += 1;
  }, []);

  const invalidateAuthChange = useCallback(() => {
    authChangeVersionRef.current += 1;
    invalidatePendingLoads();
  }, [invalidatePendingLoads]);

  const syncTasksForOffer = useCallback(
    async (offer: UserAidOffer) => {
      if (!userId) return;
      try {
        await syncAidOfferTasks(supabase, userId, offer);
      } catch (error) {
        console.error("syncAidOfferTasks failed:", error);
      }
    },
    [supabase, userId]
  );

  const loadOffersForUser = useCallback(
    async (resolvedUserId: string | null, options?: { silent?: boolean }) => {
      const loadVersion = ++loadVersionRef.current;

      if (!options?.silent) {
        setLoading(true);
      }
      setLoadError(null);

      if (!resolvedUserId) {
        setOffers([]);
        if (!options?.silent) setLoading(false);
        return;
      }

      devLog("Aid offers query started");

      try {
        const { data, error } = await supabase
          .from("user_aid_offers")
          .select("*")
          .eq("user_id", resolvedUserId)
          .order("created_at", { ascending: false });

        if (loadVersion !== loadVersionRef.current || currentUserIdRef.current !== resolvedUserId) return;
        if (error) throw error;

        const rows = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
        setOffers(rows);
        devLog("Aid offers loaded", rows.length);
      } catch (error) {
        if (loadVersion !== loadVersionRef.current || currentUserIdRef.current !== resolvedUserId) return;
        console.error("Aid offers query failed:", error);
        devLog("Aid offers query failed");
        setOffers([]);
        setLoadError(toFriendlyError(error, AID_OFFER_LOAD_ERROR));
      } finally {
        if (loadVersion === loadVersionRef.current && currentUserIdRef.current === resolvedUserId && !options?.silent) {
          setLoading(false);
        }
      }
    },
    [supabase]
  );

  const reload = useCallback(
    async (options?: { silent?: boolean }) => {
      const authChangeVersion = authChangeVersionRef.current;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const resolvedUserId = (user ?? session?.user)?.id ?? null;
      if (authChangeVersion !== authChangeVersionRef.current) return;
      updateUserId(resolvedUserId);
      setAuthReady(true);
      await loadOffersForUser(resolvedUserId, options);
    },
    [loadOffersForUser, supabase, updateUserId]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const authChangeVersion = authChangeVersionRef.current;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const resolvedUser = user ?? session?.user ?? null;
      const resolvedUserId = resolvedUser?.id ?? null;

      if (cancelled || authChangeVersion !== authChangeVersionRef.current) return;

      devLog("Aid offers user loaded", resolvedUserId ?? "logged-out");
      updateUserId(resolvedUserId);
      setAuthReady(true);
      await loadOffersForUser(resolvedUserId);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;

      if (event === "INITIAL_SESSION") {
        const initialUserId = session?.user?.id ?? null;
        updateUserId(initialUserId);
        setAuthReady(true);
        if (initialUserId) {
          void loadOffersForUser(initialUserId, { silent: true });
        }
        return;
      }

      const nextUserId = session?.user?.id ?? null;
      invalidateAuthChange();
      updateUserId(nextUserId);
      setAuthReady(true);

      if (!nextUserId) {
        setOffers([]);
        setLoadError(null);
        setLoading(false);
        return;
      }

      void loadOffersForUser(nextUserId);
    });

    return () => {
      cancelled = true;
      invalidatePendingLoads();
      subscription.unsubscribe();
    };
  }, [invalidateAuthChange, invalidatePendingLoads, loadOffersForUser, supabase, updateUserId]);

  const saveOffer = useCallback(
    async (input: AidOfferInput, offerId?: string) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(offerId ?? "new");

      const payload = buildPayload(userId, input);

      try {
        if (offerId) {
          const { data, error } = await supabase
            .from("user_aid_offers")
            .update(payload)
            .eq("id", offerId)
            .eq("user_id", userId)
            .select()
            .single();
          if (error) throw error;
          const saved = mapRow(data as Record<string, unknown>);
          setOffers((prev) =>
            prev
              .map((offer) => (offer.id === offerId ? saved : offer))
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          );
          await syncTasksForOffer(saved);
          return saved;
        }

        const { data, error } = await supabase.from("user_aid_offers").insert(payload).select().single();
        if (error) throw error;
        const saved = mapRow(data as Record<string, unknown>);
        setOffers((prev) =>
          [saved, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
        await syncTasksForOffer(saved);
        return saved;
      } catch (error) {
        console.error("saveOffer failed:", error);
        setActionError(toFriendlyError(error, AID_OFFER_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, syncTasksForOffer, userId]
  );

  const deleteOffer = useCallback(
    async (offerId: string) => {
      if (!userId) return false;
      setActionError(null);
      setSavingId(offerId);

      try {
        const { error } = await supabase.from("user_aid_offers").delete().eq("id", offerId).eq("user_id", userId);
        if (error) throw error;
        await completeAidOfferTasks(supabase, userId, offerId);
        setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
        return true;
      } catch (error) {
        console.error("deleteOffer failed:", error);
        setActionError(toFriendlyError(error, AID_OFFER_SAVE_ERROR));
        return false;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const updateOfferStatus = useCallback(
    async (offerId: string, status: AidOfferRecordStatus) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(offerId);

      const sanitizedStatus = sanitizeOfferStatus(status);
      const now = new Date().toISOString();

      try {
        const { data, error } = await supabase
          .from("user_aid_offers")
          .update({ offer_status: sanitizedStatus, updated_at: now })
          .eq("id", offerId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        const saved = mapRow(data as Record<string, unknown>);
        setOffers((prev) =>
          prev
            .map((offer) => (offer.id === offerId ? saved : offer))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );

        await loadOffersForUser(userId, { silent: true });
        await syncTasksForOffer(saved);
        return saved;
      } catch (error) {
        console.error("updateOfferStatus failed:", error);
        setActionError(toFriendlyError(error, AID_OFFER_UPDATE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [loadOffersForUser, supabase, syncTasksForOffer, userId]
  );

  const markReviewed = useCallback(
    async (offerId: string) => updateOfferStatus(offerId, "reviewed"),
    [updateOfferStatus]
  );

  return {
    authReady,
    userId,
    loading,
    offers,
    loadError,
    actionError,
    savingId,
    saveOffer,
    deleteOffer,
    updateOfferStatus,
    markReviewed,
    reload,
    clearActionError: () => setActionError(null),
  };
}
