import * as React from "react";

/** Rounded, tinted square holding an Icon. */
export interface IconTileProps {
  /** Icon name (see Icon). */
  icon: string;
  /** Fill/icon tone. Default "blue". */
  tone?: "blue" | "green" | "amber" | "coral" | "brand";
  /** Square edge in px. Default 52. */
  size?: number;
  /** Corner radius override (defaults to ~0.3× size). */
  radius?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare function IconTile(props: IconTileProps): React.JSX.Element;
