import Link from "next/link";
import type { ReactNode } from "react";

const PlaneSVG = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

const ChevronSVG = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

interface LegalShellProps {
  badge?: string;
  heading: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalShell({ badge, heading, lastUpdated, children }: LegalShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "var(--font-hanken), system-ui, sans-serif", color: "#1F2937" }}>

      {/* top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: "#0B5CAD", boxShadow: "0 4px 12px rgba(11,92,173,.22)", flexShrink: 0 }}>
              <PlaneSVG />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-.4px" }}>
              <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
            </span>
          </Link>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>
            <ChevronSVG />Back to AidPilot
          </Link>
        </div>
      </div>

      {/* page body */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 96px" }}>

        {/* page header */}
        <div style={{ marginBottom: 48 }}>
          {badge && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "5px 12px", borderRadius: 999, letterSpacing: ".3px", marginBottom: 18 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.4-3 6.8-7 8-4-1.2-7-3.6-7-8V6l7-3Z"/></svg>
              {badge}
            </span>
          )}
          <h1 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 44, fontWeight: 900, letterSpacing: "-1.2px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.08 }}>{heading}</h1>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: 0 }}>Last updated: {lastUpdated}</p>
        </div>

        {/* content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </div>
      </div>

      {/* footer */}
      <footer style={{ borderTop: "1px solid #E5E7EB", background: "#fff", padding: "32px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "#0B5CAD" }}>
              <PlaneSVG />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 16, fontWeight: 900 }}>
              <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { href: "/privacy",    label: "Privacy" },
              { href: "/disclaimer", label: "Disclaimer" },
              { href: "/dashboard",  label: "Demo" },
              { href: "/",           label: "Home" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2" }}>2026 AidPilot</div>
        </div>
      </footer>
    </div>
  );
}

// ── Reusable section card ──────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  accent?: "white" | "blue" | "green" | "amber" | "coral";
}

const ACCENT_STYLES: Record<NonNullable<SectionCardProps["accent"]>, { bg: string; border: string; titleColor: string }> = {
  white:  { bg: "#FFFFFF",  border: "#E5E7EB", titleColor: "#15212E" },
  blue:   { bg: "#EAF3FF",  border: "#CBD9EC", titleColor: "#0B5CAD" },
  green:  { bg: "#EAFBF1",  border: "#B8E8CC", titleColor: "#15885A" },
  amber:  { bg: "#FFF7E6",  border: "#F0DFA0", titleColor: "#92600A" },
  coral:  { bg: "#FFE4E6",  border: "#F4C0C4", titleColor: "#C04E57" },
};

export function SectionCard({ title, children, accent = "white" }: SectionCardProps) {
  const s = ACCENT_STYLES[accent];
  return (
    <div style={{ background: s.bg, border: "1px solid " + s.border, borderRadius: 18, padding: "28px 32px" }}>
      {title && (
        <h2 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 14px", color: s.titleColor, lineHeight: 1.2 }}>{title}</h2>
      )}
      <div style={{ fontSize: 15.5, lineHeight: 1.75, color: "#374151" }}>
        {children}
      </div>
    </div>
  );
}
