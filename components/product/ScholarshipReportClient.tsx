"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ScholarshipMatchCard } from "@/components/product/ScholarshipMatchCard";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { getScholarshipStatsFromDb } from "@/lib/data-helpers";
import {
  buildScholarshipEmailReport,
  getApplyUrl,
  selectWeeklyScholarshipMatches,
} from "@/lib/intelligence/scholarship-report";
import { getScholarshipStats, getWeeklyScholarships } from "@/lib/demo-data";

export default function ScholarshipReportClient() {
  const {
    loading,
    isDemo,
    profile,
    scholarships,
    scholarshipSources,
    saveScholarship,
    applyScholarship,
    ignoreScholarship,
    generateScholarshipMatches,
  } = useUserData();
  const [generating, setGenerating] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your scholarship report...</p>
      </AppShell>
    );
  }

  const weeklyMatches = isDemo
    ? []
    : selectWeeklyScholarshipMatches(scholarships, 7);
  const stats = isDemo ? getScholarshipStats() : getScholarshipStatsFromDb(scholarships);
  const emailReport = isDemo
    ? null
    : buildScholarshipEmailReport(profile, scholarships, scholarshipSources);

  async function handleGenerateMatches() {
    setGenerating(true);
    setMatchError("");
    try {
      await generateScholarshipMatches();
    } catch (err) {
      console.error("Failed to generate scholarship matches:", err);
      setMatchError(err instanceof Error ? err.message : "Could not generate scholarship matches.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyReport() {
    if (!emailReport) return;
    const text = `Subject: ${emailReport.subject}\n\n${emailReport.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  return (
    <AppShell>
      {isDemo && <DemoNotice message="Create an account to generate your personalized weekly scholarship report." />}

      <div style={{ marginBottom: 28 }}>
        <Link href="/report" style={{ fontSize: 13, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>← Weekly aid report</Link>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "12px 0 10px", color: "#15212E" }}>
          Here are 7 scholarships worth applying to this week.
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Top matches based on your profile, deadlines, and award amounts. Verify each scholarship before applying.
        </p>
      </div>

      {!isDemo && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <StatCard label="New matches" value={String(stats.newCount)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
          <StatCard label="Potential awards" value={stats.totalPotentialLabel} color="#15885A" style={{ flex: "1 1 140px" }} />
          <StatCard label="Strong matches" value={String(stats.strongMatches)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        </div>
      )}

      {!isDemo && scholarshipSources.length === 0 && (
        <ProductCard style={{ padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 15, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Scholarship sources are not set up yet. An admin can add scholarships at <Link href="/admin/scholarships">/admin/scholarships</Link> or run the Phase 5 seed migration.
          </p>
        </ProductCard>
      )}

      {!isDemo && scholarships.length === 0 && scholarshipSources.length > 0 && (
        <ProductCard style={{ padding: 24, marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
            Generate matches to create your first scholarship report.
          </p>
          <button
            type="button"
            onClick={() => handleGenerateMatches()}
            disabled={generating}
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {generating ? "Generating..." : "Generate matches"}
          </button>
        </ProductCard>
      )}

      {matchError && <p style={{ color: "#C04E57", marginBottom: 16 }}>{matchError}</p>}

      {isDemo && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
          {getWeeklyScholarships().slice(0, 7).map((s) => (
            <ProductCard key={s.id} style={{ padding: 20 }}>
              <PillBadge tone="blue">{s.match}% match</PillBadge>
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "12px 0 6px" }}>{s.name}</h3>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#0B5CAD" }}>{s.amountLabel}</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>{s.whyItFits}</p>
            </ProductCard>
          ))}
        </div>
      )}

      {!isDemo && weeklyMatches.length > 0 && (
        <>
          {weeklyMatches.length < 7 && (
            <ProductCard style={{ padding: 16, marginBottom: 20, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
              <p style={{ fontSize: 14, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
                Showing {weeklyMatches.length} scholarship{weeklyMatches.length === 1 ? "" : "s"} this week. Add more active scholarships in admin to fill all 7 slots.
              </p>
            </ProductCard>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 36 }}>
            {weeklyMatches.map((match, index) => (
              <ScholarshipMatchCard
                key={match.id}
                match={match}
                applyUrl={getApplyUrl(match, scholarshipSources)}
                featured={index === 0}
                onSave={saveScholarship}
                onApply={applyScholarship}
                onIgnore={ignoreScholarship}
              />
            ))}
          </div>

          <ProductCard style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>Copy email report</h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
              Plain-text draft you can paste into your email client. Automated sending is not enabled yet.
            </p>
            <button
              type="button"
              onClick={() => handleCopyReport()}
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: copied ? "#15885A" : "#0B5CAD", border: "none", padding: "12px 20px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}
            >
              {copied ? "Copied!" : "Copy report"}
            </button>
            {emailReport && (
              <pre style={{ fontSize: 12, color: "#374151", background: "#F8FAFC", padding: 16, borderRadius: 12, overflow: "auto", whiteSpace: "pre-wrap", lineHeight: 1.5, margin: 0 }}>
                {`Subject: ${emailReport.subject}\n\n${emailReport.body}`}
              </pre>
            )}
          </ProductCard>
        </>
      )}

      {!isDemo && scholarships.length > 0 && weeklyMatches.length === 0 && (
        <ProductCard style={{ padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            No active matches for this week. You may have ignored or applied to your top matches, or deadlines may have passed. Generate fresh matches or review saved scholarships on the <Link href="/scholarships">scholarships page</Link>.
          </p>
        </ProductCard>
      )}

      <FeedbackWidget page="/report/scholarships" />
    </AppShell>
  );
}
