"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo, TabBar } from "@/components/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TranslationPendingBanner } from "./TranslationPendingBanner";

// The three in-app steps, in order. `key` is also the route segment.
const STEP_KEYS = ["triage", "walkthrough", "worksheet"] as const;
type StepKey = (typeof STEP_KEYS)[number];

const STEP_ICONS: Record<StepKey, string> = {
  triage: "clipboard",
  walkthrough: "file",
  worksheet: "letter",
};

/**
 * In-app shell (clay surface). Holds the brand, language switcher, and the
 * Triage → Walkthrough → Worksheet tab nav. Wraps every route in the (app)
 * group. No user data — purely navigation chrome.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();

  const active = STEP_KEYS.find((k) => pathname.startsWith(`/${k}`)) ?? "triage";
  const tabs = STEP_KEYS.map((k) => ({ key: k, label: t(k), icon: STEP_ICONS[k] }));

  return (
    <div style={{ minHeight: "100dvh", background: "var(--surface-app)", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border-nav)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "var(--blur-nav)",
          WebkitBackdropFilter: "var(--blur-nav)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "var(--content-max)",
            margin: "0 auto",
            padding: "12px clamp(16px, 4vw, 44px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Link href="/" aria-label="AidPilot" style={{ display: "inline-flex", flexShrink: 0 }}>
            <Logo variant="full" size={26} />
          </Link>
          <LanguageSwitcher />
        </div>
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0 12px 14px",
            overflowX: "auto",
          }}
        >
          <TabBar tabs={tabs} active={active} onChange={(k) => router.push(`/${k}`)} />
        </nav>
      </header>

      <main
        className="page-enter"
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "24px clamp(16px, 4vw, 44px) 72px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <TranslationPendingBanner />
        {children}
      </main>
    </div>
  );
}
