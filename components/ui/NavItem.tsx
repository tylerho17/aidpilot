"use client";

import type { CSSProperties, MouseEventHandler } from "react";
import { Icon } from "./Icon";

/**
 * Sidebar navigation item, styled for the AidPilot blue rail. Active items get
 * a solid white pill with blue text + icon; inactive are translucent white.
 * Set `on="light"` to reuse it on a white surface. Optional trailing tag.
 */
export type NavItemProps = {
  icon?: string;
  label?: string;
  active?: boolean;
  on?: "brand" | "light";
  tag?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  style?: CSSProperties;
};

export function NavItem({
  icon,
  label,
  active = false,
  on = "brand", // "brand" (blue sidebar) | "light" (white surface)
  tag, // small trailing label e.g. "Soon"
  href,
  onClick,
  className = "",
  style,
}: NavItemProps) {
  const brand = on === "brand";
  let bg: string, color: string, weight: number;
  if (active) {
    bg = brand ? "#fff" : "var(--blue-100)";
    color = "var(--blue-700)";
    weight = 700;
  } else {
    bg = "transparent";
    color = brand ? "rgba(255,255,255,.78)" : "var(--gray-500)";
    weight = 600;
  }

  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: tag ? "space-between" : "flex-start",
        gap: 10,
        padding: "10px 12px",
        borderRadius: "var(--radius-sm)",
        textDecoration: "none",
        background: bg,
        color,
        fontWeight: weight,
        fontSize: 14,
        fontFamily: "var(--font-body)",
        border: "none",
        width: "100%",
        cursor: "pointer",
        textAlign: "left",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {icon && <Icon name={icon} size={18} color="currentColor" />}
        {label}
      </span>
      {tag && (
        <span style={{ fontSize: 10, fontWeight: 700, color: brand ? "rgba(255,255,255,.4)" : "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".4px" }}>
          {tag}
        </span>
      )}
    </Tag>
  );
}
