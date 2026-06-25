"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ── shared SVGs ────────────────────────────────────────────────────────────────

const PlaneSVG = ({ size = 18, color = "#fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

const GridSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const CheckSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 20 6"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>
  </svg>
);

const DocSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);

const StarSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z"/>
  </svg>
);

const GearSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

// ── nav items ──────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/dashboard",    label: "Dashboard",    icon: GridSVG },
  { href: "/checklist",    label: "Checklist",    icon: CheckSVG },
  { href: "/dashboard#docs", label: "Documents",  icon: DocSVG },
  { href: "/scholarships", label: "Scholarships", icon: StarSVG },
  { href: "/dashboard#settings", label: "Settings", icon: GearSVG },
];

// ── shell ──────────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-hanken), system-ui, sans-serif", background: "#F4F8FE" }}>

      {/* sidebar */}
      <aside style={{ width: 232, flexShrink: 0, background: "#0B5CAD", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,.18)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <PlaneSVG size={18} color="#fff" />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" }}>AidPilot</span>
          </Link>
        </div>

        {/* student chip */}
        <div style={{ padding: "14px 16px", margin: "12px", background: "rgba(255,255,255,.1)", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", width: 34, height: 34, borderRadius: "50%", background: "#EAF3FF", color: "#0B5CAD", fontWeight: 800, fontSize: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>MC</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Maya Chen</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.6)" }}>Sophomore · UC Irvine</div>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href.split("#")[0]) && !href.includes("#");
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, textDecoration: "none", background: isActive ? "#fff" : "transparent", color: isActive ? "#0B5CAD" : "rgba(255,255,255,.78)", fontWeight: isActive ? 700 : 600, fontSize: 14, transition: "background .15s ease,color .15s ease" }}>
                <Icon color={isActive ? "#0B5CAD" : "rgba(255,255,255,.78)"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* demo badge */}
        <div style={{ margin: 12, padding: "12px 14px", background: "rgba(255,255,255,.08)", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>Demo mode</div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.6)", margin: "0 0 10px", lineHeight: 1.5 }}>Sample data only. Join the waitlist for your real plan.</p>
          <Link href="/#waitlist" style={{ display: "block", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#fff", padding: "7px 12px", borderRadius: 999, textDecoration: "none" }}>Join waitlist</Link>
        </div>

        <div style={{ padding: "12px 16px 20px", display: "flex", gap: 16 }}>
          <Link href="/privacy"    style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/disclaimer" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Disclaimer</Link>
        </div>
      </aside>

      {/* main */}
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
