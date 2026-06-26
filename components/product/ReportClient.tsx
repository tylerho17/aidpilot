"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { getTopRecommendations } from "@/lib/intelligence/recommendations";
import {
  buildClientWeeklyReport,
  formatDueDate,
  getMissingDocumentCountFromDocs,
  getUpcomingDeadlines,
  getScholarshipStatsFromDb,
} from "@/lib/data-helpers";
import { DEMO_WEEKLY_REPORT, DEMO_DEADLINES, getScholarshipStats, getWeeklyScholarships } from "@/lib/demo-data";

function formatFafsaStatus(status: string | null | undefined) {
  const value = (status ?? "").toLowerCase();
  if (value === "yes" || value === "completed" || value === "submitted") return "Submitted";
  if (value === "in_progress" || value === "in progress") return "In progress";
  if (value === "not yet" || value === "i am not sure") return "Not started";
  return status || "Unknown";
}

function aidLetterSummaryText(
  schoolName: string | null | undefined,
  grants: number,
  scholarships: number,
  net: number
) {
  if (!schoolName && grants === 0 && scholarships === 0) {
    return "No aid letter entered yet. Add your aid offer on the Aid Letter page.";
  }
  const freeMoney = grants + scholarships;
  return `${schoolName ?? "Your school"}: $${freeMoney.toLocaleString()} in grants and scholarships. Estimated net cost: $${net.toLocaleString()}. Verify with your aid office.`;
}

