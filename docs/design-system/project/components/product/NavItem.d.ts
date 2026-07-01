import * as React from "react";

/** Sidebar nav item for the blue rail (or a light surface). */
export interface NavItemProps {
  /** Icon name (see Icon). */
  icon?: string;
  label: string;
  active?: boolean;
  /** "brand" for the blue sidebar (default), "light" for white surfaces. */
  on?: "brand" | "light";
  /** Small trailing tag, e.g. "Soon". */
  tag?: string;
  href?: string;
  onClick?: React.MouseEventHandler;
  className?: string;
  style?: React.CSSProperties;
}
export declare function NavItem(props: NavItemProps): React.JSX.Element;
