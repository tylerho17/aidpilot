"use client";

import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";

/**
 * Duolingo-style FAFSA journey - a winding trail of chunky, tappable nodes.
 * Done steps are green checks, the current step bobs with a pulsing ring and a
 * START/CONTINUE bubble, upcoming steps are muted numbers. Tapping a node marks
 * it (demo toggles locally) so the path fills in as you go. All tokens, no hex.
 */

export type JourneyStep = { id: string; title: string; done: boolean };

const NODE = 60;
const NODE_CURRENT = 78;

/** Organic left/right sway so the trail winds like a path instead of a list. */
function offsetFor(index: number): number {
  return Math.round(Math.sin(index * 0.85) * 62);
}

function TrailDots({ filled }: { filled: boolean }) {
  const color = filled ? "var(--green-600)" : "var(--gray-200)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 0" }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      ))}
    </div>
  );
}

function Node({
  step,
  index,
  state,
  bubble,
  popping,
  onToggle,
}: {
  step: JourneyStep;
  index: number;
  state: "done" | "current" | "upcoming";
  bubble: string;
  popping: boolean;
  onToggle: () => void;
}) {
  const size = state === "current" ? NODE_CURRENT : NODE;

  const face: Record<typeof state, { bg: string; shade: string; fg: string }> = {
    done: { bg: "var(--green-600)", shade: "var(--green-700)", fg: "#fff" },
    current: { bg: "var(--blue-700)", shade: "var(--blue-900)", fg: "#fff" },
    upcoming: { bg: "var(--gray-100)", shade: "var(--gray-300)", fg: "var(--gray-400)" },
  };
  const c = face[state];

  const nodeStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: c.bg,
    color: c.fg,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    fontFamily: "var(--font-metric)",
    fontWeight: 700,
    fontSize: 22,
    // consumed by .duo-node:active for the press-compress
    ["--duo-shade" as string]: c.shade,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `translateX(${offsetFor(index)}px)` }}>
      <div className={state === "current" ? "duo-bob" : ""} style={{ position: "relative" }}>
        {state === "current" && (
          <span
            className="duo-ring"
            aria-hidden
            style={{ position: "absolute", inset: 0, borderRadius: "50%", zIndex: 0 }}
          />
        )}
        {state === "current" && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--surface-card)",
              border: "2px solid var(--blue-200)",
              color: "var(--blue-700)",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 12.5,
              letterSpacing: ".5px",
              padding: "6px 12px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow-clay-sm)",
              zIndex: 2,
            }}
          >
            {bubble}
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "7px solid var(--blue-200)",
              }}
            />
          </div>
        )}
        <button
          type="button"
          className={`duo-node${popping ? " animate-pop" : ""}`}
          style={{ ...nodeStyle, position: "relative", zIndex: 1 }}
          onClick={onToggle}
          aria-label={`${step.title} - ${state === "done" ? "completed, tap to undo" : "tap to mark complete"}`}
        >
          {state === "done" ? (
            <Icon name="check" size={size * 0.5} color="#fff" strokeWidth={3.4} />
          ) : state === "current" ? (
            <Icon name="plane" size={size * 0.44} color="#fff" strokeWidth={2} />
          ) : (
            index + 1
          )}
        </button>
      </div>
      <div
        style={{
          maxWidth: 160,
          textAlign: "center",
          fontSize: 12.5,
          fontWeight: state === "upcoming" ? 500 : 700,
          lineHeight: 1.3,
          color: state === "upcoming" ? "var(--gray-400)" : "var(--ink-800)",
        }}
      >
        {step.title}
      </div>
    </div>
  );
}

export function FafsaJourney({
  steps,
  currentId,
  poppingId,
  onToggle,
  bubbleLabel,
}: {
  steps: JourneyStep[];
  currentId: string | null;
  poppingId: string | null;
  onToggle: (id: string) => void;
  bubbleLabel: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 4px" }}>
      {steps.map((step, index) => {
        const state: "done" | "current" | "upcoming" = step.done
          ? "done"
          : step.id === currentId
            ? "current"
            : "upcoming";
        return (
          <div key={step.id} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Node
              step={step}
              index={index}
              state={state}
              bubble={bubbleLabel}
              popping={poppingId === step.id}
              onToggle={() => onToggle(step.id)}
            />
            {index < steps.length - 1 && <TrailDots filled={step.done} />}
          </div>
        );
      })}
    </div>
  );
}
