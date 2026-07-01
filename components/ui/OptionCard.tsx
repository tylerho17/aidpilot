"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * Selectable option card - the onboarding "pick your goals" pattern. Unselected
 * is a white bordered row; selected gets a blue border, soft-blue fill, and a
 * check. Works as a single choice or one of a multi-select set.
 */
export type OptionCardProps = {
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: string;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function OptionCard({
  selected = false,
  onClick,
  icon,
  title,
  description,
  className = "",
  style,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: `1.5px solid ${selected ? "var(--blue-700)" : "var(--border-default)"}`,
        background: selected ? "var(--blue-100)" : "var(--white)",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "border-color .15s ease, background .15s ease",
        ...style,
      }}
    >
      {icon && (
        <span style={{ display: "flex", color: selected ? "var(--blue-700)" : "var(--gray-400)", flexShrink: 0 }}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{title}</span>
        {description && (
          <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-500)", marginTop: 2 }}>
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background: selected ? "var(--blue-700)" : "transparent",
          border: selected ? "none" : "1.5px solid var(--border-default)",
        }}
      >
        {selected && <Icon name="check" size={13} color="#fff" strokeWidth={3.2} />}
      </span>
    </button>
  );
}
