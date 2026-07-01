import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, Badge } from "@/components/ui";
import { Footer } from "@/components/Footer";

interface LegalShellProps {
  badge?: string;
  heading: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalShell({ badge, heading, lastUpdated, children }: LegalShellProps) {
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
      {/* top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "var(--blur-nav)",
          WebkitBackdropFilter: "var(--blur-nav)",
          borderBottom: "1px solid var(--border-nav)",
          padding: "14px 40px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Link href="/" aria-label="AidPilot home" style={{ display: "inline-flex" }}>
            <Logo size={28} />
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--ink-800)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* page body - centered reading column */}
      <main className="page-enter" style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "56px 24px 88px" }}>
        {/* page header */}
        <div style={{ marginBottom: 44 }}>
          {badge && (
            <div style={{ marginBottom: 18 }}>
              <Badge tone="blue" icon="shield">{badge}</Badge>
            </div>
          )}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-display)",
              fontWeight: 900,
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.08,
              margin: "0 0 10px",
              color: "var(--text-heading)",
            }}
          >
            {heading}
          </h1>
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-subtle)", margin: 0 }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
      </main>

      <Footer />
    </div>
  );
}

// ── Reusable section card ──────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  accent?: "white" | "blue" | "green" | "amber" | "coral";
}

const ACCENT_STYLES: Record<
  NonNullable<SectionCardProps["accent"]>,
  { bg: string; border: string; titleColor: string }
> = {
  white: { bg: "var(--surface-card)", border: "var(--border-card)", titleColor: "var(--text-heading)" },
  blue: { bg: "var(--blue-100)", border: "var(--blue-200)", titleColor: "var(--blue-700)" },
  green: { bg: "var(--green-100)", border: "var(--green-200)", titleColor: "var(--green-600)" },
  amber: { bg: "var(--amber-100)", border: "var(--amber-200)", titleColor: "var(--amber-600)" },
  coral: { bg: "var(--coral-100)", border: "var(--coral-200)", titleColor: "var(--coral-600)" },
};

export function SectionCard({ title, children, accent = "white" }: SectionCardProps) {
  const s = ACCENT_STYLES[accent];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--radius-2xl)",
        padding: "28px 32px",
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h4)",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: "0 0 14px",
            color: s.titleColor,
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ fontSize: "var(--text-base)", lineHeight: 1.75, color: "var(--ink-700)" }}>{children}</div>
    </div>
  );
}
