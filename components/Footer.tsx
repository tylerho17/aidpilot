import Link from "next/link";
import { Logo } from "@/components/ui";

const LINKS: { label: string; href: string }[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Demo dashboard", href: "/dashboard" },
];

export function Footer() {
  return (
    <footer style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border-nav)", padding: "36px 40px" }}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ maxWidth: 320 }}>
          <Logo size={26} />
          <p
            style={{
              marginTop: 10,
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            Protect your financial aid. Find more college money every week.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <p
        style={{
          maxWidth: 760,
          margin: "28px auto 0",
          fontSize: "var(--text-xs)",
          lineHeight: 1.6,
          color: "var(--text-subtle)",
        }}
      >
        AidPilot is an independent service and is not affiliated with FAFSA, Federal Student Aid, the U.S. Department of
        Education, or any college or university.
      </p>
    </footer>
  );
}
