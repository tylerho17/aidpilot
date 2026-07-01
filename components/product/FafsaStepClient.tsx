"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, Select } from "@/components/ui";
import { FafsaDemoBanner } from "@/components/product/FafsaDemoBanner";
import { PageEmptyState, friendlyActionError } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import { isAidTaskComplete, statusToTone } from "@/lib/data-helpers";
import { resolveFafsaStep } from "@/lib/fafsa-step-resolve";
import { fafsaStepHref, parseFafsaStepPlanKey } from "@/lib/fafsa-step-url";

const PLAN_STATUSES = ["Upcoming", "Due Soon", "Complete"] as const;

function GuideSection({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "warning" | "tip";
}) {
  const backgrounds = {
    default: { bg: "var(--surface-card)", border: "var(--border-card)" },
    warning: { bg: "#FFFBEB", border: "#FDE68A" },
    tip: { bg: "var(--blue-50)", border: "var(--blue-100)" },
  };
  const { bg, border } = backgrounds[tone];

  return (
    <Card padding={22} radius="var(--radius-2xl)" style={{ marginBottom: 16, background: bg, border: `1px solid ${border}`, boxShadow: "none" }}>
      <h2 className="font-display" style={{ fontSize: 17, fontWeight: 900, margin: "0 0 12px", color: "var(--ink-900)", letterSpacing: "-.2px" }}>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.65 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.65 }}>
          {item}
        </li>
      ))}
    </ol>
  );
}

function StepLoading() {
  return (
    <AppChrome>
      <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 500 }}>Loading FAFSA step...</p>
    </AppChrome>
  );
}

