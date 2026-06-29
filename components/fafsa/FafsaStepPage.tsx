"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard } from "@/components/ProductUI";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { FafsaSyncBanner } from "@/components/fafsa/FafsaSyncBanner";
import {
  getFafsaStepHref,
  getOfficialStudentAidUrl,
  type FafsaStep,
  type FafsaRiskLevel,
} from "@/lib/fafsa/steps";

const focusRing = "0 0 0 3px rgba(11,92,173,.35)";

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
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 10px 20px rgba(11,92,173,.22)",
} as const;

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  fontSize: 14,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "10px 18px",
  borderRadius: 999,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

function riskTone(risk: FafsaRiskLevel): "green" | "amber" | "coral" {
  if (risk === "low") return "green";
  if (risk === "medium") return "amber";
  return "coral";
}

function riskLabel(risk: FafsaRiskLevel): string {
  if (risk === "low") return "Low risk if delayed";
  if (risk === "medium") return "Medium priority";
  return "High priority";
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section aria-labelledby={id} style={{ marginBottom: 22 }}>
      <h2
        id={id}
        className="font-display"
        style={{ fontSize: 17, fontWeight: 800, margin: "0 0 10px", color: "#15212E" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "#374151", lineHeight: 1.6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

type FafsaStepPageProps = {
  step: FafsaStep;
};

export default function FafsaStepPage({ step }: FafsaStepPageProps) {
  const router = useRouter();
  const { isCompleted, markComplete, markIncomplete, syncMessage } = useFafsaProgress();
  const [saving, setSaving] = useState(false);
  const complete = isCompleted(step.planKey);
  const officialUrl = getOfficialStudentAidUrl(step);

  function handleToggleComplete() {
    setSaving(true);
    try {
      if (complete) {
        markIncomplete(step.planKey);
      } else {
        markComplete(step.planKey);
        if (step.nextPlanKey) {
          router.push(getFafsaStepHref(step.nextPlanKey));
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/fafsa"
          style={{
            display: "inline-flex",
            fontSize: 14,
            fontWeight: 600,
            color: "#0B5CAD",
            textDecoration: "none",
            marginBottom: 18,
            minHeight: 44,
            alignItems: "center",
          }}
        >
          ← Back to FAFSA plan
        </Link>

        {syncMessage && <FafsaSyncBanner message={syncMessage} />}

        <ProductCard
          style={{
            padding: 24,
            marginBottom: 20,
            background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)",
            border: "1px solid #D7E7FB",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <PillBadge tone="blue">Step {step.stepNumber} of 9</PillBadge>
            <PillBadge tone={riskTone(step.riskLevel)}>{riskLabel(step.riskLevel)}</PillBadge>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>{step.estimatedTime}</span>
            {complete && <PillBadge tone="green">Complete</PillBadge>}
          </div>

          <h1
            className="font-display"
            style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.6px", margin: "0 0 8px", color: "#15212E", lineHeight: 1.2 }}
          >
            {step.title}
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 12px", lineHeight: 1.65 }}>
            {step.subtitle}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#5B6573", margin: 0, lineHeight: 1.6 }}>
            Who is involved: {step.whoIsInvolved}
          </p>
        </ProductCard>

        <ProductCard style={{ padding: 24, marginBottom: 20 }}>
          <Section title="Why this matters" id="why-it-matters">
            <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.65 }}>
              {step.whyItMatters}
            </p>
          </Section>

          <Section title="What you need" id="what-you-need">
            <BulletList items={step.whatYouNeed} />
          </Section>

          <Section title="Exact instructions" id="exact-instructions">
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {step.exactInstructions.map((item, index) => (
                <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "#374151", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: "#0B5CAD", marginRight: 6 }}>{index + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Common mistakes" id="common-mistakes">
            <BulletList items={step.commonMistakes} />
          </Section>

          <Section title="Troubleshooting" id="troubleshooting">
            <BulletList items={step.troubleshooting} />
          </Section>

          <Section title="Privacy reminder" id="privacy-reminder">
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>
              {step.privacyReminder}
            </p>
          </Section>

          <ProductCard style={{ padding: 16, background: "#F9FAFB", border: "1px solid #EAEEF3", marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6573", margin: 0, lineHeight: 1.6 }}>
              Official-site reminder: Complete sensitive FAFSA actions only on StudentAid.gov or your school&apos;s
              official portal — not in AidPilot.
            </p>
          </ProductCard>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            {officialUrl.startsWith("http") ? (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={primaryBtn}
                aria-label={`${step.primaryCtaLabel} (opens StudentAid.gov in a new tab)`}
              >
                {step.primaryCtaLabel} ↗
              </a>
            ) : (
              <Link href={officialUrl} style={primaryBtn}>
                {step.primaryCtaLabel}
              </Link>
            )}

            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={saving}
              style={{
                ...primaryBtn,
                background: complete ? "#6B7280" : "#15885A",
                boxShadow: complete ? "none" : "0 10px 20px rgba(21,136,90,.22)",
              }}
              aria-pressed={complete}
              onFocus={(e) => {
                e.currentTarget.style.outline = "none";
                e.currentTarget.style.boxShadow = focusRing;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = complete ? "none" : "0 10px 20px rgba(21,136,90,.22)";
              }}
            >
              {saving ? "Saving..." : complete ? "Mark incomplete" : "Mark step complete"}
            </button>
          </div>

          <nav aria-label="Step navigation" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {step.previousPlanKey ? (
              <Link href={getFafsaStepHref(step.previousPlanKey)} style={secondaryBtn}>
                ← Previous step
              </Link>
            ) : null}
            {step.nextPlanKey ? (
              <Link href={getFafsaStepHref(step.nextPlanKey)} style={secondaryBtn}>
                Next step →
              </Link>
            ) : (
              <Link href="/fafsa" style={secondaryBtn}>
                Back to FAFSA home
              </Link>
            )}
          </nav>
        </ProductCard>
      </div>
    </AppShell>
  );
}
