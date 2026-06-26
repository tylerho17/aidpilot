"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard, PageContentSkeleton } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { getChecklistAttentionTasks } from "@/lib/attention";
import {
  DEADLINE_STATUSES,
  formatDueDate,
  isDeadlineCompleted,
  normalizeAidTaskStatus,
  normalizeDeadlineStatus,
  sortDeadlinesByDate,
  deadlineStatusToTone,
  statusToTone,
} from "@/lib/data-helpers";
import type { AidTask, Deadline } from "@/lib/types";

function formatDeadlineStatusLabel(status: string) {
  return normalizeDeadlineStatus(status);
}

function DeadlineCard({
  item,
  onStatusChange,
}: {
  item: Pick<Deadline, "id" | "title" | "description" | "deadline_date" | "category" | "priority" | "status" | "source_name" | "source_type" | "action_url">;
  onStatusChange?: (status: string) => void;
}) {
  const currentStatus = normalizeDeadlineStatus(item.status);

  return (
    <div className="card-lift" style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #EAEEF3", background: isDeadlineCompleted(item.status) ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#15212E" }}>{item.title}</div>
        <PillBadge tone={deadlineStatusToTone(item.status)}>{formatDeadlineStatusLabel(item.status)}</PillBadge>
      </div>
      {item.description && (
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#6B7280", margin: "0 0 10px", lineHeight: 1.55 }}>{item.description}</p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
        <span>{formatDueDate(item.deadline_date)}</span>
        {item.category && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.category}</span>
          </>
        )}
        {item.priority && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.priority} priority</span>
          </>
        )}
      </div>
      {onStatusChange && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Set status</label>
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "6px 10px", fontFamily: "inherit", background: "#fff" }}
          >
            {DEADLINE_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function ChecklistAttentionCard({ item }: { item: AidTask }) {
  const status = normalizeAidTaskStatus(item.status);

  return (
    <div className="card-lift" style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #EAEEF3", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#15212E" }}>{item.title}</div>
        <PillBadge tone={statusToTone(status)}>{status}</PillBadge>
      </div>
      {item.description && (
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#6B7280", margin: "0 0 10px", lineHeight: 1.55 }}>{item.description}</p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
        <span>{item.due_date ? formatDueDate(item.due_date) : "No deadline set."}</span>
        {item.category && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.category}</span>
          </>
        )}
        {item.priority && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.priority} priority</span>
          </>
        )}
      </div>
      <Link href="/checklist" style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
        Update on checklist →
      </Link>
    </div>
  );
}


export default function DeadlinesClient() {
  const { loading, deadlines, tasks, updateDeadlineStatus } = useUserData();
  const [error, setError] = useState("");

  const sorted = sortDeadlinesByDate(deadlines);
  const active = sorted.filter((d) => !isDeadlineCompleted(d.status));
  const completed = sorted.filter((d) => isDeadlineCompleted(d.status));
  const dueSoon = active.filter((d) => {
    const status = normalizeDeadlineStatus(d.status);
    return status === "due soon" || status === "needs attention";
  });
  const checklistAttention = getChecklistAttentionTasks(tasks);

  async function handleStatusChange(id: string, status: string) {
    setError("");
    try {
      await updateDeadlineStatus(id, status);
    } catch (err) {
      console.error("Failed to update deadline:", err);
      setError(err instanceof Error ? err.message : "Could not update deadline.");
    }
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Deadlines
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track FAFSA, state aid, school portal, and scholarship deadlines. Checklist items that need attention also appear here.
        </p>
      </div>

      {loading ? (
        <PageContentSkeleton message="Loading deadlines..." />
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
            <StatCard label="Aid deadlines" value={String(sorted.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
            <StatCard label="Due soon" value={String(dueSoon.length)} color="#B7791F" style={{ flex: "1 1 120px" }} />
            <StatCard label="Checklist attention" value={String(checklistAttention.length)} color="#C04E57" style={{ flex: "1 1 120px" }} />
            <StatCard label="Completed" value={String(completed.length)} color="#15885A" style={{ flex: "1 1 120px" }} />
          </div>

          {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{error}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <ProductCard style={{ padding: 24 }}>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Aid deadlines</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {active.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                    No active aid deadlines yet. Verify official dates with your school and scholarship providers.
                  </p>
                ) : (
                  active.map((item) => (
                    <DeadlineCard key={item.id} item={item} onStatusChange={(status) => handleStatusChange(item.id, status)} />
                  ))
                )}
              </div>
            </ProductCard>

            <ProductCard style={{ padding: 24 }}>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
                Checklist items needing attention
              </h2>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
                Checklist items appear here when they are due soon, missing, upcoming, or need review.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {checklistAttention.length === 0 ? (
                  <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                    No checklist items need attention right now. Mark tasks as Due Soon, Missing, Needs Review, or Upcoming on your checklist to see them here.
                  </p>
                ) : (
                  checklistAttention.map((item) => <ChecklistAttentionCard key={item.id} item={item} />)
                )}
              </div>
            </ProductCard>

            {completed.length > 0 && (
              <ProductCard style={{ padding: 24 }}>
                <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Completed aid deadlines</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {completed.map((item) => (
                    <DeadlineCard key={item.id} item={item} onStatusChange={(status) => handleStatusChange(item.id, status)} />
                  ))}
                </div>
              </ProductCard>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
