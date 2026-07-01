import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * AidPilot checkbox row. A rounded 20px box that fills brand-blue with a white
 * check when selected, beside a label. Controlled via `checked` + `onChange`.
 */
export function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = "",
  style,
}) {
  const boxId = id || (label ? `cb-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <label
      htmlFor={boxId}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 15,
        fontWeight: 600,
        color: disabled ? "var(--gray-400)" : "var(--ink-700)",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      <input
        id={boxId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: 6,
          flexShrink: 0,
          background: checked ? "var(--blue-700)" : "var(--white)",
          border: `1.5px solid ${checked ? "var(--blue-700)" : "var(--border-default)"}`,
          transition: "background .12s ease, border-color .12s ease",
        }}
      >
        {checked && <Icon name="check" size={13} color="#fff" strokeWidth={3.2} />}
      </span>
      {label}
    </label>
  );
}
