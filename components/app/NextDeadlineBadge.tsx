"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { nextDeadline, CA_DEADLINES, type AidDeadline, type DeadlineTone } from "@/lib/deadlines/ca-deadlines";

/**
 * The dashboard's "next deadline" pill - replaces the old habit-streak badge.
 * A streak rewards opening the app; this rewards the behavior that actually
 * matters for aid: not missing a deadline. It reads the sourced deadline engine,
 * counts down the soonest upcoming date, colors itself by urgency, and links
 * straight to the full timeline. Renders nothing if there's no upcoming date.
 */

const PILL: Record<DeadlineTone, { bg: string; fg: string; icon: string }> = {
  coral: { bg: "var(--coral-100)", fg: "var(--coral-700)", icon: "var(--coral-600)" },
  amber: { bg: "var(--amber-100)", fg: "var(--amber-700)", icon: "var(--amber-600)" },
  blue:  { bg: "var(--blue-100)",  fg: "var(--blue-700)",  icon: "var(--blue-700)" },
  gray:  { bg: "var(--blue-100)",  fg: "var(--blue-700)",  icon: "var(--blue-700)" },
};

export function NextDeadlineBadge({ deadlines = CA_DEADLINES }: { deadlines?: AidDeadline[] }) {
  const { lang, t } = useLanguage();
  const next = useMemo(() => nextDeadline(deadlines), [deadlines]);
  if (!next) return null;

  const p = PILL[next.tone];
  const unit = t({
    en: next.days === 1 ? "day" : "days",
    es: next.days === 1 ? "día" : "días",
  });
  const a11y = `${next.title.en}, ${next.days} ${unit}`;

  return (
    <Link
      href="/key-dates"
      role="status"
      aria-label={a11y}
      title={next.title.en}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: "var(--radius-pill)",
        background: p.bg,
        color: p.fg,
        lineHeight: 1,
        whiteSpace: "nowrap",
        textDecoration: "none",
        maxWidth: "100%",
      }}
    >
      <Icon name="calendar-check" size={16} color={p.icon} strokeWidth={2.25} />
      <span style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
        {next.short[lang]} ·
      </span>
      <span style={{ fontFamily: "var(--font-metric)", fontWeight: 700, fontSize: 14 }}>{next.days}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>{unit}</span>
    </Link>
  );
}
