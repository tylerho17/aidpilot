"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import AidOfferForm from "@/components/aid-letter/AidOfferForm";
import AidOfferSummaryCard from "@/components/aid-letter/AidOfferSummaryCard";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import ProductPageHeader, { ProductFlowNav } from "@/components/product/ProductPageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { PrimaryButton, SecondaryButton, SecondaryButtonLink } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { H2, Body, BodyMuted } from "@/components/ui/Typography";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useUserData } from "@/hooks/useUserData";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import { FIRST_OFFER_SCHOOL_STORAGE_KEY } from "@/lib/onboarding-aid-stage";
import { SAMPLE_AID_REPORT_HREF } from "@/lib/aid-letter/sampleAidOffer";
import { colors, layout } from "@/lib/design-tokens";
import type { UserAidOffer } from "@/lib/types";

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
        subtitle="Add each school's offer to see your real cost, gap, and next steps."
        primaryAction={{ href: "#add-offer", label: "Add aid offer" }}
        secondaryAction={
          hasOffers
            ? { href: AID_OFFER_COMPARE_HREF, label: "Compare aid offers" }
            : { href: SAMPLE_AID_REPORT_HREF, label: "View sample report" }
        }
      />
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

  const [formBoot] = useState(() => {
    if (typeof window === "undefined") return { school: "", open: false };
    const school = sessionStorage.getItem(FIRST_OFFER_SCHOOL_STORAGE_KEY) ?? "";
    if (school) sessionStorage.removeItem(FIRST_OFFER_SCHOOL_STORAGE_KEY);
    return { school, open: Boolean(school) };
  });
  const [showForm, setShowForm] = useState(formBoot.open);
  const [editingOffer, setEditingOffer] = useState<UserAidOffer | null>(null);

  if (!authReady || loading) {
    return <PageLoading message="Loading your aid offers..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <PageIntro hasOffers={false} />
        <EmptyState
          title="Sign in to save offers"
          description="Log in to save and compare your aid offers."
          actionHref="/login"
          actionLabel="Sign in"
        />
      </AppShell>
    );
  }

  function openAddForm() {
    setEditingOffer(null);
    setShowForm(true);
  }

  function openEditForm(offer: UserAidOffer) {
    setEditingOffer(offer);
    setShowForm(true);
  }

  return (
    <AppShell>
      <PageIntro hasOffers={offers.length > 0} />

      {loadError ? (
        <SectionCard style={{ ...{ marginBottom: layout.sectionGap }, background: colors.softAmber }}>
          <BodyMuted style={{ color: colors.amber, marginBottom: layout.stackGapSm }}>{loadError}</BodyMuted>
          <SecondaryButton onClick={() => void reload()}>Try again</SecondaryButton>
        </SectionCard>
      ) : null}
      {actionError ? <PageErrorBanner message={actionError} /> : null}

      {offers.length > 0 ? (
        <SectionCard style={{ ...{ marginBottom: layout.sectionGap }, background: colors.softBlue }}>
          <Body>
            You have <strong>{offers.length}</strong> saved offer{offers.length === 1 ? "" : "s"}. Compare schools to see
            which leaves you with the lowest remaining gap.
          </Body>
          <div style={{ marginTop: layout.stackGapSm }}>
            <SecondaryButtonLink href={AID_OFFER_COMPARE_HREF}>Open compare view</SecondaryButtonLink>
          </div>
        </SectionCard>
      ) : null}

      {!loadError && offers.length === 0 && !showForm ? (
        <div id="add-offer">
          <SectionCard style={{ marginBottom: layout.sectionGap }}>
            <H2 style={{ marginBottom: layout.stackGapXs }}>No aid offers yet</H2>
            <Body style={{ marginBottom: layout.stackGap }}>
              Add your first aid offer to generate your Aid Health Report. Enter numbers from your school portal or aid
              letter.
            </Body>
            <PrimaryButton onClick={openAddForm}>Add aid offer</PrimaryButton>
          </SectionCard>
        </div>
      ) : null}

      {!loadError && (showForm || offers.length > 0) ? (
        <div id={showForm ? "add-offer" : undefined}>
          <SectionCard style={{ marginBottom: layout.sectionGap }}>
            <H2 style={{ marginBottom: layout.stackGapSm }}>
              {editingOffer ? `Edit ${editingOffer.school_name}` : showForm ? "Add aid offer" : "Add another school"}
            </H2>
            {showForm ? (
              <AidOfferForm
                initialOffer={editingOffer}
                defaultSchoolName={formBoot.school || undefined}
                saving={Boolean(savingId)}
                onSubmit={async (input, offerId) => {
                  const saved = await saveOffer(input, offerId);
                  if (saved) {
                    void loadData();
                    setShowForm(false);
                    setEditingOffer(null);
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
              <PrimaryButton onClick={openAddForm}>Add aid offer</PrimaryButton>
            )}
          </SectionCard>
        </div>
      ) : null}

      {!loadError && offers.length > 0 ? (
        <div>
          <H2 style={{ marginBottom: layout.stackGap }}>Your schools</H2>
          {offers.map((offer) => (
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
              onDelete={(id) => void deleteOffer(id)}
            />
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
