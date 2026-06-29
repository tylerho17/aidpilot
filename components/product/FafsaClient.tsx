"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, ProgressBar } from "@/components/ProductUI";
import { PageErrorBanner, PageEmptyState, PageLoading, friendlyActionError, runSafe } from "@/components/product/PageSafety";
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

export default function FafsaClient() {
  const { loading, authReady, loadError, fafsaIntake, fafsaDemoMode, tasks, updateTaskStatus } = useUserData();
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!authReady && loading) {
    return <PageLoading message="Loading your FAFSA plan..." />;
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
    return <PageLoading message="Loading your FAFSA plan..." />;
  }

  if (!fafsaIntake || planTasks.length === 0) {
    return (
      <AppShell>
        <div style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
            FAFSA Plan
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Build a personalized FAFSA plan in about 3 minutes. AidPilot organizes your next steps but does not submit FAFSA for you.
          </p>
        </div>
        <ProductCard style={{ padding: 28, textAlign: "center" }}>
          <PageEmptyState
            title="Let's build your FAFSA plan"
            description="Answer a few readiness questions and AidPilot will create a step-by-step plan with stages, blockers, and next actions."
          />
          <Link
            href="/fafsa/readiness"
            style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}
          >
            Start FAFSA Readiness Wizard
          </Link>
        </ProductCard>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageErrorBanner message={loadError ?? planError} />
      {fafsaDemoMode && <FafsaDemoBanner />}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Your FAFSA plan
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Aid year {fafsaIntake.aid_year} · {fafsaIntake.student_situation}. Complete each step on StudentAid.gov — AidPilot tracks progress only.
        </p>
      </div>

      <ProductCard style={{ padding: 22, marginBottom: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
          FAFSA must be completed through official StudentAid.gov channels. AidPilot does not collect SSNs, passwords, or tax return numbers.
        </p>
      </ProductCard>

      {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Plan progress</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} color="linear-gradient(90deg,#0B5CAD,#37A0E0)" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/fafsa/readiness" style={{ fontSize: 13, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "8px 14px", borderRadius: 999, textDecoration: "none" }}>
            Update readiness answers
          </Link>
        </div>
      </ProductCard>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {grouped.length === 0 ? (
          <PageEmptyState
            title="No FAFSA plan steps yet"
            description="Complete the FAFSA Readiness Wizard to generate your personalized plan."
          />
        ) : (
        grouped.map(({ stage, tasks: stageTasks }) => (
          <ProductCard key={stage} style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>
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
                      border: complete ? "1px solid #BBF7D0" : "1px solid #EAEEF3",
                      background: complete ? "#F5FBF7" : "#fff",
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
                            color: "#15212E",
                            textDecoration: "none",
                            lineHeight: 1.4,
                            flex: 1,
                          }}
                        >
                          {task.title}
                        </Link>
                      ) : (
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E", flex: 1 }}>{task.title}</div>
                      )}
                      <PillBadge tone={statusToTone(task.status)}>{task.status}</PillBadge>
                    </div>
                    {task.why_it_matters && (
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6573", margin: "0 0 6px", lineHeight: 1.55 }}>
                        Why it matters: {task.why_it_matters}
                      </p>
                    )}
                    {task.instructions && (
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 6px", lineHeight: 1.55 }}>
                        Next step: {task.instructions}
                      </p>
                    )}
                    {requiredInfo && (
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2", margin: "0 0 8px", lineHeight: 1.5 }}>
                        You need: {requiredInfo}
                      </p>
                    )}
                    {task.blocking_reason && !complete && (
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#B7791F", margin: "0 0 8px" }}>
                        Blocker: {task.blocking_reason}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                      {task.plan_key && (
                        <Link
                          href={fafsaStepHref(task.plan_key)}
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                            background: "#0B5CAD",
                            padding: "8px 14px",
                            borderRadius: 999,
                            textDecoration: "none",
                          }}
                        >
                          Open mission guide →
                        </Link>
                      )}
                      {task.action_url && (
                        <a
                          href={task.action_url}
                          target={task.action_url.startsWith("http") ? "_blank" : undefined}
                          rel={task.action_url.startsWith("http") ? "noopener noreferrer" : undefined}
                          style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}
                        >
                          Open resource →
                        </a>
                      )}
                      <select
                        value={task.status}
                        disabled={updatingId === task.id}
                        onChange={(e) => void handleStatusChange(task.id, e.target.value)}
                        style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "6px 10px", fontFamily: "inherit", background: "#fff", marginLeft: "auto" }}
                      >
                        {PLAN_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </ProductCard>
        ))
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppShell>
  );
}
