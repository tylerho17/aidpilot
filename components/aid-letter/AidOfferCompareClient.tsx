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

const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';
const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

const linkBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 16px",
  borderRadius: 6,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: pageFont,
} as const;

const secondaryBtn = {
  ...linkBtn,
  color: "#0B5CAD",
  background: "#fff",
  border: `1px solid ${border}`,
} as const;

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

const headerCell = {
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: 700,
  color: muted,
  padding: "10px 12px",
  borderBottom: `2px solid ${border}`,
  whiteSpace: "nowrap" as const,
  fontFamily: pageFont,
};

const bodyCell = {
  padding: "11px 12px",
  fontSize: 14,
  color: navy,
  borderBottom: `1px solid ${border}`,
  whiteSpace: "nowrap" as const,
  fontFamily: pageFont,
};

function RiskBadge({ level }: { level: AidOfferComparisonRow["riskLevel"] }) {
  const tone = riskLevelTone(level);
  const colors = {
    green: { bg: "#ECFDF5", fg: "#15885A", border: "#BBF7D0" },
    amber: { bg: "#FFFBEB", fg: "#B7791F", border: "#FDE68A" },
    red: { bg: "#FEF2F2", fg: "#C04E57", border: "#FECACA" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 4,
        background: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {level}
    </span>
  );
}

function HighlightTag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        fontSize: 11,
        fontWeight: 700,
        color: "#0B5CAD",
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {label}
    </span>
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
        border: `1px solid ${border}`,
        borderRadius: 6,
        background: "#fff",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: navy, fontWeight: 500 }}>{question}</p>
      <button
        type="button"
        onClick={() => void copy()}
        style={{
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "#0B5CAD",
          background: "#F7FAFD",
          border: `1px solid ${border}`,
          borderRadius: 4,
          padding: "6px 10px",
          cursor: "pointer",
          fontFamily: pageFont,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
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
      <AppShell>
        <div style={{ maxWidth: 960, margin: "0 auto", fontFamily: pageFont }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: navy, margin: "0 0 8px" }}>Compare aid offers</h1>
          <p style={{ fontSize: 15, color: muted, margin: "0 0 18px", lineHeight: 1.6 }}>
            Log in to compare saved aid offers across schools.
          </p>
          <Link href="/login" style={linkBtn}>
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: pageFont, color: navy }}>
        <Link href="/aid-letter" style={{ fontSize: 14, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>
          ← Back to aid offers
        </Link>

        <header style={{ margin: "16px 0 24px" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: navy }}>Compare aid offers</h1>
          <p style={{ fontSize: 15, color: muted, margin: 0, lineHeight: 1.6, maxWidth: 640 }}>
            See which school leaves you with the lowest real out-of-pocket gap after gift aid, loans, and work-study.
          </p>
        </header>

        {loadError ? (
          <div style={{ padding: 16, marginBottom: 20, border: "1px solid #FDE68A", borderRadius: 6, background: "#FFFBEB" }}>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#78350F", lineHeight: 1.6 }}>{loadError}</p>
            <button type="button" style={secondaryBtn} onClick={() => void reload()}>
              Try again
            </button>
          </div>
        ) : null}

        {!loadError && offers.length === 0 ? (
          <div style={{ padding: 20, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
            <p style={{ margin: "0 0 16px", fontSize: 15, color: muted, lineHeight: 1.6 }}>
              Add your first aid offer to compare schools.
            </p>
            <Link href="/aid-letter" style={linkBtn}>
              Add aid offer
            </Link>
          </div>
        ) : null}

        {!loadError && offers.length === 1 ? (
          <div style={{ padding: 20, marginBottom: 20, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
            <p style={{ margin: "0 0 16px", fontSize: 15, color: muted, lineHeight: 1.6 }}>
              Add another aid offer to compare schools side by side.
            </p>
            <Link href="/aid-letter" style={linkBtn}>
              Add another offer
            </Link>
          </div>
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
                  <div style={{ padding: 14, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Lowest remaining gap</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#15885A" }}>
                      {comparison.lowestGap.offer.school_name} · {money(comparison.lowestGap.calculation.remainingGapAfterAllAid)}
                    </div>
                  </div>
                ) : null}
                {comparison.highestGiftAid ? (
                  <div style={{ padding: 14, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Highest gift aid</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#15885A" }}>
                      {comparison.highestGiftAid.offer.school_name} · {money(comparison.highestGiftAid.calculation.giftAid)}
                    </div>
                  </div>
                ) : null}
                {comparison.highestLoanReliance && comparison.highestLoanReliance.isHighLoanReliance ? (
                  <div style={{ padding: 14, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>High loan reliance</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#B7791F" }}>
                      {comparison.highestLoanReliance.offer.school_name} · {comparison.highestLoanReliance.loanReliancePct}% of COA
                    </div>
                  </div>
                ) : null}
                {comparison.missingYearOffers.length > 0 ? (
                  <div style={{ padding: 14, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Missing academic year</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#B7791F" }}>
                      {comparison.missingYearOffers.map((row) => row.offer.school_name).join(", ")}
                    </div>
                  </div>
                ) : null}
                {comparison.draftOffers.length > 0 ? (
                  <div style={{ padding: 14, border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Draft status</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: muted }}>
                      {comparison.draftOffers.map((row) => row.offer.school_name).join(", ")}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="overflow-x-auto" style={{ marginBottom: 24, WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse", background: "#fff" }}>
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
                          background: selected ? "#F7FAFD" : "#fff",
                        }}
                      >
                        <td style={{ ...bodyCell, fontWeight: 700, minWidth: 160 }}>
                          {row.offer.school_name}
                          {row.isLowestGap && comparison.rows.length > 1 ? <HighlightTag label="Lowest gap" /> : null}
                          {row.isHighestGiftAid && comparison.rows.length > 1 ? <HighlightTag label="Most gift aid" /> : null}
                          {row.isHighestLoanReliance && comparison.rows.length > 1 ? <HighlightTag label="Most loans" /> : null}
                          {row.isHighLoanReliance ? <HighlightTag label="High loan reliance" /> : null}
                          {row.missingAcademicYear ? <HighlightTag label="Missing year" /> : null}
                          {row.isDraft ? <HighlightTag label="Draft" /> : null}
                        </td>
                        <td style={{ ...bodyCell, color: row.missingAcademicYear ? "#B7791F" : muted }}>
                          {row.offer.academic_year?.trim() || "Not set"}
                        </td>
                        <td style={bodyCell}>{money(row.offer.cost_of_attendance)}</td>
                        <td style={{ ...bodyCell, color: "#15885A", fontWeight: 600 }}>{money(row.calculation.giftAid)}</td>
                        <td style={{ ...bodyCell, color: "#B7791F", fontWeight: 600 }}>
                          {money(row.offer.federal_student_loans)}
                        </td>
                        <td style={bodyCell}>{money(row.calculation.workStudy)}</td>
                        <td style={{ ...bodyCell, fontWeight: 700 }}>{money(row.calculation.netCostAfterGiftAid)}</td>
                        <td style={{ ...bodyCell, color: "#C04E57", fontWeight: 700 }}>
                          {money(row.calculation.remainingGapAfterAllAid)}
                        </td>
                        <td style={bodyCell}>{formatOfferStatus(row.offer)}</td>
                        <td style={bodyCell}>
                          <RiskBadge level={row.riskLevel} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {comparison.rows.length >= 2 ? (
              <>
                <section style={{ marginBottom: 24, padding: 18, border: `1px solid ${border}`, borderRadius: 6, background: "#F7FAFD" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: navy }}>Recommendation</h2>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: muted, fontWeight: 500 }}>
                    {comparison.recommendation}
                  </p>
                </section>

                <section style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: navy }}>Questions to ask the aid office</h2>
                  <p style={{ margin: "0 0 14px", fontSize: 14, color: muted, lineHeight: 1.55 }}>
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
              <Link href="/aid-letter" style={secondaryBtn}>
                Manage offers
              </Link>
              {comparison.focusOffer ? (
                <Link href={getAidOfferReportHref(comparison.focusOffer.id)} style={secondaryBtn}>
                  View Aid Health Report
                </Link>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
