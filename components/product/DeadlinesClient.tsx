"use client";

import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { formatDueDate, sortDeadlinesByDate } from "@/lib/data-helpers";
import { DEMO_DEADLINES, deadlineStatusToTone } from "@/lib/demo-data";
import type { Deadline } from "@/lib/types";

function DeadlineCard({
  item,
  onComplete,
  showAction,
}: {
  item: Pick<Deadline, "id" | "title" | "description" | "deadline_date" | "category" | "priority" | "status" | "source_name" | "action_url">;
  onComplete?: () => void;
  showAction?: boolean;
}) {
  return (
    <div className="card-lift" style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #EAEEF3", background: item.status === "complete" ? "#F5FBF7" : "#fff" }}>
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
        {item.source_name && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
            <span>{item.source_name}</span>
          </>
        )}
      </div>
      {showAction && item.status !== "complete" && onComplete && (
        <button
          type="button"
          onClick={onComplete}
          style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: "#15885A", background: "#EAFBF1", border: "none", padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}
        >
          Mark complete
        </button>
      )}
    </div>
  );
}

export default function DeadlinesClient() {
  const { loading, isDemo, deadlines, updateDeadlineStatus } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading deadlines...</p>
      </AppShell>
    );
  }

  const source = isDemo ? DEMO_DEADLINES : sortDeadlinesByDate(deadlines);
  const upcoming = source.filter((d) => d.status === "upcoming");
  const dueSoon = source.filter((d) => d.status === "due soon" || d.status === "needs attention");
  const complete = source.filter((d) => d.status === "complete");

  return (
    <AppShell>
      {isDemo && <DemoNotice />}

      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Deadlines
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track FAFSA, state aid, school portal, and scholarship deadlines in one place.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="All deadlines" value={String(source.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Due soon" value={String(dueSoon.length)} color="#B7791F" style={{ flex: "1 1 120px" }} />
        <StatCard label="Upcoming" value={String(upcoming.length)} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
        <StatCard label="Complete" value={String(complete.length)} color="#15885A" style={{ flex: "1 1 120px" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {dueSoon.length > 0 && (
          <ProductCard style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Due soon</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dueSoon.map((item) => (
                <DeadlineCard
                  key={item.id}
                  item={item}
                  showAction={!isDemo}
                  onComplete={!isDemo ? () => updateDeadlineStatus(item.id, "complete") : undefined}
                />
              ))}
            </div>
          </ProductCard>
        )}

        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>All upcoming deadlines</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {source.filter((d) => d.status !== "complete").map((item) => (
              <DeadlineCard
                key={item.id}
                item={item}
                showAction={!isDemo}
                onComplete={!isDemo ? () => updateDeadlineStatus(item.id, "complete") : undefined}
              />
            ))}
          </div>
        </ProductCard>

        {complete.length > 0 && (
          <ProductCard style={{ padding: 24 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>Completed</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {complete.map((item) => (
                <DeadlineCard key={item.id} item={item} />
              ))}
            </div>
          </ProductCard>
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot does not collect FAFSA login credentials, Social Security numbers, or tax documents.
      </p>

      <FeedbackWidget page="/deadlines" />
    </AppShell>
  );
}
