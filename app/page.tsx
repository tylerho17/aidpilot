"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Logo,
  Button,
  Badge,
  FeatureCard,
  SectionHeading,
  StatusPanel,
  Icon,
} from "@/components/ui";
import { LanguageSwitcher } from "@/components/v1/LanguageSwitcher";
import { TranslationPendingBanner } from "@/components/v1/TranslationPendingBanner";

// F1 landing — flat (marketing) surface. All copy via i18n placeholder keys.
export default function LandingPage() {
  const t = useTranslations("landing");
  const trust = useTranslations("trust");
  const router = useRouter();

  const steps = [
    { icon: "clipboard", tone: "blue" as const, title: t("step1Title"), body: t("step1Body") },
    { icon: "file", tone: "green" as const, title: t("step2Title"), body: t("step2Body") },
    { icon: "letter", tone: "amber" as const, title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--gradient-hero)", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <header
        style={{
          width: "100%",
          maxWidth: "var(--marketing-max)",
          margin: "0 auto",
          padding: "16px clamp(16px, 4vw, 44px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Logo variant="full" size={28} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSwitcher />
          <Button size="sm" iconRight="arrow-right" onClick={() => router.push("/triage")}>
            {t("ctaPrimary")}
          </Button>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "var(--marketing-max)",
          margin: "0 auto",
          padding: "8px clamp(16px, 4vw, 44px) 64px",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
        <TranslationPendingBanner />

        {/* Hero */}
        <section style={{ paddingTop: "clamp(24px, 6vw, 64px)", maxWidth: 820 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <Badge tone="green" icon="shield-check">{t("badgeNoData")}</Badge>
            <Badge tone="blue" icon="check">{t("badgeNoLogin")}</Badge>
            <Badge tone="gray">{t("badgeBilingual")}</Badge>
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
              color: "var(--blue-700)",
              marginBottom: 14,
            }}
          >
            {t("eyebrow")}
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-1px",
              lineHeight: 1.05,
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            {t("title")}
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2.4vw, 19px)",
              fontWeight: 500,
              color: "var(--gray-500)",
              lineHeight: 1.6,
              margin: "18px 0 0",
              maxWidth: 640,
            }}
          >
            {t("subtitle")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <Button size="lg" iconRight="arrow-right" onClick={() => router.push("/triage")}>
              {t("ctaPrimary")}
            </Button>
            <Link href="#how" style={{ textDecoration: "none" }}>
              <Button size="lg" variant="secondary">{t("ctaSecondary")}</Button>
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section id="how" style={{ scrollMarginTop: 24 }}>
          <SectionHeading eyebrow={t("stepsEyebrow")} title={t("stepsTitle")} />
          <div
            className="stagger-children"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 18,
              marginTop: 24,
            }}
          >
            {steps.map((s) => (
              <FeatureCard key={s.title} icon={s.icon} tone={s.tone} title={s.title}>
                {s.body}
              </FeatureCard>
            ))}
          </div>
        </section>

        {/* Trust — sourced privacy line + CADAA trust line (docs/content-source.md) */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <StatusPanel tone="green" icon="shield-check" title={trust("privacyTitle")}>
            {trust("privacy")}
          </StatusPanel>
          <StatusPanel tone="blue" icon="shield" title={trust("cadaaTitle")}>
            {trust("cadaa")}
          </StatusPanel>
        </section>

        {/* Disclaimer */}
        <section
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "16px 18px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-card)",
            background: "var(--surface-card)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <Icon name="shield" size={18} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55 }}>
            {t("disclaimer")}
          </p>
        </section>
      </main>
    </div>
  );
}
