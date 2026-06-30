"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { PlaneSVG } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { getInitials } from "@/lib/data-helpers";

const GridSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const FafsaSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

const DocSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

const CalendarSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);

const LetterSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h6" />
  </svg>
);

const GearSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const ShieldSVG = ({ color = "currentColor" }: { color?: string }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

type NavItem = {
  href: string;
  label: string;
  icon: ({ color }: { color?: string }) => ReactElement;
  isActive?: (pathname: string) => boolean;
};

const CORE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: GridSVG },
  {
    href: "/protect",
    label: "Protect Aid",
    icon: ShieldSVG,
    isActive: (pathname) => pathname === "/protect",
  },
  {
    href: "/fafsa",
    label: "FAFSA Plan",
    icon: FafsaSVG,
    isActive: (pathname) => pathname === "/fafsa" || pathname.startsWith("/fafsa/"),
  },
  {
    href: "/aid-letter",
    label: "Aid Offers",
    icon: LetterSVG,
    isActive: (pathname) => pathname === "/aid-letter" || pathname.startsWith("/aid-letter/"),
  },
  { href: "/scholarships", label: "Scholarships", icon: DocSVG },
  { href: "/documents", label: "Documents", icon: DocSVG },
  { href: "/deadlines", label: "Deadlines", icon: CalendarSVG },
  { href: "/checklist", label: "Checklist", icon: FafsaSVG },
  { href: "/settings", label: "Settings", icon: GearSVG },
];

const COMING_SOON_NAV = [{ href: "/schools", label: "Schools" }];

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href;
}

function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          display: "flex",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(255,255,255,.18)",
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ height: 12, width: "72%", borderRadius: 6, background: "rgba(255,255,255,.18)", marginBottom: 8 }} />
        <div style={{ height: 10, width: "55%", borderRadius: 6, background: "rgba(255,255,255,.12)" }} />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authReady, profile, user, logout, isScholarshipAdmin } = useUserData();
  const adminHref = "/admin/scholarships";
  const adminActive = pathname === adminHref || pathname.startsWith("/admin/");

  const isSignedIn = Boolean(user);
  const showProfileSkeleton = !authReady;

  let displayName = "Student";
  let displayEmail = "";
  let displaySchool: string | null = null;
  let displayTag = "";
  let initials = "AP";

  try {
    displayName = getProfileFullName(profile) || (user?.email ? user.email.split("@")[0] : "Student");
    displayEmail = user?.email?.trim() || profile?.email?.trim() || "";
    displaySchool =
      [getProfileEducationLevel(profile), getProfileSchoolName(profile)].filter(Boolean).join(" · ") || null;
    displayTag = profile?.student_type?.trim() || "";
    initials = getInitials(getProfileFullName(profile) || user?.email?.split("@")[0]);
  } catch (error) {
    console.error("AppShell identity render failed:", error);
    displayName = user?.email?.split("@")[0] || "Student";
    displayEmail = user?.email?.trim() || "";
    initials = getInitials(displayName);
  }

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
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "rgba(255,255,255,.18)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <PlaneSVG size={18} color="#fff" />
            </span>
            <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-.3px" }}>
              AidPilot
            </span>
          </Link>
        </div>

        <div style={{ padding: "14px 16px", margin: "12px", background: "rgba(255,255,255,.1)", borderRadius: 14 }}>
          {showProfileSkeleton ? (
            <ProfileSkeleton />
          ) : isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "flex", width: 34, height: 34, borderRadius: "50%", background: "#EAF3FF", color: "#0B5CAD", fontWeight: 800, fontSize: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {initials}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayName}
                </div>
                {displayEmail ? (
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {displayEmail}
                  </div>
                ) : null}
                {displaySchool ? (
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: displayEmail ? 2 : 0 }}>
                    {displaySchool}
                  </div>
                ) : !displayEmail ? (
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.6)" }}>
                    Complete your profile in Settings
                  </div>
                ) : null}
                {displayTag ? (
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{displayTag}</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {CORE_NAV.map((item) => {
            const { href, label, icon: Icon } = item;
            const isActive = isNavItemActive(item, pathname);
            return (
              <Link key={href} href={href} prefetch style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, textDecoration: "none", background: isActive ? "#fff" : "transparent", color: isActive ? "#0B5CAD" : "rgba(255,255,255,.78)", fontWeight: isActive ? 700 : 600, fontSize: 14 }}>
                <Icon color={isActive ? "#0B5CAD" : "rgba(255,255,255,.78)"} />
                {label}
              </Link>
            );
          })}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".8px", margin: "0 12px 8px" }}>
              Coming soon
            </div>
            {COMING_SOON_NAV.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 12,
                    textDecoration: "none",
                    background: isActive ? "rgba(255,255,255,.12)" : "transparent",
                    color: "rgba(255,255,255,.55)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".4px" }}>
                    Soon
                  </span>
                </Link>
              );
            })}
          </div>

          {isScholarshipAdmin && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".8px", margin: "0 12px 8px" }}>
                Admin
              </div>
              <Link href={adminHref} prefetch style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, textDecoration: "none", background: adminActive ? "#fff" : "transparent", color: adminActive ? "#0B5CAD" : "rgba(255,255,255,.78)", fontWeight: adminActive ? 700 : 600, fontSize: 14 }}>
                <ShieldSVG color={adminActive ? "#0B5CAD" : "rgba(255,255,255,.78)"} />
                Scholarships admin
              </Link>
            </div>
          )}
        </nav>

        <div style={{ margin: 12, padding: "12px 14px", background: "rgba(255,255,255,.08)", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>
            Your plan
          </div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,.6)", margin: "0 0 10px", lineHeight: 1.5 }}>
            Your aid data is saved to your account.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            disabled={!isSignedIn}
            style={{ display: "block", width: "100%", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#fff", padding: "7px 12px", borderRadius: 999, border: "none", cursor: isSignedIn ? "pointer" : "not-allowed", opacity: isSignedIn ? 1 : 0.6, fontFamily: "inherit" }}
          >
            Log out
          </button>
        </div>

        <div style={{ padding: "8px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.55)", textDecoration: "none" }}>
            ← Back to home
          </Link>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/disclaimer" style={{ fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none" }}>Disclaimer</Link>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <div style={{ padding: "36px 44px 72px", maxWidth: 1100, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
