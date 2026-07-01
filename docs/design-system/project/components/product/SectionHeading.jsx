import React from "react";

/**
 * Section / page heading. A colored uppercase eyebrow over a Nunito-900 title,
 * with optional subtitle and a trailing action slot. `align` centers it for
 * marketing sections; `size` scales the title (page vs hero).
 */

const EYEBROW_COLORS = {
  blue: "var(--blue-700)",
  green: "var(--green-600)",
  amber: "var(--amber-600)",
  coral: "var(--coral-600)",
};

const TITLE_SIZES = { sm: 24, md: 30, lg: 42 };

export function SectionHeading({
  eyebrow,
  eyebrowTone = "blue",
  title,
  subtitle,
  action,
  align = "left",   // "left" | "center"
  size = "md",      // "sm" | "md" | "lg"
  className = "",
  style,
}) {
  const centered = align === "center";
  const titleSize = TITLE_SIZES[size] || TITLE_SIZES.md;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: action ? "flex-end" : centered ? "center" : "flex-start",
        justifyContent: action ? "space-between" : "flex-start",
        flexDirection: action ? "row" : "column",
        gap: action ? 16 : 0,
        textAlign: centered ? "center" : "left",
        ...style,
      }}
    >
      <div style={{ margin: centered ? "0 auto" : 0 }}>
        {eyebrow && (
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", color: EYEBROW_COLORS[eyebrowTone] || EYEBROW_COLORS.blue }}>
            {eyebrow}
          </div>
        )}
        {title && (
          <h2
            className="font-display"
            style={{ fontSize: titleSize, fontWeight: 900, letterSpacing: size === "lg" ? "-1px" : "-.6px", color: "var(--ink-900)", lineHeight: 1.12, margin: eyebrow ? "12px 0 0" : 0 }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "10px 0 0", maxWidth: centered ? 620 : 560 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
