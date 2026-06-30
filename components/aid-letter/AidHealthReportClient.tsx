"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge } from "@/components/ProductUI";
import AidActionPlanSection from "@/components/aid-letter/AidActionPlanSection";
import AidOfficeDraftSection from "@/components/aid-letter/AidOfficeDraftSection";
import ScholarshipGapPlanSection from "@/components/aid-letter/ScholarshipGapPlanSection";
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
import { AID_OFFER_STATUS_LABELS } from "@/lib/aid-letter/calculateAidOffer";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import { createClient } from "@/lib/supabase/client";
import ProductPageHeader, { ProductFlowNav, primaryBtn, secondaryBtn } from "@/components/product/ProductPageHeader";

const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';
const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

const sectionStyle = { marginBottom: 28 };
const h2Style = {
  fontSize: 16,
  fontWeight: 700,
  margin: "0 0 12px",
  color: navy,
  fontFamily: pageFont,
} as const;
const bodyStyle = { fontSize: 15, fontWeight: 500, color: navy, margin: 0, lineHeight: 1.65, fontFamily: pageFont };
const mutedStyle = { fontSize: 14, fontWeight: 500, color: muted, margin: 0, lineHeight: 1.6, fontFamily: pageFont };

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function LineItem({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "8px 0",
        borderBottom: `1px solid ${border}`,
        fontSize: 14,
        fontWeight: emphasize ? 700 : 500,
        color: emphasize ? navy : muted,
        fontFamily: pageFont,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

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
    return getAidOfferActionTasks(tasks, offer.id).filter(
      (task) => !task.plan_key?.startsWith(prefix)
    );
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
      .catch((error) => console.error("syncAidOfferTasks on report failed:", error));
  }, [loadData, offer, supabase, userId]);

  async function handleToggleTask(taskId: string, complete: boolean) {
    setTogglingId(taskId);
    try {
      await updateTaskStatus(taskId, complete ? "Complete" : "Needs Review");
    } catch (error) {
      console.error("updateTaskStatus failed:", error);
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
        <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: pageFont, background: "#fff" }}>
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
        <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: pageFont, background: "#fff" }}>
          <ProductFlowNav
            links={[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/aid-letter", label: "Aid Offers" },
            ]}
          />
          <ProductPageHeader
            title="Your Aid Health Report"
            subtitle="We could not find that aid offer. It may have been deleted."
            primaryAction={{ href: "/aid-letter", label: "Add aid offer" }}
          />
        </div>
      </AppShell>
    );
  }

  const { calculation: calc } = report;

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: pageFont, background: "#fff" }}>
        <ProductFlowNav
          links={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/aid-letter", label: "Aid Offers" },
            { href: AID_OFFER_COMPARE_HREF, label: "Compare Offers" },
          ]}
        />

        <header style={{ margin: "0 0 28px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: muted, margin: "0 0 6px", letterSpacing: "0.04em" }}>
            YOUR AID HEALTH REPORT
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: navy, lineHeight: 1.15 }}>
            {offer.school_name}
          </h1>
          <p style={{ ...mutedStyle, marginBottom: 12 }}>
            Understand your real cost, remaining gap, and next steps.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <PillBadge tone={offer.offer_status === "reviewed" ? "green" : "blue"}>
              {AID_OFFER_STATUS_LABELS[offer.offer_status]}
            </PillBadge>
            {offer.academic_year ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: muted }}>{offer.academic_year}</span>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600, color: "#B7791F" }}>Academic year not set</span>
            )}
          </div>
        </header>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Summary</h2>
          <p style={bodyStyle}>{report.summary}</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Cost breakdown</h2>
          <LineItem label="Cost of attendance" value={money(offer.cost_of_attendance)} emphasize />
          <LineItem label="Tuition and fees" value={money(offer.tuition_and_fees)} />
          <LineItem label="Housing and food" value={money(offer.housing_and_food)} />
          <LineItem label="Books and supplies" value={money(offer.books_and_supplies)} />
          <LineItem label="Transportation" value={money(offer.transportation)} />
          <LineItem label="Personal expenses" value={money(offer.personal_expenses)} />
          <LineItem label="Direct cost estimate (tuition + housing)" value={money(calc.directCostEstimate)} />
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Aid breakdown</h2>
          <LineItem label="Grants and scholarships" value={money(offer.grants_and_scholarships)} />
          <LineItem label="Other gift aid" value={money(offer.other_aid)} />
          <LineItem label="Total gift aid" value={money(calc.giftAid)} emphasize />
          <LineItem label="Work-study" value={money(calc.workStudy)} />
          <LineItem label="Federal student loans" value={money(offer.federal_student_loans)} />
          <LineItem label="Parent PLUS loans" value={money(offer.parent_plus_loans)} />
          <LineItem label="Private loans" value={money(offer.private_loans)} />
          <LineItem label="Total loans" value={money(calc.loanTotal)} emphasize />
          <LineItem label="Net cost after gift aid" value={money(calc.netCostAfterGiftAid)} emphasize />
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Remaining gap</h2>
          <p style={{ ...bodyStyle, fontSize: 24, fontWeight: 800, color: calc.remainingGapAfterAllAid > 0 ? "#C04E57" : "#15885A" }}>
            {money(calc.remainingGapAfterAllAid)}
          </p>
          <p style={{ ...mutedStyle, marginTop: 8 }}>
            {calc.remainingGapAfterAllAid > 0
              ? "This is what may still need a plan after all aid shown on the offer."
              : "Aid shown on this offer covers the listed cost of attendance."}
          </p>
          {calc.surplusAid > 0 ? (
            <p style={{ ...mutedStyle, marginTop: 8, color: "#15885A" }}>
              Aid shown exceeds cost of attendance by {money(calc.surplusAid)}. Confirm line items with your school.
            </p>
          ) : null}
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Risk flags</h2>
          {report.flags.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", fontSize: 15, lineHeight: 1.65 }}>
              {report.flags.map((flag) => (
                <li key={flag} style={{ marginBottom: 8 }}>
                  {flag}
                </li>
              ))}
            </ul>
          ) : (
            <p style={mutedStyle}>No risk flags for this offer right now.</p>
          )}
        </section>

        {officeDraft ? <AidOfficeDraftSection draft={officeDraft} /> : null}

        {scholarshipGapPlan ? (
          <ScholarshipGapPlanSection
            plan={scholarshipGapPlan}
            gapTasks={scholarshipGapTasks}
            onToggleTask={handleToggleTask}
            togglingId={togglingId}
          />
        ) : null}

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
      </div>
    </AppShell>
  );
}
