"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Dashboard stat / metric box. Claymorphism × Material: a puffy, tactile card
 * with a soft molded shadow, a colored Material icon chip, and a subtle diagonal
 * gradient wash of the tone. The headline figure is set in Rubik - precise and
 * professional - so money and counts read clearly for students AND parents.
 */
const TONES = {
  blue:  { chip: "var(--blue-100)",  fg: "var(--blue-700)",  wash: "var(--blue-50)",  ring: "var(--blue-200)" },
  green: { chip: "var(--green-100)", fg: "var(--green-600)", wash: "#F1FBF6", ring: "var(--green-200)" },
  amber: { chip: "var(--amber-100)", fg: "var(--amber-600)", wash: "#FFFBF0", ring: "var(--amber-200)" },
  coral: { chip: "var(--coral-100)", fg: "var(--coral-600)", wash: "#FFF5F6", ring: "var(--coral-200)" },
};

type StatCardTone = "blue" | "green" | "amber" | "coral";

export type StatCardProps = {
  label?: ReactNode;
  value?: ReactNode;
  sub?: ReactNode;
  icon?: string;
  tone?: StatCardTone;
  valueColor?: string;
  className?: string;
  style?: CSSProperties;
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "blue",
  valueColor = "var(--ink-900)",
  className = "",
  style,
}: StatCardProps) {
  const [hover, setHover] = useState(false);
  const t = TONES[tone] || TONES.blue;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        backgroundColor: "var(--surface-card)",
        backgroundImage: `linear-gradient(150deg, #fff 52%, ${t.wash} 150%)`,
        borderRadius: "var(--radius-clay)",
        padding: "20px 22px",
        // calm, non-moving hover: a soft tone ring appears - the card stays put
        boxShadow: hover ? `var(--shadow-clay), 0 0 0 2px ${t.ring}` : "var(--shadow-clay)",
        transition: "box-shadow .2s ease",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)" }}>{label}</div>
        {icon && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 11, background: t.chip, boxShadow: "inset 0 2px 2px rgba(255,255,255,.7), inset 0 -2px 4px rgba(11,92,173,.06)" }}>
            <Icon name={icon} size={18} color={t.fg} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-metric)", fontSize: 32, fontWeight: 700, color: valueColor, lineHeight: 1.05, letterSpacing: "-.5px" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)", marginTop: 7 }}>{sub}</div>}
    </div>
  );
}
