import React, { useState } from "react";
import { Icon } from "../icon/Icon.jsx";
import { Badge } from "../data-display/Badge.jsx";

/**
 * A single task row, styled after Linear's issue list: dense, quiet, and
 * keyboard-clean. A circular status checkbox (fills green when done), a plain
 * title with muted inline meta, and a small trailing status pill. The whole row
 * highlights on hover; stack rows in a container and set `divider` for the
 * hairline between them. `popping` plays the spring pop on completion.
 */
export function ChecklistItem({
  done = false,
  title,
  sub,
  badge,
  badgeTone = "blue",
  popping = false,
  divider = false,
  onToggle,
  className = "",
  style,
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        padding: "11px 12px",
        borderRadius: 10,
        background: hover ? "var(--blue-50)" : "transparent",
        borderBottom: divider ? "1px solid var(--border-card)" : "1px solid transparent",
        transition: "background .12s ease",
        ...style,
      }}
    >
      <span
        className={popping ? "animate-pop" : ""}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "50%",
          flexShrink: 0,
          border: done ? "none" : `2px solid ${hover ? "var(--blue-700)" : "var(--gray-300)"}`,
          background: done ? "var(--green-600)" : "transparent",
          transition: "background .15s ease, border-color .15s ease",
        }}
      >
        {done && <Icon name="check" size={11} color="#fff" strokeWidth={3.5} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: done ? "var(--gray-400)" : "var(--ink-800)", textDecoration: done ? "line-through" : "none", textDecorationColor: "var(--gray-300)" }}>
          {title}
        </span>
        {sub && <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", marginLeft: 9 }}>{sub}</span>}
      </div>
      {badge && <Badge tone={done ? "green" : badgeTone}>{done ? "Done" : badge}</Badge>}
    </div>
  );
}
