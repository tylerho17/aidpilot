"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageLoading } from "@/components/product/PageSafety";
import { useAidOffers } from "@/hooks/useAidOffers";
import {
  buildAidOfferComparison,
  formatOfferStatus,
  riskLevelTone,
  type AidOfferComparisonRow,
} from "@/lib/aid-letter/buildAidOfferComparison";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { PageHeader, ProductFlowNav } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyQuestionRow } from "@/components/ui/CopyButton";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { SecondaryButton, SecondaryButtonLink } from "@/components/ui/SecondaryButton";
import { TableWrapper, tableHeaderCell, tableBodyCell } from "@/components/ui/TableWrapper";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttons, colors, layout, radius, text, type BadgeTone } from "@/lib/design-tokens";
import { H3, Body } from "@/components/ui/Typography";

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function RiskBadge({ level }: { level: AidOfferComparisonRow["riskLevel"] }) {
  const toneMap: Record<string, BadgeTone> = { green: "green", amber: "amber", red: "coral" };
  return <StatusBadge tone={toneMap[riskLevelTone(level)] ?? "gray"}>{level}</StatusBadge>;
}

function HighlightTag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        ...text.label,
        color: colors.primary,
        background: colors.softBlue,
        padding: "2px 8px",
        borderRadius: radius.pill,
      }}
    >
      {label}
    </span>
  );
}

