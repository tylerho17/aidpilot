import React from "react";
import { Icon } from "../icon/Icon.jsx";

/**
 * Centered top-bar tab navigation (Claymorphism × Material). A softly recessed
 * "track" holds the tabs; the active one lifts into a raised, molded brand-blue
 * pill — an unmistakable indicator of where you are. Built for a small, simple
 * set of destinations so students and parents never get lost.
 */
export function TabBar({
  tabs = [],          // [{ key, label, icon }]
  active,
  onChange,
  className = "",
  style,
}) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 6,
        borderRadius: 999,
        background: "var(--surface-app)",
        boxShadow: "inset 0 2px 5px rgba(11,92,173,.12), inset 0 -2px 3px rgba(255,255,255,.8)",
        ...style,
      }}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange && onChange(t.key)}
            aria-current={on ? "page" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 14.5,
              fontWeight: on ? 800 : 600,
              whiteSpace: "nowrap",
              color: on ? "#fff" : "var(--gray-500)",
              backgroundColor: on ? "var(--blue-700)" : "transparent",
              boxShadow: on ? "var(--shadow-clay-brand)" : "none",
              // NB: do not transition background-color/box-shadow here — when the
              // active pill moves between tabs in one render, the shorthand paint
              // goes stale and the indicator sticks. Snap them; only fade color.
              transition: "color .15s ease",
            }}
          >
            {t.icon && <Icon name={t.icon} size={17} color="currentColor" strokeWidth={2.2} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
