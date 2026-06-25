import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PillBadge, StatCard } from "@/components/ProductUI";
import {
  getFeaturedScholarship,
  getScholarshipStats,
  getWeeklyScholarships,
  SCHOLARSHIPS,
  type ScholarshipMatch,
} from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Scholarships | AidPilot",
  description: "Weekly scholarship report for Maya Chen.",
};

const BookmarkSVG = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

function ScholarshipCard({ s, featured = false }: { s: ScholarshipMatch; featured?: boolean }) {
  const amountColor = s.strongMatch ? "#15885A" : "#0B5CAD";
  const matchBg = s.strongMatch ? "#EAFBF1" : "#EAF3FF";
  const matchColor = s.strongMatch ? "#15885A" : "#0B5CAD";
  const deadlineColor = s.deadlineUrgent ? "#B7791F" : "#15885A";
  const deadlineBg = s.deadlineUrgent ? "#FFF7E6" : "#EAFBF1";

  if (featured) {
    return (
      <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 24, boxShadow: "0 26px 50px -26px rgba(11,92,173,.26)", padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#EAFBF1", alignItems: "center", justifyContent: "center" }}>
            <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke="#15885A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PillBadge tone="green">{s.match}% match for you</PillBadge>
            <PillBadge tone="blue">Featured</PillBadge>
          </div>
        </div>
        <h3 className="font-display" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", color: "#15212E" }}>
          {s.name}
        </h3>
        <div className="font-display" style={{ fontSize: 38, fontWeight: 900, color: amountColor, marginBottom: 8, letterSpacing: -1 }}>
          {s.amountLabel}
        </div>
        <PillBadge tone="gray">{s.category}</PillBadge>
        <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: "16px 0 18px", lineHeight: 1.6 }}>
          <strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> {s.whyItFits}
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: deadlineColor, background: deadlineBg, padding: "9px 14px", borderRadius: 12, marginBottom: 20 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {s.deadline}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/#waitlist" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "13px 24px", borderRadius: 13, boxShadow: "0 10px 20px rgba(11,92,173,.22)", textDecoration: "none" }}>
            Start application
          </a>
          <button type="button" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "13px 20px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit" }}>
            <BookmarkSVG />
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-lift animate-slide-in" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, boxShadow: "0 16px 34px -24px rgba(11,92,173,.18)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <h4 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px", color: "#15212E" }}>
            {s.name}
          </h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PillBadge tone="gray">{s.category}</PillBadge>
            {s.newThisWeek && <PillBadge tone="blue">New this week</PillBadge>}
            {s.status === "Saved" && <PillBadge tone="amber">Saved</PillBadge>}
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: matchColor, background: matchBg, padding: "5px 10px", borderRadius: 999, flexShrink: 0 }}>
          {s.match}%
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="font-display" style={{ fontSize: 24, fontWeight: 900, color: amountColor }}>
          {s.amountLabel}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: deadlineColor }}>{s.deadline}</span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", lineHeight: 1.55, margin: "0 0 14px" }}>
        <strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> {s.whyItFits}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/#waitlist" style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "10px 16px", borderRadius: 11, textDecoration: "none" }}>
          Start application
        </a>
        <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "10px 14px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit" }}>
          <BookmarkSVG />
          Save
        </button>
      </div>
    </div>
  );
}

export default function ScholarshipsPage() {
  const stats = getScholarshipStats();
  const featured = getFeaturedScholarship();
  const weekly = getWeeklyScholarships().filter((s) => s.id !== featured.id);
  const saved = SCHOLARSHIPS.filter((s) => !s.newThisWeek);

  return (
    <AppShell>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999, letterSpacing: ".3px", marginBottom: 14 }}>
          This week&apos;s report
        </div>
        <h1 className="font-display" style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>
          Weekly Scholarship Report
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          We found money for you this week.{" "}
          <span style={{ color: "#15885A", fontWeight: 700 }}>{stats.totalPotentialLabel}</span> in scholarships matched to your story.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 36 }}>
        <StatCard label="New scholarships" value={String(stats.newCount)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Potential awards" value={stats.totalPotentialLabel} color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="Strong matches" value={String(stats.strongMatches)} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Deadlines this month" value={String(stats.deadlinesThisMonth)} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>
          Top match this week
        </h2>
        <ScholarshipCard s={featured} featured />
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
          New matches this week
        </h2>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: "0 0 20px" }}>
          {weekly.length} more scholarships ranked by fit, deadline, and amount.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {weekly.map((s) => (
            <ScholarshipCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
          Saved and upcoming matches
        </h2>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: "0 0 20px" }}>
          {saved.length} additional scholarships in your pipeline.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {saved.map((s) => (
            <ScholarshipCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is independent and not affiliated with any scholarship provider. Verify each scholarship&apos;s requirements before applying.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>
          Read disclaimer
        </Link>
      </p>
    </AppShell>
  );
}
