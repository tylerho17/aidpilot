"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo, TabBar, Avatar, Badge, Button, Icon } from "@/components/ui";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/lib/i18n";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { getInitials } from "@/lib/data-helpers";

/**
 * AidPilot signed-in app chrome - the Claymorphism × Material top bar that
 * replaces the old blue sidebar. Logo (left) · centered 3-tab TabBar · profile
 * menu (right). The three tabs consolidate the product per the design IA:
 * Dashboard, Protect, FAFSA Plan. Aid & Money and Docs & Dates surfaces stay
 * reachable from the Dashboard and light up the Dashboard tab.
 */

type TabKey = "home" | "protect" | "fafsa";

const TABS: { key: TabKey; label: { en: string; es: string }; icon: string; route: string }[] = [
  { key: "home", label: { en: "Dashboard", es: "Panel" }, icon: "grid", route: "/dashboard" },
  { key: "protect", label: { en: "Protect", es: "Proteger" }, icon: "shield", route: "/protect" },
  { key: "fafsa", label: { en: "FAFSA Plan", es: "Plan FAFSA" }, icon: "clipboard", route: "/fafsa" },
];

// Old routes that were merged into a tab still light up their new home.
function activeTab(pathname: string): TabKey {
  if (pathname.startsWith("/protect")) return "protect";
  if (pathname.startsWith("/fafsa")) return "fafsa";
  // Everything else - /aid-money, /docs-dates, /aid-letter, /scholarships,
  // /documents, /deadlines, /schools - rolls up to the Dashboard tab.
  return "home";
}

function ProfileMenu() {
  const { authReady, profile, user, logout, isScholarshipAdmin } = useUserData();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  let name = "Student";
  let school: string | null = null;
  let initials = "AP";
  try {
    name = getProfileFullName(profile) || (user?.email ? user.email.split("@")[0] : "Student");
    school =
      [getProfileEducationLevel(profile), getProfileSchoolName(profile)].filter(Boolean).join(" · ") || null;
    initials = getInitials(getProfileFullName(profile) || user?.email?.split("@")[0]);
  } catch {
    name = user?.email?.split("@")[0] || "Student";
    initials = getInitials(name);
  }

  if (!authReady) {
    return (
      <span
        style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue-100)", display: "inline-block" }}
        aria-hidden
      />
    );
  }

  // Signed-out demo tour: no fake profile - a demo badge and a real way in.
  if (!user) {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Badge tone="blue" dot>
          {t({ en: "Demo data", es: "Datos de demo" })}
        </Badge>
        <Link href="/signup" style={{ textDecoration: "none" }}>
          <Button size="sm" shape="pill">
            {t({ en: "Create account", es: "Crear cuenta" })}
          </Button>
        </Link>
      </span>
    );
  }

  const item: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--ink-800)",
    textAlign: "left",
    textDecoration: "none",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "5px 8px 5px 5px",
          border: "none",
          background: open ? "var(--blue-50)" : "transparent",
          borderRadius: 999,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Avatar initials={initials} size={36} />
        <span style={{ lineHeight: 1.15, textAlign: "left" }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--ink-800)" }}>{name}</span>
          {school && (
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--gray-400)" }}>{school}</span>
          )}
        </span>
        <Icon name="chevron-down" size={16} color="var(--gray-400)" />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 210,
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-modal)",
            padding: 6,
            zIndex: 300,
          }}
        >
          <Link href="/settings" role="menuitem" style={item} onClick={() => setOpen(false)}>
            <Icon name="gear" size={17} color="var(--gray-500)" /> Settings
          </Link>
          {isScholarshipAdmin && (
            <Link href="/admin/scholarships" role="menuitem" style={item} onClick={() => setOpen(false)}>
              <Icon name="shield" size={17} color="var(--gray-500)" /> Scholarships admin
            </Link>
          )}
          <div style={{ height: 1, background: "var(--border-card)", margin: "6px 4px" }} />
          <button
            type="button"
            role="menuitem"
            style={{ ...item, color: "var(--coral-600)" }}
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <Icon name="arrow-right" size={17} color="var(--coral-600)" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const active = activeTab(pathname || "/dashboard");

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-app)", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 6px 20px -12px rgba(11,92,173,.28)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
          padding: "14px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Link href="/dashboard" aria-label="AidPilot home" style={{ display: "inline-flex" }}>
            <Logo size={30} />
          </Link>
        </div>
        <TabBar
          tabs={TABS.map(({ key, label, icon }) => ({ key, label: t(label), icon }))}
          active={active}
          onChange={(key) => {
            const tab = TABS.find((entry) => entry.key === key);
            if (tab) router.push(tab.route);
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
          <ProfileMenu />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "var(--pad-page)",
        }}
      >
        {/* Keyed on pathname so the entrance replays on every route change -
            the chrome above stays put; only page content fades in. */}
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
