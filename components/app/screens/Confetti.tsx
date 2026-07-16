"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

/**
 * A lightweight, dependency-free confetti burst (fixed overlay, pointer-events
 * none). Randomizes per-piece color, drift, spin, size, and timing via CSS
 * vars against the confettiFall keyframe. Renders nothing under
 * prefers-reduced-motion. Mount it briefly, then unmount to stop.
 */

const COLORS = [
  "var(--green-600)",
  "var(--blue-500)",
  "var(--blue-700)",
  "var(--amber-600)",
  "var(--coral-600)",
];

/** Pure, deterministic pseudo-random in [0,1) from an index + salt - avoids
 * Math.random() during render (impure) and any hydration mismatch. */
function pr(i: number, salt: number): number {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ count = 46 }: { count?: number }) {
  const reduce =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const pieces = useMemo(() => {
    if (reduce) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: pr(i, 1) * 100,
      w: 7 + pr(i, 2) * 4,
      h: 10 + pr(i, 3) * 6,
      color: COLORS[i % COLORS.length],
      round: pr(i, 4) < 0.35 ? "50%" : "2px",
      drift: -150 + pr(i, 5) * 300,
      spin: 240 + pr(i, 6) * 660,
      dur: 2.2 + pr(i, 7) * 1.1,
      delay: pr(i, 8) * 0.5,
    }));
  }, [count, reduce]);

  if (reduce) return null;

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round,
              "--cf-drift": `${p.drift}px`,
              "--cf-spin": `${p.spin}deg`,
              "--cf-dur": `${p.dur}s`,
              "--cf-delay": `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
