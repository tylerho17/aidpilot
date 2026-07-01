"use client";

import Link from "next/link";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, Icon, ProgressBar, StatusPanel } from "@/components/ui";
import { Greeting, SectionTitle, money } from "@/components/app/screens/shared";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { useAidActions } from "@/hooks/useAidActions";
import { FAFSA_STEPS, getFafsaStepHref, getGuidedProgressPercent } from "@/lib/fafsa/steps";
import { FafsaSyncBanner } from "@/components/fafsa/FafsaSyncBanner";

export default function FafsaHomeClient() {
  const { completionCount, nextIncompleteStep, isCompleted, completedPlanKeys, syncMessage } = useFafsaProgress();
  const { topAction } = useAidActions();
  const progressPercent = getGuidedProgressPercent(completedPlanKeys);
  const allComplete = completionCount >= FAFSA_STEPS.length;
  const recommendedAction = topAction;

  return (
    <AppChrome>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {syncMessage && <FafsaSyncBanner message={syncMessage} />}

        <StatusPanel
          tone="amber"
          icon="shield-check"
          eyebrow="Stay safe"
          title="Never share passwords or sensitive numbers with AidPilot"
          style={{ marginBottom: 22 }}
        >
          Never enter your StudentAid.gov password, Social Security number, or bank account number into AidPilot.
        </StatusPanel>

        <Greeting
          title="Protect your aid"
          subtitle="FAFSA is free. AidPilot explains the steps - you complete the official form at StudentAid.gov."
        />

        <Card variant="clay" padding={22} style={{ marginBottom: 22, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--green-50, #F4FBF7) 160%)" }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: "var(--green-600)", margin: "0 0 8px" }}>
            Next recommended action
          </p>
          {recommendedAction ? (
            <>
              <p className="font-display" style={{ fontSize: 18, fontWeight: 900, color: "var(--ink-900)", margin: "0 0 8px", lineHeight: 1.35 }}>
                {recommendedAction.title}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 14px", lineHeight: 1.6 }}>
                {recommendedAction.description}
              </p>
              <Link href={recommendedAction.href} style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">{recommendedAction.ctaLabel}</Button>
              </Link>
            </>
          ) : !allComplete && nextIncompleteStep ? (
            <>
              <p className="font-display" style={{ fontSize: 18, fontWeight: 900, color: "var(--ink-900)", margin: "0 0 8px", lineHeight: 1.35 }}>
                Step {nextIncompleteStep.stepNumber}: {nextIncompleteStep.title}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 14px", lineHeight: 1.6 }}>
                Stay on track by completing the next FAFSA step.
              </p>
              <Link href={getFafsaStepHref(nextIncompleteStep.planKey)} style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Continue the guide</Button>
              </Link>
            </>
          ) : (
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
              No urgent FAFSA actions right now. Keep checking StudentAid.gov and your school portals.
            </p>
          )}
        </Card>

        <Card variant="clay" padding={24} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: "var(--ink-900)", letterSpacing: "-.3px" }}>
                Your progress
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", marginTop: 3 }}>
                {completionCount} of {FAFSA_STEPS.length} steps
              </div>
            </div>
            <span style={{ ...money, fontSize: 34, color: "var(--blue-700)" }}>{progressPercent}%</span>
          </div>
          <ProgressBar pct={progressPercent} height={12} />

          {!allComplete && nextIncompleteStep ? (
            <StatusPanel
              tone="blue"
              eyebrow="Your next step"
              title={`Step ${nextIncompleteStep.stepNumber}: ${nextIncompleteStep.title}`}
              trailing={
                <Link href={getFafsaStepHref(nextIncompleteStep.planKey)} style={{ textDecoration: "none" }}>
                  <Button variant="clay" size="sm" iconRight="arrow-right">Continue</Button>
                </Link>
              }
              style={{ marginTop: 20, borderRadius: "var(--radius-2xl)" }}
            />
          ) : (
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--green-600)", margin: "16px 0 0", lineHeight: 1.6 }}>
              You have completed all nine steps. Keep checking StudentAid.gov and your school portals.
            </p>
          )}
        </Card>

        <SectionTitle>All 9 FAFSA steps</SectionTitle>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAFSA_STEPS.map((step) => {
            const done = isCompleted(step.planKey);
            return (
              <Link
                key={step.planKey}
                href={getFafsaStepHref(step.planKey)}
                style={{ textDecoration: "none" }}
              >
                <Card
                  variant="clay"
                  lift
                  padding="16px 18px"
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, minHeight: 56 }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "flex",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: done ? "var(--green-600)" : "var(--blue-100)",
                      color: done ? "#fff" : "var(--blue-700)",
                      fontWeight: 800,
                      fontSize: 13,
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {done ? <Icon name="check" size={14} color="#fff" strokeWidth={3} /> : step.stepNumber}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink-900)", marginBottom: 4, lineHeight: 1.4 }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.5 }}>
                      {step.estimatedTime} · {step.subtitle}
                    </span>
                  </span>
                  {done ? <Badge tone="green">Done</Badge> : <Badge tone="gray">Open</Badge>}
                </Card>
              </Link>
            );
          })}
        </div>

        <p style={{ marginTop: 24, fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.6 }}>
          Federal FAFSA is only one deadline. Your state or college may require earlier action. Official FAFSA work
          happens on{" "}
          <a href="https://studentaid.gov" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-700)" }}>
            StudentAid.gov
          </a>
          .
        </p>
      </div>
    </AppChrome>
  );
}
