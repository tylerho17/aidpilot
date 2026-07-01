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
  background: colors.softBlue,
  padding: `0 ${buttons.paddingX}px`,
  borderRadius: radius.button,
  textDecoration: "none",
  border: `1.5px solid ${colors.borderSoft}`,
  cursor: "pointer",
  lineHeight: 1,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
};

export function SoftButtonLink({
  href,
  children,
  style,
}: {
  href: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Link href={href} style={{ ...baseStyle, ...style }}>
      {children}
    </Link>
  );
}

export function SoftButton({
  children,
  style,
  ...props
}: { children: ReactNode; style?: CSSProperties } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </button>
  );
}

export const softButtonStyle = baseStyle;
