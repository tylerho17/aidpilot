"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, StatusPanel } from "@/components/ui";
import { Greeting, money as moneyStyle } from "@/components/app/screens/shared";
import { PageLoading } from "@/components/product/PageSafety";
import { toFriendlyError } from "@/lib/friendly-errors";
import { useAidOffers } from "@/hooks/useAidOffers";
import {
  buildAidOfferComparison,
  formatOfferStatus,
  riskLevelTone,
  type AidOfferComparisonRow,
} from "@/lib/aid-letter/buildAidOfferComparison";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

const headerCell = {
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: 700,
  color: "var(--gray-500)",
  padding: "10px 12px",
  borderBottom: "2px solid var(--border-card)",
  whiteSpace: "nowrap" as const,
};

const bodyCell = {
  padding: "12px 12px",
  fontSize: 14,
  color: "var(--ink-800)",
  borderBottom: "1px solid var(--border-card)",
  whiteSpace: "nowrap" as const,
};

const RISK_TONE = {
  green: "green",
  amber: "amber",
  red: "coral",
} as const;

function RiskBadge({ level }: { level: AidOfferComparisonRow["riskLevel"] }) {
  const tone = RISK_TONE[riskLevelTone(level)];
  return <Badge tone={tone}>{level}</Badge>;
}

function HighlightTag({ label }: { label: string }) {
  return (
    <Badge tone="blue" style={{ marginLeft: 8, fontSize: 11, padding: "3px 8px" }}>
      {label}
    </Badge>
  );
}

function HighlightCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card variant="clay" padding={16}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
    </Card>
  );
}

