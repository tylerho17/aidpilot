"use client";

import { useState } from "react";
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
  QUESTION_ORDER,
  nextTriageStep,
  type TriageAnswers,
  type TriageOutcome,
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

// F3 — REAL triage. Three questions route to FAFSA, CADAA, or the counselor
// (conservative: any doubt → counselor; mixed-status → counselor, not solved
// in v1). Question text: VERIFY against CSAC "which application is right for
// me" before launch (see lib/v1/triage.ts + messages/en.json triage._verify).
export default function TriagePage() {
  const t = useTranslations("triage");
  const common = useTranslations("common");
  const router = useRouter();
  const { setPath } = useSession();

  // Triage answers include sensitive eligibility info, so they live ONLY in
  // this component's state — never in session state, storage, or the network
  // (Rule 1). Only the resulting path is written to the session.
  const [answers, setAnswers] = useState<TriageAnswers>({});
  const [selection, setSelection] = useState<string | null>(null);

  const step = nextTriageStep(answers);
  const answeredCount = QUESTION_ORDER.filter((k) => answers[k] !== undefined).length;
  // Q2 is skipped for CADAA candidates (Q1 = "no"), so they see 2 questions.
  const total = answers.citizenship === "no" ? 2 : 3;

  function commit() {
    if (step.kind !== "question" || selection === null) return;
    const next = { ...answers, [step.key]: selection } as TriageAnswers;
    const resolved = nextTriageStep(next);
    if (resolved.kind === "outcome") {
      // 'counselor' is a real session path (Part 1): screens downstream use it
      // to point the student at the counselor referral instead of a form.
      setPath(resolved.outcome);
    }
    setAnswers(next);
    setSelection(null);
  }

  function goBack() {
    const answered = QUESTION_ORDER.filter((k) => answers[k] !== undefined);
    if (answered.length === 0) {
      router.push("/");
      return;
    }
    const last = answered[answered.length - 1];
    const rest = { ...answers };
    setSelection(rest[last] ?? null);
    delete rest[last];
    setAnswers(rest);
  }

  function startOver() {
    setAnswers({});
    setSelection(null);
    setPath(null);
  }

  // ── Summary screen ──
  if (step.kind === "outcome") {
    const { outcome, info } = step;
    return (
      <>
        <SectionHeading eyebrow={t("summaryEyebrow")} title={t("summaryTitle")} />
        <StatusPanel
          tone={OUTCOME_TONE[outcome]}
          icon={OUTCOME_ICON[outcome]}
          title={t(`paths.${outcome}`)}
        >
          {outcome === "counselor" && info === "notSenior"
            ? t("counselor.notSeniorNote")
            : null}
        </StatusPanel>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {outcome === "counselor" ? (
            <Button iconRight="arrow-right" onClick={() => router.push("/counselor")}>
              {common("continue")}
            </Button>
          ) : (
            <Button iconRight="arrow-right" onClick={() => router.push("/walkthrough")}>
              {t("continueWalkthrough")}
            </Button>
          )}
          <Button variant="secondary" onClick={startOver}>
            {t("startOver")}
          </Button>
        </div>
      </>
    );
  }

  // ── Question screen ──
  const q = TRIAGE_QUESTIONS[step.key];
  const pct = Math.round((answeredCount / total) * 100);

  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <ProgressBar
        pct={pct}
        label={t("progress", { current: answeredCount + 1, total })}
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
          {t(`questions.${q.key}.label`)}
        </h2>

        {q.component === "segmented" ? (
          <SegmentedControl
            options={q.options.map((v) => ({
              value: v,
              label: t(`questions.${q.key}.options.${v}`),
            }))}
            value={selection ?? ""}
            onChange={(v) => setSelection(v)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((v) => (
              <OptionCard
                key={v}
                selected={selection === v}
                title={t(`questions.${q.key}.options.${v}`)}
                onClick={() => setSelection(v)}
              />
            ))}
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        <Button variant="secondary" iconLeft="chevron-left" onClick={goBack}>
          {common("back")}
        </Button>
        <Button iconRight="arrow-right" disabled={selection === null} onClick={commit}>
          {common("continue")}
        </Button>
      </div>
    </>
  );
}
