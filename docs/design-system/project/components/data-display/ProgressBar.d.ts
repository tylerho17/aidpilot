import * as React from "react";

/** Rounded progress bar with the blue gradient fill. */
export interface ProgressBarProps {
  /** Completion 0–100. */
  pct: number;
  /** CSS background for the fill. Default the AidPilot blue gradient. */
  fill?: string;
  /** Bar height in px. Default 10. */
  height?: number;
  /** Track color. Default --track. */
  track?: string;
  /** Optional caption above the bar. */
  label?: string;
  /** Show the percentage value at the right. */
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): React.JSX.Element;
