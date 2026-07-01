import * as React from "react";

/**
 * Section / page heading: colored uppercase eyebrow + Nunito-900 title, with
 * optional subtitle and trailing action.
 */
export interface SectionHeadingProps {
  eyebrow?: string;
  eyebrowTone?: "blue" | "green" | "amber" | "coral";
  title: string;
  subtitle?: string;
  /** Trailing action node (e.g. a Button) — right-aligned. */
  action?: React.ReactNode;
  align?: "left" | "center";
  /** Title size: sm (24) page, md (30), lg (42) marketing. */
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}
export declare function SectionHeading(props: SectionHeadingProps): React.JSX.Element;
