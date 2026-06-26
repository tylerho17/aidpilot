"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  buildClientWeeklyReport,
  formatDueDate,
  getUpcomingDeadlines,
  getScholarshipStatsFromDb,
  resolveScholarshipMatches,
} from "@/lib/data-helpers";

export default function ReportClient() {
  const { loading, profile, tasks, documents, scholarships, deadlines, weeklyReport } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your weekly report...</p>
      </AppShell>
    );
  }

  const report = weeklyReport
    ? {
        aid_status: weeklyReport.aid_status,
        summary: weeklyReport.summary ?? "",
        tasks_due_count: weeklyReport.tasks_due_count,
        missing_documents_count: weeklyReport.missing_documents_count,
        scholarship_count: weeklyReport.scholarship_count,
        potential_scholarship_amount: weeklyReport.potential_scholarship_amount,
        recommendations: weeklyReport.recommendations ?? [],
      }
    : buildClientWeeklyReport(tasks, documents, scholarships, deadlines);

  const scholarshipStats = getScholarshipStatsFromDb(scholarships);
  const upcomingDeadlines = getUpcomingDeadlines(deadlines, 3);
  const topScholarships = resolveScholarshipMatches(scholarships).slice(0, 3);
  const statusTone =
    report.aid_status === "Protected" ? "green" : report.aid_status === "At risk" ? "coral" : "amber";

  return (
    <AppShell>

      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Weekly AidPilot Report
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Your weekly check-in for aid safety, deadlines, documents, and scholarships.
        </p>
      </div>

      {!weeklyReport && (
        <ProductCard style={{ padding: 20, marginBottom: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            Showing a live summary from your current data. Your first saved weekly report appears after onboarding.
          </p>
        </ProductCard>
      )}

      <ProductCard style={{ padding: 28, marginBottom: 22, background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <PillBadge tone={statusTone}>{report.aid_status}</PillBadge>
          {profile?.school && (
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>{profile.school}</span>
          )}
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.65 }}>{report.summary}</p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <StatCard label="Tasks due" value={String(report.tasks_due_count)} color="#0B5CAD" style={{ flex: "1 1 130px" }} />
        <StatCard label="Missing documents" value={String(report.missing_documents_count)} color="#C04E57" style={{ flex: "1 1 130px" }} />
        <StatCard label="Scholarship matches" value={String(report.scholarship_count)} color="#0B5CAD" style={{ flex: "1 1 130px" }} />
        <StatCard
          label="Potential scholarships"
          value={`$${report.potential_scholarship_amount.toLocaleString()}`}
          color="#15885A"
          style={{ flex: "1 1 160px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 22 }}>
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Top recommendations</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {report.recommendations.map((rec) => (
              <div key={rec.title} style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{rec.title}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", lineHeight: 1.5 }}>{rec.body}</div>
              </div>
            ))}
          </div>
        </ProductCard>

        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Upcoming deadlines</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingDeadlines.map((d) => (
              <div key={d.id} style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{d.title}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                  {formatDueDate(d.deadline_date)} · {d.category}
                </div>
              </div>
            ))}
          </div>
          <Link href="/deadlines" style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
            View all deadlines
          </Link>
        </ProductCard>
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Top scholarship matches</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topScholarships.map((s) => (
            <div key={s.id ?? s.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E" }}>{s.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>${(s.amount ?? 0).toLocaleString()}</div>
              </div>
              <PillBadge tone="blue">{s.match_percent ?? 0}% match</PillBadge>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#15885A", margin: "14px 0 0" }}>
          {scholarshipStats.totalPotentialLabel} in potential awards this week
        </p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Link href="/checklist" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          Go to checklist
        </Link>
        <Link href="/scholarships" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          View scholarships
        </Link>
        <Link href="/deadlines" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}>
          View deadlines
        </Link>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.
      </p>

      <FeedbackWidget page="/report" />
    </AppShell>
  );
}
