"use client";

import { isAidTaskComplete } from "@/lib/data-helpers";
import type { AidTask } from "@/lib/types";

const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';
const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

type AidActionPlanSectionProps = {
  tasks: AidTask[];
  onToggleTask?: (taskId: string, complete: boolean) => void;
  togglingId?: string | null;
};

export default function AidActionPlanSection({ tasks, onToggleTask, togglingId }: AidActionPlanSectionProps) {
  const openCount = tasks.filter((task) => !isAidTaskComplete(task.status)).length;

  return (
    <section style={{ marginBottom: 28, fontFamily: pageFont }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: navy }}>Your Aid Action Plan</h2>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: muted, lineHeight: 1.55 }}>
        {openCount > 0
          ? `${openCount} step${openCount === 1 ? "" : "s"} to review for this offer.`
          : "All action steps for this offer are complete."}
      </p>

      {tasks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => {
            const done = isAidTaskComplete(task.status);
            const toggling = togglingId === task.id;

            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 14px",
                  border: `1px solid ${done ? "#BBF7D0" : border}`,
                  borderRadius: 6,
                  background: done ? "#F7FDF9" : "#fff",
                }}
              >
                <button
                  type="button"
                  aria-label={done ? "Mark task incomplete" : "Mark task complete"}
                  disabled={!onToggleTask || toggling}
                  onClick={() => onToggleTask?.(task.id, !done)}
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    borderRadius: 4,
                    border: `1.5px solid ${done ? "#15885A" : "#CBD5E1"}`,
                    background: done ? "#15885A" : "#fff",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: onToggleTask ? "pointer" : "default",
                    flexShrink: 0,
                    fontFamily: pageFont,
                  }}
                >
                  {done ? "✓" : ""}
                </button>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: done ? muted : navy,
                      marginBottom: 4,
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </div>
                  {task.description ? (
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: muted }}>{task.description}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: muted, lineHeight: 1.6 }}>
          No action steps are needed for this offer right now.
        </p>
      )}
    </section>
  );
}
