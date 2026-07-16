"use client";

import { useSyncExternalStore } from "react";

/**
 * A paper plane that flies down the margin as you scroll the landing page,
 * banking left/right along a gentle sine flight path with a dotted trail.
 * Desktop only, pointer-events none, and it disappears entirely under
 * prefers-reduced-motion or on narrow screens.
 *
 * Scroll progress lives in a module store read via useSyncExternalStore so the
 * server (and first client paint) render nothing (value -1) and the plane only
 * appears once the client measures - no setState-in-effect, no hydration
 * mismatch.
 */

let value = -1; // -1 = unmeasured or disabled -> render nothing
const listeners = new Set<() => void>();
let lastRun = 0;

function measure() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  if (next === value) return;
  value = next;
  listeners.forEach((l) => l());
}

// Timestamp throttle instead of rAF - stays correct even when the tab isn't
// painting (rAF pauses on hidden tabs); a decorative plane doesn't need 60fps.
function onScroll() {
  const now = Date.now();
  if (now - lastRun < 50) return;
  lastRun = now;
  measure();
}

function subscribe(cb: () => void): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 1100px)").matches;
  if (reduce || !wide) {
    value = -1;
    return () => {};
  }
  listeners.add(cb);
  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  return () => {
    listeners.delete(cb);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

export function ScrollPlane() {
  const progress = useSyncExternalStore(subscribe, () => value, () => -1);
  if (progress < 0) return null;

  // Fly from ~14% to ~86% of viewport height as the page scrolls; sway
  // horizontally on a sine so it banks like a flight path.
  const topVh = 14 + progress * 72;
  const sway = Math.sin(progress * Math.PI * 3); // -1..1
  const x = sway * 26;
  const rotate = 8 + sway * 22;

  return (
    <div
      aria-hidden
      style={{ position: "fixed", top: 0, right: "3.2vw", height: "100vh", width: 60, pointerEvents: "none", zIndex: 60 }}
    >
      <div
        style={{
          position: "absolute",
          top: "12vh",
          bottom: "10vh",
          left: "50%",
          width: 0,
          borderLeft: "2px dashed var(--blue-200)",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: `${topVh}vh`,
          left: "50%",
          transform: `translate(calc(-50% + ${x}px), -50%) rotate(${rotate}deg)`,
          transition: "top .12s linear, transform .12s linear",
          filter: "drop-shadow(0 8px 10px rgba(31,41,55,.18))",
        }}
      >
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path d="M44 4 L6 20 L20 25 Z" fill="#FDFDFB" stroke="var(--blue-300)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M44 4 L20 25 L24 40 Z" fill="var(--blue-100)" stroke="var(--blue-300)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M44 4 L20 25 L21 30 Z" fill="var(--blue-200)" />
        </svg>
      </div>
    </div>
  );
}