export default function FafsaStepClient() {
  const router = useRouter();
  const params = useParams();
  const rawPlanKey = typeof params.planKey === "string" ? params.planKey : "";
  const planKey = parseFafsaStepPlanKey(rawPlanKey);

  const { loading, authReady, tasks, fafsaDemoMode, updateTaskStatus } = useUserData();
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const step = useMemo(() => resolveFafsaStep(planKey, tasks ?? []), [planKey, tasks]);

  const isComplete = step?.status ? isAidTaskComplete(step.status) : false;

  if (!authReady && loading) {
    return <StepLoading />;
  }

  if (loading) {
    return <StepLoading />;
  }

  async function handleMarkComplete() {
    if (!step?.task?.id || isComplete) return;
    setError("");
    setUpdating(true);
    try {
      await updateTaskStatus(step.task.id, "Complete");
      if (step.nextStep) {
        router.push(fafsaStepHref(step.nextStep.planKey));
      }
    } catch (err) {
      setError(friendlyActionError(err, "Could not mark this step complete. Please try again."));
    } finally {
      setUpdating(false);
    }
  }

  async function handleStatusChange(status: string) {
    if (!step?.task?.id) return;
    setError("");
    setUpdating(true);
    try {
      await updateTaskStatus(step.task.id, status);
    } catch (err) {
      setError(friendlyActionError(err, "Could not update this step. Please try again."));
    } finally {
      setUpdating(false);
    }
  }

  if (!step) {
    return (
      <AppChrome>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <Card variant="clay" padding={28} style={{ textAlign: "center" }}>
            <PageEmptyState
              title="Step guide not found"
              description="This FAFSA step does not have a guide yet. Head back to your plan and pick another step."
            />
            <div style={{ marginTop: 8 }}>
              <Link href="/fafsa" style={{ textDecoration: "none" }}>
                <Button variant="clay">Back to FAFSA plan</Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome>
      {fafsaDemoMode && <FafsaDemoBanner />}

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/fafsa" style={{ textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
          <Button variant="ghost" size="sm" iconLeft="chevron-left" style={{ paddingLeft: 4 }}>
            Back to FAFSA plan
          </Button>
        </Link>

        <Card
          variant="clay"
          padding={24}
          style={{ marginBottom: 20, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--blue-50) 150%)" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <Badge tone="blue">{step.stage}</Badge>
            {step.stepNumber && step.totalSteps && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)" }}>
                Mission {step.stepNumber} of {step.totalSteps}
              </span>
            )}
            {step.status ? (
              <Badge tone={statusToTone(step.status)}>{step.status}</Badge>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)" }}>Guide only - not in your plan yet</span>
            )}
            {step.source === "static" && step.task === null && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)" }}>General guide</span>
            )}
          </div>

          <h1
            className="font-display"
            style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.6px", margin: "0 0 10px", color: "var(--ink-900)", lineHeight: 1.2 }}
          >
            {step.title}
          </h1>

          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.65 }}>
            AidPilot tracks your readiness - you complete the real FAFSA on StudentAid.gov. Never enter SSNs, passwords, or tax numbers here.
          </p>

          {step.blockingReason && !isComplete && (
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--amber-600)", margin: "12px 0 0", lineHeight: 1.5 }}>
              Blocker: {step.blockingReason}
            </p>
          )}
        </Card>

        {error && <p style={{ color: "var(--coral-600)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{error}</p>}

        <GuideSection title="Why this matters">
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-700)", margin: 0, lineHeight: 1.7 }}>
            {step.whyItMatters}
          </p>
        </GuideSection>

        <GuideSection title="What you need before starting">
          <BulletList items={step.beforeYouStart} />
        </GuideSection>

        <GuideSection title="Exact instructions" tone="tip">
          <NumberedList items={step.instructions} />
          {step.actionUrl && (
            <p style={{ margin: "16px 0 0" }}>
              <a
                href={step.actionUrl}
                target={step.actionUrl.startsWith("http") ? "_blank" : undefined}
                rel={step.actionUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{ fontSize: 14, fontWeight: 700, color: "var(--blue-700)", textDecoration: "none" }}
              >
                Open official resource →
              </a>
            </p>
          )}
        </GuideSection>

        <GuideSection title="Common mistakes">
          <BulletList items={step.commonMistakes} />
        </GuideSection>

        <GuideSection title="What to do if you're stuck">
          <BulletList items={step.ifStuck} />
        </GuideSection>

        <GuideSection title="Privacy reminder" tone="warning">
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.7 }}>
            {step.privacyReminder}
          </p>
        </GuideSection>

        <Card variant="clay" padding={22} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {step.task?.id && !isComplete && (
              <Button
                onClick={() => void handleMarkComplete()}
                disabled={updating}
                variant="primary"
                iconLeft="check"
                style={{ backgroundColor: "var(--green-600)" }}
              >
                {updating ? "Saving..." : "Mark complete"}
              </Button>
            )}
            {step.task?.id && isComplete && (
              <Badge tone="green" icon="check">You marked this step complete</Badge>
            )}
            <Link href="/fafsa" style={{ textDecoration: "none" }}>
              <Button variant="secondary" shape="pill">Back to FAFSA plan</Button>
            </Link>
            {step.nextStep && (
              <Link href={fafsaStepHref(step.nextStep.planKey)} style={{ textDecoration: "none" }}>
                <Button variant="clay" iconRight="arrow-right">Next step: {step.nextStep.title}</Button>
              </Link>
            )}
          </div>

          {step.task?.id && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-card)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)", marginBottom: 10 }}>Update status manually</div>
              <Select
                value={step.status ?? "Upcoming"}
                disabled={updating}
                onChange={(e) => void handleStatusChange(e.target.value)}
                options={PLAN_STATUSES as unknown as string[]}
                style={{ maxWidth: 280 }}
              />
            </div>
          )}

          {!step.task?.id && (
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", margin: "14px 0 0", lineHeight: 1.55 }}>
              This guide is available even when the step is not in your saved plan. Run the FAFSA readiness wizard to add it to your checklist.
            </p>
          )}
        </Card>
      </div>
    </AppChrome>
  );
}
