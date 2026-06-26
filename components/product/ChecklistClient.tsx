"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PillBadge, ProductCard, ProgressBar, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  formatDueDate,
  getAttentionCountFromTasks,
  getChecklistProgressFromTasks,
  getMissingDocumentCountFromDocs,
  getNextDeadlineFromTasks,
  documentStatusToTone,
  formatDocumentStatus,
  statusToTone,
} from "@/lib/data-helpers";
import type { AidTask, DocumentItem } from "@/lib/types";

const DOCUMENT_STATUSES = ["not_started", "needed", "submitted", "verified"] as const;
const TASK_STATUSES = ["not_started", "in_progress", "blocked", "complete"] as const;
const LEGACY_TASK_STATUSES = ["Missing", "Due Soon", "Needs Review", "Optional", "Upcoming", "Complete"] as const;

const STATUS_ORDER: Record<string, number> = {
  blocked: 0,
  Missing: 0,
  in_progress: 1,
  "Due Soon": 1,
  not_started: 2,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  complete: 5,
  Complete: 5,
};

function sortDbTasks(tasks: AidTask[]) {
  return [...tasks].sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));
}

function formatTaskStatus(status: string) {
  return status.replace(/_/g, " ");
}

function isTaskComplete(status: string) {
  return status === "complete" || status === "Complete";
}

export default function ChecklistClient() {
  const { loading, tasks, documents, updateTaskStatus, updateDocumentStatus } = useUserData();
  const [error, setError] = useState("");

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your checklist...</p>
      </AppShell>
    );
  }

  const progress = getChecklistProgressFromTasks(tasks);
  const attention = getAttentionCountFromTasks(tasks);
  const missingDocs = getMissingDocumentCountFromDocs(documents);
  const nextDeadline = getNextDeadlineFromTasks(tasks);
  const sortedDb = sortDbTasks(tasks);
  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))] as string[];

  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Aid Checklist
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track every step needed to protect your financial aid. Change any task status anytime.
        </p>
      </div>

      {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Progress" value={`${progress}% complete`} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Tasks" value={`${attention} need attention`} color="#B7791F" style={{ flex: "1 1 140px" }} />
        <StatCard label="Documents" value={`${missingDocs} missing`} color="#C04E57" style={{ flex: "1 1 140px" }} />
        <StatCard label="Next deadline" value={nextDeadline} color="#B7791F" style={{ flex: "1 1 140px" }} />
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Overall progress</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0B5CAD" }}>{progress}%</span>
        </div>
        <ProgressBar pct={progress} color="linear-gradient(90deg,#15885A,#37A877)" />
      </ProductCard>

      {categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {categories.map((cat) => {
            const catTasks = tasks.filter((t) => t.category === cat);
            const done = catTasks.filter((t) => isTaskComplete(t.status)).length;
            return (
              <span key={cat} style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "6px 12px", borderRadius: 999 }}>
                {cat} · {done}/{catTasks.length}
              </span>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "start" }}>
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>All checklist tasks</h2>
          {sortedDb.length === 0 ? (
            <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No tasks yet. Tasks appear as your aid plan is set up.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedDb.map((item) => (
                <TaskRow
                  key={item.id}
                  title={item.title}
                  description={item.description ?? ""}
                  status={item.status}
                  due={formatDueDate(item.due_date, item.status)}
                  category={item.category ?? ""}
                  priority={item.priority ?? "Medium"}
                  tone={statusToTone(item.status)}
                  action={
                    <select
                      value={[...TASK_STATUSES, ...LEGACY_TASK_STATUSES].includes(item.status as (typeof TASK_STATUSES)[number]) ? item.status : "not_started"}
                      onChange={async (e) => {
                        setError("");
                        try {
                          await updateTaskStatus(item.id, e.target.value);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Could not update task.");
                        }
                      }}
                      style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 9px", fontFamily: "inherit", background: "#fff" }}
                    >
                      {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>{formatTaskStatus(status)}</option>
                      ))}
                      {LEGACY_TASK_STATUSES.filter((s) => !TASK_STATUSES.includes(s as (typeof TASK_STATUSES)[number])).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  }
                />
              ))}
            </div>
          )}
        </ProductCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Document tracker</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.5 }}>
              Status only — no file uploads yet. Document upload is coming later.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {documents.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No documents tracked yet.</p>
              ) : (
                documents.map((doc: DocumentItem) => (
                  <DocRow
                    key={doc.id}
                    name={doc.title}
                    status={formatDocumentStatus(doc.status)}
                    due={formatDueDate(doc.due_date, "No date")}
                    tone={documentStatusToTone(doc.status)}
                    action={
                      <select
                        value={doc.status}
                        onChange={async (e) => {
                          setError("");
                          try {
                            await updateDocumentStatus(doc.id, e.target.value);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Could not update document.");
                          }
                        }}
                        style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 9px", fontFamily: "inherit", background: "#fff" }}
                      >
                        {DOCUMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>{formatDocumentStatus(status)}</option>
                        ))}
                      </select>
                    }
                  />
                ))
              )}
            </div>
          </ProductCard>

          <ProductCard style={{ padding: 22, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
              Upload required documents through your school portal. AidPilot tracks status only and never collects tax files or SSNs.
            </p>
          </ProductCard>

          <Link href="/dashboard" style={{ display: "block", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: 14, borderRadius: 14, textDecoration: "none" }}>
            Back to dashboard
          </Link>
        </div>
      </div>

      <FeedbackWidget page="/checklist" />
    </AppShell>
  );
}

function TaskRow({
  title,
  description,
  status,
  due,
  category,
  priority,
  tone,
  action,
}: {
  title: string;
  description: string;
  status: string;
  due: string;
  category: string;
  priority: string;
  tone: "green" | "amber" | "coral" | "blue" | "gray";
  action?: ReactNode;
}) {
  const complete = isTaskComplete(status);
  return (
    <div className="card-lift" style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #EAEEF3", background: complete ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: complete ? "#7C9A89" : "#15212E", textDecoration: complete ? "line-through" : "none" }}>{title}</div>
        <PillBadge tone={tone}>{formatTaskStatus(status)}</PillBadge>
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 8px", lineHeight: 1.55 }}>{description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9AA4B2" }}>{category}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "#9AA4B2" }}>Due {due}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: priority === "High" ? "#C04E57" : priority === "Medium" ? "#B7791F" : "#9AA4B2" }}>{priority} priority</span>
        {action}
      </div>
    </div>
  );
}

function DocRow({
  name,
  status,
  due,
  tone,
  action,
}: {
  name: string;
  status: string;
  due: string;
  tone: "green" | "amber" | "coral" | "blue" | "gray";
  action?: ReactNode;
}) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#15212E" }}>{name}</span>
        <PillBadge tone={tone}>{status}</PillBadge>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Due {due}</span>
        {action}
      </div>
    </div>
  );
}