export default function AidOfferCompareClient() {
  const { authReady, userId, loading, offers, loadError, reload } = useAidOffers();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const comparison = useMemo(
    () => (offers.length > 0 ? buildAidOfferComparison(offers, selectedId) : null),
    [offers, selectedId]
  );

  if (!authReady || loading) {
    return <PageLoading message="Loading aid offer comparison..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <PageHeader
          title="Compare aid offers"
          subtitle="Log in to compare saved aid offers across schools."
          primaryAction={{ href: "/login", label: "Sign in" }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
        <ProductFlowNav
          links={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/aid-letter", label: "Aid Offers" },
          ]}
        />

        <PageHeader title="Compare aid offers" subtitle="See which school leaves you with the lowest real gap." />

        {loadError ? (
          <SectionCard style={{ marginBottom: layout.sectionGap, background: colors.softAmber }}>
            <Body style={{ color: colors.amber, marginBottom: layout.stackGapSm }}>{loadError}</Body>
            <SecondaryButton onClick={() => void reload()}>Try again</SecondaryButton>
          </SectionCard>
        ) : null}

        {!loadError && offers.length === 0 ? (
          <EmptyState
            title="No offers to compare"
            description="Add your first aid offer to compare schools."
            actionHref="/aid-letter"
            actionLabel="Add aid offer"
          />
        ) : null}

        {!loadError && offers.length === 1 ? (
          <SectionCard style={{ marginBottom: layout.sectionGap }}>
            <Body style={{ marginBottom: layout.stackGap }}>
              Add another aid offer to compare schools side by side.
            </Body>
            <PrimaryButtonLink href="/aid-letter">Add another offer</PrimaryButtonLink>
          </SectionCard>
        ) : null}

        {comparison && comparison.rows.length > 0 ? (
          <>
            {comparison.rows.length >= 2 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: layout.stackGapSm,
                  marginBottom: layout.sectionGap,
                }}
              >
                {comparison.lowestGap ? (
                  <MetricCard
                    label="Lowest remaining gap"
                    value={`${comparison.lowestGap.offer.school_name} · ${money(comparison.lowestGap.calculation.remainingGapAfterAllAid)}`}
                    tone="success"
                  />
                ) : null}
                {comparison.highestGiftAid ? (
                  <MetricCard
                    label="Highest gift aid"
                    value={`${comparison.highestGiftAid.offer.school_name} · ${money(comparison.highestGiftAid.calculation.giftAid)}`}
                    tone="success"
                  />
                ) : null}
                {comparison.highestLoanReliance && comparison.highestLoanReliance.isHighLoanReliance ? (
                  <MetricCard
                    label="High loan reliance"
                    value={`${comparison.highestLoanReliance.offer.school_name} · ${comparison.highestLoanReliance.loanReliancePct}% of COA`}
                    tone="warning"
                  />
                ) : null}
                {comparison.missingYearOffers.length > 0 ? (
                  <MetricCard
                    label="Missing academic year"
                    value={comparison.missingYearOffers.map((row) => row.offer.school_name).join(", ")}
                    tone="warning"
                  />
                ) : null}
                {comparison.draftOffers.length > 0 ? (
                  <MetricCard
                    label="Draft status"
                    value={comparison.draftOffers.map((row) => row.offer.school_name).join(", ")}
                  />
                ) : null}
              </div>
            ) : null}

            <TableWrapper>
              <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "School",
                      "Academic year",
                      "Cost of attendance",
                      "Gift aid",
                      "Federal loans",
                      "Work-study",
                      "Net after gift aid",
                      "Remaining gap",
                      "Status",
                      "Risk",
                      "Report",
                    ].map((header) => (
                      <th key={header} style={tableHeaderCell}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => {
                    const selected = selectedId === row.offer.id;
                    return (
                      <tr
                        key={row.offer.id}
                        onClick={() => setSelectedId(row.offer.id)}
                        style={{
                          cursor: "pointer",
                          background: selected ? colors.softBlue : colors.card,
                        }}
                      >
                        <td style={{ ...tableBodyCell, fontWeight: 600, minWidth: 160 }}>
                          {row.offer.school_name}
                          {row.isLowestGap && comparison.rows.length > 1 ? <HighlightTag label="Lowest gap" /> : null}
                          {row.isHighestGiftAid && comparison.rows.length > 1 ? <HighlightTag label="Most gift aid" /> : null}
                          {row.isHighestLoanReliance && comparison.rows.length > 1 ? <HighlightTag label="Most loans" /> : null}
                          {row.isHighLoanReliance ? <HighlightTag label="High loan reliance" /> : null}
                          {row.missingAcademicYear ? <HighlightTag label="Missing year" /> : null}
                          {row.isDraft ? <HighlightTag label="Draft" /> : null}
                        </td>
                        <td style={{ ...tableBodyCell, color: row.missingAcademicYear ? colors.amber : colors.textMuted }}>
                          {row.offer.academic_year?.trim() || "Not set"}
                        </td>
                        <td style={tableBodyCell}>{money(row.offer.cost_of_attendance)}</td>
                        <td style={{ ...tableBodyCell, color: colors.green, fontWeight: 600 }}>{money(row.calculation.giftAid)}</td>
                        <td style={{ ...tableBodyCell, color: colors.amber, fontWeight: 600 }}>
                          {money(row.offer.federal_student_loans)}
                        </td>
                        <td style={tableBodyCell}>{money(row.calculation.workStudy)}</td>
                        <td style={{ ...tableBodyCell, fontWeight: 600 }}>{money(row.calculation.netCostAfterGiftAid)}</td>
                        <td style={{ ...tableBodyCell, color: colors.coral, fontWeight: 700 }}>
                          {money(row.calculation.remainingGapAfterAllAid)}
                        </td>
                        <td style={tableBodyCell}>{formatOfferStatus(row.offer)}</td>
                        <td style={tableBodyCell}>
                          <RiskBadge level={row.riskLevel} />
                        </td>
                        <td style={tableBodyCell} onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={getAidOfferReportHref(row.offer.id)}
                            style={{ fontSize: 13, fontWeight: 600, color: colors.primary, textDecoration: "none" }}
                          >
                            Health Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TableWrapper>

            {comparison.rows.length >= 2 ? (
              <>
                <SectionCard style={{ marginBottom: layout.sectionGap, background: colors.softBlue }}>
                  <H3 style={{ marginBottom: layout.stackGapSm }}>Recommendation</H3>
                  <Body>{comparison.recommendation}</Body>
                </SectionCard>

                <section style={{ marginBottom: layout.sectionGap }}>
                  <H3 style={{ marginBottom: layout.stackGapXs }}>Questions to ask the aid office</H3>
                  <Body style={{ marginBottom: layout.stackGapSm }}>
                    {comparison.focusOffer
                      ? `Use these when speaking with ${comparison.focusOffer.school_name}'s aid office. Click a school row above to change focus.`
                      : "Use these when speaking with your school's aid office."}
                  </Body>
                  <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
                    {comparison.officeQuestions.map((question) => (
                      <CopyQuestionRow key={question} question={question} />
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: buttons.gap }}>
              <SecondaryButtonLink href="/dashboard">Dashboard</SecondaryButtonLink>
              <SecondaryButtonLink href="/aid-letter">Manage offers</SecondaryButtonLink>
              {comparison.focusOffer ? (
                <PrimaryButtonLink href={getAidOfferReportHref(comparison.focusOffer.id)}>View Aid Health Report</PrimaryButtonLink>
              ) : null}
            </div>
          </>
        ) : null}
    </AppShell>
  );
}
