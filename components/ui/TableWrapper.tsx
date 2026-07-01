import type { ReactNode } from "react";
import { colors, fontFamily, radius, text } from "@/lib/design-tokens";

export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-x-auto"
      style={{
        marginBottom: 24,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.card,
        background: colors.card,
        overflow: "hidden",
        WebkitOverflowScrolling: "touch",
        fontFamily,
      }}
    >
      {children}
    </div>
  );
}

export const tableHeaderCell = {
  textAlign: "left" as const,
  ...text.label,
  padding: "12px 16px",
  borderBottom: `2px solid ${colors.border}`,
  whiteSpace: "nowrap" as const,
  fontFamily,
  background: colors.background,
};

export const tableBodyCell = {
  padding: "12px 16px",
  ...text.body,
  color: colors.text,
  borderBottom: `1px solid ${colors.border}`,
  whiteSpace: "nowrap" as const,
  fontFamily,
};
