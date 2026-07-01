import * as React from "react";

/** Dashboard metric box (Claymorphism × Material): label + Rubik value + optional icon chip. */
export interface StatCardProps {
  label: string;
  /** The headline figure — rendered in Rubik (the professional metric face). */
  value: string;
  /** Optional secondary line. */
  sub?: string;
  /** Optional Material icon-chip name (see Icon). */
  icon?: string;
  /** Icon-chip tone. Default "blue". */
  tone?: "blue" | "green" | "amber" | "coral";
  /** Value color — e.g. green for "secured", coral for "at risk". */
  valueColor?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): React.JSX.Element;