function CopyQuestion({ question }: { question: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-card)",
        background: "var(--surface-card)",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink-800)", fontWeight: 500 }}>{question}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        iconLeft={copied ? "check" : undefined}
        onClick={() => void copy()}
        style={{ flexShrink: 0 }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
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
      <AppChrome>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Greeting title="Compare aid offers" subtitle="Log in to compare saved aid offers across schools." />
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="clay" iconRight="arrow-right">Sign in</Button>
          </Link>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <Link href="/aid-letter" style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="sm" iconLeft="chevron-left">Aid Offers</Button>
          </Link>
        </div>

        <Greeting title="Compare aid offers" subtitle="See which school leaves you with the lowest real gap." />

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
            style={{ marginBottom: 20 }}
          >
            {toFriendlyError(loadError, "Please try again in a moment.")}
          </StatusPanel>
        ) : null}

        {!loadError && offers.length === 0 ? (
          <Card variant="clay" padding={24} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6 }}>
              Add your first aid offer to compare schools.
            </p>
            <div>
              <Link href="/aid-letter" style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Add aid offer</Button>
              </Link>
            </div>
          </Card>
        ) : null}

        {!loadError && offers.length === 1 ? (
          <Card variant="clay" padding={24} style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6 }}>
              Add another aid offer to compare schools side by side.
            </p>
            <div>
              <Link href="/aid-letter" style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Add another offer</Button>
              </Link>
            </div>
          </Card>
        ) : null}

        {comparison && comparison.rows.length > 0 ? (
          <>
            {comparison.rows.length >= 2 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {comparison.lowestGap ? (
                  <HighlightCard
                    label="Lowest remaining gap"
                    color="var(--green-600)"
                    value={`${comparison.lowestGap.offer.school_name} · ${money(comparison.lowestGap.calculation.remainingGapAfterAllAid)}`}
                  />
                ) : null}
                {comparison.highestGiftAid ? (
                  <HighlightCard
                    label="Highest gift aid"
                    color="var(--green-600)"
                    value={`${comparison.highestGiftAid.offer.school_name} · ${money(comparison.highestGiftAid.calculation.giftAid)}`}
                  />
                ) : null}
                {comparison.highestLoanReliance && comparison.highestLoanReliance.isHighLoanReliance ? (
                  <HighlightCard
                    label="High loan reliance"
                    color="var(--amber-600)"
                    value={`${comparison.highestLoanReliance.offer.school_name} · ${comparison.highestLoanReliance.loanReliancePct}% of COA`}
                  />
                ) : null}
                {comparison.missingYearOffers.length > 0 ? (
                  <HighlightCard
                    label="Missing academic year"
                    color="var(--amber-600)"
                    value={comparison.missingYearOffers.map((row) => row.offer.school_name).join(", ")}
                  />
                ) : null}
                {comparison.draftOffers.length > 0 ? (
                  <HighlightCard
                    label="Draft status"
                    color="var(--gray-500)"
                    value={comparison.draftOffers.map((row) => row.offer.school_name).join(", ")}
                  />
                ) : null}
              </div>
            ) : null}

            <Card variant="clay" padding={0} style={{ marginBottom: 24, overflow: "hidden" }}>
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse", background: "transparent" }}>
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
                        <th key={header} style={headerCell}>
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
                            background: selected ? "var(--blue-50)" : "transparent",
                          }}
                        >
                          <td style={{ ...bodyCell, fontWeight: 700, minWidth: 160, color: "var(--ink-900)" }}>
                            {row.offer.school_name}
                            {row.isLowestGap && comparison.rows.length > 1 ? <HighlightTag label="Lowest gap" /> : null}
                            {row.isHighestGiftAid && comparison.rows.length > 1 ? <HighlightTag label="Most gift aid" /> : null}
                            {row.isHighestLoanReliance && comparison.rows.length > 1 ? <HighlightTag label="Most loans" /> : null}
                            {row.isHighLoanReliance ? <HighlightTag label="High loan reliance" /> : null}
                            {row.missingAcademicYear ? <HighlightTag label="Missing year" /> : null}
                            {row.isDraft ? <HighlightTag label="Draft" /> : null}
                          </td>
                          <td style={{ ...bodyCell, color: row.missingAcademicYear ? "var(--amber-600)" : "var(--gray-500)" }}>
                            {row.offer.academic_year?.trim() || "Not set"}
                          </td>
                          <td style={{ ...bodyCell, ...moneyStyle }}>{money(row.offer.cost_of_attendance)}</td>
                          <td style={{ ...bodyCell, ...moneyStyle, color: "var(--green-600)" }}>{money(row.calculation.giftAid)}</td>
                          <td style={{ ...bodyCell, ...moneyStyle, color: "var(--amber-600)" }}>
                            {money(row.offer.federal_student_loans)}
                          </td>
                          <td style={{ ...bodyCell, ...moneyStyle }}>{money(row.calculation.workStudy)}</td>
                          <td style={{ ...bodyCell, ...moneyStyle, fontWeight: 700, color: "var(--ink-900)" }}>
                            {money(row.calculation.netCostAfterGiftAid)}
                          </td>
                          <td style={{ ...bodyCell, ...moneyStyle, fontWeight: 700, color: "var(--coral-600)" }}>
                            {money(row.calculation.remainingGapAfterAllAid)}
                          </td>
                          <td style={bodyCell}>{formatOfferStatus(row.offer)}</td>
                          <td style={bodyCell}>
                            <RiskBadge level={row.riskLevel} />
                          </td>
                          <td style={bodyCell} onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={getAidOfferReportHref(row.offer.id)}
                              style={{ fontSize: 13, fontWeight: 700, color: "var(--blue-700)", textDecoration: "none" }}
                            >
                              Health Report
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {comparison.rows.length >= 2 ? (
              <>
                <StatusPanel tone="blue" icon="shield-check" eyebrow="Recommendation" style={{ marginBottom: 24 }}>
                  {comparison.recommendation}
                </StatusPanel>

                <section style={{ marginBottom: 24 }}>
                  <h2
                    className="font-display"
                    style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 6px", color: "var(--ink-900)" }}
                  >
                    Questions to ask the aid office
                  </h2>
                  <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55 }}>
                    {comparison.focusOffer
                      ? `Use these when speaking with ${comparison.focusOffer.school_name}'s aid office. Click a school row above to change focus.`
                      : "Use these when speaking with your school's aid office."}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {comparison.officeQuestions.map((question) => (
                      <CopyQuestion key={question} question={question} />
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Link href="/aid-letter" style={{ textDecoration: "none" }}>
                <Button variant="secondary">Manage offers</Button>
              </Link>
              {comparison.focusOffer ? (
                <Link href={getAidOfferReportHref(comparison.focusOffer.id)} style={{ textDecoration: "none" }}>
                  <Button variant="clay" iconRight="arrow-right">View Aid Health Report</Button>
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </AppChrome>
  );
}
