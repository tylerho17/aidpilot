"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';
export const navy = "#0F2744";
export const muted = "#5B6B7F";
export const border = "#E3EBF3";

export const linkBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 16px",
  borderRadius: 8,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: pageFont,
} as const;

export const primaryBtn = {
  ...linkBtn,
} as const;

export const secondaryBtn = {
  ...linkBtn,
  color: "#0B5CAD",
  background: "#fff",
  border: `1px solid ${border}`,
} as const;

type ProductPageHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
  children?: ReactNode;
};

export default function ProductPageHeader({
  title,
  subtitle,
  eyebrow,
  primaryAction,
  secondaryAction,
  children,
}: ProductPageHeaderProps) {
  return (
    <header style={{ marginBottom: 24, fontFamily: pageFont }}>
      {eyebrow ? (
        <p style={{ fontSize: 12, fontWeight: 700, color: muted, margin: "0 0 6px", letterSpacing: "0.04em" }}>
          {eyebrow}
        </p>
      ) : null}
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: navy, lineHeight: 1.15 }}>{title}</h1>
      <p style={{ fontSize: 15, fontWeight: 500, color: muted, margin: "0 0 16px", lineHeight: 1.6, maxWidth: 640 }}>
        {subtitle}
      </p>
      {primaryAction || secondaryAction ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: children ? 14 : 0 }}>
          {primaryAction ? (
            <Link href={primaryAction.href} style={primaryBtn}>
              {primaryAction.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link href={secondaryAction.href} style={secondaryBtn}>
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}

type ProductFlowNavProps = {
  links: { href: string; label: string }[];
};

export function ProductFlowNav({ links }: ProductFlowNavProps) {
  return (
    <nav
      aria-label="Product flow"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
        fontFamily: pageFont,
      }}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0B5CAD",
            textDecoration: "none",
            padding: "6px 10px",
            border: `1px solid ${border}`,
            borderRadius: 6,
            background: "#fff",
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
