"use client";

import { Icon } from "@/components/ui";
import { useStreak } from "@/hooks/useStreak";

/**
 * Duolingo-style flame + day-count. Renders nothing until there's a streak to
 * show (the visit is recorded on mount, so a returning student sees at least 1).
 * The count uses the metric font, the same face used for money and day-counts.
 */
export function StreakBadge() {
  const { current, longest } = useStreak();
  if (current <= 0) return null;

  const label = `${current}-day streak${longest > current ? ` · best ${longest}` : ""}`;

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 11px",
        borderRadius: "var(--radius-pill)",
        background: "var(--amber-100)",
        color: "var(--amber-700)",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="flame" size={16} color="var(--amber-600)" strokeWidth={2.25} />
      <span style={{ fontFamily: "var(--font-metric)", fontWeight: 700, fontSize: 14 }}>{current}</span>
      <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>day{current === 1 ? "" : "s"}</span>
    </span>
  );
}
