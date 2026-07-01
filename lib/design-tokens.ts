/** AidPilot design tokens — single source of truth for product UI. */

import type { CSSProperties } from "react";

/** Use CSS variable set by next/font in app/layout.tsx */
export const fontFamily = "var(--font-app), sans-serif";

export const colors = {
  background: "#F4F8FE",
  card: "#FFFFFF",
  primary: "#0B5CAD",
  softBlue: "#EAF3FF",
  softGreen: "#EAFBF1",
  softAmber: "#FFF7E6",
  softCoral: "#FFE4E6",
  text: "#15212E",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  borderSoft: "#E6EDF6",
  green: "#15885A",
  amber: "#B7791F",
  coral: "#C04E57",
  sidebarActiveBg: "#EAF3FF",
} as const;

export const layout = {
  pageMaxWidth: 1120,
  pagePaddingDesktop: 32,
  pagePaddingMobile: 20,
  sectionGap: 24,
  cardPadding: 24,
  cardPaddingLarge: 28,
  stackGap: 16,
  stackGapSm: 12,
  stackGapXs: 8,
} as const;

export const radius = {
  card: 20,
  button: 12,
  input: 12,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const shadow = {
  card: "0 4px 12px rgba(11, 92, 173, 0.05)",
} as const;

/** Typography scale — prefer `.text-*` classes from globals.css for responsive headings */
export const text = {
  h1: {
    fontFamily,
    fontSize: 32,
    lineHeight: "1.2",
    fontWeight: 800,
    color: colors.text,
    margin: 0,
    letterSpacing: "-0.02em",
  } satisfies CSSProperties,
  h1Desktop: {
    fontSize: 40,
  } satisfies CSSProperties,
  h2: {
    fontFamily,
    fontSize: 28,
    lineHeight: "1.2",
    fontWeight: 800,
    color: colors.text,
    margin: 0,
    letterSpacing: "-0.02em",
  } satisfies CSSProperties,
  h3: {
    fontFamily,
    fontSize: 22,
    lineHeight: "1.3",
    fontWeight: 800,
    color: colors.text,
    margin: 0,
  } satisfies CSSProperties,
  body: {
    fontFamily,
    fontSize: 17,
    lineHeight: "1.6",
    fontWeight: 500,
    color: colors.text,
    margin: 0,
  } satisfies CSSProperties,
  bodyMuted: {
    fontFamily,
    fontSize: 17,
    lineHeight: "1.6",
    fontWeight: 500,
    color: colors.textMuted,
    margin: 0,
  } satisfies CSSProperties,
  bodyStrong: {
    fontFamily,
    fontSize: 17,
    lineHeight: "1.6",
    fontWeight: 700,
    color: colors.text,
    margin: 0,
  } satisfies CSSProperties,
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: "1.4",
    fontWeight: 700,
    color: colors.textMuted,
    margin: 0,
  } satisfies CSSProperties,
  metric: {
    fontFamily,
    fontSize: 28,
    lineHeight: "1.2",
    fontWeight: 800,
    color: colors.text,
    margin: 0,
  } satisfies CSSProperties,
  button: {
    fontFamily,
    fontSize: 16,
    lineHeight: 1,
    fontWeight: 800,
  } satisfies CSSProperties,
} as const;

export const buttons = {
  height: 48,
  heightTab: 40,
  paddingX: 20,
  fontSize: 16,
  fontWeight: 800,
  gap: 12,
} as const;

export const cardBase: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: radius.card,
  boxShadow: shadow.card,
  fontFamily,
};

export type BadgeTone = "green" | "amber" | "coral" | "blue" | "gray";

export const badgeStyles: Record<BadgeTone, { bg: string; fg: string }> = {
  green: { bg: colors.softGreen, fg: colors.green },
  amber: { bg: colors.softAmber, fg: colors.amber },
  coral: { bg: colors.softCoral, fg: colors.coral },
  blue: { bg: colors.softBlue, fg: colors.primary },
  gray: { bg: "#F3F4F6", fg: colors.textMuted },
};

export const formFieldStyle: CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: radius.input,
  border: `1.5px solid ${colors.border}`,
  padding: "0 14px",
  fontSize: 17,
  lineHeight: "1.4",
  fontWeight: 500,
  outline: "none",
  fontFamily,
  boxSizing: "border-box",
  color: colors.text,
  background: colors.card,
};

export const formLabelStyle: CSSProperties = {
  display: "block",
  ...text.label,
  color: colors.text,
  marginBottom: 8,
};

export const insightRowStyle: CSSProperties = {
  padding: "12px 16px",
  borderRadius: radius.button,
  background: colors.softBlue,
  fontFamily,
  fontSize: 17,
  lineHeight: "1.6",
  fontWeight: 500,
  color: colors.text,
  minHeight: 48,
  display: "flex",
  alignItems: "center",
};

export const taskRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 16px",
  borderRadius: radius.button,
  background: colors.background,
  border: `1px solid ${colors.borderSoft}`,
  minHeight: 72,
  fontFamily,
};

/** @deprecated use `text` */
export const typography = text;
