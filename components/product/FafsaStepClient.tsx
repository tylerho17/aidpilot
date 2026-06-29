"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard } from "@/components/ProductUI";
import { FafsaDemoBanner } from "@/components/product/FafsaDemoBanner";
import { PageEmptyState, PageLoading, friendlyActionError } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import { isAidTaskComplete, statusToTone } from "@/lib/data-helpers";
import { resolveFafsaStep } from "@/lib/fafsa-step-resolve";
import { fafsaStepHref, parseFafsaStepPlanKey } from "@/lib/fafsa-step-url";

const PLAN_STATUSES = ["Upcoming", "Due Soon", "Complete"] as const;

const primaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "12px 22px",
  borderRadius: 13,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 10px 20px rgba(11,92,173,.22)",
};

const secondaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "12px 22px",
  borderRadius: 13,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const completeBtn: CSSProperties = {
  ...primaryBtn,
  background: "#15885A",
  boxShadow: "0 10px 20px rgba(21,136,90,.22)",
};

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
    default: { bg: "#fff", border: "#EAEEF3" },
    warning: { bg: "#FFFBEB", border: "#FDE68A" },
    tip: { bg: "#F0F9FF", border: "#BAE6FD" },
  };
  const { bg, border } = backgrounds[tone];

  return (
    <ProductCard style={{ padding: 22, marginBottom: 16, background: bg, border: `1px solid ${border}` }}>
      <h2 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: "#15212E" }}>
        {title}
      </h2>
      {children}
    </ProductCard>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "#4B5563", lineHeight: 1.65 }}>
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
        <li key={`${index}-${item.slice(0, 24)}`} style={{ fontSize: 14, fontWeight: 500, color: "#374151", lineHeight: 1.65 }}>
          {item}
        </li>
      ))}
    </ol>
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
    return <PageLoading message="Loading FAFSA step..." />;
  }

  if (loading) {
    return <PageLoading message="Loading FAFSA step..." />;
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
      <AppShell>
        <ProductCard style={{ padding: 28 }}>
          <PageEmptyState
            title="Step guide not found"
            description="This FAFSA step does not have a guide yet. Head back to your plan and pick another step."
          />
          <Link href="/fafsa" style={{ ...primaryBtn, marginTop: 8 }}>
            Back to FAFSA plan
          </Link>
        </ProductCard>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {fafsaDemoMode && <FafsaDemoBanner />}

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/fafsa"
          style={{ display: "inline-flex", fontSize: 13, fontWeight: 700, color: "#0B5CAD", textDecoration: "none", marginBottom: 16 }}
        >
          ← Back to FAFSA plan
        </Link>

        <ProductCard
          style={{
            padding: 24,
            marginBottom: 20,
            background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)",
            border: "1px solid #D7E7FB",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <PillBadge tone="blue">{step.stage}</PillBadge>
            {step.stepNumber && step.totalSteps && (
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280" }}>
                Mission {step.stepNumber} of {step.totalSteps}
              </span>
            )}
            {step.status ? (
              <PillBadge tone={statusToTone(step.status)}>{step.status}</PillBadge>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Guide only — not in your plan yet</span>
            )}
            {step.source === "static" && step.task === null && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>General guide</span>
            )}
          </div>

          <h1
            className="font-display"
            style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.6px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.2 }}
          >
            {step.title}
          </h1>

          <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>
            AidPilot tracks your readiness — you complete the real FAFSA on StudentAid.gov. Never enter SSNs, passwords, or tax numbers here.
          </p>

          {step.blockingReason && !isComplete && (
            <p style={{ fontSize: 13, fontWeight: 700, color: "#B7791F", margin: "12px 0 0", lineHeight: 1.5 }}>
              Blocker: {step.blockingReason}
            </p>
          )}
        </ProductCard>

        {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{error}</p>}

        <GuideSection title="Why this matters">
          <p style={{ fontSize: 15, fontWeight: 500, color: "#4B5563", margin: 0, lineHeight: 1.7 }}>
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
                style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}
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

        <ProductCard style={{ padding: 22, marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {step.task?.id && !isComplete && (
              <button type="button" onClick={() => void handleMarkComplete()} disabled={updating} style={completeBtn}>
                {updating ? "Saving..." : "Mark complete"}
              </button>
            )}
            {step.task?.id && isComplete && (
              <span style={{ fontSize: 14, fontWeight: 700, color: "#15885A" }}>✓ You marked this step complete</span>
            )}
            <Link href="/fafsa" style={secondaryBtn}>
              Back to FAFSA plan
            </Link>
            {step.nextStep && (
              <Link href={fafsaStepHref(step.nextStep.planKey)} style={primaryBtn}>
                Next step: {step.nextStep.title} →
              </Link>
            )}
          </div>

          {step.task?.id && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #EAEEF3" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 10 }}>Update status manually</div>
              <select
                value={step.status ?? "Upcoming"}
                disabled={updating}
                onChange={(e) => void handleStatusChange(e.target.value)}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  padding: "10px 14px",
                  fontFamily: "inherit",
                  background: "#fff",
                  width: "100%",
                  maxWidth: 280,
                }}
              >
                {PLAN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!step.task?.id && (
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "14px 0 0", lineHeight: 1.55 }}>
              This guide is available even when the step is not in your saved plan. Run the FAFSA readiness wizard to add it to your checklist.
            </p>
          )}
        </ProductCard>
      </div>
    </AppShell>
  );
}
