"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ScholarshipMatchCard } from "@/components/product/ScholarshipMatchCard";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  formatScholarshipDeadline,
  getFeaturedScholarshipFromDb,
  getScholarshipStatsFromDb,
} from "@/lib/data-helpers";
import { getApplyUrl } from "@/lib/intelligence/scholarship-report";
import {
  getFeaturedScholarship,
  getScholarshipStats,
  getWeeklyScholarships,
  type ScholarshipMatch as DemoScholarship,
} from "@/lib/demo-data";
import type { ScholarshipMatch, ScholarshipSource } from "@/lib/types";

type TabId = "new" | "saved" | "applied" | "ignored";

const TABS: { id: TabId; label: string }[] = [
  { id: "new", label: "New matches" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "ignored", label: "Ignored" },
];

function filterMatches(matches: ScholarshipMatch[], tab: TabId) {
  switch (tab) {
    case "saved":
      return matches.filter((m) => m.is_saved && !m.applied && !m.ignored);
    case "applied":
      return matches.filter((m) => m.applied);
    case "ignored":
      return matches.filter((m) => m.ignored);
    default:
      return matches.filter((m) => !m.ignored && !m.applied && !m.is_saved);
  }
}

export default function ScholarshipsClient() {
  const {
    loading,
    isDemo,
    scholarships,
    scholarshipSources,
    saveScholarship,
    applyScholarship,
    ignoreScholarship,
    generateScholarshipMatches,
  } = useUserData();
  const [generating, setGenerating] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [tab, setTab] = useState<TabId>("new");

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your scholarships...</p>
      </AppShell>
    );
  }

  const stats = isDemo ? getScholarshipStats() : getScholarshipStatsFromDb(scholarships);
  const featuredDemo = getFeaturedScholarship();
  const featuredDb = getFeaturedScholarshipFromDb(scholarships);
  const tabMatches = isDemo ? [] : filterMatches(scholarships, tab);

  async function handleGenerateMatches() {
    setGenerating(true);
    setMatchError("");
    try {
      await generateScholarshipMatches();
      setTab("new");
    } catch (err) {
      console.error("Failed to generate scholarship matches:", err);
      setMatchError(err instanceof Error ? err.message : "Could not generate scholarship matches. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <AppShell>
      {isDemo && <DemoNotice message="You are viewing Maya's sample scholarship report. Create an account to save matches to your own plan." />}

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999 }}>
            Scholarship engine
          </div>
          {!isDemo && (
            <Link href="/report/scholarships" style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
              Weekly report →
            </Link>
          )}
        </div>
        <h1 className="font-display" style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>
          Scholarships
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Matches tailored to your profile. <span style={{ color: "#15885A", fontWeight: 700 }}>{stats.totalPotentialLabel}</span> in potential awards in your new matches.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="New scholarships" value={String(stats.newCount)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Potential awards" value={stats.totalPotentialLabel} color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="Strong matches" value={String(stats.strongMatches)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Deadlines this month" value={String(stats.deadlinesThisMonth)} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      {!isDemo && matchError && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{matchError}</p>}

      {!isDemo && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Match generator</h2>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: 0 }}>
                {scholarshipSources.length} active sources available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerateMatches()}
              disabled={generating || scholarshipSources.length === 0}
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: generating || scholarshipSources.length === 0 ? "not-allowed" : "pointer", opacity: scholarshipSources.length === 0 ? 0.6 : 1, fontFamily: "inherit" }}
            >
              {generating ? "Generating..." : "Generate matches"}
            </button>
          </div>
          {scholarshipSources.length === 0 ? (
            <ProductCard style={{ padding: 24 }}>
              <p style={{ fontSize: 15, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                No scholarship sources yet. Run <code>supabase/008_seed_phase_5_scholarships.sql</code> or add scholarships in{" "}
                <Link href="/admin/scholarships" style={{ color: "#0B5CAD" }}>admin</Link>.
              </p>
            </ProductCard>
          ) : scholarships.length === 0 ? (
            <ProductCard style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                Generate matches to create your first scholarship report.
              </p>
            </ProductCard>
          ) : null}
        </section>
      )}

      {isDemo && featuredDemo && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Top match</h2>
          <DemoScholarshipCard s={featuredDemo} featured />
        </section>
      )}

      {!isDemo && featuredDb && tab === "new" && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Top match</h2>
          <ScholarshipMatchCard
            match={featuredDb}
            applyUrl={getApplyUrl(featuredDb, scholarshipSources)}
            featured
            onSave={saveScholarship}
            onApply={applyScholarship}
            onIgnore={ignoreScholarship}
          />
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {(isDemo ? TABS.slice(0, 1) : TABS).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 999,
                border: tab === item.id ? "none" : "1.5px solid #E2E8F0",
                background: tab === item.id ? "#0B5CAD" : "#fff",
                color: tab === item.id ? "#fff" : "#374151",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isDemo ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {getWeeklyScholarships()
              .filter((s) => s.id !== featuredDemo?.id)
              .map((s) => (
                <DemoScholarshipCard key={s.id} s={s} />
              ))}
          </div>
        ) : tabMatches.length === 0 ? (
          <ProductCard style={{ padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
              {tab === "new"
                ? "No new matches. Generate matches or check your saved and applied tabs."
                : `No ${tab} scholarships yet.`}
            </p>
          </ProductCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {tabMatches
              .filter((m) => !(tab === "new" && featuredDb && m.id === featuredDb.id))
              .map((m) => (
                <ScholarshipMatchCard
                  key={m.id}
                  match={m}
                  applyUrl={getApplyUrl(m, scholarshipSources)}
                  onSave={saveScholarship}
                  onApply={applyScholarship}
                  onIgnore={ignoreScholarship}
                />
              ))}
          </div>
        )}
      </section>

      {!isDemo && scholarshipSources.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Source preview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {scholarshipSources.slice(0, 4).map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </section>
      )}

      <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is independent and not affiliated with any scholarship provider. Verify each scholarship&apos;s requirements before applying.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>

      <FeedbackWidget page="/scholarships" />
    </AppShell>
  );
}

