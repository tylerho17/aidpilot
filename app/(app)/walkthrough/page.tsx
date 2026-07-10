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
import { WalkthroughField } from "@/components/v1/WalkthroughField";

// F4 — Walkthrough shell. Section-by-section flow driven by lib/v1/walkthrough.
// All content is i18n placeholders; answers live in session only, nothing sent.
export default function WalkthroughPage() {
  const t = useTranslations("walkthrough");
  const common = useTranslations("common");
  const router = useRouter();
  const { path, answers } = useSession();
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

  const isDone = (s: WalkSection): boolean => {
    if (s.explainerOnly) return true; // nothing to fill
    return s.fields.every((f) => {
      const v = answers[f.answerKey];
      if (typeof v === "string") return v.trim() !== "";
      return v !== null && v !== undefined;
    });
  };

  const doneCount = sections.filter(isDone).length;
  const pct = Math.round((doneCount / sections.length) * 100);
  const section = sections[current];

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
            badge={s.explainerOnly ? t("explainerBadge") : undefined}
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

      {section.explainerOnly ? (
        <StatusPanel tone="blue" icon="shield" title={t(section.titleKey)}>
          {section.bodyKey ? t(section.bodyKey) : null}
        </StatusPanel>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {section.fields.map((f) => (
            <WalkthroughField key={f.answerKey} field={f} />
          ))}
        </div>
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