export default function ReportClient() {
  const {
    loading,
    isDemo,
    profile,
    tasks,
    documents,
    scholarships,
    deadlines,
    weeklyReport,
    aidLetter,
    recommendations,
    generateWeeklyReport,
  } = useUserData();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your weekly report...</p>
      </AppShell>
    );
  }

  const fallbackReport = buildClientWeeklyReport(tasks, documents, scholarships, deadlines);
  const topRecs = isDemo
    ? fallbackReport.recommendations
    : weeklyReport?.recommendations?.length
      ? weeklyReport.recommendations
      : getTopRecommendations(recommendations, 3).map((r) => ({
          title: r.title,
          body: r.description ?? "Suggested next step from AidPilot.",
        }));

  const report = isDemo
    ? DEMO_WEEKLY_REPORT
    : weeklyReport
      ? {
          aid_status: weeklyReport.aid_status,
          summary: weeklyReport.summary ?? "",
          tasks_due_count: weeklyReport.tasks_due_count,
          missing_documents_count: weeklyReport.missing_documents_count,
          scholarship_count: weeklyReport.scholarship_count,
          potential_scholarship_amount: weeklyReport.potential_scholarship_amount,
          recommendations: topRecs,
        }
      : {
          ...fallbackReport,
          recommendations: topRecs.length ? topRecs : fallbackReport.recommendations,
        };

  const scholarshipStats = isDemo ? getScholarshipStats() : getScholarshipStatsFromDb(scholarships);
  const upcomingDeadlines = isDemo ? DEMO_DEADLINES.slice(0, 3) : getUpcomingDeadlines(deadlines, 3);
  const topScholarships = isDemo ? getWeeklyScholarships().slice(0, 3) : scholarships.slice(0, 3);
  const missingDocs = isDemo ? report.missing_documents_count : getMissingDocumentCountFromDocs(documents);
  const fafsaLabel = isDemo ? "Submitted" : formatFafsaStatus(profile?.fafsa_status);
  const aidSummary = isDemo
    ? "UC Irvine: $21,900 in grants and scholarships. Estimated net cost: $4,200."
    : aidLetterSummaryText(
        aidLetter?.school_name ?? profile?.school,
        aidLetter?.grants_amount ?? 0,
        aidLetter?.scholarships_amount ?? 0,
        aidLetter?.estimated_net_cost ?? 0
      );

  const statusTone =
    report.aid_status === "Protected" ? "green" : report.aid_status === "At risk" ? "coral" : "amber";

  async function handleGenerateReport() {
    setGenerating(true);
    setError("");
    try {
      await generateWeeklyReport();
    } catch (err) {
      console.error("Failed to generate weekly report:", err);
      setError(err instanceof Error ? err.message : "Could not generate your weekly report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppShell>
      {isDemo && <DemoNotice />}

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
              Weekly AidPilot Report
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
              Your weekly check-in for FAFSA status, documents, deadlines, scholarships, and aid offers.
            </p>
          </div>
          {!isDemo && (
            <button
              type="button"
              onClick={() => handleGenerateReport()}
              disabled={generating}
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}
            >
              {generating ? "Generating..." : "Generate report"}
            </button>
          )}
        </div>
      </div>

      {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{error}</p>}

      {!isDemo && !weeklyReport && (
        <ProductCard style={{ padding: 20, marginBottom: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            Showing a live summary from your current data. Click &quot;Generate report&quot; to save this week&apos;s report.
          </p>
        </ProductCard>
      )}

      <ProductCard style={{ padding: 28, marginBottom: 22, background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <PillBadge tone={statusTone}>{report.aid_status}</PillBadge>
          {!isDemo && profile?.school && (
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>{profile.school}</span>
          )}
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.65 }}>{report.summary}</p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <StatCard label="FAFSA status" value={fafsaLabel} color="#0B5CAD" style={{ flex: "1 1 130px" }} />
        <StatCard label="Tasks due" value={String(report.tasks_due_count)} color="#0B5CAD" style={{ flex: "1 1 130px" }} />
        <StatCard label="Missing documents" value={String(missingDocs)} color="#C04E57" style={{ flex: "1 1 130px" }} />
        <StatCard label="Scholarship matches" value={String(report.scholarship_count)} color="#0B5CAD" style={{ flex: "1 1 130px" }} />
        <StatCard
          label="Potential scholarships"
          value={`$${report.potential_scholarship_amount.toLocaleString()}`}
          color="#15885A"
          style={{ flex: "1 1 160px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, marginBottom: 22 }}>
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Top 3 next actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {report.recommendations.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No recommendations yet. Generate a report or refresh recommendations from the dashboard.</p>
            ) : (
              report.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.title} style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{rec.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", lineHeight: 1.5 }}>{rec.body}</div>
                </div>
              ))
            )}
          </div>
        </ProductCard>

        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Upcoming deadlines</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No upcoming deadlines tracked yet.</p>
            ) : (
              upcomingDeadlines.map((d) => (
                <div key={d.id} style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                    {formatDueDate(d.deadline_date)} · {d.category}
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/deadlines" style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
            View all deadlines
          </Link>
        </ProductCard>
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>Aid letter summary</h2>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>{aidSummary}</p>
        {!isDemo && !aidLetter && (
          <Link href="/aid-letter" style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
            Enter your aid letter →
          </Link>
        )}
      </ProductCard>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Top scholarship matches</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topScholarships.length === 0 ? (
            <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No scholarship matches yet. Visit Scholarships to generate matches.</p>
          ) : (
            topScholarships.map((s) => (
              <div key={s.id ?? s.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E" }}>{"name" in s ? s.name : ""}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                    {"amountLabel" in s ? s.amountLabel : `$${(s.amount ?? 0).toLocaleString()}`}
                  </div>
                </div>
                {"match" in s ? (
                  <PillBadge tone="blue">{s.match}% match</PillBadge>
                ) : (
                  <PillBadge tone="blue">{s.match_percent}% match</PillBadge>
                )}
              </div>
            ))
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#15885A", margin: "14px 0 0" }}>
          {scholarshipStats.totalPotentialLabel} in potential awards
        </p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link href="/checklist" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          Go to checklist
        </Link>
        <Link href="/scholarships" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          View scholarships
        </Link>
        <Link href="/fafsa" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          FAFSA workflow
        </Link>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.
      </p>

      <FeedbackWidget page="/report" />
    </AppShell>
  );
}
