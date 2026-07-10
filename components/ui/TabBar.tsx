"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "./Icon";

type Tab = {
  key: string;
  label: string;
  icon?: string;
};

type TabBarProps = {
  tabs?: Tab[];
  active?: string;
  onChange?: (key: string) => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * Centered top-bar tab navigation (Claymorphism × Material). A softly recessed
 * "track" holds the tabs; the active one lifts into a raised, molded brand-blue
 * pill - an unmistakable indicator of where you are.
 *
 * The pill is ONE persistent element that glides to the active tab
 * (translateX + width on the spring curve), Apple-segmented-control style.
 * It measures the active button in a layout effect, so the first paint lands
 * in place with no slide-in, and a ResizeObserver keeps it aligned through
 * font swaps and window resizes.
 */
export function TabBar({
  tabs = [],          // [{ key, label, icon }]
  active,
  onChange,
  className = "",
  style,
}: TabBarProps) {
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const el = active ? buttonRefs.current.get(active) : undefined;
    if (!el) {
      setPill(null);
      return;
    }
    const update = () => {
      const x = el.offsetLeft;
      const w = el.offsetWidth;
      setPill((prev) => (prev && prev.x === x && prev.w === w ? prev : { x, w }));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);
    return () => observer.disconnect();
  }, [active, tabs]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        gap: 4,
        padding: 6,
        borderRadius: 999,
        background: "var(--surface-app)",
        boxShadow: "inset 0 2px 5px rgba(11,92,173,.12), inset 0 -2px 3px rgba(255,255,255,.8)",
        ...style,
      }}
    >
      {/* The sliding pill - one element gliding beneath the buttons. */}
      {pill && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 6,
            bottom: 6,
            left: 0,
            width: pill.w,
            transform: `translateX(${pill.x}px)`,
            borderRadius: 999,
            backgroundColor: "var(--blue-700)",
            boxShadow: "var(--shadow-clay-brand)",
            transition: "transform .3s var(--ease-spring), width .3s var(--ease-spring)",
            willChange: "transform, width",
          }}
        />
      )}
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            ref={(el) => {
              if (el) buttonRefs.current.set(t.key, el);
              else buttonRefs.current.delete(t.key);
            }}
            type="button"
            onClick={() => onChange && onChange(t.key)}
            aria-current={on ? "page" : undefined}
            style={{
              position: "relative",
              zIndex: 1,
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
              backgroundColor: "transparent",
              transition: "color .18s ease",
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
