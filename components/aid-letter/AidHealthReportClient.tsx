"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge } from "@/components/ProductUI";
import { PageLoading } from "@/components/product/PageSafety";
import { useAidOffers } from "@/hooks/useAidOffers";
import { buildAidHealthReport } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_STATUS_LABELS } from "@/lib/aid-letter/calculateAidOffer";

const sectionStyle = { marginBottom: 32 };
const h2Style = {
  fontSize: 18,
  fontWeight: 800,
  margin: "0 0 12px",
  color: "#15212E",
  fontFamily: "inherit",
} as const;
const bodyStyle = { fontSize: 15, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.65 };
const mutedStyle = { fontSize: 14, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 };

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
        borderBottom: "1px solid #F3F4F6",
        fontSize: 14,
        fontWeight: emphasize ? 700 : 500,
        color: emphasize ? "#15212E" : "#374151",
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

  const offer = offers.find((item) => item.id === offerId) ?? null;

  const report = useMemo(() => (offer ? buildAidHealthReport(offer) : null), [offer]);

  if (!authReady || loading) {
    return <PageLoading message="Loading aid health report..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/aid-letter" style={{ fontSize: 14, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>
            ← Back to aid offers
          </Link>
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 900, margin: "16px 0 8px", color: "#15212E" }}>
            Aid Health Report
          </h1>
          <p style={mutedStyle}>We could not find that aid offer. It may have been deleted.</p>
        </div>
      </AppShell>
    );
  }

  const { calculation: calc } = report;

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/aid-letter" style={{ fontSize: 14, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>
          ← Back to aid offers
        </Link>

        <header style={{ margin: "16px 0 28px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#9AA4B2", margin: "0 0 6px", letterSpacing: "0.02em" }}>
            AID HEALTH REPORT
          </p>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", color: "#15212E", lineHeight: 1.15 }}>
            {offer.school_name}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <PillBadge tone={offer.offer_status === "reviewed" ? "green" : "blue"}>
              {AID_OFFER_STATUS_LABELS[offer.offer_status]}
            </PillBadge>
            {offer.academic_year ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>{offer.academic_year}</span>
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

        <section style={sectionStyle}>
          <h2 style={h2Style}>Recommended next actions</h2>
          {report.recommendedTasks.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {report.recommendedTasks.map((task) => (
                <li
                  key={task.plan_key}
                  style={{ padding: "12px 0", borderBottom: "1px solid #F3F4F6", fontSize: 15, lineHeight: 1.55 }}
                >
                  <div style={{ fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{task.title}</div>
                  <div style={{ color: "#6B7280", marginBottom: 6 }}>{task.description}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>
                    {task.priority} priority · {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={mutedStyle}>No follow-up tasks needed for this offer right now.</p>
          )}
          <p style={{ ...mutedStyle, marginTop: 14 }}>
            These tasks are also added to your{" "}
            <Link href="/checklist" style={{ color: "#0B5CAD", fontWeight: 700, textDecoration: "none" }}>
              checklist
            </Link>{" "}
            when you save or update this offer.
          </p>
        </section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <Link
            href="/aid-letter"
            style={{
              display: "inline-flex",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#0B5CAD",
              padding: "10px 18px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Edit aid offer
          </Link>
          <Link
            href="/checklist"
            style={{
              display: "inline-flex",
              fontSize: 14,
              fontWeight: 700,
              color: "#0B5CAD",
              background: "#EAF3FF",
              padding: "10px 18px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Open checklist
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
