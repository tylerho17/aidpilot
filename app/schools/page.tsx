import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Financial Aid Offices -- AidPilot",
  description: "AidPilot helps students arrive prepared, submit documents on time, and understand what to do next.",
};

const PlaneSVG = ({ size = 18, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

const CheckSVG = ({ color = "#15885A" }: { color?: string }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

const VALUE_CARDS = [
  {
    title: "Fewer missing documents",
    body: "Students arrive with required documents ready, reducing back-and-forth and reprocessing time.",
    icon: "📄",
    accent: "#EAF3FF",
    border: "#CBD9EC",
  },
  {
    title: "Earlier deadline completion",
    body: "Friendly weekly reminders mean students submit on time instead of at the last minute.",
    icon: "📅",
    accent: "#EAFBF1",
    border: "#B8E8CC",
  },
  {
    title: "Students arrive prepared",
    body: "AidPilot explains what documents are needed and why, so students understand before they call.",
    icon: "🎓",
    accent: "#FFF7E6",
    border: "#F0DFA0",
  },
  {
    title: "Less repeated confusion",
    body: "Plain-language explanations reduce common questions about FAFSA corrections, verification, and aid offers.",
    icon: "💬",
    accent: "#EAF3FF",
    border: "#CBD9EC",
  },
];

const WORKFLOW = [
  { step: "01", title: "Student gets weekly check-in", body: "AidPilot delivers a short weekly summary: aid status, missing steps, upcoming deadlines." },
  { step: "02", title: "AidPilot flags missing steps",  body: "Missing documents, verification holds, and incomplete tasks are surfaced early and clearly." },
  { step: "03", title: "Documents arrive earlier",       body: "Students are reminded what to upload, where to go, and why it matters, before it becomes urgent." },
  { step: "04", title: "Office spends less time chasing", body: "Fewer calls, fewer re-requests, fewer last-minute escalations. Students arrive already informed." },
];

export default function SchoolsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "var(--font-hanken), system-ui, sans-serif", color: "#1F2937" }}>

      {/* nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid #EAECEF", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "#0B5CAD", boxShadow: "0 4px 12px rgba(11,92,173,.22)", alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={18} />
          </span>
          <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-.4px" }}>
            <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>For students</Link>
          <Link href="/#waitlist" style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#1F2937", padding: "10px 18px", borderRadius: 999, textDecoration: "none" }}>Partner with us</Link>
        </div>
      </nav>

      {/* hero */}
      <header style={{ background: "#fff", padding: "96px 48px 80px", borderBottom: "1px solid #EAECEF" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#6B7280", background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "6px 14px", borderRadius: 999, marginBottom: 24, letterSpacing: ".2px" }}>For financial aid offices</span>
          <h1 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 54, fontWeight: 900, letterSpacing: "-1.6px", margin: "0 0 20px", color: "#15212E", lineHeight: 1.06 }}>
            Fewer missing documents.<br />Calmer students.
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: "#5B6573", margin: "0 auto 40px", lineHeight: 1.6, maxWidth: 600 }}>
            AidPilot helps students arrive prepared, submit documents on time, and understand what to do next before they ever call your office.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="mailto:hello@aidpilot.app" style={{ fontSize: 17, fontWeight: 700, color: "#fff", background: "#1F2937", padding: "15px 28px", borderRadius: 14, boxShadow: "0 12px 24px rgba(31,41,55,.22)", textDecoration: "none" }}>Partner with us</a>
            <Link href="/dashboard" style={{ fontSize: 17, fontWeight: 700, color: "#1F2937", background: "#fff", border: "1.5px solid #E2E8F0", padding: "15px 28px", borderRadius: 14, textDecoration: "none" }}>View student demo</Link>
          </div>
        </div>
      </header>

      {/* value cards */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#15885A", textTransform: "uppercase", letterSpacing: "1.2px" }}>Why it works</span>
            <h2 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: "-.8px", margin: "12px 0 0", color: "#15212E" }}>What changes for your office</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {VALUE_CARDS.map((c) => (
              <div key={c.title} style={{ background: c.accent, border: "1px solid " + c.border, borderRadius: 20, padding: "28px 32px" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{c.icon}</span>
                <h3 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 19, fontWeight: 800, margin: "0 0 10px", color: "#15212E" }}>{c.title}</h3>
                <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.65 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* workflow */}
      <section style={{ background: "#fff", padding: "80px 48px", borderTop: "1px solid #EAECEF", borderBottom: "1px solid #EAECEF" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD", textTransform: "uppercase", letterSpacing: "1.2px" }}>How it works</span>
            <h2 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: "-.8px", margin: "12px 0 0", color: "#15212E" }}>The student journey, improved</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {WORKFLOW.map((w, i) => (
              <div key={w.step} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "24px 28px", background: i % 2 === 0 ? "#F9FAFB" : "#fff", border: "1px solid #E9EDF2", borderRadius: 18 }}>
                <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 28, fontWeight: 900, color: "#0B5CAD", opacity: .35, flexShrink: 0, lineHeight: 1 }}>{w.step}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#15212E" }}>{w.title}</h3>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* trust strip */}
      <section style={{ padding: "56px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #EAECEF", borderRadius: 20, padding: "28px 32px", display: "flex", flexWrap: "wrap", gap: "12px 32px", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>AidPilot never asks students for:</span>
            {["Social Security numbers", "Tax documents", "FAFSA login credentials", "Bank account information"].map((item) => (
              <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                <CheckSVG />{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section style={{ padding: "0 48px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", background: "#1F2937", borderRadius: 28, padding: "56px 48px", textAlign: "center", boxShadow: "0 32px 64px -32px rgba(31,41,55,.5)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 38, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 14px", color: "#fff", lineHeight: 1.1 }}>Let&apos;s make aid simpler<br />for your students.</h2>
            <p style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,.65)", margin: "0 0 28px" }}>Reach out to learn how AidPilot can support your financial aid office.</p>
            <a href="mailto:hello@aidpilot.app" style={{ display: "inline-block", fontSize: 17, fontWeight: 700, color: "#1F2937", background: "#fff", padding: "15px 32px", borderRadius: 14, textDecoration: "none", boxShadow: "0 10px 24px rgba(0,0,0,.2)" }}>Partner with us</a>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer style={{ borderTop: "1px solid #EAECEF", background: "#fff", padding: "28px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ display: "flex", width: 28, height: 28, borderRadius: 8, background: "#0B5CAD", alignItems: "center", justifyContent: "center" }}>
              <PlaneSVG size={15} />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 16, fontWeight: 900 }}>
              <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link href="/"           style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>For students</Link>
            <Link href="/dashboard"  style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Demo</Link>
            <Link href="/privacy"    style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Privacy</Link>
            <Link href="/disclaimer" style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Disclaimer</Link>
          </div>
          <div style={{ fontSize: 13, color: "#9AA4B2" }}>2026 AidPilot</div>
        </div>
      </footer>
    </div>
  );
}
