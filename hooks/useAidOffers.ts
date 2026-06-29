"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toFriendlyError } from "@/lib/friendly-errors";
import { AID_OFFER_LOAD_ERROR, AID_OFFER_SAVE_ERROR } from "@/lib/aid-letter/calculateAidOffer";
import type { AidOfferRecordStatus, UserAidOffer } from "@/lib/types";

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

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapRow(row: Record<string, unknown>): UserAidOffer {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    school_name: String(row.school_name ?? ""),
    offer_status: (row.offer_status as AidOfferRecordStatus) ?? "draft",
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

export function useAidOffers() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<UserAidOffer[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

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
          setOffers([]);
          return;
        }

        const { data, error } = await supabase
          .from("user_aid_offers")
          .select("*")
          .eq("user_id", user.id)
          .order("school_name");

        if (cancelled) return;
        if (error) throw error;

        setOffers((data ?? []).map((row) => mapRow(row as Record<string, unknown>)));
      } catch (error) {
        if (cancelled) return;
        console.error("useAidOffers load failed:", error);
        setLoadError(toFriendlyError(error, AID_OFFER_LOAD_ERROR));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const saveOffer = useCallback(
    async (input: AidOfferInput, offerId?: string) => {
      if (!userId) return null;
      setActionError(null);
      setSavingId(offerId ?? "new");

      const now = new Date().toISOString();
      const payload = {
        user_id: userId,
        school_name: input.school_name.trim(),
        offer_status: input.offer_status,
        academic_year: input.academic_year?.trim() || null,
        cost_of_attendance: input.cost_of_attendance,
        tuition_and_fees: input.tuition_and_fees,
        housing_and_food: input.housing_and_food,
        books_and_supplies: input.books_and_supplies,
        transportation: input.transportation,
        personal_expenses: input.personal_expenses,
        grants_and_scholarships: input.grants_and_scholarships,
        work_study: input.work_study,
        federal_student_loans: input.federal_student_loans,
        parent_plus_loans: input.parent_plus_loans,
        private_loans: input.private_loans,
        other_aid: input.other_aid,
        renewal_notes: input.renewal_notes?.trim() || null,
        notes: input.notes?.trim() || null,
        updated_at: now,
      };

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
            prev.map((offer) => (offer.id === offerId ? saved : offer)).sort((a, b) => a.school_name.localeCompare(b.school_name))
          );
          return saved;
        }

        const { data, error } = await supabase.from("user_aid_offers").insert(payload).select().single();
        if (error) throw error;
        const saved = mapRow(data as Record<string, unknown>);
        setOffers((prev) => [...prev, saved].sort((a, b) => a.school_name.localeCompare(b.school_name)));
        return saved;
      } catch (error) {
        console.error("saveOffer failed:", error);
        setActionError(toFriendlyError(error, AID_OFFER_SAVE_ERROR));
        return null;
      } finally {
        setSavingId(null);
      }
    },
    [supabase, userId]
  );

  const deleteOffer = useCallback(
    async (offerId: string) => {
      if (!userId) return false;
      setActionError(null);
      setSavingId(offerId);

      try {
        const { error } = await supabase.from("user_aid_offers").delete().eq("id", offerId).eq("user_id", userId);
        if (error) throw error;
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

  const markReviewed = useCallback(
    async (offerId: string) => {
      const offer = offers.find((item) => item.id === offerId);
      if (!offer) return null;
      return saveOffer(
        {
          school_name: offer.school_name,
          offer_status: "reviewed",
          academic_year: offer.academic_year ?? undefined,
          cost_of_attendance: offer.cost_of_attendance,
          tuition_and_fees: offer.tuition_and_fees,
          housing_and_food: offer.housing_and_food,
          books_and_supplies: offer.books_and_supplies,
          transportation: offer.transportation,
          personal_expenses: offer.personal_expenses,
          grants_and_scholarships: offer.grants_and_scholarships,
          work_study: offer.work_study,
          federal_student_loans: offer.federal_student_loans,
          parent_plus_loans: offer.parent_plus_loans,
          private_loans: offer.private_loans,
          other_aid: offer.other_aid,
          renewal_notes: offer.renewal_notes ?? undefined,
          notes: offer.notes ?? undefined,
        },
        offerId
      );
    },
    [offers, saveOffer]
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
    markReviewed,
    clearActionError: () => setActionError(null),
  };
}
