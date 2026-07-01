import type { Metadata } from "next";
import Link from "next/link";
import { Logo, Badge, IconTile, Icon, Card } from "@/components/ui";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "For Financial Aid Offices -- AidPilot",
  description: "AidPilot helps students arrive prepared, submit documents on time, and understand what to do next.",
};

/* Button-styled anchors - the design-system Button look, rendered as links. */
const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  textDecoration: "none",
  whiteSpace: "nowrap",
  cursor: "pointer",
} as const;

const btnPrimary = {
  ...btnBase,
  padding: "16px 30px",
  fontSize: "var(--text-md)",
  color: "#fff",
  background: "var(--blue-700)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-btn)",
} as const;

const btnPrimaryPill = {
  ...btnBase,
  padding: "11px 20px",
  fontSize: "var(--text-base)",
  color: "#fff",
  background: "var(--blue-700)",
  borderRadius: "var(--radius-pill)",
  boxShadow: "var(--shadow-btn)",
} as const;

const btnSecondary = {
  ...btnBase,
  padding: "16px 30px",
  fontSize: "var(--text-md)",
  color: "var(--blue-700)",
  background: "#fff",
  border: "var(--border-btn-secondary)",
  borderRadius: "var(--radius-md)",
} as const;

type Tone = "blue" | "green" | "amber" | "coral";

const VALUE_CARDS: { title: string; body: string; icon: string; tone: Tone }[] = [
  {
    title: "Fewer missing documents",
    body: "Students arrive with required documents ready, reducing back-and-forth and reprocessing time.",
    icon: "file",
    tone: "blue",
  },
  {
    title: "Earlier deadline completion",
    body: "Friendly weekly reminders mean students submit on time instead of at the last minute.",
    icon: "calendar",
    tone: "green",
  },
  {
    title: "Students arrive prepared",
    body: "AidPilot explains what documents are needed and why, so students understand before they call.",
    icon: "star",
    tone: "amber",
  },
  {
    title: "Less repeated confusion",
    body: "Plain-language explanations reduce common questions about FAFSA corrections, verification, and aid offers.",
    icon: "clipboard",
    tone: "blue",
  },
];

const WORKFLOW = [
  { step: "01", title: "Student gets weekly check-in", body: "AidPilot delivers a short weekly summary: aid status, missing steps, upcoming deadlines." },
  { step: "02", title: "AidPilot flags missing steps",  body: "Missing documents, verification holds, and incomplete tasks are surfaced early and clearly." },
  { step: "03", title: "Documents arrive earlier",       body: "Students are reminded what to upload, where to go, and why it matters, before it becomes urgent." },
  { step: "04", title: "Office spends less time chasing", body: "Fewer calls, fewer re-requests, fewer last-minute escalations. Students arrive already informed." },
];

const NO_ASK = ["Social Security numbers", "Tax documents", "FAFSA login credentials", "Bank account information"];

export default function SchoolsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-page)",
        fontFamily: "var(--font-body)",
        color: "var(--text-body)",
      }}
    >
      {/* nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "var(--blur-nav)",
          WebkitBackdropFilter: "var(--blur-nav)",
          borderBottom: "1px solid var(--border-nav)",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link href="/" aria-label="AidPilot home" style={{ display: "inline-flex" }}>
          <Logo size={30} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Link href="/" style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", whiteSpace: "nowrap" }}>For students</Link>
          <Link href="/#waitlist" style={btnPrimaryPill}>Partner with us</Link>
        </div>
      </nav>

      {/* hero */}
      <header style={{ background: "var(--surface-card)", padding: "88px 40px 72px", borderBottom: "1px solid var(--border-nav)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginBottom: 22 }}>
            <Badge tone="blue" icon="shield-check">For financial aid offices</Badge>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-display)",
              fontWeight: 900,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.06,
              margin: "0 0 18px",
              color: "var(--text-heading)",
            }}
          >
            Fewer missing documents.<br />Calmer students.
          </h1>
          <p style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--ink-600)", margin: "0 0 32px", lineHeight: 1.6, maxWidth: 560 }}>
            AidPilot helps students arrive prepared, submit documents on time, and understand what to do next before they ever call your office.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="mailto:hello@aidpilot.app" style={btnPrimary}>Partner with us<Icon name="arrow-right" size={19} strokeWidth={2.2} /></a>
            <Link href="/dashboard" style={btnSecondary}>View student demo</Link>
          </div>
        </div>
      </header>

      {/* value cards */}
      <section style={{ padding: "72px 40px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--green-600)", textTransform: "uppercase", letterSpacing: "var(--tracking-eyebrow)" }}>Why it works</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", fontWeight: 900, letterSpacing: "var(--tracking-snug)", margin: "12px 0 0", color: "var(--text-heading)" }}>What changes for your office</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {VALUE_CARDS.map((c) => (
              <Card key={c.title} variant="clay" padding="28px 30px">
                <IconTile icon={c.icon} tone={c.tone} size={48} style={{ marginBottom: 16 }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", fontWeight: 800, margin: "0 0 8px", color: "var(--text-heading)" }}>{c.title}</h3>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--ink-700)", margin: 0, lineHeight: 1.65 }}>{c.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* workflow */}
      <section style={{ background: "var(--surface-card)", padding: "72px 40px", borderTop: "1px solid var(--border-nav)", borderBottom: "1px solid var(--border-nav)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 800, color: "var(--blue-700)", textTransform: "uppercase", letterSpacing: "var(--tracking-eyebrow)" }}>How it works</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", fontWeight: 900, letterSpacing: "var(--tracking-snug)", margin: "12px 0 0", color: "var(--text-heading)" }}>The student journey, improved</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {WORKFLOW.map((w) => (
              <div key={w.step} style={{ display: "flex", gap: 22, alignItems: "flex-start", padding: "22px 26px", background: "var(--surface-page)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-xl)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: 900, color: "var(--blue-700)", opacity: 0.4, flexShrink: 0, lineHeight: 1 }}>{w.step}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", fontWeight: 800, margin: "0 0 6px", color: "var(--text-heading)" }}>{w.title}</h3>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-muted)", margin: 0, lineHeight: 1.65 }}>{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* trust strip */}
      <section style={{ padding: "56px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Card variant="flat" padding="26px 30px" style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-muted)" }}>AidPilot never asks students for:</span>
            {NO_ASK.map((item) => (
              <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink-700)" }}>
                <Icon name="check" size={15} color="var(--green-600)" strokeWidth={3} />{item}
              </span>
            ))}
          </Card>
        </div>
      </section>

      {/* final CTA */}
      <section style={{ padding: "0 40px 80px" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            background: "var(--blue-700)",
            backgroundImage: "linear-gradient(180deg,#3E86D6,#0B5CAD)",
            borderRadius: "var(--radius-clay-lg)",
            padding: "52px 44px",
            textAlign: "center",
            boxShadow: "var(--shadow-clay-brand)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", fontWeight: 900, letterSpacing: "var(--tracking-snug)", margin: "0 0 12px", color: "#fff", lineHeight: 1.1 }}>Let&apos;s make aid simpler<br />for your students.</h2>
            <p style={{ fontSize: "var(--text-md)", fontWeight: 500, color: "rgba(255,255,255,.78)", margin: "0 0 26px" }}>Reach out to learn how AidPilot can support your financial aid office.</p>
            <a
              href="mailto:hello@aidpilot.app"
              style={{ ...btnBase, padding: "16px 30px", fontSize: "var(--text-md)", color: "var(--blue-700)", background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "0 10px 24px rgba(0,0,0,.2)" }}
            >
              Partner with us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
