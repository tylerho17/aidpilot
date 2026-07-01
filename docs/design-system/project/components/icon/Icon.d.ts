import * as React from "react";

/**
 * AidPilot line-icon set. 24×24 stroked glyphs (round caps + joins) drawn
 * from the product's own inline SVGs — plane (brand), the sidebar nav set,
 * status glyphs, and directional chevrons/arrows.
 *
 * @startingPoint section="Foundations" subtitle="The AidPilot 24×24 line-icon set" viewport="700x150"
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Glyph name — see ICON_NAMES for the full list. */
  name:
    | "plane"
    | "grid"
    | "clipboard"
    | "file"
    | "calendar"
    | "letter"
    | "gear"
    | "shield"
    | "shield-check"
    | "calendar-check"
    | "star"
    | "bookmark"
    | "check"
    | "arrow-right"
    | "chevron-left"
    | "chevron-down"
    | "x"
    | "plus";
  /** Pixel size (width = height). Default 20. */
  size?: number;
  /** Stroke color. Default `currentColor`. */
  color?: string;
  /** Stroke width. Default 2 (nav uses 2; check marks use 3). */
  strokeWidth?: number;
}

export declare function Icon(props: IconProps): React.JSX.Element | null;

/** Ordered list of every available glyph name. */
export declare const ICON_NAMES: string[];
