import type { CSSProperties } from "react";
import { cardBase, colors, layout, text } from "@/lib/design-tokens";

const metricCardBase: CSSProperties = {
  ...cardBase,
  flex: "1 1 0",
  minWidth: 140,
  minHeight: 108,
  padding: layout.cardPadding,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export function MetricCard({
  label,
  value,
  tone = "default",
  style,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "alert";
  style?: CSSProperties;
}) {
  const valueColor =
    tone === "success"
      ? colors.green
      : tone === "warning"
        ? colors.amber
        : tone === "alert"
          ? colors.coral
          : colors.text;

  return (
    <div style={{ ...metricCardBase, ...style }}>
      <div style={{ ...text.label, marginBottom: 8 }}>{label}</div>
      <div style={{ ...text.metric, fontSize: value.length > 12 ? 20 : 28, lineHeight: value.length > 12 ? "28px" : "34px", color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color,
  style,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  style?: CSSProperties;
}) {
  const tone =
    color === colors.green
      ? "success"
      : color === colors.amber
        ? "warning"
        : color === colors.coral
          ? "alert"
          : "default";

  return (
    <div style={style}>
      <MetricCard label={label} value={value} tone={tone} />
      {sub ? <div style={{ ...text.label, marginTop: 8 }}>{sub}</div> : null}
    </div>
  );
}
