"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CheckSVG, PillBadge, ProductCard, ProgressBar } from "@/components/ProductUI";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { useAidActions } from "@/hooks/useAidActions";
import { FAFSA_STEPS, getFafsaStepHref, getGuidedProgressPercent } from "@/lib/fafsa/steps";
import { FafsaSyncBanner } from "@/components/fafsa/FafsaSyncBanner";

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "12px 22px",
  borderRadius: 13,
  textDecoration: "none",
  boxShadow: "0 10px 20px rgba(11,92,173,.22)",
} as const;

export default function FafsaHomeClient() {
  const { completionCount, nextIncompleteStep, isCompleted, completedPlanKeys, syncMessage } = useFafsaProgress();
  const { topAction } = useAidActions();
  const progressPercent = getGuidedProgressPercent(completedPlanKeys);
  const allComplete = completionCount >= FAFSA_STEPS.length;
  const recommendedAction = topAction;

  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {syncMessage && <FafsaSyncBanner message={syncMessage} />}

        <ProductCard
          style={{
            padding: 18,
            marginBottom: 22,
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            Never enter your StudentAid.gov password, Social Security number, or bank account number into AidPilot.
          </p>
        </ProductCard>

        <div style={{ marginBottom: 24 }}>
          <h1
            className="font-display"
            style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E", lineHeight: 1.1 }}
          >
            Protect your aid
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            FAFSA is free. AidPilot explains the steps — you complete the official form at StudentAid.gov.
          </p>
        </div>

        <ProductCard style={{ padding: 22, marginBottom: 22, background: "#F4FBF7", border: "1px solid #D5F0E2" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#15885A", margin: "0 0 8px" }}>Next recommended action</p>
          {recommendedAction ? (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#15212E", margin: "0 0 8px", lineHeight: 1.4 }}>
                {recommendedAction.title}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
                {recommendedAction.description}
              </p>
              <Link href={recommendedAction.href} style={primaryBtn}>
                {recommendedAction.ctaLabel}
              </Link>
            </>
          ) : !allComplete && nextIncompleteStep ? (
            <>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#15212E", margin: "0 0 8px", lineHeight: 1.4 }}>
                Step {nextIncompleteStep.stepNumber}: {nextIncompleteStep.title}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
                Stay on track by completing the next FAFSA step.
              </p>
              <Link href={getFafsaStepHref(nextIncompleteStep.planKey)} style={primaryBtn}>
                Continue the guide
              </Link>
            </>
          ) : (
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
              No urgent FAFSA actions right now. Keep checking StudentAid.gov and your school portals.
            </p>
          )}
        </ProductCard>

        <ProductCard style={{ padding: 24, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>Your progress</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0B5CAD" }}>
              {completionCount} of {FAFSA_STEPS.length} steps
            </span>
          </div>
          <ProgressBar pct={progressPercent} />
          <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "12px 0 0", lineHeight: 1.5 }}>
            {progressPercent}% complete
          </p>

          {!allComplete && nextIncompleteStep ? (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "#EAF3FF", border: "1px solid #D7E7FB" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", margin: "0 0 6px" }}>Your next step</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#15212E", margin: "0 0 14px", lineHeight: 1.4 }}>
                Step {nextIncompleteStep.stepNumber}: {nextIncompleteStep.title}
              </p>
              <Link href={getFafsaStepHref(nextIncompleteStep.planKey)} style={primaryBtn}>
                Continue the guide
              </Link>
            </div>
          ) : (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#15885A", margin: "16px 0 0", lineHeight: 1.6 }}>
              You have completed all nine steps. Keep checking StudentAid.gov and your school portals.
            </p>
          )}
        </ProductCard>

        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
          All 9 FAFSA steps
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAFSA_STEPS.map((step) => {
            const done = isCompleted(step.planKey);
            return (
              <Link
                key={step.planKey}
                href={getFafsaStepHref(step.planKey)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 14,
                  textDecoration: "none",
                  border: done ? "1px solid #BBF7D0" : "1px solid #EAEEF3",
                  background: done ? "#F5FBF7" : "#fff",
                  minHeight: 56,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "flex",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: done ? "#15885A" : "#EAF3FF",
                    color: done ? "#fff" : "#0B5CAD",
                    fontWeight: 800,
                    fontSize: 13,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {done ? <CheckSVG color="#fff" size={14} /> : step.stepNumber}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#15212E",
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.title}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", lineHeight: 1.5 }}>
                    {step.estimatedTime} · {step.subtitle}
                  </span>
                </span>
                {done ? <PillBadge tone="green">Done</PillBadge> : <PillBadge tone="gray">Open</PillBadge>}
              </Link>
            );
          })}
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
          Federal FAFSA is only one deadline. Your state or college may require earlier action. Official FAFSA work
          happens on{" "}
          <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#0B5CAD" }}>
            StudentAid.gov
          </a>
          .
        </p>
      </div>
    </AppShell>
  );
}
