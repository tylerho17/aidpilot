"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, ProgressBar } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import type { FafsaWorkflowStep, UserFafsaStep } from "@/lib/types";

const STEP_STATUSES = ["not_started", "in_progress", "completed"] as const;

function formatStepStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stepStatusTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  if (status === "completed") return "green";
  if (status === "in_progress") return "amber";
  return "gray";
}

function getMergedSteps(workflowSteps: FafsaWorkflowStep[], userSteps: UserFafsaStep[]) {
  const byWorkflowId = new Map(userSteps.map((s) => [s.workflow_step_id, s]));
  return workflowSteps.map((step) => ({
    workflow: step,
    userStep: byWorkflowId.get(step.id) ?? null,
  }));
}

export default function FafsaClient() {
  const {
    loading,
    workflowSteps,
    userFafsaSteps,
    updateFafsaStepStatus,
    updateFafsaStepByWorkflowId,
    ensureUserFafsaSteps,
    loadData,
  } = useUserData();
  const [seeding, setSeeding] = useState(false);
  const [stepError, setStepError] = useState("");
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && workflowSteps.length > 0 && userFafsaSteps.length < workflowSteps.length) {
      void ensureUserFafsaSteps();
    }
  }, [loading, workflowSteps.length, userFafsaSteps.length, ensureUserFafsaSteps]);

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading FAFSA workflow...</p>
      </AppShell>
    );
  }

  const merged = getMergedSteps(workflowSteps, userFafsaSteps);
  const completed = merged.filter((m) => (m.userStep?.status ?? "not_started") === "completed").length;
  const progress = merged.length ? Math.round((completed / merged.length) * 100) : 0;

  async function handleCheckAgain() {
    setSeeding(true);
    setStepError("");
    try {
      await loadData();
      await ensureUserFafsaSteps();
    } catch (err) {
      console.error("Failed to refresh FAFSA workflow:", err);
      setStepError("Could not refresh FAFSA steps. Please try again.");
    } finally {
      setSeeding(false);
    }
  }

  async function handleStatusChange(workflowStepId: string, userStepId: string | null, status: string) {
    setStepError("");
    setUpdatingStepId(workflowStepId);
    try {
      if (userStepId) {
        await updateFafsaStepStatus(userStepId, status);
      } else {
        await updateFafsaStepByWorkflowId(workflowStepId, status);
      }
    } catch (err) {
      console.error("Failed to update FAFSA step:", err);
      setStepError(err instanceof Error ? err.message : "Could not update step status. Please try again.");
    } finally {
      setUpdatingStepId(null);
    }
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          FAFSA Workflow
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track your FAFSA progress step by step. AidPilot organizes your process but does not submit FAFSA for you.
        </p>
      </div>

      <ProductCard style={{ padding: 22, marginBottom: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
          AidPilot helps you organize your FAFSA process, but FAFSA must be completed through official StudentAid.gov channels.
        </p>
      </ProductCard>

      {stepError && (
        <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{stepError}</p>
      )}

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Workflow progress</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} color="linear-gradient(90deg,#0B5CAD,#37A0E0)" />
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", margin: "12px 0 0" }}>
          {completed} of {merged.length || 12} steps completed
        </p>
      </ProductCard>

      {workflowSteps.length === 0 ? (
        <ProductCard style={{ padding: 28, textAlign: "center" }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
            FAFSA workflow not available yet
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 8px", lineHeight: 1.6 }}>
            Global FAFSA steps have not been loaded into your database.
          </p>
          <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.6 }}>
            Run <code style={{ fontSize: 12, background: "#F3F4F6", padding: "2px 6px", borderRadius: 4 }}>supabase/005_seed_global_intelligence_data.sql</code> in the Supabase SQL Editor.
          </p>
          <button type="button" onClick={() => handleCheckAgain()} disabled={seeding} style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: seeding ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {seeding ? "Checking..." : "Check again"}
          </button>
        </ProductCard>
      ) : (
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Your FAFSA steps</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {merged.map(({ workflow, userStep }) => {
              const status = userStep?.status ?? "not_started";
              return (
                <div key={workflow.id} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #EAEEF3", background: status === "completed" ? "#F5FBF7" : "#fff" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>Step {workflow.step_order}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E" }}>{workflow.title}</div>
                    </div>
                    <PillBadge tone={stepStatusTone(status)}>{formatStepStatus(status)}</PillBadge>
                  </div>
                  {workflow.description && (
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 10px", lineHeight: 1.55 }}>{workflow.description}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {workflow.category && <span style={{ fontSize: 11, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "4px 10px", borderRadius: 999 }}>{workflow.category}</span>}
                    {workflow.source_url && (
                      <a href={workflow.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#0B5CAD" }}>
                        Official resource
                      </a>
                    )}
                    <select
                      value={status}
                      disabled={updatingStepId === workflow.id}
                      onChange={(e) => handleStatusChange(workflow.id, userStep?.id ?? null, e.target.value)}
                      style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 10px", fontFamily: "inherit", background: "#fff", marginLeft: "auto" }}
                    >
                      {STEP_STATUSES.map((s) => (
                        <option key={s} value={s}>{formatStepStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </ProductCard>
      )}

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppShell>
  );
}
