"use client";

import { isAidTaskComplete } from "@/lib/data-helpers";
import { fontFamily } from "@/lib/design-tokens";
import type { ScholarshipGapPlan } from "@/lib/aid-letter/buildScholarshipGapPlan";
import type { AidTask } from "@/lib/types";

const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

type ScholarshipGapPlanSectionProps = {
  plan: ScholarshipGapPlan;
  gapTasks?: AidTask[];
  onToggleTask?: (taskId: string, complete: boolean) => void;
  togglingId?: string | null;
};

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

export default function ScholarshipGapPlanSection({
  plan,
  gapTasks = [],
  onToggleTask,
  togglingId,
}: ScholarshipGapPlanSectionProps) {
  if (!plan.hasGap) {
    return (
      <section style={{ marginBottom: 28, fontFamily: fontFamily }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: navy }}>Scholarship Gap Plan</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: muted }}>
          {plan.zeroGapMessage}
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 28, fontFamily: fontFamily }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: navy }}>Scholarship Gap Plan</h2>

      <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 16, marginBottom: 16, background: "#fff" }}>
        <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Remaining gap</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#C04E57" }}>{money(plan.remainingGap)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Plan type</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: navy }}>{plan.planTypeLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Suggested monthly target</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: navy }}>
              Apply to {money(plan.monthlyTargetLow)} to {money(plan.monthlyTargetHigh)} of scholarships per month
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 4 }}>Scholarships to apply to</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: navy }}>
              About {plan.scholarshipsToApplyCount} scholarships over the next few months
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.65, color: muted }}>{plan.recommendation}</p>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 8 }}>Weekly plan</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: navy, fontSize: 14, lineHeight: 1.7 }}>
            {plan.weeklyPlan.map((item) => (
              <li key={item} style={{ marginBottom: 4 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {gapTasks.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 8 }}>Scholarship gap tasks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gapTasks.map((task) => {
              const done = isAidTaskComplete(task.status);
              const toggling = togglingId === task.id;

              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 12px",
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
                      width: 18,
                      height: 18,
                      marginTop: 2,
                      borderRadius: 4,
                      border: `1.5px solid ${done ? "#15885A" : "#CBD5E1"}`,
                      background: done ? "#15885A" : "#fff",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: onToggleTask ? "pointer" : "default",
                      flexShrink: 0,
                      fontFamily: fontFamily,
                    }}
                  >
                    {done ? "✓" : ""}
                  </button>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: done ? muted : navy,
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: navy }}>Scholarships to look for</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.categories.map((category) => (
          <div
            key={category.id}
            style={{
              border: `1px solid ${border}`,
              borderRadius: 8,
              padding: 14,
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: navy, marginBottom: 6 }}>{category.title}</div>
            <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.55, color: muted }}>
              <span style={{ fontWeight: 700, color: navy }}>Why: </span>
              {category.why}
            </p>
            <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.55, color: muted }}>
              <span style={{ fontWeight: 700, color: navy }}>Action: </span>
              {category.action}
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: muted }}>
              <span style={{ fontWeight: 700, color: navy }}>Search phrase: </span>
              <span style={{ color: navy }}>&quot;{category.searchPhrase}&quot;</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
