"use client";

import type { CSSProperties } from "react";
import { Icon } from "./Icon";

/**
 * A rounded, tinted square holding an Icon - the recurring "chip" behind
 * feature icons, empty states, and auth headers. Tone sets the fill+icon color.
 */

type TileTone = "blue" | "green" | "amber" | "coral" | "brand";

const TILE_TONES: Record<TileTone, { bg: string; fg: string }> = {
  blue:  { bg: "var(--blue-100)",  fg: "var(--blue-700)" },
  green: { bg: "var(--green-100)", fg: "var(--green-600)" },
  amber: { bg: "var(--amber-100)", fg: "var(--amber-600)" },
  coral: { bg: "var(--coral-100)", fg: "var(--coral-600)" },
  brand: { bg: "var(--blue-700)",  fg: "#fff" },
};

export type IconTileProps = {
  icon: string;
  tone?: TileTone;
  size?: number;
  radius?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

export function IconTile({
  icon,
  tone = "blue",       // "blue" | "green" | "amber" | "coral" | "brand"
  size = 52,
  radius,
  strokeWidth = 2,
  className = "",
  style,
}: IconTileProps) {
  const t = TILE_TONES[tone] || TILE_TONES.blue;
  const r = radius ?? Math.round(size * 0.3);
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: r,
        background: t.bg,
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={t.fg} strokeWidth={strokeWidth} />
    </span>
  );
}
