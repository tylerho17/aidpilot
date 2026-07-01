import React from "react";

/**
 * The base AidPilot surface. `variant="flat"` (default) is the classic white
 * card with a hairline blue border and soft far-throw shadow — used on
 * marketing. `variant="clay"` is the app treatment: a puffy, tactile
 * Claymorphism × Material surface (chunky radius, molded shadow, no border)
 * that's friendly and easy for students and parents. Set `lift` for hover.
 */
export function Card({
  children,
  variant = "flat",   // "flat" | "clay"
  lift = false,
  padding = 20,
  radius,
  as: Tag = "div",
  className = "",
  style,
  ...rest
}) {
  const clay = variant === "clay";
  return (
    <Tag
      className={`${lift ? "card-lift" : ""} ${className}`.trim()}
      style={{
        background: "var(--surface-card)",
        border: clay ? "none" : "1px solid var(--border-card)",
        borderRadius: radius || (clay ? "var(--radius-clay)" : "var(--radius-2xl)"),
        boxShadow: clay ? "var(--shadow-clay)" : "var(--shadow-card)",
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
