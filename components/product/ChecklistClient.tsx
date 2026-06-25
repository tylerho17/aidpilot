"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { PillBadge, ProductCard, ProgressBar, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  formatDueDate,
  getAttentionCountFromTasks,
  getChecklistProgressFromTasks,
  getMissingDocumentCountFromDocs,
  getNextDeadlineFromTasks,
  statusToTone,
} from "@/lib/data-helpers";
import {
  CHECKLIST_TASKS,
  DOCUMENTS,
  documentStatusToTone,
  getAttentionCount,
  getChecklistProgress,
  getMissingDocumentCount,
  getNextDeadline,
  statusToTone as demoStatusToTone,
  type ChecklistTask,
  type TaskStatus,
} from "@/lib/demo-data";
import type { AidTask, DocumentItem } from "@/lib/types";

const STATUS_ORDER: Record<string, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

function sortDemoTasks(tasks: ChecklistTask[]) {
  return [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

function sortDbTasks(tasks: AidTask[]) {
  return [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export default function ChecklistClient() {
  const { loading, isDemo, tasks, documents, updateTaskStatus, updateDocumentStatus } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading your checklist...</p>
      </AppShell>
    );
  }

  const progress = isDemo ? getChecklistProgress() : getChecklistProgressFromTasks(tasks);
  const attention = isDemo ? getAttentionCount() : getAttentionCountFromTasks(tasks);
  const missingDocs = isDemo ? getMissingDocumentCount() : getMissingDocumentCountFromDocs(documents);
  const nextDeadline = isDemo ? getNextDeadline() : getNextDeadlineFromTasks(tasks);
  const totalTasks = isDemo ? CHECKLIST_TASKS.length : tasks.length;
  const sortedDemo = sortDemoTasks(CHECKLIST_TASKS);
  const sortedDb = sortDbTasks(tasks);
  const categories = isDemo
    ? [...new Set(CHECKLIST_TASKS.map((t) => t.category))]
    : [...new Set(tasks.map((t) => t.category).filter(Boolean))] as string[];

  const toneFn = (status: string) =>
    isDemo ? demoStatusToTone(status as TaskStatus) : statusToTone(status);

  return (
    <AppShell>
      {isDemo && <DemoNotice />}

      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
          Aid Checklist
        </h1>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track every step needed to protect your financial aid. {totalTasks} tasks in your aid cycle.
        </p>
      </div>

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
        <p style={{ fontSize: 14, fontWeight: 700, color: "#15885A", margin: "14px 0 0" }}>
          Nice work. You are {progress}% done with your aid checklist.
        </p>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {categories.map((cat) => {
          const catTasks = isDemo ? CHECKLIST_TASKS.filter((t) => t.category === cat) : tasks.filter((t) => t.category === cat);
          const done = catTasks.filter((t) => t.status === "Complete").length;
          return (
            <span key={cat} style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "6px 12px", borderRadius: 999 }}>
              {cat} · {done}/{catTasks.length}
            </span>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 22, alignItems: "start" }}>
        <ProductCard style={{ padding: 26 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>All checklist tasks</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isDemo
              ? sortedDemo.map((item) => (
                  <TaskRow key={item.id} title={item.title} description={item.description} status={item.status} due={item.dueDate} category={item.category} priority={item.priority} tone={toneFn(item.status)} />
                ))
              : sortedDb.map((item) => (
                  <TaskRow
                    key={item.id}
                    title={item.title}
                    description={item.description ?? ""}
                    status={item.status}
                    due={formatDueDate(item.due_date, item.status)}
                    category={item.category ?? ""}
                    priority={item.priority ?? "Medium"}
                    tone={toneFn(item.status)}
                    action={
                      item.status !== "Complete" ? (
                        <button type="button" onClick={() => updateTaskStatus(item.id, "Complete")} style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", border: "none", padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}>
                          Mark complete
                        </button>
                      ) : null
                    }
                  />
                ))}
          </div>
        </ProductCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Document tracker</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.5 }}>Status only. No file uploads in AidPilot.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isDemo
                ? DOCUMENTS.map((doc) => (
                    <DocRow key={doc.id} name={doc.name} status={doc.status} due={doc.dueDate} tone={documentStatusToTone(doc.status)} />
                  ))
                : documents.map((doc: DocumentItem) => (
                    <DocRow
                      key={doc.id}
                      name={doc.title}
                      status={doc.status}
                      due={formatDueDate(doc.due_date, "No date")}
                      tone={statusToTone(doc.status)}
                      action={
                        doc.status === "Missing" ? (
                          <button type="button" onClick={() => updateDocumentStatus(doc.id, "Uploaded")} style={{ fontSize: 11, fontWeight: 700, color: "#15885A", background: "#EAFBF1", border: "none", padding: "5px 9px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}>
                            Mark uploaded
                          </button>
                        ) : null
                      }
                    />
                  ))}
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
  return (
    <div className="card-lift" style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #EAEEF3", background: status === "Complete" ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: status === "Complete" ? "#7C9A89" : "#15212E", textDecoration: status === "Complete" ? "line-through" : "none" }}>{title}</div>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Due {due}</span>
        {action}
      </div>
    </div>
  );
}
