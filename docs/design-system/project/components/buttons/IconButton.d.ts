import * as React from "react";

/**
 * Square icon-only button — soft blue tint, ghost, or solid brand.
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** Icon name (see Icon). */
  icon: string;
  /** Treatment. Default "soft". */
  variant?: "soft" | "ghost" | "solid";
  /** Size. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Active/selected state (e.g. bookmarked). */
  active?: boolean;
  /** Accessible label — always provide one for icon-only buttons. */
  "aria-label"?: string;
  style?: React.CSSProperties;
}

export declare function IconButton(props: IconButtonProps): React.JSX.Element;
