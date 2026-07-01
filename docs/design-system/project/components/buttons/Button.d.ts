import * as React from "react";

/**
 * AidPilot's primary action control. Trust-blue primary with a soft blue
 * shadow, white secondary outline, or text-only ghost. Rounded or pill.
 *
 * @startingPoint section="Components" subtitle="Primary / secondary / ghost buttons" viewport="700x150"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** Visual weight. Default "primary". `clay` is the puffy app button. */
  variant?: "primary" | "secondary" | "ghost" | "clay";
  /** Size. Default "md". lg is the hero CTA size. */
  size?: "sm" | "md" | "lg";
  /** Corner style. Default "rounded" (14px); "pill" is fully round. */
  shape?: "rounded" | "pill";
  /** Icon name (see Icon) shown before the label. */
  iconLeft?: string;
  /** Icon name shown after the label — e.g. "arrow-right" on CTAs. */
  iconRight?: string;
  /** Show a spinner and block interaction. */
  loading?: boolean;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export declare function Button(props: ButtonProps): React.JSX.Element;
