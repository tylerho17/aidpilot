import React, { useState } from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * AidPilot text input. Rounded 14px field with a 1.5px border that turns blue
 * with a soft focus ring. Optional label, leading icon, hint, and error state.
 */
export function TextField({
  label,
  hint,
  error,
  icon,
  id,
  className = "",
  style,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const inputId = id || (label ? `tf-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const borderColor = error ? "var(--coral-600)" : focus ? "var(--blue-700)" : "var(--border-default)";

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{ position: "absolute", left: 14, display: "flex", pointerEvents: "none", color: "var(--gray-400)" }}>
            <Icon name={icon} size={17} />
          </span>
        )}
        <input
          id={inputId}
          onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
          {...rest}
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "var(--radius-md)",
            border: `1.5px solid ${borderColor}`,
            padding: icon ? "13px 16px 13px 40px" : "13px 16px",
            fontSize: 15,
            fontFamily: "var(--font-body)",
            color: "var(--ink-800)",
            outline: "none",
            boxShadow: focus && !error ? "0 0 0 3px var(--color-focus-ring)" : "none",
            transition: "border-color .15s ease, box-shadow .15s ease",
          }}
        />
      </div>
      {error ? (
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--coral-600)" }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12.5, color: "var(--gray-400)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
