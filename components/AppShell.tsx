"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { PlaneSVG } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { getInitials } from "@/lib/data-helpers";
import { colors, fontFamily, radius } from "@/lib/design-tokens";

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

type ComingSoonNavItem = {
  label: string;
  href?: string;
};

const CORE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: GridSVG },
  {
    href: "/checklist",
    label: "Weekly Check-In",
    icon: CalendarSVG,
    isActive: (pathname) => pathname === "/checklist",
  },
  {
    href: "/aid-letter",
    label: "Aid Offers",
    icon: LetterSVG,
    isActive: (pathname) => pathname === "/aid-letter" || pathname.startsWith("/aid-letter/"),
  },
  {
    href: "/fafsa",
    label: "FAFSA Plan",
    icon: FafsaSVG,
    isActive: (pathname) => pathname === "/fafsa" || pathname.startsWith("/fafsa/"),
  },
  {
    href: "/protect",
    label: "Protect Aid",
    icon: ShieldSVG,
    isActive: (pathname) => pathname === "/protect",
  },
];

const COMING_SOON_NAV: ComingSoonNavItem[] = [
  { label: "Scholarships", href: "/scholarships" },
  { label: "Documents", href: "/documents" },
  { label: "Deadlines", href: "/deadlines" },
  { label: "Appeals" },
  { label: "Schools", href: "/schools" },
];

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href;
}

function navLinkStyle(active: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: radius.md,
    textDecoration: "none",
    background: active ? colors.sidebarActiveBg : "transparent",
    color: active ? colors.primary : colors.textMuted,
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    fontFamily,
  } as const;
}

function ComingSoonNavRow({ item, pathname }: { item: ComingSoonNavItem; pathname: string }) {
  const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;
  const soonBadge = (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: colors.textMuted,
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: ".4px",
      }}
    >
      Soon
    </span>
  );

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "7px 12px",
    borderRadius: radius.md,
    textDecoration: "none",
    background: isActive ? colors.background : "transparent",
    color: colors.textMuted,
    opacity: 0.65,
    fontWeight: 500,
    fontSize: 13,
    fontFamily,
    cursor: item.href ? "pointer" : "default",
  } as const;

  if (!item.href) {
    return (
      <div aria-disabled="true" style={baseStyle}>
        <span>{item.label}</span>
        {soonBadge}
      </div>
    );
  }

  return (
    <Link href={item.href} prefetch style={baseStyle}>
      <span>{item.label}</span>
      {soonBadge}
    </Link>
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
  let displaySchool: string | null = null;
  let initials = "AP";

  try {
    displayName = getProfileFullName(profile) || (user?.email ? user.email.split("@")[0] : "Student");
    displaySchool =
      [getProfileEducationLevel(profile), getProfileSchoolName(profile)].filter(Boolean).join(" · ") || null;
    initials = getInitials(getProfileFullName(profile) || user?.email?.split("@")[0]);
  } catch (error) {
    console.error("AppShell identity render failed:", error);
    displayName = user?.email?.split("@")[0] || "Student";
    initials = getInitials(displayName);
  }

  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily, background: colors.background }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: colors.card,
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 16px 16px" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span
              style={{
                display: "flex",
                width: 32,
                height: 32,
                borderRadius: radius.md,
                background: colors.softBlue,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlaneSVG size={16} color={colors.primary} />
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: colors.text, letterSpacing: "-.2px" }}>AidPilot</span>
          </Link>
        </div>

        {isSignedIn && !showProfileSkeleton ? (
          <div style={{ padding: "0 16px 12px", borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "flex",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: colors.softBlue,
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initials}
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </div>
                {displaySchool ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: colors.textMuted,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displaySchool}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {CORE_NAV.map((item) => {
            const { href, label, icon: Icon } = item;
            const isActive = isNavItemActive(item, pathname);
            return (
              <Link key={href} href={href} prefetch style={navLinkStyle(isActive)}>
                <Icon color={isActive ? colors.primary : colors.textMuted} />
                {label}
              </Link>
            );
          })}

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: colors.textMuted,
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: ".6px",
                margin: "0 12px 8px",
              }}
            >
              Coming soon
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {COMING_SOON_NAV.map((item) => (
                <ComingSoonNavRow key={item.label} item={item} pathname={pathname} />
              ))}
            </div>
          </div>

          {isScholarshipAdmin ? (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: colors.textMuted,
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: ".6px",
                  margin: "0 12px 8px",
                }}
              >
                Admin
              </div>
              <Link href={adminHref} prefetch style={navLinkStyle(adminActive)}>
                <ShieldSVG color={adminActive ? colors.primary : colors.textMuted} />
                Scholarships admin
              </Link>
            </div>
          ) : null}
        </nav>

        <div style={{ padding: "8px 10px 12px", borderTop: `1px solid ${colors.border}` }}>
          <Link href="/settings" prefetch style={navLinkStyle(settingsActive)}>
            <GearSVG color={settingsActive ? colors.primary : colors.textMuted} />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            disabled={!isSignedIn}
            style={{
              display: "block",
              width: "100%",
              marginTop: 6,
              textAlign: "left",
              fontSize: 14,
              fontWeight: 500,
              color: colors.textMuted,
              background: "transparent",
              padding: "9px 12px",
              borderRadius: radius.md,
              border: "none",
              cursor: isSignedIn ? "pointer" : "not-allowed",
              opacity: isSignedIn ? 1 : 0.5,
              fontFamily,
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <div className="app-page-container">{children}</div>
      </main>
    </div>
  );
}
