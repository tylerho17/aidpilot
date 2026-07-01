"use client";

import type { CSSProperties, ReactNode } from "react";

/** Shared building blocks for the signed-in app screens, from the app UI kit. */

export const money: CSSProperties = {
  fontFamily: "var(--font-metric)",
  fontWeight: 700,
  letterSpacing: "-.5px",
};

export function Greeting({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.7px", color: "var(--ink-900)", margin: 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "7px 0 0" }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 2px 14px" }}>
      <h2 className="font-display" style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-.4px", color: "var(--ink-900)", margin: 0 }}>
        {children}
      </h2>
      {action}
    </div>
  );
}
