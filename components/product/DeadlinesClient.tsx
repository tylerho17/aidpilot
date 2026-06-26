"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { formatDueDate, sortDeadlinesByDate } from "@/lib/data-helpers";
import { deadlineStatusToTone } from "@/lib/demo-data";
import type { Deadline } from "@/lib/types";

function isCompleted(status: string) {
  return status === "complete" || status === "completed";
}

function DeadlineCard({
  item,
  onComplete,
}: {
  item: Pick<Deadline, "id" | "title" | "description" | "deadline_date" | "category" | "priority" | "status" | "source_name" | "source_type" | "action_url">;
  onComplete?: () => void;
}) {
  return (
    <div className="card-lift" style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #EAEEF3", background: isCompleted(item.status) ? "#F5FBF7" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#15212E" }}>{item.title}</div>
        <PillBadge tone={deadlineStatusToTone(item.status)}>{item.status}</PillBadge>
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
        {(item.source_name || item.source_type) && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.source_name ?? item.source_type}</span>
          </>
        )}
      </div>
      {!isCompleted(item.status) && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: "#15885A", background: "#EAFBF1", border: "none", padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}
        >
          Mark completed
        </button>
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
  const dueSoon = active.filter((d) => d.status === "due soon" || d.status === "needs attention");

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Deadlines
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track FAFSA, state aid, school portal, and scholarship deadlines in one place.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="All deadlines" value={String(sorted.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Due soon" value={String(dueSoon.length)} color="#B7791F" style={{ flex: "1 1 120px" }} />
        <StatCard label="Active" value={String(active.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Completed" value={String(completed.length)} color="#15885A" style={{ flex: "1 1 120px" }} />
      </div>

      {error && (
        <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{error}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Upcoming deadlines</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                No active deadlines yet. Track FAFSA, school portal, and scholarship deadlines here as you add them.
              </p>
            ) : (
              active.map((item) => (
                <DeadlineCard
                  key={item.id}
                  item={item}
                  onComplete={async () => {
                    setError("");
                    try {
                      await updateDeadlineStatus(item.id, "completed");
                    } catch (err) {
                      console.error("Failed to update deadline:", err);
                      setError(err instanceof Error ? err.message : "Could not mark deadline complete.");
                    }
                  }}
                />
              ))
            )}
          </div>
        </ProductCard>

        {completed.length > 0 && (
          <ProductCard style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Completed</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {completed.map((item) => (
                <DeadlineCard key={item.id} item={item} />
              ))}
            </div>
          </ProductCard>
        )}
      </div>
    </AppShell>
  );
}
