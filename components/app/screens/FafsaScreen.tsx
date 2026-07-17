"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, StatusPanel, ProgressBar, Button } from "@/components/ui";
import { Greeting, SectionTitle, money } from "@/components/app/screens/shared";
import { FafsaGuide } from "@/components/app/screens/FafsaGuide";
import { AskAidPilot } from "@/components/app/screens/AskAidPilot";
import { FafsaJourney } from "@/components/app/screens/FafsaJourney";
import { FafsaCoach } from "@/components/app/screens/FafsaCoach";
import { FafsaSyncBanner } from "@/components/fafsa/FafsaSyncBanner";
import { Confetti } from "@/components/app/screens/Confetti";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/lib/i18n";
import { FAFSA_STEPS } from "@/lib/fafsa/steps";
import type { UserFafsaStep } from "@/lib/types";

const STRINGS = {
  en: {
    title: "FAFSA Plan",
    subtitle: "Your step-by-step path to a submitted FAFSA - no jargon.",
    followUp: "Follow-up questions",
    ready: (pct: number) => `You're ${pct}% ready`,
    progress: (done: number, total: number) => `${done} of ${total} steps done`,
    minutesLeft: (m: number) => ` · about ${m} minutes left`,
    allSet: " · you're all set",
    yourSteps: "Your journey",
    next: "Next",
    continueStep: "Continue",
    tapHint: "Tap a step to check it off.",
    allDoneEyebrow: "All done",
    allDoneTitle: "Every step done - your FAFSA is ready.",
    allDoneBody: "Nice work. We'll let you know if anything new needs your attention.",
    doNext: "Do this next",
    nextStepFallback: "Your next step",
    start: "Start",
    nextBodyFallback: "Take it one step at a time. We never ask for your login or documents.",
  },
  es: {
    title: "Plan FAFSA",
    subtitle: "Tu camino paso a paso hacia una FAFSA enviada - sin jerga.",
    followUp: "Preguntas de seguimiento",
    ready: (pct: number) => `Estás ${pct}% listo`,
    progress: (done: number, total: number) => `${done} de ${total} pasos completados`,
    minutesLeft: (m: number) => ` · unos ${m} minutos restantes`,
    allSet: " · todo listo",
    yourSteps: "Tu recorrido",
    next: "Siguiente",
    continueStep: "Continuar",
    tapHint: "Toca un paso para marcarlo.",
    allDoneEyebrow: "Todo listo",
    allDoneTitle: "Todos los pasos completados - tu FAFSA está lista.",
    allDoneBody: "Buen trabajo. Te avisaremos si algo nuevo necesita tu atención.",
    doNext: "Haz esto ahora",
    nextStepFallback: "Tu siguiente paso",
    start: "Comenzar",
    nextBodyFallback: "Ve paso a paso. Nunca pedimos tu contraseña ni tus documentos.",
  },
};

const LEGACY_WORKFLOW_TITLE_TO_PLAN_KEYS: Record<string, string[]> = {
  "create studentaid.gov account": ["create-account"],
  "gather student and contributor information": ["gather-records"],
  "invite contributor if needed": ["invite-contributors"],
  "complete fafsa": ["start-fafsa"],
  "submit fafsa": ["review-submit"],
  "watch for school verification request": ["respond-verification"],
  "submit requested verification documents": ["respond-verification"],
  "check school financial aid portal": ["check-school-portals"],
  "compare aid offers": ["understand-aid-offers"],
};

function legacyPlanKeysFor(step: UserFafsaStep, workflowTitleById: Map<string, string>): string[] {
  const title = step.workflow_step?.title ?? workflowTitleById.get(step.workflow_step_id) ?? "";
  return LEGACY_WORKFLOW_TITLE_TO_PLAN_KEYS[title.trim().toLowerCase()] ?? [];
}

/** A FAFSA step counts as done when its status reads complete/completed/done. */
function isStepDone(step: UserFafsaStep): boolean {
  const status = (step.status ?? "").trim().toLowerCase();
  return status === "complete" || status === "completed" || status === "done";
}

