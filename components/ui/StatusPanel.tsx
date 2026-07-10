"use client";

import type { CSSProperties, ReactNode } from "react";
import { IconTile } from "./IconTile";

/**
 * The soft gradient "status" panel behind AidPilot's emotional messages -
 * "Your aid is protected this week." Tone drives the diagonal gradient, border,
 * and accent. Optional icon tile, headline, body, and trailing content.
 */

type Tone = "green" | "amber" | "coral" | "blue";

const PANELS: Record<Tone, { grad: string; border: string; fg: string }> = {
  green: { grad: "var(--gradient-safe)", border: "var(--green-200)", fg: "var(--green-600)" },
  amber: { grad: "var(--gradient-warn)", border: "var(--amber-200)", fg: "var(--amber-600)" },
  coral: { grad: "var(--gradient-risk)", border: "var(--coral-200)", fg: "var(--coral-600)" },
  blue:  { grad: "var(--gradient-info)", border: "var(--blue-200)",  fg: "var(--blue-700)" },
};

type StatusPanelProps = {
  tone?: Tone;
  icon?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function StatusPanel({
  tone = "green",   // "green" | "amber" | "coral" | "blue"
  icon,
  eyebrow,
  title,
  children,
  trailing,
  className = "",
  style,
}: StatusPanelProps) {
  const p = PANELS[tone] || PANELS.green;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        background: p.grad,
        border: `1px solid ${p.border}`,
        borderRadius: "var(--radius-2xl)",
        padding: 20,
        ...style,
      }}
    >
      {icon && <IconTile icon={icon} tone={tone} size={46} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && (
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: p.fg, marginBottom: 6 }}>
            {eyebrow}
          </div>
        )}
        {title && (
          <div className="font-display" style={{ fontSize: 19, fontWeight: 900, color: "var(--ink-900)", lineHeight: 1.25, letterSpacing: "-.3px" }}>
            {title}
          </div>
        )}
        {children && (
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, marginTop: title ? 6 : 0 }}>
            {children}
          </div>
        )}
      </div>
      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </div>
  );
}
