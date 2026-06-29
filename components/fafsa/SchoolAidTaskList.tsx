"use client";

import { PillBadge } from "@/components/ProductUI";
import type { UserSchoolAidTask } from "@/lib/types";

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  fontSize: 13,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

function priorityTone(priority: UserSchoolAidTask["priority"]): "green" | "amber" | "coral" | "blue" | "gray" {
  if (priority === "urgent") return "coral";
  if (priority === "high") return "amber";
  if (priority === "medium") return "blue";
  return "gray";
}

type SchoolAidTaskListProps = {
  tasks: UserSchoolAidTask[];
  savingId?: string | null;
  onUpdateStatus: (taskId: string, status: UserSchoolAidTask["status"]) => void;
};

export default function SchoolAidTaskList({ tasks, savingId, onUpdateStatus }: SchoolAidTaskListProps) {
  const openTasks = tasks.filter((task) => task.status === "todo");
  const doneTasks = tasks.filter((task) => task.status !== "todo");

  if (tasks.length === 0) {
    return (
      <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: 0, lineHeight: 1.55 }}>
        No follow-up tasks yet. Tasks appear when you add a school or when a status needs attention.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {openTasks.map((task) => (
        <div
          key={task.id}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "#F9FAFB",
            border: "1px solid #EAEEF3",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E" }}>{task.title}</div>
            <PillBadge tone={priorityTone(task.priority)}>{task.priority}</PillBadge>
          </div>
          {task.description ? (
            <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 10px", lineHeight: 1.55 }}>
              {task.description}
            </p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              style={secondaryBtn}
              disabled={savingId === task.id}
              onClick={() => onUpdateStatus(task.id, "done")}
            >
              {savingId === task.id ? "Saving..." : "Mark done"}
            </button>
            <button
              type="button"
              style={{ ...secondaryBtn, background: "#F3F4F6", color: "#6B7280" }}
              disabled={savingId === task.id}
              onClick={() => onUpdateStatus(task.id, "skipped")}
            >
              Skip
            </button>
          </div>
        </div>
      ))}

      {doneTasks.length > 0 ? (
        <p style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2", margin: "4px 0 0" }}>
          {doneTasks.length} completed or skipped task{doneTasks.length === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
