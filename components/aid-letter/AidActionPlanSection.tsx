"use client";

import { Card, ChecklistItem } from "@/components/ui";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { AidTask } from "@/lib/types";

type AidActionPlanSectionProps = {
  tasks: AidTask[];
  onToggleTask?: (taskId: string, complete: boolean) => void;
  togglingId?: string | null;
};

export default function AidActionPlanSection({ tasks, onToggleTask, togglingId }: AidActionPlanSectionProps) {
  const openCount = tasks.filter((task) => !isAidTaskComplete(task.status)).length;

  return (
    <Card variant="clay" padding={24}>
      <h2
        className="font-display"
        style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 6px", color: "var(--ink-900)" }}
      >
        Your Aid Action Plan
      </h2>
      <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55 }}>
        {openCount > 0
          ? `${openCount} step${openCount === 1 ? "" : "s"} to review for this offer.`
          : "All action steps for this offer are complete."}
      </p>

      {tasks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tasks.map((task, index) => {
            const done = isAidTaskComplete(task.status);
            const toggling = togglingId === task.id;

            return (
              <ChecklistItem
                key={task.id}
                done={done}
                divider={index < tasks.length - 1}
                title={task.title}
                sub={task.description || undefined}
                onToggle={
                  onToggleTask && !toggling ? () => onToggleTask(task.id, !done) : undefined
                }
              />
            );
          })}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6 }}>
          No action steps are needed for this offer right now.
        </p>
      )}
    </Card>
  );
}
