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
  color: "#fff",
  background: colors.primary,
  padding: `0 ${buttons.paddingX}px`,
  borderRadius: radius.button,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  lineHeight: 1,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
};

type SharedProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function PrimaryButton({
  children,
  style,
  className,
  type = "button",
  ...props
}: SharedProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={className} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </button>
  );
}

export function PrimaryButtonLink({
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

export const primaryButtonStyle = baseStyle;
