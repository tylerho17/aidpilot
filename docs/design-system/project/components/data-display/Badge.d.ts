import * as React from "react";

/**
 * Pill badge / status chip. Tone carries meaning: green safe, amber due-soon,
 * coral risk, blue info, gray neutral.
 *
 * @startingPoint section="Components" subtitle="Status pills in all five tones" viewport="700x120"
 */
export interface BadgeProps {
  children: React.ReactNode;
  /** Status tone. Default "blue". */
  tone?: "green" | "amber" | "coral" | "blue" | "gray";
  /** Optional leading Icon name. */
  icon?: string;
  /** Show a small leading status dot. */
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Badge(props: BadgeProps): React.JSX.Element;
