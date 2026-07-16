"use client";

import type { CSSProperties, SVGAttributes } from "react";

/**
 * AidPilot icon set - the exact inline SVG glyphs used across the product.
 * Every glyph is a 24×24 stroked line icon (round caps + joins), transcribed
 * verbatim from the AidPilot codebase. `currentColor` inherits text color;
 * stroke width and size are tunable.
 */

const ICONS: Record<string, string> = {
  // ── Brand ──
  plane: '<path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z"/>',
  // ── Navigation ──
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  clipboard: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  letter: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  // ── Status / feature ──
  "shield-check": '<path d="M12 3l7 3v5c0 4.4-3 6.8-7 8-4-1.2-7-3.6-7-8V6l7-3Z"/><polyline points="9 12 11 14 15 9.5"/>',
  "calendar-check": '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M9 14l2 2 4-4"/>',
  star: '<path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2 2.5Z"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  check: '<polyline points="5 13 10 18 19 6"/>',
  // ── Directional (system-consistent, same line language) ──
  "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "chevron-left": '<path d="M15 18l-6-6 6-6"/>',
  "chevron-down": '<path d="M6 9l6 6 6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};

export const ICON_NAMES = Object.keys(ICONS);

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
} & Omit<
  SVGAttributes<SVGSVGElement>,
  "name" | "color" | "strokeWidth" | "className" | "style"
>;

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
  style,
  ...rest
}: IconProps) {
  const body = ICONS[name];
  if (!body) {
    if (typeof console !== "undefined") console.warn(`Icon: unknown name "${name}"`);
    return null;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={rest["aria-label"] ? undefined : true}
      dangerouslySetInnerHTML={{ __html: body }}
      {...rest}
    />
  );
}
