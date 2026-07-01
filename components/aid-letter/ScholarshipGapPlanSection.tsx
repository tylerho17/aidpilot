"use client";

import { Card, ChecklistItem } from "@/components/ui";
import { money as moneyStyle } from "@/components/app/screens/shared";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { ScholarshipGapPlan } from "@/lib/aid-letter/buildScholarshipGapPlan";
import type { AidTask } from "@/lib/types";

type ScholarshipGapPlanSectionProps = {
  plan: ScholarshipGapPlan;
  gapTasks?: AidTask[];
  onToggleTask?: (taskId: string, complete: boolean) => void;
  togglingId?: string | null;
};

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

const metaLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--gray-500)",
  marginBottom: 4,
} as const;

export default function ScholarshipGapPlanSection({
  plan,
  gapTasks = [],
  onToggleTask,
  togglingId,
}: ScholarshipGapPlanSectionProps) {
  if (!plan.hasGap) {
    return (
      <Card variant="clay" padding={24}>
        <h2
          className="font-display"
          style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 10px", color: "var(--ink-900)" }}
        >
          Scholarship Gap Plan
        </h2>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, lineHeight: 1.65, color: "var(--gray-500)" }}>
          {plan.zeroGapMessage}
        </p>
      </Card>
    );
  }

  return (
    <Card variant="clay" padding={24}>
      <h2
        className="font-display"
        style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 16px", color: "var(--ink-900)" }}
      >
        Scholarship Gap Plan
      </h2>

      <div
        style={{
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: 18,
          marginBottom: 18,
          background: "var(--blue-50)",
        }}
      >
        <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
          <div>
            <div style={metaLabel}>Remaining gap</div>
            <div style={{ ...moneyStyle, fontSize: 24, color: "var(--coral-600)" }}>{money(plan.remainingGap)}</div>
          </div>
          <div>
            <div style={metaLabel}>Plan type</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>{plan.planTypeLabel}</div>
          </div>
          <div>
            <div style={metaLabel}>Suggested monthly target</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>
              Apply to {money(plan.monthlyTargetLow)} to {money(plan.monthlyTargetHigh)} of scholarships per month
            </div>
          </div>
          <div>
            <div style={metaLabel}>Scholarships to apply to</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>
              About {plan.scholarshipsToApplyCount} scholarships over the next few months
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 500, lineHeight: 1.65, color: "var(--gray-500)" }}>
          {plan.recommendation}
        </p>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-900)", marginBottom: 8 }}>Weekly plan</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--ink-800)", fontSize: 14, fontWeight: 500, lineHeight: 1.7 }}>
            {plan.weeklyPlan.map((item) => (
              <li key={item} style={{ marginBottom: 4 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {gapTasks.length > 0 ? (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-900)", marginBottom: 8 }}>Scholarship gap tasks</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {gapTasks.map((task, index) => {
              const done = isAidTaskComplete(task.status);
              const toggling = togglingId === task.id;

              return (
                <ChecklistItem
                  key={task.id}
                  done={done}
                  divider={index < gapTasks.length - 1}
                  title={task.title}
                  onToggle={onToggleTask && !toggling ? () => onToggleTask(task.id, !done) : undefined}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <h3 className="font-display" style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink-900)" }}>
        Scholarships to look for
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.categories.map((category) => (
          <div
            key={category.id}
            style={{
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: 16,
              background: "var(--surface-card)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-900)", marginBottom: 6 }}>{category.title}</div>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500, lineHeight: 1.55, color: "var(--gray-500)" }}>
              <span style={{ fontWeight: 700, color: "var(--ink-800)" }}>Why: </span>
              {category.why}
            </p>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500, lineHeight: 1.55, color: "var(--gray-500)" }}>
              <span style={{ fontWeight: 700, color: "var(--ink-800)" }}>Action: </span>
              {category.action}
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.55, color: "var(--gray-500)" }}>
              <span style={{ fontWeight: 700, color: "var(--ink-800)" }}>Search phrase: </span>
              <span style={{ color: "var(--ink-800)" }}>&quot;{category.searchPhrase}&quot;</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
