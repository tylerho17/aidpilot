import * as React from "react";

/**
 * A Linear-style task row — dense, quiet, hover-highlighted, with a circular
 * status checkbox. Stack rows in a container and set `divider` between them.
 *
 * @startingPoint section="Components" subtitle="Linear-style task row" viewport="700x120"
 */
export interface ChecklistItemProps {
  done?: boolean;
  title: string;
  sub?: string;
  /** Trailing badge label shown when not done (becomes "Done" when complete). */
  badge?: string;
  badgeTone?: "green" | "amber" | "coral" | "blue" | "gray";
  /** Play the spring pop on the circle (just-completed feedback). */
  popping?: boolean;
  /** Hairline bottom divider — set on all but the last row in a list. */
  divider?: boolean;
  onToggle?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ChecklistItem(props: ChecklistItemProps): React.JSX.Element;
