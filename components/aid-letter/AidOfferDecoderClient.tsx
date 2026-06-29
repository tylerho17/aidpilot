"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import AidCategoryExplainer from "@/components/aid-letter/AidCategoryExplainer";
import AidOfferComparisonTable from "@/components/aid-letter/AidOfferComparisonTable";
import AidOfferForm from "@/components/aid-letter/AidOfferForm";
import AidOfferSummaryCard from "@/components/aid-letter/AidOfferSummaryCard";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import { useAidOffers } from "@/hooks/useAidOffers";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 18px",
  borderRadius: 12,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

export default function AidOfferDecoderClient() {
  const {
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
  } = useAidOffers();

  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<UserAidOffer | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedOffer = offers.find((offer) => offer.id === selectedId) ?? null;

  const summaryStats = useMemo(() => {
    if (offers.length === 0) return null;
    const withCalc = offers.map((offer) => ({ offer, calculation: calculateAidOfferFromRecord(offer) }));
    const lowestNet = [...withCalc].sort((a, b) => a.calculation.netCostAfterGiftAid - b.calculation.netCostAfterGiftAid)[0];
    const highestGap = [...withCalc].sort(
      (a, b) => b.calculation.remainingGapAfterAllAid - a.calculation.remainingGapAfterAllAid
    )[0];
    return { lowestNet, highestGap };
  }, [offers]);

  if (!authReady || loading) {
    return <PageLoading message="Loading your aid offers..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
            Aid Offer Decoder
          </h1>
          <PageErrorBanner message="Log in to compare aid offers from your schools." />
          <Link href="/login" style={primaryBtn}>
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  function openAddForm() {
    setEditingOffer(null);
    setShowForm(true);
    setSelectedId(null);
  }

  function openEditForm(offer: UserAidOffer) {
    setEditingOffer(offer);
    setShowForm(true);
    setSelectedId(offer.id);
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
            Aid Offer Decoder
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Understand what a school is really offering and what you may still owe.
          </p>
        </div>

        <ProductCard
          style={{
            padding: 18,
            marginBottom: 18,
            background: "#EAF3FF",
            border: "1px solid #D7E7FB",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: "#1E3A5F", margin: 0, lineHeight: 1.65 }}>
            Grants and scholarships usually do not need to be repaid. Work-study is earned through a job. Loans must be
            repaid. Your remaining gap is what still needs a plan.
          </p>
        </ProductCard>

        {loadError && <PageErrorBanner message={loadError} />}
        {actionError && <PageErrorBanner message={actionError} />}

        {offers.length > 0 && summaryStats ? (
          <ProductCard style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Saved offers</div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "#15212E" }}>
                  {offers.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Lowest net after gift aid</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15885A" }}>
                  {summaryStats.lowestNet.offer.school_name} · $
                  {summaryStats.lowestNet.calculation.netCostAfterGiftAid.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Highest remaining gap</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#C04E57" }}>
                  {summaryStats.highestGap.offer.school_name} · $
                  {summaryStats.highestGap.calculation.remainingGapAfterAllAid.toLocaleString()}
                </div>
              </div>
            </div>
          </ProductCard>
        ) : null}

        <AidCategoryExplainer />

        {offers.length === 0 && !showForm ? (
          <ProductCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Add your first school aid offer. You can enter the numbers manually from your school portal or aid letter.
            </p>
            <button type="button" style={primaryBtn} onClick={openAddForm}>
              Add aid offer
            </button>
          </ProductCard>
        ) : null}

        {(showForm || offers.length > 0) && (
          <ProductCard style={{ padding: 22, marginBottom: 20 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
              {editingOffer ? `Edit ${editingOffer.school_name}` : showForm ? "Add aid offer" : "Add another school"}
            </h2>
            {showForm ? (
              <AidOfferForm
                initialOffer={editingOffer}
                saving={Boolean(savingId)}
                onSubmit={async (input, offerId) => {
                  const saved = await saveOffer(input, offerId);
                  if (saved) {
                    setShowForm(false);
                    setEditingOffer(null);
                    setSelectedId(saved.id);
                  }
                  return saved;
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingOffer(null);
                }}
              />
            ) : (
              <button type="button" style={primaryBtn} onClick={openAddForm}>
                Add aid offer
              </button>
            )}
          </ProductCard>
        )}

        {offers.length > 0 ? (
          <>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
              Compare schools
            </h2>
            <AidOfferComparisonTable offers={offers} onSelect={(offer) => setSelectedId(offer.id)} />

            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
              School breakdowns
            </h2>
            {(selectedOffer ? [selectedOffer] : offers).map((offer) => (
              <AidOfferSummaryCard
                key={offer.id}
                offer={offer}
                saving={savingId === offer.id}
                onMarkReviewed={(id) => void markReviewed(id)}
                onEdit={openEditForm}
                onDelete={(id) => {
                  void deleteOffer(id);
                  if (selectedId === id) setSelectedId(null);
                }}
              />
            ))}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
