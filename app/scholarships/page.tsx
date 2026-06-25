import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Scholarships -- AidPilot",
  description: "Weekly scholarship report for Maya Chen.",
};

const BookmarkSVG = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const StarSVG = ({ color = "#15885A" }: { color?: string }) => (
  <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z"/>
  </svg>
);

const SCHOLARSHIPS = [
  {
    id: "fgff",
    name: "First-Gen Future Fund",
    amount: "$5,000",
    match: 96,
    deadline: "Closes in 21 days",
    deadlineColor: "#B7791F",
    deadlineBg: "#FFF7E6",
    why: "For first-generation students in California. Maya's background, UC Irvine profile, and aid status make this a strong fit.",
    icon: <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke="#15885A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    iconBg: "#EAFBF1",
    amountColor: "#15885A",
    matchBg: "#EAFBF1",
    matchColor: "#15885A",
    featured: true,
  },
  {
    id: "stem",
    name: "Women in STEM Grant",
    amount: "$3,500",
    match: 91,
    deadline: "Plenty of time",
    deadlineColor: "#15885A",
    deadlineBg: "#EAFBF1",
    why: "Maya's STEM interest and student profile make this a strong fit.",
    matchBg: "#EAF3FF",
    matchColor: "#0B5CAD",
    amountColor: "#0B5CAD",
  },
  {
    id: "anteater",
    name: "Anteater Community Award",
    amount: "$2,000",
    match: 88,
    deadline: "Closes in 12 days",
    deadlineColor: "#B7791F",
    deadlineBg: "#FFF7E6",
    why: "UC Irvine students with community involvement are a strong match.",
    matchBg: "#EAF3FF",
    matchColor: "#0B5CAD",
    amountColor: "#0B5CAD",
  },
  {
    id: "local",
    name: "Local Service Scholarship",
    amount: "$1,000",
    match: 84,
    deadline: "Closes in 18 days",
    deadlineColor: "#B7791F",
    deadlineBg: "#FFF7E6",
    why: "Maya's volunteer work and first-gen profile match the criteria.",
    matchBg: "#EAF3FF",
    matchColor: "#0B5CAD",
    amountColor: "#0B5CAD",
  },
];

export default function ScholarshipsPage() {
  const featured = SCHOLARSHIPS[0];
  const rest = SCHOLARSHIPS.slice(1);

  return (
    <AppShell>
      <div style={{ padding: "40px 48px 80px", maxWidth: 1100, margin: "0 auto" }}>

        {/* header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 999, letterSpacing: ".3px", marginBottom: 14 }}>
            <StarSVG color="#fff" />
            <svg width={12} height={12} viewBox="0 0 12 12" fill="#fff"><circle cx="6" cy="6" r="6"/></svg>
            This week&apos;s report
          </div>
          <h1 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>Weekly Scholarship Report</h1>
          <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            We found money for you this week. <span style={{ color: "#15885A", fontWeight: 700 }}>$24,500</span> in scholarships matched to your story.
          </p>
        </div>

        {/* stat row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 40 }}>
          {[
            { val: "12",      label: "new scholarships",    color: "#0B5CAD" },
            { val: "$24,500", label: "potential awards",     color: "#15885A" },
            { val: "4",       label: "strong matches",       color: "#0B5CAD" },
            { val: "3",       label: "deadlines this month", color: "#B7791F" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, minWidth: 140, background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, padding: "18px 20px", boxShadow: "0 4px 12px rgba(11,92,173,.05)" }}>
              <div style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* featured + list grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 24, alignItems: "start" }}>

          {/* featured */}
          <div style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 24, boxShadow: "0 26px 50px -26px rgba(11,92,173,.26)", padding: 30 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: featured.iconBg, alignItems: "center", justifyContent: "center" }}>{featured.icon}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: featured.matchBg, color: featured.matchColor, fontSize: 13, fontWeight: 800, padding: "7px 14px", borderRadius: 999 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />{featured.match}% match for you
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 26, fontWeight: 900, margin: "0 0 4px", color: "#15212E" }}>{featured.name}</h3>
            <div style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 38, fontWeight: 900, color: featured.amountColor, marginBottom: 14, letterSpacing: -1 }}>{featured.amount}</div>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
              <strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> {featured.why}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: featured.deadlineColor, background: featured.deadlineBg, padding: "9px 14px", borderRadius: 12, marginBottom: 20 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              {featured.deadline}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="/#waitlist" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "13px 24px", borderRadius: 13, boxShadow: "0 10px 20px rgba(11,92,173,.22)", textDecoration: "none" }}>Start application</a>
              <button style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "13px 20px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit" }}>
                <BookmarkSVG />Save
              </button>
            </div>
          </div>

          {/* compact list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rest.map((s) => (
              <div key={s.id} style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, boxShadow: "0 16px 34px -24px rgba(11,92,173,.22)", padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <h4 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 16, fontWeight: 800, margin: 0, color: "#15212E" }}>{s.name}</h4>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: s.matchColor, background: s.matchBg, padding: "4px 9px", borderRadius: 999 }}>{s.match}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 22, fontWeight: 900, color: s.amountColor }}>{s.amount}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: s.deadlineColor }}>{s.deadline}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7280", lineHeight: 1.5 }}>
                  <strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> {s.why}
                </div>
              </div>
            ))}
            <a href="/#waitlist" style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: 15, borderRadius: 16, textDecoration: "none" }}>
              See all 12 matches
            </a>
          </div>
        </div>

        <p style={{ marginTop: 40, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
          AidPilot is independent and not affiliated with any scholarship provider. Verify each scholarship&apos;s requirements before applying.{" "}
          <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
        </p>
      </div>
    </AppShell>
  );
}
