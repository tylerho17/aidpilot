"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  SectionHeading,
  OptionCard,
  SegmentedControl,
  ProgressBar,
  StatusPanel,
  Button,
} from "@/components/ui";
import { useSession } from "@/components/v1/session";
import {
  TRIAGE_QUESTIONS,
  resolveOutcome,
  type TriageOutcome,
  type TriageSignal,
} from "@/lib/v1/triage";

const OUTCOME_TONE: Record<TriageOutcome, "blue" | "green" | "amber"> = {
  fafsa: "blue",
  cadaa: "green",
  counselor: "amber",
};
const OUTCOME_ICON: Record<TriageOutcome, string> = {
  fafsa: "shield-check",
  cadaa: "star",
  counselor: "letter",
};

// F3 — Triage wizard. One question per step; routes to FAFSA / CADAA / counselor.
// All copy is i18n placeholders; nothing entered is saved or sent.
export default function TriagePage() {
  const t = useTranslations("triage");
  const common = useTranslations("common");
  const router = useRouter();
  const { setPath } = useSession();

  const total = TRIAGE_QUESTIONS.length;
  const [step, setStep] = useState(0); // 0..total-1 = questions, total = result
  const [selections, setSelections] = useState<Record<string, string>>({}); // questionKey → valueKey
  const [outcome, setOutcome] = useState<TriageOutcome | null>(null);

  const atResult = step >= total;
  const question = atResult ? null : TRIAGE_QUESTIONS[step];
  const answered = question ? selections[question.key] !== undefined : true;

  function choose(questionKey: string, valueKey: string) {
    setSelections((prev) => ({ ...prev, [questionKey]: valueKey }));
  }

  function goBack() {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    if (!question) return;
    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }
    // Last question answered → resolve signals and route.
    const signals = TRIAGE_QUESTIONS.map((q) => {
      const chosen = selections[q.key];
      return q.options.find((o) => o.valueKey === chosen)?.signal;
    }).filter(Boolean) as TriageSignal[];
    const result = resolveOutcome(signals);
    setOutcome(result);
    setPath(result === "counselor" ? null : result);
    setStep(total);
  }

  function startOver() {
    setSelections({});
    setOutcome(null);
    setPath(null);
    setStep(0);
  }

  const progressPct = useMemo(
    () => Math.round((Math.min(step, total) / total) * 100),
    [step, total],
  );

  if (atResult && outcome) {
    return (
      <>
        <SectionHeading eyebrow={t("resultEyebrow")} title={t(`outcomes.${outcome}.title`)} />
        <StatusPanel
          tone={OUTCOME_TONE[outcome]}
          icon={OUTCOME_ICON[outcome]}
          title={t(`outcomes.${outcome}.title`)}
        >
          {t(`outcomes.${outcome}.body`)}
        </StatusPanel>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {outcome === "counselor" ? (
            <Button iconRight="arrow-right" onClick={() => router.push("/for-counselors")}>
              {t("outcomes.counselor.cta")}
            </Button>
          ) : (
            <Button iconRight="arrow-right" onClick={() => router.push("/walkthrough")}>
              {t(`outcomes.${outcome}.cta`)}
            </Button>
          )}
          <Button variant="secondary" onClick={startOver}>
            {t("startOver")}
          </Button>
        </div>
      </>
    );
  }

  if (!question) return null;

  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <ProgressBar
        pct={progressPct}
        label={t("progress", { current: step + 1, total })}
        showValue
      />

      <Card variant="clay" padding="clamp(20px, 5vw, 32px)">
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(19px, 3vw, 24px)",
            fontWeight: 800,
            letterSpacing: "-0.4px",
            color: "var(--ink-900)",
            margin: "0 0 18px",
            lineHeight: 1.25,
          }}
        >
          {t(`questions.${question.key}.label`)}
        </h2>

        {question.component === "segmented" ? (
          <SegmentedControl
            options={question.options.map((o) => ({
              value: o.valueKey,
              label: t(`questions.${question.key}.options.${o.valueKey}`),
            }))}
            value={selections[question.key] ?? ""}
            onChange={(value) => choose(question.key, value)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((o) => (
              <OptionCard
                key={o.valueKey}
                icon={o.icon}
                selected={selections[question.key] === o.valueKey}
                title={t(`questions.${question.key}.options.${o.valueKey}.title`)}
                description={t(`questions.${question.key}.options.${o.valueKey}.desc`)}
                onClick={() => choose(question.key, o.valueKey)}
              />
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <Button variant="secondary" iconLeft="chevron-left" onClick={goBack}>
          {common("back")}
        </Button>
        <Button iconRight="arrow-right" disabled={!answered} onClick={goNext}>
          {common("continue")}
        </Button>
      </div>
    </>
  );
}
