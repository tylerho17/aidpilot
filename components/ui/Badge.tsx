"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * AidPilot pill badge / status chip. Five tones map to the brand's status
 * meaning: green = safe/on-track, amber = due soon, coral = risk/missing,
 * blue = informational, gray = neutral. Optional leading icon or status dot.
 */

type Tone = "green" | "amber" | "coral" | "blue" | "gray";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: "var(--status-safe-fill)", fg: "var(--status-safe-fg)" },
  amber: { bg: "var(--status-warn-fill)", fg: "var(--status-warn-fg)" },
  coral: { bg: "var(--status-risk-fill)", fg: "var(--status-risk-fg)" },
  blue:  { bg: "var(--status-info-fill)", fg: "var(--status-info-fg)" },
  gray:  { bg: "var(--status-neutral-fill)", fg: "var(--status-neutral-fg)" },
};

export type BadgeProps = {
  children?: ReactNode;
  tone?: Tone;
  icon?: string;
  dot?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Badge({
  children,
  tone = "blue",   // "green" | "amber" | "coral" | "blue" | "gray"
  icon,            // optional Icon name
  dot = false,     // show a leading status dot
  className = "",
  style,
}: BadgeProps) {
  const p = TONES[tone] || TONES.blue;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 800,
        fontFamily: "var(--font-body)",
        padding: "6px 12px",
        borderRadius: 999,
        background: p.bg,
        color: p.fg,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.fg, flexShrink: 0 }} />
      )}
      {icon && <Icon name={icon} size={13} strokeWidth={2.6} />}
      {children}
    </span>
  );
}
