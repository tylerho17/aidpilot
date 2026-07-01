"use client";

import Link from "next/link";
import { useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, ProgressBar, Select, StatusPanel } from "@/components/ui";
import { Greeting, money } from "@/components/app/screens/shared";
import { PageEmptyState, friendlyActionError, runSafe } from "@/components/product/PageSafety";
import { FafsaDemoBanner } from "@/components/product/FafsaDemoBanner";
import { useUserData } from "@/hooks/useUserData";
import { isAidTaskComplete, statusToTone } from "@/lib/data-helpers";
import {
  getFafsaPlanProgress,
  getFafsaPlanTasks,
  groupFafsaPlanByStage,
} from "@/lib/fafsa-plan";
import { fafsaStepHref } from "@/lib/fafsa-step-url";
import { normalizeRequiredInfo } from "@/lib/required-info";

const PLAN_STATUSES = ["Upcoming", "Due Soon", "Complete"] as const;

function FafsaLoading() {
  return (
    <AppChrome>
      <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 500 }}>Loading your FAFSA plan...</p>
    </AppChrome>
  );
}

export default function FafsaClient() {
  const { loading, authReady, loadError, fafsaIntake, fafsaDemoMode, tasks, updateTaskStatus } = useUserData();
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!authReady && loading) {
    return <FafsaLoading />;
  }

  const { data: planView, error: planError } = runSafe(
    "Fafsa",
    () => ({
      planTasks: getFafsaPlanTasks(tasks ?? []),
      progress: getFafsaPlanProgress(tasks ?? []),
      grouped: groupFafsaPlanByStage(tasks ?? []),
    }),
    { planTasks: [], progress: 0, grouped: [] }
  );

  const { planTasks, progress, grouped } = planView;

  async function handleStatusChange(taskId: string, status: string) {
    setError("");
    setUpdatingId(taskId);
    try {
      await updateTaskStatus(taskId, status);
    } catch (err) {
      setError(friendlyActionError(err, "Could not update this step. Please try again."));
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <FafsaLoading />;
  }

  if (!fafsaIntake || planTasks.length === 0) {
    return (
      <AppChrome>
        <Greeting
          title="FAFSA Plan"
          subtitle="Build a personalized FAFSA plan in about 3 minutes. AidPilot organizes your next steps but does not submit FAFSA for you."
        />
        <Card variant="clay" padding={28} style={{ textAlign: "center" }}>
          <PageEmptyState
            title="Let's build your FAFSA plan"
            description="Answer a few readiness questions and AidPilot will create a step-by-step plan with stages, blockers, and next actions."
          />
          <div style={{ marginTop: 8 }}>
            <Link href="/fafsa/readiness" style={{ textDecoration: "none" }}>
              <Button variant="clay" iconRight="arrow-right">Start FAFSA Readiness Wizard</Button>
            </Link>
          </div>
        </Card>
      </AppChrome>
    );
  }

  const bannerError = loadError ?? planError;

  return (
    <AppChrome>
      {bannerError && (
        <StatusPanel tone="coral" icon="shield" title="Something needs your attention" style={{ marginBottom: 22 }}>
          {bannerError}
        </StatusPanel>
      )}
      {fafsaDemoMode && <FafsaDemoBanner />}

      <Greeting
        title="Your FAFSA plan"
        subtitle={`Aid year ${fafsaIntake.aid_year} · ${fafsaIntake.student_situation}. Complete each step on StudentAid.gov - AidPilot tracks progress only.`}
      />

      <StatusPanel
        tone="amber"
        icon="shield-check"
        eyebrow="Official channels only"
        title="Complete FAFSA on StudentAid.gov"
        style={{ marginBottom: 22 }}
      >
        FAFSA must be completed through official StudentAid.gov channels. AidPilot does not collect SSNs, passwords, or
        tax return numbers.
      </StatusPanel>

      {error && <p style={{ color: "var(--coral-600)", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{error}</p>}

      <Card variant="clay" padding={24} style={{ marginBottom: 22, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--blue-50) 150%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <span className="font-display" style={{ fontSize: 19, fontWeight: 900, color: "var(--ink-900)", letterSpacing: "-.3px" }}>
            Plan progress
          </span>
          <span style={{ ...money, fontSize: 34, color: "var(--blue-700)" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} height={12} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/fafsa/readiness" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" shape="pill">
              Update readiness answers
            </Button>
          </Link>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {grouped.length === 0 ? (
          <PageEmptyState
            title="No FAFSA plan steps yet"
            description="Complete the FAFSA Readiness Wizard to generate your personalized plan."
          />
        ) : (
          grouped.map(({ stage, tasks: stageTasks }) => (
            <Card key={stage} variant="clay" padding={26}>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: "var(--ink-900)", letterSpacing: "-.3px" }}>
                {stage}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stageTasks.map((task) => {
                  const complete = isAidTaskComplete(task.status);
                  const requiredInfo = normalizeRequiredInfo(task.required_info);
                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 14,
                        border: complete ? "1px solid var(--green-200)" : "1px solid var(--border-card)",
                        background: complete ? "var(--green-50, #F5FBF7)" : "var(--surface-card)",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                        {task.plan_key ? (
                          <Link
                            href={fafsaStepHref(task.plan_key)}
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "var(--ink-900)",
                              textDecoration: "none",
                              lineHeight: 1.4,
                              flex: 1,
                            }}
                          >
                            {task.title}
                          </Link>
                        ) : (
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-900)", flex: 1 }}>{task.title}</div>
                        )}
                        <Badge tone={statusToTone(task.status)}>{task.status}</Badge>
                      </div>
                      {task.why_it_matters && (
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-700)", margin: "0 0 6px", lineHeight: 1.55 }}>
                          Why it matters: {task.why_it_matters}
                        </p>
                      )}
                      {task.instructions && (
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 6px", lineHeight: 1.55 }}>
                          Next step: {task.instructions}
                        </p>
                      )}
                      {requiredInfo && (
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", margin: "0 0 8px", lineHeight: 1.5 }}>
                          You need: {requiredInfo}
                        </p>
                      )}
                      {task.blocking_reason && !complete && (
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--amber-600)", margin: "0 0 8px" }}>
                          Blocker: {task.blocking_reason}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                        {task.plan_key && (
                          <Link href={fafsaStepHref(task.plan_key)} style={{ textDecoration: "none" }}>
                            <Button variant="clay" size="sm" shape="pill" iconRight="arrow-right">
                              Open mission guide
                            </Button>
                          </Link>
                        )}
                        {task.action_url && (
                          <a
                            href={task.action_url}
                            target={task.action_url.startsWith("http") ? "_blank" : undefined}
                            rel={task.action_url.startsWith("http") ? "noopener noreferrer" : undefined}
                            style={{ fontSize: 12, fontWeight: 700, color: "var(--blue-700)", textDecoration: "none" }}
                          >
                            Open resource →
                          </a>
                        )}
                        <Select
                          value={task.status}
                          disabled={updatingId === task.id}
                          onChange={(e) => void handleStatusChange(task.id, e.target.value)}
                          options={PLAN_STATUSES as unknown as string[]}
                          style={{ marginLeft: "auto", minWidth: 150 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "var(--blue-700)", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppChrome>
  );
}
