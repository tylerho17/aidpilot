"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ScholarshipMatchCard } from "@/components/product/ScholarshipMatchCard";
import { ProductCard, StatCard } from "@/components/ProductUI";
import { PageErrorBanner, PageEmptyState, PageLoading, runSafe } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import {
  filterScholarshipMatchesByTab,
  formatScholarshipDeadline,
  getFeaturedScholarshipFromDb,
  getScholarshipStatsFromDb,
  resolveScholarshipMatches,
  type ScholarshipMatchTab,
} from "@/lib/data-helpers";
import { getApplyUrl } from "@/lib/intelligence/scholarship-report";
import { formatScholarshipError } from "@/lib/scholarship-errors";
import type { ScholarshipMatch, ScholarshipSource } from "@/lib/types";

const TABS: { id: ScholarshipMatchTab; label: string }[] = [
  { id: "new", label: "New matches" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "ignored", label: "Ignored" },
];

export default function ScholarshipsClient() {
  const {
    loading,
    authReady,
    loadError,
    scholarships,
    scholarshipSources,
    scholarshipSchemaError,
    saveScholarship,
    applyScholarship,
    ignoreScholarship,
    generateScholarshipMatches,
  } = useUserData();
  const [generating, setGenerating] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [tab, setTab] = useState<ScholarshipMatchTab>("new");

  if (!authReady && loading) {
    return <PageLoading message="Loading your scholarships..." />;
  }

  const { data: view, error: viewError } = runSafe(
    "Scholarships",
    () => {
      const visibleScholarships = resolveScholarshipMatches(scholarships ?? []);
      const stats = getScholarshipStatsFromDb(scholarships ?? []);
      const featuredDb = getFeaturedScholarshipFromDb(scholarships ?? []);
      const tabMatches = filterScholarshipMatchesByTab(visibleScholarships, tab);
      return { visibleScholarships, stats, featuredDb, tabMatches };
    },
    {
      visibleScholarships: [] as ReturnType<typeof resolveScholarshipMatches>,
      stats: getScholarshipStatsFromDb([]),
      featuredDb: null as ScholarshipMatch | null,
      tabMatches: [] as ReturnType<typeof filterScholarshipMatchesByTab>,
    }
  );

  const { visibleScholarships, stats, featuredDb, tabMatches } = view;
  const sources = scholarshipSources ?? [];

  async function handleGenerateMatches() {
    setGenerating(true);
    setMatchError("");
    try {
      await generateScholarshipMatches();
      setTab("new");
    } catch (err) {
      setMatchError(formatScholarshipError(err, "Could not generate scholarship matches. Please try again."));
    } finally {
      setGenerating(false);
    }
  }

  async function runAction(action: (id: string) => Promise<void>, id: string) {
    setActionError("");
    try {
      await action(id);
    } catch (err) {
      setActionError(formatScholarshipError(err, "Could not update this scholarship."));
    }
  }

  if (loading) {
    return <PageLoading message="Loading your scholarships..." />;
  }

  return (
    <AppShell>
      <PageErrorBanner message={loadError ?? viewError} />
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999 }}>
            Scholarship engine
          </div>
          <Link href="/report/scholarships" style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
            Weekly report →
          </Link>
        </div>
        <h1 className="font-display" style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>
          Scholarships
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Matches tailored to your profile. <span style={{ color: "#15885A", fontWeight: 700 }}>{stats.totalPotentialLabel}</span> in potential awards in your new matches.
        </p>
        <p style={{ fontSize: 13, color: "#9AA4B2", margin: "10px 0 0", lineHeight: 1.5 }}>
          AidPilot does not submit applications for you. Verify eligibility and deadlines with each provider.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="New scholarships" value={String(stats.newCount)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Potential awards" value={stats.totalPotentialLabel} color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="Strong matches" value={String(stats.strongMatches)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Deadlines this month" value={String(stats.deadlinesThisMonth)} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      {scholarshipSchemaError && (
        <ProductCard style={{ padding: 20, marginBottom: 20, background: "#FFF5F5", border: "1px solid #FECACA" }}>
          <p style={{ fontSize: 14, color: "#991B1B", margin: 0, lineHeight: 1.6 }}>{scholarshipSchemaError}</p>
        </ProductCard>
      )}

      {matchError && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{matchError}</p>}
      {actionError && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{actionError}</p>}

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Match generator</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: 0 }}>
              {sources.length} active sources available.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateMatches()}
            disabled={generating || sources.length === 0}
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: generating || sources.length === 0 ? "not-allowed" : "pointer", opacity: sources.length === 0 ? 0.6 : 1, fontFamily: "inherit" }}
          >
            {generating ? "Generating..." : "Generate matches"}
          </button>
        </div>
        {sources.length === 0 ? (
          <PageEmptyState
            title="No scholarship sources yet"
            description="Scholarship sources are not available in this environment yet. You can still use the rest of AidPilot."
          />
        ) : visibleScholarships.length === 0 ? (
          <PageEmptyState
            title="No matches yet"
            description="Generate matches to create your first scholarship report."
          />
        ) : null}
      </section>

      {featuredDb && tab === "new" && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Top match</h2>
          <ScholarshipMatchCard
            match={featuredDb}
            applyUrl={getApplyUrl(featuredDb, sources)}
            featured
            onSave={(id) => runAction(saveScholarship, id)}
            onApply={(id) => runAction(applyScholarship, id)}
            onIgnore={(id) => runAction(ignoreScholarship, id)}
          />
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {TABS.map((item) => (
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

        {tabMatches.length === 0 ? (
          <PageEmptyState
            title={tab === "new" ? "No new matches" : `No ${tab} scholarships`}
            description={
              tab === "new"
                ? "Generate matches or check your saved and applied tabs."
                : `You have not marked any scholarships as ${tab} yet.`
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {tabMatches
              .filter((m) => !(tab === "new" && featuredDb && m.id === featuredDb.id))
              .map((m) => (
                <ScholarshipMatchCard
                  key={m.id}
                  match={m}
                  applyUrl={getApplyUrl(m, sources)}
                  onSave={(id) => runAction(saveScholarship, id)}
                  onApply={(id) => runAction(applyScholarship, id)}
                  onIgnore={(id) => runAction(ignoreScholarship, id)}
                />
              ))}
          </div>
        )}
      </section>

      {sources.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Source preview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {sources.slice(0, 4).map((source) => (
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
