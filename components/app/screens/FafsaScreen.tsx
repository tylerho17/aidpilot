"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, StatusPanel, ProgressBar, Button } from "@/components/ui";
import { Greeting, SectionTitle, money } from "@/components/app/screens/shared";
import { FafsaGuide } from "@/components/app/screens/FafsaGuide";
import { AskAidPilot } from "@/components/app/screens/AskAidPilot";
import { FafsaJourney } from "@/components/app/screens/FafsaJourney";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/lib/i18n";
import { demoFallback, makeDemoFafsaSteps, useDemoMutations } from "@/lib/demo";
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

/** A FAFSA step counts as done when its status reads complete/completed/done. */
function isStepDone(step: UserFafsaStep): boolean {
  const status = (step.status ?? "").trim().toLowerCase();
  return status === "complete" || status === "completed" || status === "done";
}

/** Order steps by their workflow step_order, falling back to load order. */
function orderSteps(steps: UserFafsaStep[]): UserFafsaStep[] {
  return steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => {
      const orderA = a.step.workflow_step?.step_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.step.workflow_step?.step_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.index - b.index;
    })
    .map(({ step }) => step);
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
  const { authReady, loading, userFafsaSteps, workflowSteps, ensureUserFafsaSteps, updateFafsaStepStatus } =
    useUserData();
  const { t } = useLanguage();
  const s = t(STRINGS);
  const demo = useDemoMutations();
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ready = authReady && !loading;
  const hasSteps = userFafsaSteps.length > 0;

  // If we're signed in with data loaded but no real steps yet, seed them.
  useEffect(() => {
    if (ready && !hasSteps) {
      void ensureUserFafsaSteps();
    }
  }, [ready, hasSteps, ensureUserFafsaSteps]);

  // Real rows win; fixtures fill in only when demo mode is on and Supabase is empty.
  const effectiveSteps = useMemo(() => demoFallback(userFafsaSteps, makeDemoFafsaSteps), [userFafsaSteps]);

  // user_fafsa_steps rows are loaded WITHOUT a join - hydrate each row's
  // workflow_step (title/description/order) from the global catalog so real
  // accounts see the actual step names, never a generic fallback.
  const hydratedSteps = useMemo(() => {
    const catalog = new Map(workflowSteps.map((ws) => [ws.id, ws]));
    return effectiveSteps.map((step) =>
      step.workflow_step ? step : { ...step, workflow_step: catalog.get(step.workflow_step_id) ?? null }
    );
  }, [effectiveSteps, workflowSteps]);

  useEffect(() => {
    return () => {
      if (popTimer.current) clearTimeout(popTimer.current);
    };
  }, []);

  if (!ready || hydratedSteps.length === 0) {
    return <FafsaSkeleton />;
  }

  // Effective done-state: fixture/row status XOR a local demo toggle.
  const isEffectivelyDone = (step: UserFafsaStep) => (demo.has(step.id) ? !isStepDone(step) : isStepDone(step));

  const steps = orderSteps(hydratedSteps);
  const total = steps.length;
  const done = steps.filter(isEffectivelyDone).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;
  const minutesLeft = remaining * 5;

  const nextStep = steps.find((step) => !isEffectivelyDone(step));
  const allDone = !nextStep;

  const toggleStep = (step: UserFafsaStep) => {
    if (demo.isDemo(step.id)) {
      demo.toggle(step.id);
    } else {
      void updateFafsaStepStatus(step.id, isEffectivelyDone(step) ? "incomplete" : "complete");
    }
    setPoppingId(step.id);
    if (popTimer.current) clearTimeout(popTimer.current);
    popTimer.current = setTimeout(() => setPoppingId(null), 460);
  };

  return (
    <div>
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
            id: step.id,
            title: step.workflow_step?.title ?? `Step ${index + 1}`,
            done: isEffectivelyDone(step),
          }))}
          currentId={allDone ? null : nextStep?.id ?? null}
          poppingId={poppingId}
          onToggle={(id) => {
            const step = steps.find((entry) => entry.id === id);
            if (step) toggleStep(step);
          }}
          bubbleLabel={done > 0 ? s.continueStep : s.start}
        />
      </Card>

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
