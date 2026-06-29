"use client";

import { useMemo, useState } from "react";
import AidActionCard from "@/components/aid-actions/AidActionCard";
import { ProductCard } from "@/components/ProductUI";
import type { AidAction, AidActionPriority } from "@/lib/aid-actions/types";

const EMPTY_MESSAGE = "No urgent aid actions right now. Keep checking your school portals and deadlines.";

const tabBtn = (active: boolean) =>
  ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    fontSize: 13,
    fontWeight: 700,
    color: active ? "#0B5CAD" : "#6B7280",
    background: active ? "#EAF3FF" : "#F3F4F6",
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  }) as const;

type FilterTab = "all" | AidActionPriority;

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "urgent", label: "Urgent" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

type AidActionListProps = {
  actions: AidAction[];
  showFilters?: boolean;
};

export default function AidActionList({ actions, showFilters = true }: AidActionListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return actions;
    return actions.filter((action) => action.priority === filter);
  }, [actions, filter]);

  if (actions.length === 0) {
    return (
      <ProductCard style={{ padding: 24 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>{EMPTY_MESSAGE}</p>
      </ProductCard>
    );
  }

  return (
    <div>
      {showFilters ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              style={tabBtn(filter === tab.id)}
              onClick={() => setFilter(tab.id)}
              aria-pressed={filter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <ProductCard style={{ padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
            No actions in this priority level.
          </p>
        </ProductCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((action) => (
            <AidActionCard key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

export { EMPTY_MESSAGE as AID_ACTION_EMPTY_MESSAGE };