function FafsaSkeleton() {
  const shimmer: React.CSSProperties = {
    background: "var(--track)",
    borderRadius: 10,
  };
  return (
    <div>
      <div style={{ ...shimmer, height: 40, width: 220, marginBottom: 12 }} />
      <div style={{ ...shimmer, height: 18, width: 340, marginBottom: 24 }} />
      <Card variant="clay" padding={24} style={{ marginBottom: 20 }}>
        <div style={{ ...shimmer, height: 26, width: 180, marginBottom: 10 }} />
        <div style={{ ...shimmer, height: 16, width: 240, marginBottom: 16 }} />
        <div style={{ ...shimmer, height: 12, width: "100%" }} />
      </Card>
      <Card variant="clay" padding={8} style={{ marginBottom: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px" }}>
            <div style={{ ...shimmer, height: 20, width: 20, borderRadius: "50%" }} />
            <div style={{ ...shimmer, height: 16, width: `${60 - i * 6}%` }} />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default function FafsaScreen() {
  const { authReady, loading, userFafsaSteps, workflowSteps } = useUserData();
  const { completedPlanKeys, markComplete, markIncomplete, syncMessage } = useFafsaProgress();
  const { t } = useLanguage();
  const s = t(STRINGS);
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ready = authReady && !loading;
  const completedKeySet = useMemo(() => new Set(completedPlanKeys), [completedPlanKeys]);
  const legacyCompletedPlanKeys = useMemo(() => {
    const workflowTitleById = new Map(workflowSteps.map((step) => [step.id, step.title]));
    const migrated = new Set<string>();
    userFafsaSteps.forEach((step) => {
      if (!isStepDone(step)) return;
      legacyPlanKeysFor(step, workflowTitleById).forEach((planKey) => {
        if (!completedKeySet.has(planKey)) migrated.add(planKey);
      });
    });
    return [...migrated];
  }, [completedKeySet, userFafsaSteps, workflowSteps]);

  // Older FAFSA screens wrote completion to user_fafsa_steps. Keep that
  // progress by copying clear title matches into the canonical plan-key store.
  useEffect(() => {
    if (!ready || legacyCompletedPlanKeys.length === 0) return;
    legacyCompletedPlanKeys.forEach((planKey) => markComplete(planKey));
  }, [legacyCompletedPlanKeys, markComplete, ready]);

  useEffect(() => {
    return () => {
      if (popTimer.current) clearTimeout(popTimer.current);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    };
  }, []);

  if (!ready) {
    return <FafsaSkeleton />;
  }

  const steps = FAFSA_STEPS;
  const total = steps.length;
  const done = steps.filter((step) => completedKeySet.has(step.planKey)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;
  const minutesLeft = remaining * 5;

  const nextStep = steps.find((step) => !completedKeySet.has(step.planKey));
  const allDone = !nextStep;

  const toggleStep = (planKey: string) => {
    const isDone = completedKeySet.has(planKey);
    // Completing the last remaining step finishes the journey - celebrate.
    const willComplete = remaining === 1 && !isDone;
    if (isDone) {
      markIncomplete(planKey);
    } else {
      markComplete(planKey);
    }
    setPoppingId(planKey);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => setPoppingId(null), 460);
    if (willComplete) {
      setCelebrate(true);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => setCelebrate(false), 3800);
    }
  };

  return (
    <div>
      {celebrate && <Confetti />}
      <Greeting
        title={s.title}
        subtitle={s.subtitle}
        action={
          <Link href="/fafsa/follow-up" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              {s.followUp}
            </Button>
          </Link>
        }
      />

      {syncMessage && <FafsaSyncBanner message={syncMessage} />}

      <Card variant="clay" padding={24} style={{ marginBottom: 20, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--blue-50) 150%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ fontSize: 21, fontWeight: 900, color: "var(--ink-900)" }}>{s.ready(pct)}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", marginTop: 3 }}>
              {s.progress(done, total)}
              {remaining > 0 ? s.minutesLeft(minutesLeft) : s.allSet}
            </div>
          </div>
          <span style={{ ...money, fontSize: 46, color: "var(--blue-700)" }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} height={12} />
      </Card>

      <SectionTitle
        action={
          !allDone ? (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)" }}>{s.tapHint}</span>
          ) : undefined
        }
      >
        {s.yourSteps}
      </SectionTitle>
      <Card variant="clay" padding="24px 12px" style={{ marginBottom: 20 }}>
        <FafsaJourney
          steps={steps.map((step, index) => ({
            id: step.planKey,
            title: step.title ?? `Step ${index + 1}`,
            done: completedKeySet.has(step.planKey),
          }))}
          currentId={allDone ? null : nextStep?.planKey ?? null}
          poppingId={poppingId}
          onToggle={toggleStep}
          bubbleLabel={done > 0 ? s.continueStep : s.start}
        />
      </Card>

      {!allDone && nextStep && (
        <FafsaCoach key={nextStep.planKey} stepTitle={nextStep.title} />
      )}

      {allDone && (
        <StatusPanel
          tone="green"
          icon="shield-check"
          eyebrow={s.allDoneEyebrow}
          title={s.allDoneTitle}
          style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)" }}
        >
          {s.allDoneBody}
        </StatusPanel>
      )}

      {/* AI Q&A grounded strictly in the sourced guide content. */}
      <div style={{ marginTop: 32 }}>
        <AskAidPilot />
      </div>

      {/* Sourced, read-only guide to the real FAFSA structure (see lib/fafsa-guide). */}
      <div id="fafsa-guide" style={{ marginTop: 32, scrollMarginTop: 90 }}>
        <FafsaGuide path="fafsa" />
      </div>
    </div>
  );
}
