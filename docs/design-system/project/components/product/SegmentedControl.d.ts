import * as React from "react";

/** Pill segmented control (the marketing demo switcher). */
export interface SegmentedControlProps {
  /** Options as strings or {value,label}. */
  options: Array<string | { value: string; label: string }>;
  value: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}
export declare function SegmentedControl(props: SegmentedControlProps): React.JSX.Element;
