"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import AidCategoryExplainer from "@/components/aid-letter/AidCategoryExplainer";
import AidOfferComparisonTable from "@/components/aid-letter/AidOfferComparisonTable";
import AidOfferForm from "@/components/aid-letter/AidOfferForm";
import AidOfferSummaryCard from "@/components/aid-letter/AidOfferSummaryCard";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import ProductPageHeader, { ProductFlowNav, primaryBtn, secondaryBtn } from "@/components/product/ProductPageHeader";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useUserData } from "@/hooks/useUserData";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';

function PageIntro({ hasOffers }: { hasOffers: boolean }) {
  return (
    <>
      <ProductFlowNav
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: AID_OFFER_COMPARE_HREF, label: "Compare Offers" },
        ]}
      />
      <ProductPageHeader
        title="Aid Offers"
        subtitle="Understand what a school is really offering and what you may still owe."
        primaryAction={{ href: "#add-offer", label: "Add aid offer" }}
        secondaryAction={hasOffers ? { href: AID_OFFER_COMPARE_HREF, label: "Compare aid offers" } : undefined}
      />
      <div
        style={{
          padding: 14,
          marginBottom: 18,
          background: "#fff",
          border: "1px solid #E3EBF3",
          borderRadius: 8,
          fontFamily: pageFont,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#5B6B7F", margin: 0, lineHeight: 1.65 }}>
          Grants and scholarships usually do not need to be repaid. Work-study is earned through a job. Loans must be
          repaid. Your remaining gap is what still needs a plan.
        </p>
      </div>
    </>
  );
}

export default function AidOfferDecoderClient() {
  const router = useRouter();
  const { loadData } = useUserData();
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
    updateOfferStatus,
    markReviewed,
    reload,
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
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <PageIntro hasOffers={false} />
          <ProductCard style={{ padding: 24, marginBottom: 20, border: "1px solid #E3EBF3" }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Log in to save and compare your aid offers.
            </p>
            <Link href="/login" style={primaryBtn}>
              Sign in
            </Link>
          </ProductCard>
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
        <PageIntro hasOffers={offers.length > 0} />

        <AidCategoryExplainer />

        {loadError ? (
          <ProductCard style={{ padding: 18, marginBottom: 18, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.6 }}>
              {loadError}
            </p>
            <button type="button" style={secondaryBtn} onClick={() => void reload()}>
              Try again
            </button>
          </ProductCard>
        ) : null}
        {actionError ? <PageErrorBanner message={actionError} /> : null}

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

        {!loadError && offers.length === 0 && !showForm ? (
          <div id="add-offer">
          <ProductCard style={{ padding: 24, marginBottom: 20, border: "1px solid #E3EBF3" }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#5B6B7F", margin: "0 0 10px", lineHeight: 1.65, fontFamily: pageFont }}>
              No aid offers yet. Add your first aid offer to generate your Aid Health Report.
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: "0 0 18px", lineHeight: 1.6, fontFamily: pageFont }}>
              Enter the numbers manually from your school portal or aid letter.
            </p>
            <button type="button" style={primaryBtn} onClick={openAddForm}>
              Add aid offer
            </button>
          </ProductCard>
          </div>
        ) : null}

        {!loadError && (showForm || offers.length > 0) ? (
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
                    void loadData();
                    setShowForm(false);
                    setEditingOffer(null);
                    setSelectedId(saved.id);
                    router.push(getAidOfferReportHref(saved.id));
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
        ) : null}

        {!loadError && offers.length > 0 ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#15212E" }}>
                Compare schools
              </h2>
              <Link href={AID_OFFER_COMPARE_HREF} style={secondaryBtn}>
                Compare aid offers
              </Link>
            </div>
            <AidOfferComparisonTable
              offers={offers}
              onSelect={(offer) => router.push(getAidOfferReportHref(offer.id))}
            />

            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
              School breakdowns
            </h2>
            {(selectedOffer ? [selectedOffer] : offers).map((offer) => (
              <AidOfferSummaryCard
                key={offer.id}
                offer={offer}
                saving={savingId === offer.id}
                onMarkOfficial={(id) => {
                  void updateOfferStatus(id, "official").then(() => loadData());
                }}
                onMarkReviewed={(id) => {
                  void markReviewed(id).then(() => loadData());
                }}
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
