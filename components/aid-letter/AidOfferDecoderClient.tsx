"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Button, Card, StatusPanel } from "@/components/ui";
import { Greeting, SectionTitle, money as moneyStyle } from "@/components/app/screens/shared";
import AidCategoryExplainer from "@/components/aid-letter/AidCategoryExplainer";
import AidOfferComparisonTable from "@/components/aid-letter/AidOfferComparisonTable";
import AidOfferForm from "@/components/aid-letter/AidOfferForm";
import AidOfferSummaryCard from "@/components/aid-letter/AidOfferSummaryCard";
import { PageLoading } from "@/components/product/PageSafety";
import { toFriendlyError } from "@/lib/friendly-errors";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useUserData } from "@/hooks/useUserData";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

function PageIntro({ hasOffers }: { hasOffers: boolean }) {
  return (
    <>
      <Greeting
        title="Aid Offers"
        subtitle="Understand what a school is really offering and what you may still owe."
        action={
          hasOffers ? (
            <Link href={AID_OFFER_COMPARE_HREF} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">Compare aid offers</Button>
            </Link>
          ) : (
            <Link href="#add-offer" style={{ textDecoration: "none" }}>
              <Button variant="clay" size="sm" iconRight="arrow-right">Add aid offer</Button>
            </Link>
          )
        }
      />
      <StatusPanel tone="blue" icon="letter" style={{ marginBottom: 20 }}>
        Grants and scholarships usually do not need to be repaid. Work-study is earned through a job. Loans must be
        repaid. Your remaining gap is what still needs a plan.
      </StatusPanel>
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
      <AppChrome>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <PageIntro hasOffers={false} />
          <Card variant="clay" padding={24} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
              Log in to save and compare your aid offers.
            </p>
            <div>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Sign in</Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppChrome>
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
    <AppChrome>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <PageIntro hasOffers={offers.length > 0} />

        <AidCategoryExplainer />

        {loadError ? (
          <StatusPanel
            tone="amber"
            icon="star"
            title="We couldn't load your offers"
            trailing={
              <Button variant="secondary" size="sm" onClick={() => void reload()}>
                Try again
              </Button>
            }
            style={{ marginBottom: 18 }}
          >
            {toFriendlyError(loadError, "Please try again in a moment.")}
          </StatusPanel>
        ) : null}
        {actionError ? (
          <StatusPanel tone="coral" icon="star" title="Something went wrong" style={{ marginBottom: 18 }}>
            {toFriendlyError(actionError, "Please try again in a moment.")}
          </StatusPanel>
        ) : null}

        {offers.length > 0 && summaryStats ? (
          <Card variant="clay" padding={20} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>Saved offers</div>
                <div style={{ ...moneyStyle, fontSize: 26, color: "var(--ink-900)" }}>{offers.length}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>Lowest net after gift aid</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green-600)", marginTop: 4 }}>
                  {summaryStats.lowestNet.offer.school_name} · $
                  {summaryStats.lowestNet.calculation.netCostAfterGiftAid.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>Highest remaining gap</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--coral-600)", marginTop: 4 }}>
                  {summaryStats.highestGap.offer.school_name} · $
                  {summaryStats.highestGap.calculation.remainingGapAfterAllAid.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        ) : null}

        {!loadError && offers.length === 0 && !showForm ? (
          <div id="add-offer">
            <Card variant="clay" padding={24} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
                No aid offers yet. Add your first aid offer to generate your Aid Health Report.
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-400)", margin: 0, lineHeight: 1.6 }}>
                Enter the numbers manually from your school portal or aid letter.
              </p>
              <div>
                <Button variant="clay" iconRight="arrow-right" onClick={openAddForm}>Add aid offer</Button>
              </div>
            </Card>
          </div>
        ) : null}

        {!loadError && (showForm || offers.length > 0) ? (
          <Card variant="clay" padding={24} style={{ marginBottom: 20 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 16px", color: "var(--ink-900)" }}>
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
              <Button variant="clay" iconRight="arrow-right" onClick={openAddForm}>Add aid offer</Button>
            )}
          </Card>
        ) : null}

        {!loadError && offers.length > 0 ? (
          <>
            <SectionTitle
              action={
                <Link href={AID_OFFER_COMPARE_HREF} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="sm">Compare aid offers</Button>
                </Link>
              }
            >
              Compare schools
            </SectionTitle>
            <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 24 }}>
              <div style={{ padding: "6px 6px 0" }}>
                <AidOfferComparisonTable
                  offers={offers}
                  onSelect={(offer) => router.push(getAidOfferReportHref(offer.id))}
                />
              </div>
            </Card>

            <SectionTitle>School breakdowns</SectionTitle>
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
    </AppChrome>
  );
}
