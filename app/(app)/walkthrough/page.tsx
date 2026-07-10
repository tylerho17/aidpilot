"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  SectionHeading,
  Card,
  ProgressBar,
  ChecklistItem,
  StatusPanel,
  Button,
} from "@/components/ui";
import { useSession } from "@/components/v1/session";
import { WALKTHROUGH, type WalkSection } from "@/lib/v1/walkthrough";

// v1-flow 3/4 — Walkthrough renderer. Sections/fields come from the typed
// content files (real structure, placeholder explanations). Nothing transmitted.
export default function WalkthroughPage() {
  const t = useTranslations("walkthrough");
  const common = useTranslations("common");
  const router = useRouter();
  const { path } = useSession();
  const [current, setCurrent] = useState(0);

  // No form path → send the user to triage (counselor-routed students get the
  // counselor screen from the triage result; the walkthrough is FAFSA/CADAA only).
  if (!path || path === "counselor") {
    const counselor = path === "counselor";
    return (
      <>
        <SectionHeading eyebrow={t("eyebrow")} title={t("noPath.title")} />
        <StatusPanel
          tone={counselor ? "amber" : "blue"}
          icon={counselor ? "letter" : "clipboard"}
          title={t("noPath.title")}
        >
          {t("noPath.body")}
        </StatusPanel>
        <div>
          <Button
            iconRight="arrow-right"
            onClick={() => router.push(counselor ? "/counselor" : "/triage")}
          >
            {counselor ? t("noPath.counselorCta") : t("noPath.cta")}
          </Button>
        </div>
      </>
    );
  }

  const sections = WALKTHROUGH[path];
  const section = sections[Math.min(current, sections.length - 1)];

  // Section completion becomes reviewed-driven in v1-flow 4.
  const isDone = (s: WalkSection) => s.explainer;
  const doneCount = sections.filter(isDone).length;
  const pct = Math.round((doneCount / sections.length) * 100);

  function goBack() {
    if (current === 0) {
      router.push("/triage");
      return;
    }
    setCurrent((c) => Math.max(0, c - 1));
  }

  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <ProgressBar
        pct={pct}
        label={t("sectionProgress", { done: doneCount, total: sections.length })}
        showValue
      />

      {/* Section overview / navigator */}
      <Card variant="clay" padding="clamp(14px, 4vw, 20px)">
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-500)", margin: "2px 4px 8px" }}>
          {t("overviewTitle")}
        </div>
        {sections.map((s, i) => (
          <ChecklistItem
            key={s.sectionKey}
            done={isDone(s)}
            title={t(s.titleKey)}
            badge={s.explainer ? t("explainerBadge") : undefined}
            badgeTone="gray"
            divider={i < sections.length - 1}
            onToggle={() => setCurrent(i)}
          />
        ))}
      </Card>

      {/* Current section */}
      <SectionHeading
        size="sm"
        eyebrow={`${current + 1} / ${sections.length}`}
        title={t(section.titleKey)}
      />

      {section.explainer ? (
        <StatusPanel tone="blue" icon="shield" title={t(section.titleKey)}>
          {section.bodyKey ? t(section.bodyKey) : null}
        </StatusPanel>
      ) : (
        <Card variant="clay" padding="clamp(16px, 4vw, 22px)">
          {section.fields.map((f, i) => (
            <div
              key={f.fieldKey}
              style={{
                padding: "11px 4px",
                borderBottom: i < section.fields.length - 1 ? "1px solid var(--border-card)" : "none",
                fontSize: 14.5,
                fontWeight: 600,
                color: "var(--ink-800)",
              }}
            >
              {t(f.labelKey)}
            </div>
          ))}
        </Card>
      )}

      {/* Section nav */}
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <Button variant="secondary" iconLeft="chevron-left" onClick={goBack}>
          {common("back")}
        </Button>
        {current < sections.length - 1 ? (
          <Button iconRight="arrow-right" onClick={() => setCurrent((c) => c + 1)}>
            {common("next")}
          </Button>
        ) : (
          <Button iconRight="arrow-right" onClick={() => router.push("/worksheet")}>
            {t("toWorksheet")}
          </Button>
        )}
      </div>
    </>
  );
}
