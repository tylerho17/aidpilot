"use client";

import Link from "next/link";
import { useState } from "react";
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
  const { loading, workflowSteps, userFafsaSteps, updateFafsaStepStatus, loadData } = useUserData();
  const [seeding, setSeeding] = useState(false);

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading FAFSA workflow...</p>
      </AppShell>
    );
  }

  const merged = getMergedSteps(workflowSteps, userFafsaSteps);
  const completed = merged.filter((m) => m.userStep?.status === "completed").length;
  const progress = merged.length ? Math.round((completed / merged.length) * 100) : 0;

  async function ensureSteps() {
    setSeeding(true);
    await loadData();
    setSeeding(false);
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

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Workflow progress</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} color="linear-gradient(90deg,#0B5CAD,#37A0E0)" />
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", margin: "12px 0 0" }}>
          {completed} of {merged.length} steps completed
        </p>
      </ProductCard>

      {workflowSteps.length === 0 ? (
        <ProductCard style={{ padding: 28, textAlign: "center" }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
            FAFSA workflow not available yet
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
            Global FAFSA steps have not been loaded into your database. Ask your project admin to run the global intelligence seed SQL in Supabase.
          </p>
          <button type="button" onClick={() => ensureSteps()} disabled={seeding} style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {seeding ? "Checking..." : "Check again"}
          </button>
        </ProductCard>
      ) : (
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 16px", color: "#15212E" }}>Your FAFSA steps</h2>
          {userFafsaSteps.length === 0 && (
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 14px" }}>
              Your personal step tracker is being set up. Refresh if steps do not appear.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {merged.map(({ workflow, userStep }) => (
              <div key={workflow.id} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #EAEEF3", background: userStep?.status === "completed" ? "#F5FBF7" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>Step {workflow.step_order}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E" }}>{workflow.title}</div>
                  </div>
                  {userStep && <PillBadge tone={stepStatusTone(userStep.status)}>{formatStepStatus(userStep.status)}</PillBadge>}
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
                  {userStep && (
                    <select
                      value={userStep.status}
                      onChange={(e) => updateFafsaStepStatus(userStep.id, e.target.value)}
                      style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 10px", fontFamily: "inherit", background: "#fff", marginLeft: "auto" }}
                    >
                      {STEP_STATUSES.map((status) => (
                        <option key={status} value={status}>{formatStepStatus(status)}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
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
