"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo, Button, StatusPanel } from "@/components/ui";
import { LanguageSwitcher } from "@/components/v1/LanguageSwitcher";
import { TranslationPendingBanner } from "@/components/v1/TranslationPendingBanner";

// Part 6 — counselor-referral landing (/go): the one shareable link a counselor
// hands out. Flat surface, language-first, single CTA into triage. Static UI
// copy only; the trust/privacy lines are the sourced ones (content-source.md).
export default function ReferralPage() {
  const t = useTranslations("referral");
  const trust = useTranslations("trust");
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--gradient-hero)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(20px, 5vw, 48px) clamp(16px, 4vw, 44px) 64px",
      }}
    >
      <main
        className="page-enter"
        style={{
          width: "100%",
          maxWidth: "var(--auth-max)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <Logo variant="full" size={34} />
        </div>

        <TranslationPendingBanner />

        {/* Language first — the family picks before anything else */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "16px 18px",
            borderRadius: "var(--radius-2xl)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>
            {t("langHint")}
          </span>
          <LanguageSwitcher style={{ width: "100%" }} />
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--blue-700)",
              marginBottom: 10,
            }}
          >
            {t("eyebrow")}
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(26px, 6vw, 34px)",
              fontWeight: 900,
              letterSpacing: "-0.8px",
              lineHeight: 1.12,
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--gray-500)",
              lineHeight: 1.6,
              margin: "12px 0 0",
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        <Button size="lg" fullWidth iconRight="arrow-right" onClick={() => router.push("/triage")}>
          {t("cta")}
        </Button>

        <StatusPanel tone="green" icon="shield-check" title={trust("privacyTitle")}>
          {trust("privacy")}
        </StatusPanel>
        <StatusPanel tone="blue" icon="shield" title={trust("cadaaTitle")}>
          {trust("cadaa")}
        </StatusPanel>
      </main>
    </div>
  );
}
