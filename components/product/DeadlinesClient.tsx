"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { formatDueDate, sortDeadlinesByDate, deadlineStatusToTone } from "@/lib/data-helpers";
import type { Deadline } from "@/lib/types";

const DEADLINE_STATUSES = ["upcoming", "in_progress", "completed", "missed"] as const;
const LEGACY_DEADLINE_STATUSES = ["due soon", "needs attention", "complete", "completed", "upcoming"] as const;

function isCompleted(status: string) {
  return status === "complete" || status === "completed";
}

function formatDeadlineStatus(status: string) {
  return status.replace(/_/g, " ");
}

function DeadlineCard({
  item,
  onStatusChange,
}: {
  item: Pick<Deadline, "id" | "title" | "description" | "deadline_date" | "category" | "priority" | "status" | "source_name" | "source_type" | "action_url">;
  onStatusChange?: (status: string) => void;
}) {
  const statusOptions = [...DEADLINE_STATUSES, ...LEGACY_DEADLINE_STATUSES.filter((s) => !DEADLINE_STATUSES.includes(s as (typeof DEADLINE_STATUSES)[number]))];
  const currentValue = statusOptions.includes(item.status as (typeof DEADLINE_STATUSES)[number] | (typeof LEGACY_DEADLINE_STATUSES)[number]) ? item.status : "upcoming";

  return (
    <div className="card-lift" style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #EAEEF3", background: isCompleted(item.status) ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#15212E" }}>{item.title}</div>
        <PillBadge tone={deadlineStatusToTone(item.status)}>{formatDeadlineStatus(item.status)}</PillBadge>
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
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>Status (change anytime)</label>
          <select
            value={currentValue}
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "6px 10px", fontFamily: "inherit", background: "#fff" }}
          >
            {DEADLINE_STATUSES.map((status) => (
              <option key={status} value={status}>{formatDeadlineStatus(status)}</option>
            ))}
            {LEGACY_DEADLINE_STATUSES.filter((s) => !DEADLINE_STATUSES.includes(s as (typeof DEADLINE_STATUSES)[number])).map((status) => (
              <option key={status} value={status}>{formatDeadlineStatus(status)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default function DeadlinesClient() {
  const { loading, deadlines, updateDeadlineStatus } = useUserData();
  const [error, setError] = useState("");

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading deadlines...</p>
      </AppShell>
    );
  }

  const sorted = sortDeadlinesByDate(deadlines);
  const active = sorted.filter((d) => !isCompleted(d.status));
  const completed = sorted.filter((d) => isCompleted(d.status));
  const dueSoon = active.filter((d) => d.status === "due soon" || d.status === "needs attention" || d.status === "in_progress");

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
          Track FAFSA, state aid, school portal, and scholarship deadlines. You can change status anytime.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="All deadlines" value={String(sorted.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Due soon" value={String(dueSoon.length)} color="#B7791F" style={{ flex: "1 1 120px" }} />
        <StatCard label="Active" value={String(active.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Completed" value={String(completed.length)} color="#15885A" style={{ flex: "1 1 120px" }} />
      </div>

      {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Upcoming deadlines</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                No active deadlines yet. Verify official dates with your school and scholarship providers.
              </p>
            ) : (
              active.map((item) => (
                <DeadlineCard key={item.id} item={item} onStatusChange={(status) => handleStatusChange(item.id, status)} />
              ))
            )}
          </div>
        </ProductCard>

        {completed.length > 0 && (
          <ProductCard style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Completed</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {completed.map((item) => (
                <DeadlineCard key={item.id} item={item} onStatusChange={(status) => handleStatusChange(item.id, status)} />
              ))}
            </div>
          </ProductCard>
        )}
      </div>
    </AppShell>
  );
}
