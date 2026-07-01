import type { ReactNode } from "react";
import { colors, fontFamily } from "@/lib/design-tokens";

export function DataRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
        borderBottom: `1px solid ${colors.border}`,
        fontSize: 14,
        fontWeight: emphasize ? 600 : 400,
        color: emphasize ? colors.text : colors.textMuted,
        fontFamily,
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: emphasize ? 700 : 500, color: emphasize ? colors.text : colors.textMuted }}>
        {value}
      </span>
    </div>
  );
}

export function DataRowHeader({
  columns,
}: {
  columns: string[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        gap: 12,
        padding: "10px 16px",
        borderBottom: `2px solid ${colors.border}`,
        fontFamily,
      }}
    >
      {columns.map((col) => (
        <span key={col} style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>
          {col}
        </span>
      ))}
    </div>
  );
}

export function DataRowItem({
  cells,
  onClick,
  selected,
}: {
  cells: ReactNode[];
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
        gap: 12,
        padding: "12px 16px",
        borderBottom: `1px solid ${colors.border}`,
        background: selected ? colors.softBlue : colors.card,
        cursor: onClick ? "pointer" : "default",
        fontFamily,
        alignItems: "center",
      }}
    >
      {cells.map((cell, i) => (
        <div key={i} style={{ fontSize: 14, color: colors.text, minWidth: 0 }}>
          {cell}
        </div>
      ))}
    </div>
  );
}
