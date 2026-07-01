import { colors, fontFamily, radius } from "@/lib/design-tokens";

export const PlaneSVG = ({ size = 18, color = colors.primary, strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

export const CheckSVG = ({ size = 13, color = "#fff", strokeWidth = 3 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

export {
  PillBadge,
  ProductCard,
  StatCard,
  StatusBadge,
  SectionCard,
  MetricCard,
} from "@/components/ui";

export function ProgressBar({ pct, color = colors.primary }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 8, borderRadius: radius.pill, background: colors.border, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          borderRadius: radius.pill,
          background: color,
          width: `${pct}%`,
          transition: "width 0.8s cubic-bezier(.2,.7,.2,1)",
        }}
      />
    </div>
  );
}

export function PageContentSkeleton({ message }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily }}>
      {message ? <p style={{ color: colors.textMuted, margin: 0, fontSize: 15 }}>{message}</p> : null}
      <div style={{ height: 120, borderRadius: radius.lg, background: colors.border }} />
      <div style={{ height: 120, borderRadius: radius.lg, background: colors.border }} />
    </div>
  );
}
