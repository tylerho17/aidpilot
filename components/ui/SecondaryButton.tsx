"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { buttons, colors, radius, text } from "@/lib/design-tokens";

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: buttons.height,
  minHeight: buttons.height,
  ...text.button,
  color: colors.primary,
  background: colors.card,
  padding: `0 ${buttons.paddingX}px`,
  borderRadius: radius.button,
  textDecoration: "none",
  border: `1.5px solid ${colors.borderSoft}`,
  cursor: "pointer",
  lineHeight: 1,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
};

const tabStyle: CSSProperties = {
  ...baseStyle,
  height: buttons.heightTab,
  minHeight: buttons.heightTab,
  fontSize: 14,
  fontWeight: 700,
  padding: `0 16px`,
};

type SharedProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function SecondaryButton({
  children,
  style,
  className,
  ...props
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={className} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButtonLink({
  href,
  children,
  style,
  className,
}: SharedProps & { href: string }) {
  return (
    <Link href={href} className={className} style={{ ...baseStyle, ...style }}>
      {children}
    </Link>
  );
}

export function TabButtonLink({
  href,
  children,
  style,
  className,
}: SharedProps & { href: string }) {
  return (
    <Link href={href} className={className} style={{ ...tabStyle, ...style }}>
      {children}
    </Link>
  );
}

export const secondaryButtonStyle = baseStyle;
export const tabButtonStyle = tabStyle;
