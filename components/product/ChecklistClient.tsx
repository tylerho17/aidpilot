"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PillBadge, ProductCard, ProgressBar, StatCard } from "@/components/ProductUI";
import { PageErrorBanner, PageEmptyState, PageLoading, friendlyActionError, runSafe } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import { getChecklistOnlyTasks } from "@/lib/fafsa-plan";
import {
  AID_TASK_STATUSES,
  DOCUMENT_STATUSES,
  formatDueDate,
  formatDocumentStatus,
  getAttentionCountFromTasks,
  getChecklistProgressFromTasks,
  getMissingDocumentCountFromDocs,
  getNextDeadlineFromTasks,
  documentStatusToTone,
  isAidTaskComplete,
  normalizeAidTaskStatus,
  statusToTone,
} from "@/lib/data-helpers";
import type { AidTask, DocumentItem } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

function sortDbTasks(tasks: AidTask[]) {
  return [...tasks].sort(
    (a, b) =>
      (STATUS_ORDER[normalizeAidTaskStatus(a.status)] ?? 99) -
      (STATUS_ORDER[normalizeAidTaskStatus(b.status)] ?? 99)
  );
}

export default function ChecklistClient() {
  const { loading, authReady, loadError, tasks, documents, updateTaskStatus, updateDocumentStatus } = useUserData();
  const [error, setError] = useState("");

  if (!authReady && loading) {
    return <PageLoading message="Loading your checklist..." />;
  }

  const { data: view, error: viewError } = runSafe(
    "Checklist",
    () => {
      const checklistTasks = getChecklistOnlyTasks(tasks ?? []);
      const progress = getChecklistProgressFromTasks(checklistTasks);
      const attention = getAttentionCountFromTasks(checklistTasks);
      const missingDocs = getMissingDocumentCountFromDocs(documents ?? []);
      const nextDeadline = getNextDeadlineFromTasks(checklistTasks);
      const sortedDb = sortDbTasks(checklistTasks);
      const categories = [...new Set(checklistTasks.map((t) => t.category).filter(Boolean))] as string[];
      return { checklistTasks, progress, attention, missingDocs, nextDeadline, sortedDb, categories };
    },
    {
      checklistTasks: [],
      progress: 0,
      attention: 0,
      missingDocs: 0,
      nextDeadline: "No deadlines yet",
      sortedDb: [],
      categories: [],
    }
  );

  const { checklistTasks, progress, attention, missingDocs, nextDeadline, sortedDb, categories } = view;
  const safeDocuments = documents ?? [];

  if (loading) {
    return <PageLoading message="Loading your checklist..." />;
  }

  return (
    <AppShell>
      <PageErrorBanner message={loadError ?? viewError} />
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Aid Checklist
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track every step needed to protect your financial aid. You can change any task status anytime.
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
            const catTasks = checklistTasks.filter((t) => t.category === cat);
            const done = catTasks.filter((t) => isAidTaskComplete(t.status)).length;
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
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>All checklist tasks</h2>
          <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 18px", lineHeight: 1.5 }}>You can change this later.</p>
          {sortedDb.length === 0 ? (
            <PageEmptyState
              title="No checklist tasks yet"
              description="Tasks appear as your aid plan is set up. You can also add tasks from your dashboard."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedDb.map((item) => (
                <TaskRow
                  key={item.id}
                  title={item.title}
                  description={item.description ?? ""}
                  status={normalizeAidTaskStatus(item.status)}
                  due={formatDueDate(item.due_date, item.status)}
                  category={item.category ?? ""}
                  priority={item.priority ?? "Medium"}
                  tone={statusToTone(item.status)}
                  action={
                    <label style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#9AA4B2", textTransform: "uppercase", letterSpacing: ".4px" }}>Update status</span>
                      <select
                        value={normalizeAidTaskStatus(item.status)}
                        onChange={async (e) => {
                          setError("");
                          try {
                            await updateTaskStatus(item.id, e.target.value);
                          } catch (err) {
                            setError(friendlyActionError(err, "Could not update task."));
                          }
                        }}
                        style={{ fontSize: 11, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 9px", fontFamily: "inherit", background: "#fff" }}
                      >
                        {AID_TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
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
              {safeDocuments.length === 0 ? (
                <PageEmptyState title="No documents tracked yet" description="Track document status here when your school requests materials." />
              ) : (
                safeDocuments.map((doc: DocumentItem) => (
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
                            setError(friendlyActionError(err, "Could not update document."));
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
  const complete = isAidTaskComplete(status);
  return (
    <div className="card-lift" style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #EAEEF3", background: complete ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: complete ? "#7C9A89" : "#15212E", textDecoration: complete ? "line-through" : "none" }}>{title}</div>
        <PillBadge tone={tone}>{status}</PillBadge>
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
