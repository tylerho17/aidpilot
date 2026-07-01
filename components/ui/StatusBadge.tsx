import type { ReactNode } from "react";
import { badgeStyles, type BadgeTone, fontFamily, radius, text } from "@/lib/design-tokens";

export function StatusBadge({ children, tone = "blue" }: { children: ReactNode; tone?: BadgeTone }) {
  const palette = badgeStyles[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...text.label,
        padding: "4px 10px",
        borderRadius: radius.pill,
        background: palette.bg,
        color: palette.fg,
        whiteSpace: "nowrap",
        fontFamily,
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  );
}

/** @deprecated Use StatusBadge — kept for existing imports */
export function PillBadge({ children, tone = "blue" }: { children: ReactNode; tone?: BadgeTone }) {
  return <StatusBadge tone={tone}>{children}</StatusBadge>;
}
