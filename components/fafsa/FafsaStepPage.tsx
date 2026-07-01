"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, StatusPanel } from "@/components/ui";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { FafsaSyncBanner } from "@/components/fafsa/FafsaSyncBanner";
import {
  getFafsaStepHref,
  getFollowUpTrackerHref,
  getOfficialStudentAidUrl,
  type FafsaStep,
  type FafsaRiskLevel,
} from "@/lib/fafsa/steps";

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
        style={{ fontSize: 17, fontWeight: 900, margin: "0 0 10px", color: "var(--ink-900)", letterSpacing: "-.2px" }}
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
        <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.6 }}>
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
    <AppChrome>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/fafsa" style={{ textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
          <Button variant="ghost" size="sm" iconLeft="chevron-left" style={{ paddingLeft: 4 }}>
            Back to FAFSA plan
          </Button>
        </Link>

        {syncMessage && <FafsaSyncBanner message={syncMessage} />}

        <Card
          variant="clay"
          padding={24}
          style={{ marginBottom: 20, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--blue-50) 150%)" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <Badge tone="blue">Step {step.stepNumber} of 9</Badge>
            <Badge tone={riskTone(step.riskLevel)}>{riskLabel(step.riskLevel)}</Badge>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>{step.estimatedTime}</span>
            {complete && <Badge tone="green" icon="check">Complete</Badge>}
          </div>

          <h1
            className="font-display"
            style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.6px", margin: "0 0 8px", color: "var(--ink-900)", lineHeight: 1.2 }}
          >
            {step.title}
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 12px", lineHeight: 1.65 }}>
            {step.subtitle}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-700)", margin: 0, lineHeight: 1.6 }}>
            Who is involved: {step.whoIsInvolved}
          </p>
        </Card>

        <Card variant="clay" padding={24} style={{ marginBottom: 20 }}>
          <Section title="Why this matters" id="why-it-matters">
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", margin: 0, lineHeight: 1.65 }}>
              {step.whyItMatters}
            </p>
          </Section>

          <Section title="What you need" id="what-you-need">
            <BulletList items={step.whatYouNeed} />
          </Section>

          <Section title="Exact instructions" id="exact-instructions">
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {step.exactInstructions.map((item, index) => (
                <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 800, color: "var(--blue-700)", marginRight: 6 }}>{index + 1}.</span>
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
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.65 }}>
              {step.privacyReminder}
            </p>
          </Section>

          <StatusPanel
            tone="amber"
            icon="shield-check"
            eyebrow="Official-site reminder"
            title="Do sensitive FAFSA actions on official sites only"
            style={{ marginBottom: 20 }}
          >
            Complete sensitive FAFSA actions only on StudentAid.gov or your school&apos;s official portal - not in
            AidPilot.
          </StatusPanel>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            {officialUrl.startsWith("http") ? (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                aria-label={`${step.primaryCtaLabel} (opens StudentAid.gov in a new tab)`}
              >
                <Button variant="clay" iconRight="arrow-right">
                  {step.primaryCtaLabel}
                </Button>
              </a>
            ) : (
              <Link href={officialUrl} style={{ textDecoration: "none" }}>
                <Button variant="clay">{step.primaryCtaLabel}</Button>
              </Link>
            )}

            {step.followUpCtaLabel ? (
              <Link href={getFollowUpTrackerHref()} style={{ textDecoration: "none" }}>
                <Button variant="secondary" shape="pill">
                  {step.followUpCtaLabel}
                </Button>
              </Link>
            ) : null}

            {step.aidDecoderCtaLabel ? (
              <Link href="/aid-letter" style={{ textDecoration: "none" }}>
                <Button variant="secondary" shape="pill">
                  {step.aidDecoderCtaLabel}
                </Button>
              </Link>
            ) : null}

            <Button
              onClick={handleToggleComplete}
              disabled={saving}
              variant={complete ? "secondary" : "primary"}
              iconLeft={complete ? undefined : "check"}
              aria-pressed={complete}
              style={complete ? undefined : { backgroundColor: "var(--green-600)" }}
            >
              {saving ? "Saving..." : complete ? "Mark incomplete" : "Mark step complete"}
            </Button>
          </div>

          <nav aria-label="Step navigation" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {step.previousPlanKey ? (
              <Link href={getFafsaStepHref(step.previousPlanKey)} style={{ textDecoration: "none" }}>
                <Button variant="secondary" shape="pill" iconLeft="chevron-left">
                  Previous step
                </Button>
              </Link>
            ) : null}
            {step.nextPlanKey ? (
              <Link href={getFafsaStepHref(step.nextPlanKey)} style={{ textDecoration: "none" }}>
                <Button variant="secondary" shape="pill" iconRight="arrow-right">
                  Next step
                </Button>
              </Link>
            ) : (
              <Link href="/fafsa" style={{ textDecoration: "none" }}>
                <Button variant="secondary" shape="pill">
                  Back to FAFSA home
                </Button>
              </Link>
            )}
          </nav>
        </Card>
      </div>
    </AppChrome>
  );
}
