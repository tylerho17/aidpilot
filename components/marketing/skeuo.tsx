import type { CSSProperties, ReactNode } from "react";

/**
 * Skeuomorphic desk pieces for the AidPilot marketing site - paper, tape,
 * rubber stamps, a wooden pencil, a graduation cap, textbooks, and a
 * highlighter swipe. Ported verbatim from the Claude Design marketing kit.
 */

export const paperShadow =
  "0 1px 1px rgba(31,41,55,.05), 0 14px 26px -12px rgba(31,41,55,.28)";
export const linedPaper =
  "repeating-linear-gradient(#fff 0, #fff 26px, #E4ECF7 27px, #fff 28px)";

export function Tape({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: 76,
        height: 26,
        background: "rgba(255,247,230,.72)",
        boxShadow: "0 1px 2px rgba(31,41,55,.12)",
        borderLeft: "1px dashed rgba(183,121,31,.25)",
        borderRight: "1px dashed rgba(183,121,31,.25)",
        ...style,
      }}
    />
  );
}

type StickyTone = "amber" | "green" | "blue" | "coral";
export function Sticky({
  tone = "amber",
  rotate = -3,
  children,
  style,
}: {
  tone?: StickyTone;
  rotate?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const c = { amber: "#FFF3D6", green: "#DFF6E8", blue: "#E4EFFF", coral: "#FFE0E3" }[tone];
  return (
    <div
      style={{
        position: "relative",
        width: 150,
        minHeight: 150,
        background: c,
        padding: "20px 16px 16px",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 10px 20px -8px rgba(31,41,55,.28)",
        ...style,
      }}
    >
      <Tape style={{ top: -12, left: "50%", marginLeft: -38, transform: "rotate(-2deg)" }} />
      {children}
    </div>
  );
}

type StampTone = "green" | "blue" | "coral";
export function Stamp({
  children,
  tone = "green",
  rotate = -12,
  style,
}: {
  children?: ReactNode;
  tone?: StampTone;
  rotate?: number;
  style?: CSSProperties;
}) {
  const c = { green: "var(--green-600)", blue: "var(--blue-700)", coral: "var(--coral-600)" }[tone];
  return (
    <div
      style={{
        display: "inline-block",
        color: c,
        border: `3px solid ${c}`,
        borderRadius: 8,
        padding: "5px 12px",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: 15,
        letterSpacing: "1px",
        textTransform: "uppercase",
        transform: `rotate(${rotate}deg)`,
        opacity: 0.82,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Realistic wooden pencil: dark lead point → tan wood cone → yellow hex body
   → silver ferrule with bands → pink eraser. */
export function Pencil({ style }: { style?: CSSProperties }) {
  const H = 22;
  return (
    <div
      style={{
        position: "absolute",
        width: 236,
        height: H,
        display: "flex",
        alignItems: "stretch",
        filter: "drop-shadow(0 7px 7px rgba(31,41,55,.22))",
        ...style,
      }}
    >
      <div style={{ position: "relative", width: 30, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, width: 0, height: 0, borderTop: `${H / 2}px solid transparent`, borderBottom: `${H / 2}px solid transparent`, borderRight: "30px solid #E7C79A" }} />
        <div style={{ position: "absolute", left: 0, top: H / 2 - 5, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "11px solid #3B3B3B" }} />
      </div>
      <div style={{ flex: 1, background: "linear-gradient(to bottom, #E19A00 0%, #FFCE3A 20%, #FFE488 48%, #FFCE3A 76%, #DC9200 100%)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: 1, background: "rgba(255,255,255,.45)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "28%", height: 1, background: "rgba(0,0,0,.09)" }} />
      </div>
      <div style={{ width: 22, flexShrink: 0, background: "linear-gradient(to bottom, #C6C6CF, #F2F2F6 45%, #ADADB8)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 5, height: 1.5, background: "rgba(0,0,0,.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 5, height: 1.5, background: "rgba(0,0,0,.16)" }} />
      </div>
      <div style={{ width: 20, flexShrink: 0, background: "linear-gradient(to bottom, #F6A9B7, #E97C90)", borderRadius: "0 10px 10px 0" }} />
    </div>
  );
}

/* Graduation cap - mortarboard with a gold button and a gently-swaying tassel. */
export function GradCap({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: 104, height: 84, ...style }}>
      <div style={{ position: "absolute", top: 34, left: 30, width: 44, height: 24, background: "linear-gradient(#31465C, #22333F)", borderRadius: "0 0 9px 9px" }} />
      <div style={{ position: "absolute", top: 12, left: 6, width: 92, height: 44, background: "linear-gradient(135deg, #24344A, #34495F)", transform: "rotate(45deg) scaleY(.52)", borderRadius: 6, boxShadow: "0 10px 16px -8px rgba(31,41,55,.45)" }} />
      <div style={{ position: "absolute", top: 24, left: 48, width: 9, height: 9, borderRadius: "50%", background: "#F4B70E", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
      <div className="animate-sway" style={{ position: "absolute", top: 28, left: 51 }}>
        <div style={{ width: 2.5, height: 30, background: "#F4B70E", margin: "0 auto" }} />
        <div style={{ width: 11, height: 17, background: "linear-gradient(#F4B70E,#E09A0C)", borderRadius: "0 0 5px 5px", marginTop: -1 }} />
      </div>
    </div>
  );
}

/* A small stack of textbooks in the brand tints. */
export function Books({ style }: { style?: CSSProperties }) {
  const book = (grad: string, rot: number, mb: number, w: number, key: number) => (
    <div key={key} style={{ position: "relative", height: 20, width: w, background: grad, borderRadius: 4, transform: `rotate(${rot}deg)`, marginBottom: mb, boxShadow: "0 5px 11px -6px rgba(31,41,55,.4)" }}>
      <div style={{ position: "absolute", left: 9, top: 4, bottom: 4, width: 3, background: "rgba(255,255,255,.5)", borderRadius: 2 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", width: 128, ...style }}>
      {book("linear-gradient(#EFAF3A,#E0940F)", -3, 6, 128, 0)}
      {book("linear-gradient(#15885A,#0F6E48)", 2, 6, 118, 1)}
      {book("linear-gradient(#3E86D6,#2A6FBD)", -1, 0, 126, 2)}
    </div>
  );
}

type HighlightTone = "amber" | "blue" | "green";
export function Highlight({ children, tone = "amber" }: { children?: ReactNode; tone?: HighlightTone }) {
  const c = { amber: "rgba(255,199,60,.5)", blue: "rgba(62,134,214,.28)", green: "rgba(21,136,90,.24)" }[tone];
  return (
    <span
      style={{
        background: `linear-gradient(${c},${c})`,
        backgroundSize: "100% 42%",
        backgroundPosition: "0 78%",
        backgroundRepeat: "no-repeat",
        padding: "0 2px",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}
