"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { PillBadge, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  formatScholarshipDeadline,
  getFeaturedScholarshipFromDb,
  getScholarshipStatsFromDb,
  isDeadlineUrgent,
} from "@/lib/data-helpers";
import {
  SCHOLARSHIPS,
  getFeaturedScholarship,
  getScholarshipStats,
  getWeeklyScholarships,
  type ScholarshipMatch as DemoScholarship,
} from "@/lib/demo-data";
import type { ScholarshipMatch } from "@/lib/types";

const BookmarkSVG = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export default function ScholarshipsClient() {
  const { loading, isDemo, scholarships, saveScholarship, startScholarship } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your scholarship report...</p>
      </AppShell>
    );
  }

  const stats = isDemo ? getScholarshipStats() : getScholarshipStatsFromDb(scholarships);
  const featuredDemo = getFeaturedScholarship();
  const featuredDb = getFeaturedScholarshipFromDb(scholarships);
  const weeklyDemo = getWeeklyScholarships().filter((s) => s.id !== featuredDemo.id);
  const weeklyDb = scholarships.filter((s) => s.status === "new" && s.id !== featuredDb?.id);
  const savedDemo = SCHOLARSHIPS.filter((s) => !s.newThisWeek);
  const savedDb = scholarships.filter((s) => s.status !== "new");

  return (
    <AppShell>
      {isDemo && <DemoNotice message="You are viewing Maya's sample scholarship report. Create an account to save matches to your own plan." />}

      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999, marginBottom: 14 }}>
          This week&apos;s report
        </div>
        <h1 className="font-display" style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>
          Weekly Scholarship Report
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          We found money for you this week. <span style={{ color: "#15885A", fontWeight: 700 }}>{stats.totalPotentialLabel}</span> in scholarships matched to your story.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 36 }}>
        <StatCard label="New scholarships" value={String(stats.newCount)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Potential awards" value={stats.totalPotentialLabel} color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="Strong matches" value={String(stats.strongMatches)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Deadlines this month" value={String(stats.deadlinesThisMonth)} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      {isDemo && featuredDemo && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Top match this week</h2>
          <DemoScholarshipCard s={featuredDemo} featured />
        </section>
      )}

      {!isDemo && featuredDb && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Top match this week</h2>
          <DbScholarshipCard s={featuredDb} featured onSave={saveScholarship} onStart={startScholarship} />
        </section>
      )}

      <section style={{ marginBottom: 40 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 20px", color: "#15212E" }}>New matches this week</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {isDemo
            ? weeklyDemo.map((s) => <DemoScholarshipCard key={s.id} s={s} />)
            : weeklyDb.map((s) => <DbScholarshipCard key={s.id} s={s} onSave={saveScholarship} onStart={startScholarship} />)}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 20px", color: "#15212E" }}>Saved and upcoming matches</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {isDemo
            ? savedDemo.map((s) => <DemoScholarshipCard key={s.id} s={s} />)
            : savedDb.map((s) => <DbScholarshipCard key={s.id} s={s} onSave={saveScholarship} onStart={startScholarship} />)}
        </div>
      </section>

      <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is independent and not affiliated with any scholarship provider. Verify each scholarship&apos;s requirements before applying.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppShell>
  );
}

function DemoScholarshipCard({ s, featured = false }: { s: DemoScholarship; featured?: boolean }) {
  const amountColor = s.strongMatch ? "#15885A" : "#0B5CAD";
  const deadlineColor = s.deadlineUrgent ? "#B7791F" : "#15885A";

  if (featured) {
    return (
      <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 24, padding: 30, boxShadow: "0 26px 50px -26px rgba(11,92,173,.26)" }}>
        <PillBadge tone="green">{s.match}% match for you</PillBadge>
        <h3 className="font-display" style={{ fontSize: 26, fontWeight: 900, margin: "16px 0 4px", color: "#15212E" }}>{s.name}</h3>
        <div className="font-display" style={{ fontSize: 38, fontWeight: 900, color: amountColor, marginBottom: 14 }}>{s.amountLabel}</div>
        <p style={{ fontSize: 15.5, color: "#6B7280", lineHeight: 1.6 }}><strong style={{ color: "#15212E" }}>Why it fits:</strong> {s.whyItFits}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: deadlineColor, margin: "16px 0 20px" }}>{s.deadline}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/signup" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "13px 24px", borderRadius: 13, textDecoration: "none" }}>Start application</Link>
          <Link href="/signup" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "13px 20px", borderRadius: 13, textDecoration: "none" }}><BookmarkSVG />Save</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h4 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#15212E" }}>{s.name}</h4>
        <PillBadge tone="blue">{s.match}%</PillBadge>
      </div>
      <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: amountColor }}>{s.amountLabel}</div>
      <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, margin: "10px 0" }}><strong style={{ color: "#15212E" }}>Why it fits:</strong> {s.whyItFits}</p>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: deadlineColor }}>{s.deadline}</p>
    </div>
  );
}

function DbScholarshipCard({
  s,
  featured = false,
  onSave,
  onStart,
}: {
  s: ScholarshipMatch;
  featured?: boolean;
  onSave: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
}) {
  const match = s.match_percent ?? 0;
  const amountLabel = s.amount ? `$${s.amount.toLocaleString()}` : "Amount TBD";
  const strong = match >= 88;
  const amountColor = strong ? "#15885A" : "#0B5CAD";
  const deadlineLabel = formatScholarshipDeadline(s.deadline);
  const urgent = isDeadlineUrgent(s.deadline);
  const deadlineColor = urgent ? "#B7791F" : "#15885A";

  const cardBody = (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <PillBadge tone={strong ? "green" : "blue"}>{match}% match</PillBadge>
        {s.status === "new" && <PillBadge tone="blue">New this week</PillBadge>}
        {s.is_saved && <PillBadge tone="amber">Saved</PillBadge>}
        {s.is_started && <PillBadge tone="green">Started</PillBadge>}
      </div>
      <h3 className="font-display" style={{ fontSize: featured ? 26 : 17, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>{s.name}</h3>
      <div className="font-display" style={{ fontSize: featured ? 38 : 24, fontWeight: 900, color: amountColor, marginBottom: 10 }}>{amountLabel}</div>
      <p style={{ fontSize: featured ? 15.5 : 13, color: "#6B7280", lineHeight: 1.6 }}><strong style={{ color: "#15212E" }}>Why it fits:</strong> {s.why_it_fits}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: deadlineColor, margin: "14px 0 16px" }}>{deadlineLabel}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onStart(s.id)} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "10px 16px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          Start application
        </button>
        <button type="button" onClick={() => onSave(s.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "10px 14px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit" }}>
          <BookmarkSVG />Save
        </button>
      </div>
    </>
  );

  return (
    <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: featured ? 24 : 18, padding: featured ? 30 : 20, boxShadow: featured ? "0 26px 50px -26px rgba(11,92,173,.26)" : undefined }}>
      {cardBody}
    </div>
  );
}
