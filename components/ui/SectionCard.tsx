import type { CSSProperties, ReactNode } from "react";
import { cardBase, layout } from "@/lib/design-tokens";

export function SectionCard({
  children,
  style,
  padding = layout.cardPadding,
  noPadding = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
  noPadding?: boolean;
}) {
  return (
    <div style={{ ...cardBase, padding: noPadding ? 0 : padding, ...style }}>{children}</div>
  );
}

/** @deprecated Use SectionCard */
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
    <div className={className} style={{ ...cardBase, padding: layout.cardPadding, ...style }}>
      {children}
    </div>
  );
}
