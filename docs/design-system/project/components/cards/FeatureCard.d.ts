import * as React from "react";

/** Feature card: tinted icon tile, title, copy, optional corner badge. */
export interface FeatureCardProps {
  icon: string;
  tone?: "blue" | "green" | "amber" | "coral" | "brand";
  title: string;
  children?: React.ReactNode;
  /** Corner badge label (e.g. "Coming soon"). */
  badge?: string;
  badgeTone?: "green" | "amber" | "coral" | "blue" | "gray";
  className?: string;
  style?: React.CSSProperties;
}
export declare function FeatureCard(props: FeatureCardProps): React.JSX.Element;
