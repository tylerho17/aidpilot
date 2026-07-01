"use client";

import Link from "next/link";
import { fontFamily } from "@/lib/design-tokens";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import AidActionPlanSection from "@/components/aid-letter/AidActionPlanSection";
import AidHealthReportLayout from "@/components/aid-letter/AidHealthReportLayout";
import { PageLoading } from "@/components/product/PageSafety";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useUserData } from "@/hooks/useUserData";
import { buildAidOfficeDraft } from "@/lib/aid-letter/buildAidOfficeDraft";
import { buildAidHealthReport, getAidOfferActionTasks } from "@/lib/aid-letter/buildAidHealthReport";
import {
  buildScholarshipGapPlan,
  getScholarshipGapActionTasks,
  scholarshipGapTaskPrefix,
} from "@/lib/aid-letter/buildScholarshipGapPlan";
import { syncAidOfferTasks } from "@/lib/aid-letter/sync-aid-offer-tasks";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import TrustDisclaimer from "@/components/product/TrustDisclaimer";
import { ProductFlowNav, primaryBtn, secondaryBtn } from "@/components/product/ProductPageHeader";
import { createClient } from "@/lib/supabase/client";

const bodyStyle = { fontSize: 15, fontWeight: 500, color: "#0F2744", margin: 0, lineHeight: 1.65, fontFamily: fontFamily };
const mutedStyle = { fontSize: 14, fontWeight: 500, color: "#5B6B7F", margin: 0, lineHeight: 1.6, fontFamily: fontFamily };

type AidHealthReportClientProps = {
  offerId: string;
};

export default function AidHealthReportClient({ offerId }: AidHealthReportClientProps) {
  const { authReady, userId, loading, offers } = useAidOffers();
  const { tasks, loadData, updateTaskStatus, profile, fafsaIntake } = useUserData();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const syncedOfferRef = useRef<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const offer = offers.find((item) => item.id === offerId) ?? null;

  const report = useMemo(() => (offer ? buildAidHealthReport(offer) : null), [offer]);
  const officeDraft = useMemo(
    () => (offer && report ? buildAidOfficeDraft(offer, report.calculation) : null),
    [offer, report]
  );
  const scholarshipGapPlan = useMemo(
    () => (offer && report ? buildScholarshipGapPlan(offer, report.calculation, profile, fafsaIntake) : null),
    [fafsaIntake, offer, profile, report]
  );
  const actionPlanTasks = useMemo(() => {
    if (!offer) return [];
    const prefix = scholarshipGapTaskPrefix(offer.id);
    return getAidOfferActionTasks(tasks, offer.id).filter((task) => !task.plan_key?.startsWith(prefix));
  }, [offer, tasks]);
  const scholarshipGapTasks = useMemo(
    () => (offer ? getScholarshipGapActionTasks(tasks, offer.id) : []),
    [offer, tasks]
  );

  useEffect(() => {
    if (!userId || !offer || syncedOfferRef.current === offer.id) return;
    syncedOfferRef.current = offer.id;
    void syncAidOfferTasks(supabase, userId, offer)
      .then(() => loadData({ silent: true }))
      .catch((error) => console.warn("syncAidOfferTasks on report failed:", error));
  }, [loadData, offer, supabase, userId]);

  async function handleToggleTask(taskId: string, complete: boolean) {
    setTogglingId(taskId);
    try {
      await updateTaskStatus(taskId, complete ? "Complete" : "Needs Review");
    } catch (error) {
      console.warn("updateTaskStatus failed:", error);
    } finally {
      setTogglingId(null);
    }
  }

  if (!authReady || loading) {
    return <PageLoading message="Loading aid health report..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: fontFamily, background: "#fff" }}>
          <p style={bodyStyle}>Log in to view your Aid Health Report.</p>
          <Link href="/login" style={{ color: "#0B5CAD", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!offer || !report) {
    return (
      <AppShell>
        <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: fontFamily, background: "#fff" }}>
          <ProductFlowNav
            links={[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/aid-letter", label: "Aid Offers" },
            ]}
          />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "16px 0 8px", color: "#0F2744", fontFamily: fontFamily }}>
            Your Aid Health Report
          </h1>
          <p style={mutedStyle}>We could not find that aid offer. It may have been deleted.</p>
          <Link href="/aid-letter" style={{ ...primaryBtn, marginTop: 16, display: "inline-flex" }}>
            Add aid offer
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AidHealthReportLayout
        offer={offer}
        report={report}
        officeDraft={officeDraft}
        scholarshipGapPlan={scholarshipGapPlan}
        scholarshipGapTasks={scholarshipGapTasks}
        onToggleGapTask={handleToggleTask}
        togglingId={togglingId}
        belowGrid={
          <>
            <AidActionPlanSection
              tasks={actionPlanTasks}
              onToggleTask={handleToggleTask}
              togglingId={togglingId}
            />
            <p style={{ ...mutedStyle, marginBottom: 24 }}>
              These tasks are also added to your{" "}
              <Link href="/checklist" style={{ color: "#0B5CAD", fontWeight: 700, textDecoration: "none" }}>
                checklist
              </Link>{" "}
              when you save or update this offer.
            </p>
            <TrustDisclaimer />
          </>
        }
        footer={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            <Link href="/dashboard" style={primaryBtn}>
              Back to dashboard
            </Link>
            <Link href="/aid-letter" style={secondaryBtn}>
              Edit aid offer
            </Link>
            <Link href={AID_OFFER_COMPARE_HREF} style={secondaryBtn}>
              Compare aid offers
            </Link>
            <Link href="/checklist" style={secondaryBtn}>
              Open checklist
            </Link>
          </div>
        }
      />
    </AppShell>
  );
}
