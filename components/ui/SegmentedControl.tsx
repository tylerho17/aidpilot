"use client";

import type { CSSProperties } from "react";

type SegmentedControlOption =
  | string
  | { value: string; label: string };

export type SegmentedControlProps = {
  options?: SegmentedControlOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
};

/**
 * Pill segmented control - the marketing demo switcher. A row of pill tabs;
 * the active one is solid brand-blue with a blue-tinted shadow, the rest are
 * white outlines. Options are strings or {value,label}.
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md", // "sm" | "md"
  className = "",
  style,
}: SegmentedControlProps) {
  const pad = size === "sm" ? "8px 14px" : "11px 20px";
  const fs = size === "sm" ? 14 : 15;
  return (
    <div className={className} style={{ display: "flex", flexWrap: "wrap", gap: 10, ...style }}>
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const on = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange && onChange(val)}
            style={{
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: fs,
              fontWeight: 700,
              padding: pad,
              borderRadius: 999,
              transition: "all .2s ease",
              border: `1.5px solid ${on ? "var(--blue-700)" : "var(--border-default)"}`,
              background: on ? "var(--blue-700)" : "var(--white)",
              color: on ? "#fff" : "var(--gray-500)",
              boxShadow: on ? "0 10px 20px rgba(11,92,173,.22)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
