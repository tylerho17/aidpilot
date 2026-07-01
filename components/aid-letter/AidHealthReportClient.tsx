"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, IconTile, StatusPanel } from "@/components/ui";
import { money as moneyStyle } from "@/components/app/screens/shared";
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

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display"
      style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", color: "var(--ink-900)", margin: "0 0 14px" }}
    >
      {children}
    </h2>
  );
}

function LineItem({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid var(--border-card)",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: emphasize ? 700 : 600, color: emphasize ? "var(--ink-800)" : "var(--gray-500)" }}>
        {label}
      </span>
      <span
        style={{
          ...moneyStyle,
          fontSize: emphasize ? 17 : 15,
          color: emphasize ? "var(--ink-900)" : "var(--ink-800)",
        }}
      >
        {value}
      </span>
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
      <AppChrome>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Card variant="clay" padding={26} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
              Log in to view your Aid Health Report.
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

  if (!offer || !report) {
    return (
      <AppChrome>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Card variant="clay" padding={26} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h1 className="font-display" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", color: "var(--ink-900)", margin: 0 }}>
              Your Aid Health Report
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
              We could not find that aid offer. It may have been deleted.
            </p>
            <div>
              <Link href="/aid-letter" style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Add aid offer</Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppChrome>
    );
  }

  const { calculation: calc } = report;
  const gapPositive = calc.remainingGapAfterAllAid > 0;

  return (
    <AppChrome>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <Link href="/aid-letter" style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="sm" iconLeft="chevron-left">Aid Offers</Button>
          </Link>
          <Link href={AID_OFFER_COMPARE_HREF} style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="sm">Compare Offers</Button>
          </Link>
        </div>

        <header style={{ margin: "0 0 24px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <IconTile icon="letter" tone="blue" size={52} />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "var(--blue-700)",
                margin: "0 0 6px",
                letterSpacing: ".8px",
                textTransform: "uppercase",
              }}
            >
              Your Aid Health Report
            </p>
            <h1 className="font-display" style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.6px", margin: "0 0 8px", color: "var(--ink-900)", lineHeight: 1.15 }}>
              {offer.school_name}
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 12px", lineHeight: 1.55 }}>
              Understand your real cost, remaining gap, and next steps.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Badge tone={offer.offer_status === "reviewed" ? "green" : "blue"}>
                {AID_OFFER_STATUS_LABELS[offer.offer_status]}
              </Badge>
              {offer.academic_year ? (
                <Badge tone="gray">{offer.academic_year}</Badge>
              ) : (
                <Badge tone="amber">Academic year not set</Badge>
              )}
            </div>
          </div>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <StatusPanel
            tone={gapPositive ? "coral" : "green"}
            icon={gapPositive ? "star" : "shield-check"}
            eyebrow="Summary"
            title={report.summary}
          />

          <Card variant="clay" padding={24}>
            <SectionTitle>Cost breakdown</SectionTitle>
            <LineItem label="Cost of attendance" value={money(offer.cost_of_attendance)} emphasize />
            <LineItem label="Tuition and fees" value={money(offer.tuition_and_fees)} />
            <LineItem label="Housing and food" value={money(offer.housing_and_food)} />
            <LineItem label="Books and supplies" value={money(offer.books_and_supplies)} />
            <LineItem label="Transportation" value={money(offer.transportation)} />
            <LineItem label="Personal expenses" value={money(offer.personal_expenses)} />
            <LineItem label="Direct cost estimate (tuition + housing)" value={money(calc.directCostEstimate)} />
          </Card>

          <Card variant="clay" padding={24}>
            <SectionTitle>Aid breakdown</SectionTitle>
            <LineItem label="Grants and scholarships" value={money(offer.grants_and_scholarships)} />
            <LineItem label="Other gift aid" value={money(offer.other_aid)} />
            <LineItem label="Total gift aid" value={money(calc.giftAid)} emphasize />
            <LineItem label="Work-study" value={money(calc.workStudy)} />
            <LineItem label="Federal student loans" value={money(offer.federal_student_loans)} />
            <LineItem label="Parent PLUS loans" value={money(offer.parent_plus_loans)} />
            <LineItem label="Private loans" value={money(offer.private_loans)} />
            <LineItem label="Total loans" value={money(calc.loanTotal)} emphasize />
            <LineItem label="Net cost after gift aid" value={money(calc.netCostAfterGiftAid)} emphasize />
          </Card>

          <Card
            variant="clay"
            padding={24}
            style={{ background: gapPositive ? "var(--gradient-risk)" : "var(--gradient-safe)" }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6 }}>Remaining gap</div>
            <div style={{ ...moneyStyle, fontSize: 34, color: gapPositive ? "var(--coral-600)" : "var(--green-600)" }}>
              {money(calc.remainingGapAfterAllAid)}
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "10px 0 0", lineHeight: 1.55 }}>
              {gapPositive
                ? "This is what may still need a plan after all aid shown on the offer."
                : "Aid shown on this offer covers the listed cost of attendance."}
            </p>
            {calc.surplusAid > 0 ? (
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--green-600)", margin: "10px 0 0", lineHeight: 1.55 }}>
                Aid shown exceeds cost of attendance by {money(calc.surplusAid)}. Confirm line items with your school.
              </p>
            ) : null}
          </Card>

          <Card variant="clay" padding={24}>
            <SectionTitle>Risk flags</SectionTitle>
            {report.flags.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {report.flags.map((flag) => (
                  <div
                    key={flag}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--gradient-warn)",
                      border: "1px solid var(--amber-200)",
                    }}
                  >
                    <IconTile icon="star" tone="amber" size={28} />
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--amber-600)", margin: 0, lineHeight: 1.55 }}>
                      {flag}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
                No risk flags for this offer right now.
              </p>
            )}
          </Card>

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
        </div>

        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "20px 0 24px", lineHeight: 1.6 }}>
          These tasks are also added to your{" "}
          <Link href="/checklist" style={{ color: "var(--blue-700)", fontWeight: 700, textDecoration: "none" }}>
            checklist
          </Link>{" "}
          when you save or update this offer.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="clay" iconRight="arrow-right">Back to dashboard</Button>
          </Link>
          <Link href="/aid-letter" style={{ textDecoration: "none" }}>
            <Button variant="secondary">Edit aid offer</Button>
          </Link>
          <Link href={AID_OFFER_COMPARE_HREF} style={{ textDecoration: "none" }}>
            <Button variant="secondary">Compare aid offers</Button>
          </Link>
          <Link href="/checklist" style={{ textDecoration: "none" }}>
            <Button variant="secondary">Open checklist</Button>
          </Link>
        </div>
      </div>
    </AppChrome>
  );
}
