import React from "react";
import { IconTile } from "./IconTile.jsx";
import { Badge } from "../data-display/Badge.jsx";

/**
 * Marketing / dashboard feature card: a tinted icon tile, title, and a line of
 * copy, on the lifting white card. Optional corner badge (e.g. "Coming soon").
 */
export function FeatureCard({
  icon,
  tone = "blue",
  title,
  children,
  badge,
  badgeTone = "gray",
  className = "",
  style,
}) {
  return (
    <div
      className={`card-lift ${className}`.trim()}
      style={{
        position: "relative",
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-card)",
        padding: 22,
        ...style,
      }}
    >
      {badge && (
        <span style={{ position: "absolute", top: 16, right: 16 }}>
          <Badge tone={badgeTone}>{badge}</Badge>
        </span>
      )}
      <IconTile icon={icon} tone={tone} size={46} />
      <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-900)", margin: "14px 0 6px", letterSpacing: "-.3px" }}>
        {title}
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
