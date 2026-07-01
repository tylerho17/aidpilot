"use client";

import type { ReactNode } from "react";
import { ProductFlowNav } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { DataRow } from "@/components/ui/DataRow";
import { CopyButton } from "@/components/ui/CopyButton";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import ScholarshipGapPlanSection from "@/components/aid-letter/ScholarshipGapPlanSection";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import type { AidOfficeDraft } from "@/lib/aid-letter/buildAidOfficeDraft";
import type { AidHealthReport } from "@/lib/aid-letter/buildAidHealthReport";
import type { ScholarshipGapPlan } from "@/lib/aid-letter/buildScholarshipGapPlan";
import { AID_OFFER_STATUS_LABELS } from "@/lib/aid-letter/calculateAidOffer";
import type { AidTask, UserAidOffer } from "@/lib/types";
import { colors, fontFamily } from "@/lib/design-tokens";

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionCard padding={16}>
      <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px", color: colors.text }}>{title}</h2>
      {children}
    </SectionCard>
  );
}

export type AidHealthReportLayoutProps = {
  offer: UserAidOffer;
  report: AidHealthReport;
  officeDraft: AidOfficeDraft | null;
  scholarshipGapPlan: ScholarshipGapPlan | null;
  scholarshipGapTasks?: AidTask[];
  onToggleGapTask?: (taskId: string, complete: boolean) => void;
  togglingId?: string | null;
  banner?: ReactNode;
  footer?: ReactNode;
  belowGrid?: ReactNode;
};

export default function AidHealthReportLayout({
  offer,
  report,
  officeDraft,
  scholarshipGapPlan,
  scholarshipGapTasks,
  onToggleGapTask,
  togglingId,
  banner,
  footer,
  belowGrid,
}: AidHealthReportLayoutProps) {
  const calc = report.calculation;
  const statusLabel = AID_OFFER_STATUS_LABELS[offer.offer_status];
  const yearLabel = offer.academic_year?.trim() || "Year not set";
  const topAction = report.recommendedTasks[0] ?? null;
  const gapTone = calc.remainingGapAfterAllAid > 0 ? "alert" : "success";

  return (
    <div style={{ fontFamily, color: colors.text }}>
      <ProductFlowNav
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/aid-letter", label: "Aid Offers" },
          { href: AID_OFFER_COMPARE_HREF, label: "Compare Offers" },
        ]}
      />

      {banner}

      <header style={{ margin: "0 0 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: "0 0 6px", color: colors.text, lineHeight: 1.2 }}>
          {offer.school_name}
        </h1>
        <p style={{ fontSize: 15, fontWeight: 500, color: colors.textMuted, margin: "0 0 8px" }}>
          {statusLabel} · {yearLabel}
        </p>
        <p style={{ fontSize: 15, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
          Understand your real cost, remaining gap, and next steps.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <MetricCard label="Cost of attendance" value={money(offer.cost_of_attendance)} />
        <MetricCard label="Gift aid" value={money(calc.giftAid)} tone="success" />
        <MetricCard label="Loans" value={money(calc.loanTotal)} tone="warning" />
        <MetricCard label="Remaining gap" value={money(calc.remainingGapAfterAllAid)} tone={gapTone} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 420px", minWidth: 0 }}>
          <SectionCard style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: colors.text }}>Summary</h2>
            <p style={{ fontSize: 15, fontWeight: 400, color: colors.text, margin: 0, lineHeight: 1.65 }}>{report.summary}</p>
          </SectionCard>

          <SectionCard style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: colors.text }}>Cost breakdown</h2>
            <DataRow label="Cost of attendance" value={money(offer.cost_of_attendance)} emphasize />
            <DataRow label="Tuition and fees" value={money(offer.tuition_and_fees)} />
            <DataRow label="Housing and food" value={money(offer.housing_and_food)} />
            {offer.books_and_supplies > 0 ? <DataRow label="Books and supplies" value={money(offer.books_and_supplies)} /> : null}
            {offer.transportation > 0 ? <DataRow label="Transportation" value={money(offer.transportation)} /> : null}
            {offer.personal_expenses > 0 ? <DataRow label="Personal expenses" value={money(offer.personal_expenses)} /> : null}
            <DataRow label="Direct cost estimate (tuition + housing)" value={money(calc.directCostEstimate)} emphasize />
          </SectionCard>

          <SectionCard style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: colors.text }}>Aid breakdown</h2>
            <DataRow label="Grants and scholarships" value={money(offer.grants_and_scholarships)} />
            {offer.other_aid > 0 ? <DataRow label="Other gift aid" value={money(offer.other_aid)} /> : null}
            <DataRow label="Total gift aid" value={money(calc.giftAid)} emphasize />
            {calc.workStudy > 0 ? <DataRow label="Work-study" value={money(calc.workStudy)} /> : null}
            {offer.federal_student_loans > 0 ? (
              <DataRow label="Federal student loans" value={money(offer.federal_student_loans)} />
            ) : null}
            {offer.parent_plus_loans > 0 ? <DataRow label="Parent PLUS loans" value={money(offer.parent_plus_loans)} /> : null}
            {offer.private_loans > 0 ? <DataRow label="Private loans" value={money(offer.private_loans)} /> : null}
            <DataRow label="Total loans" value={money(calc.loanTotal)} emphasize />
            <DataRow label="Net cost after gift aid" value={money(calc.netCostAfterGiftAid)} emphasize />
          </SectionCard>

          {scholarshipGapPlan ? (
            <ScholarshipGapPlanSection
              plan={scholarshipGapPlan}
              gapTasks={scholarshipGapTasks}
              onToggleTask={onToggleGapTask}
              togglingId={togglingId}
            />
          ) : null}
        </div>

        <aside style={{ flex: "1 1 280px", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
          <SidebarPanel title="Aid status">
            <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: colors.text }}>{statusLabel}</p>
            {report.flags.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: colors.textMuted, fontSize: 14, lineHeight: 1.55 }}>
                {report.flags.slice(0, 4).map((flag) => (
                  <li key={flag} style={{ marginBottom: 6 }}>
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.55 }}>
                No risk flags for this offer right now.
              </p>
            )}
          </SidebarPanel>

          <SidebarPanel title="Recommended next action">
            {topAction ? (
              <>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: colors.text, lineHeight: 1.45 }}>
                  {topAction.title}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.55 }}>{topAction.description}</p>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: colors.textMuted, lineHeight: 1.55 }}>
                No immediate actions for this offer.
              </p>
            )}
          </SidebarPanel>

          {officeDraft ? (
            <SidebarPanel title="Questions to ask aid office">
              {officeDraft.questions.length > 0 ? (
                <ul style={{ margin: "0 0 14px", paddingLeft: 18, color: colors.text, fontSize: 14, lineHeight: 1.55 }}>
                  {officeDraft.questions.slice(0, 4).map((question) => (
                    <li key={question} style={{ marginBottom: 8 }}>
                      {question}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: "0 0 14px", fontSize: 14, color: colors.textMuted, lineHeight: 1.55 }}>
                  No specific questions were generated for this offer.
                </p>
              )}
              <CopyButton label="Copy email" copiedLabel="Copied" text={officeDraft.emailText} />
            </SidebarPanel>
          ) : null}

          <PrimaryButtonLink href={AID_OFFER_COMPARE_HREF} style={{ width: "100%", justifyContent: "center" }}>
            Compare offers
          </PrimaryButtonLink>
        </aside>
      </div>

      {belowGrid}
      {footer}
    </div>
  );
}
