"use client";

import { useState } from "react";
import type { CSSProperties, SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";

type SelectOption = string | { value: string; label: string };

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "className" | "style"
> & {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  id?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * AidPilot select. Matches TextField geometry with a custom chevron; native
 * <select> under the hood. Pass `options` as strings or {value,label}.
 */
export function Select({
  label,
  hint,
  error,
  options = [],
  id,
  className = "",
  style,
  ...rest
}: SelectProps) {
  const [focus, setFocus] = useState(false);
  const selectId = id || (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const borderColor = error ? "var(--coral-600)" : focus ? "var(--blue-700)" : "var(--border-default)";

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label htmlFor={selectId} style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <select
          id={selectId}
          {...rest}
          onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
          style={{
            width: "100%",
            boxSizing: "border-box",
            appearance: "none",
            WebkitAppearance: "none",
            borderRadius: "var(--radius-md)",
            border: `1.5px solid ${borderColor}`,
            padding: "13px 40px 13px 16px",
            fontSize: 15,
            fontFamily: "var(--font-body)",
            color: "var(--ink-800)",
            background: "var(--white)",
            outline: "none",
            cursor: "pointer",
            boxShadow: focus && !error ? "0 0 0 3px var(--color-focus-ring)" : "none",
            transition: "border-color .15s ease, box-shadow .15s ease",
          }}
        >
          {options.map((o) => {
            const value = typeof o === "string" ? o : o.value;
            const text = typeof o === "string" ? o : o.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 14, display: "flex", pointerEvents: "none", color: "var(--gray-400)" }}>
          <Icon name="chevron-down" size={18} />
        </span>
      </div>
      {error ? (
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--coral-600)" }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