function SourceCard({ source }: { source: ScholarshipSource }) {
  const amountLabel = source.amount ? `$${source.amount.toLocaleString()}` : "Amount varies";
  const deadlineLabel = formatScholarshipDeadline(source.deadline);
  return (
    <div style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 16, padding: 16 }}>
      <h4 className="font-display" style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "#15212E" }}>{source.name}</h4>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#0B5CAD", marginBottom: 6 }}>{amountLabel}</div>
      <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{source.provider ?? "Provider TBD"} · {deadlineLabel}</p>
    </div>
  );
}

function DemoScholarshipCard({ s, featured = false }: { s: DemoScholarship; featured?: boolean }) {
  const amountColor = s.strongMatch ? "#15885A" : "#0B5CAD";
  const deadlineColor = s.deadlineUrgent ? "#B7791F" : "#15885A";

  return (
    <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: featured ? 24 : 18, padding: featured ? 30 : 20, boxShadow: featured ? "0 26px 50px -26px rgba(11,92,173,.26)" : undefined }}>
      <PillBadge tone="green">{s.match}% match for you</PillBadge>
      <h3 className="font-display" style={{ fontSize: featured ? 26 : 17, fontWeight: 900, margin: "16px 0 4px", color: "#15212E" }}>{s.name}</h3>
      <div className="font-display" style={{ fontSize: featured ? 38 : 24, fontWeight: 900, color: amountColor, marginBottom: 10 }}>{s.amountLabel}</div>
      <p style={{ fontSize: featured ? 15.5 : 13, color: "#6B7280", lineHeight: 1.55 }}><strong style={{ color: "#15212E" }}>Why it fits:</strong> {s.whyItFits}</p>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: deadlineColor, marginTop: 12 }}>{s.deadline}</p>
    </div>
  );
}
