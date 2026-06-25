import type { CSSProperties, ReactNode } from "react";

export const PlaneSVG = ({ size = 18, color = "#fff", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

export const CheckSVG = ({ size = 13, color = "#fff", strokeWidth = 3 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

type BadgeTone = "green" | "amber" | "coral" | "blue" | "gray";

const BADGE: Record<BadgeTone, { bg: string; fg: string }> = {
  green: { bg: "#EAFBF1", fg: "#15885A" },
  amber: { bg: "#FFF7E6", fg: "#B7791F" },
  coral: { bg: "#FFE4E6", fg: "#C04E57" },
  blue: { bg: "#EAF3FF", fg: "#0B5CAD" },
  gray: { bg: "#F3F4F6", fg: "#6B7280" },
};

export function PillBadge({ children, tone = "blue" }: { children: ReactNode; tone?: BadgeTone }) {
  const p = BADGE[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 800,
        padding: "6px 12px",
        borderRadius: 999,
        background: p.bg,
        color: p.fg,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = "#15212E",
  style,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="card-lift" style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, padding: "18px 20px", boxShadow: "0 4px 12px rgba(11,92,173,.05)", ...style }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function ProductCard({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`card-lift ${className}`}
      style={{
        background: "#fff",
        border: "1px solid #E6EDF6",
        borderRadius: 20,
        boxShadow: "0 16px 34px -24px rgba(11,92,173,.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ pct, color = "linear-gradient(90deg,#0B5CAD,#3E86D6)" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 10, borderRadius: 999, background: "#E9EEF3", overflow: "hidden" }}>
      <div
        className="progress-fill"
        style={{
          height: "100%",
          borderRadius: 999,
          background: color,
          width: `${pct}%`,
        }}
      />
    </div>
  );
}
