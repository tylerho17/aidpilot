"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, ReactElement } from "react";
import { PlaneSVG } from "@/components/ProductUI";

const GridSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const CheckSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 20 6" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
  </svg>
);

const DocSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const StarSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z" />
  </svg>
);

const GearSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const NAV: {
  href: string;
  label: string;
  icon: ({ color }: { color?: string }) => ReactElement;
  match: string;
  id?: string;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: GridSVG, match: "/dashboard" },
  { href: "/checklist", label: "Checklist", icon: CheckSVG, match: "/checklist" },
  { href: "/checklist", label: "Documents", icon: DocSVG, match: "/checklist", id: "documents" },
  { href: "/scholarships", label: "Scholarships", icon: StarSVG, match: "/scholarships" },
] ;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-hanken), system-ui, sans-serif", background: "#F4F8FE" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: "#0B5CAD",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span
              style={{
                display: "flex",
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "rgba(255,255,255,.18)",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlaneSVG size={18} color="#fff" />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" }}>
              AidPilot
            </span>
          </Link>
        </div>

        <div style={{ padding: "14px 16px", margin: "12px", background: "rgba(255,255,255,.1)", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "flex",
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#EAF3FF",
                color: "#0B5CAD",
                fontWeight: 800,
                fontSize: 12,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              MC
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Maya Chen
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.6)" }}>Sophomore · UC Irvine</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.45)", marginTop: 2 }}>Cal Grant recipient</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(({ href, label, icon: Icon, match, id }) => {
            const isActive = pathname === match;
            const isDocuments = id === "documents";
            const activeBg = isDocuments && isActive ? "rgba(255,255,255,.12)" : isActive && !isDocuments ? "#fff" : "transparent";
            const activeColor = isActive && !isDocuments ? "#0B5CAD" : "rgba(255,255,255,.78)";
            const iconColor = isActive && !isDocuments ? "#0B5CAD" : "rgba(255,255,255,.78)";

            return (
              <Link
                key={id ?? label}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  textDecoration: "none",
                  background: activeBg,
                  color: activeColor,
                  fontWeight: isActive && !isDocuments ? 700 : 600,
                  fontSize: 14,
                  transition: "background .15s ease, color .15s ease",
                }}
              >
                <Icon color={iconColor} />
                {label}
              </Link>
            );
          })}

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              color: "rgba(255,255,255,.35)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "not-allowed",
            }}
            title="Coming soon"
          >
            <GearSVG color="rgba(255,255,255,.35)" />
            Settings
          </span>
        </nav>

        <div style={{ margin: 12, padding: "12px 14px", background: "rgba(255,255,255,.08)", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>
            Demo mode
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.6)", margin: "0 0 10px", lineHeight: 1.5 }}>
            Sample data only. Join the waitlist for your real plan.
          </p>
          <Link
            href="/#waitlist"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#0B5CAD",
              background: "#fff",
              padding: "7px 12px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Join waitlist
          </Link>
        </div>

        <div style={{ padding: "8px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.55)", textDecoration: "none" }}>
            ← Back to home
          </Link>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link href="/disclaimer" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>
              Disclaimer
            </Link>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <div style={{ padding: "36px 44px 72px", maxWidth: 1100, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
