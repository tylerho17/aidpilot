import * as React from "react";

/**
 * Soft gradient status panel behind AidPilot's emotional messages
 * ("Your aid is protected this week."). Tone drives gradient + accent.
 *
 * @startingPoint section="Components" subtitle="Gradient status callout panel" viewport="700x160"
 */
export interface StatusPanelProps {
  /** Status tone → gradient + border + accent. Default "green". */
  tone?: "green" | "amber" | "coral" | "blue";
  /** Optional leading IconTile glyph. */
  icon?: string;
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string;
  /** Headline (display face). */
  title?: string;
  /** Body copy. */
  children?: React.ReactNode;
  /** Trailing content (e.g. a metric or button). */
  trailing?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function StatusPanel(props: StatusPanelProps): React.JSX.Element;
