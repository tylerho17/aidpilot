import * as React from "react";

/**
 * The AidPilot logo — the real brand artwork: a blue "A" monogram whose counter
 * is a paper-plane, beside the two-tone "Aid" (ink) / "Pilot" (blue) wordmark.
 * Use `on="brand"` for the white knockout on the blue sidebar / dark surfaces.
 *
 * @startingPoint section="Foundations" subtitle="AidPilot A-monogram + wordmark" viewport="700x150"
 */
export interface LogoProps {
  /** "full" = mark + wordmark, "mark" = A-monogram only, "wordmark" = wordmark only. Default "full". */
  variant?: "full" | "mark" | "wordmark";
  /** Surface it sits on. "light" (default, full color) or "brand" (white knockout). */
  on?: "light" | "brand";
  /** Rendered height in px (width scales to preserve the artwork's aspect). Default 32. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function Logo(props: LogoProps): React.JSX.Element;
