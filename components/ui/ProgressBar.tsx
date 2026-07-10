"use client";

import type { CSSProperties } from "react";

/**
 * AidPilot progress bar. Rounded track with a blue→light-blue gradient fill
 * that eases its width. Used for FAFSA/onboarding completion and aid goals.
 */
export type ProgressBarProps = {
  pct?: number;
  fill?: string;
  height?: number;
  track?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function ProgressBar({
  pct = 0,
  fill = "var(--gradient-progress)",
  height = 10,
  track = "var(--track)",
  label,
  showValue = false,
  className = "",
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={className} style={style}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          {label && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>{label}</span>}
          {showValue && (
            <span className="font-display" style={{ fontSize: 13, fontWeight: 900, color: "var(--blue-700)" }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div style={{ height, borderRadius: 999, background: track, overflow: "hidden" }}>
        <div
          className="progress-fill"
          style={{ height: "100%", borderRadius: 999, background: fill, width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
