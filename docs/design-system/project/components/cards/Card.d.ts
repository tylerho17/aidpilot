import * as React from "react";

/**
 * The base AidPilot surface: white, hairline blue-tinted border, 20px radius,
 * soft blue shadow. `lift` adds the hover raise.
 *
 * @startingPoint section="Components" subtitle="The base white product card" viewport="700x200"
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  /** "flat" (default, marketing) or "clay" (puffy Claymorphism app surface). */
  variant?: "flat" | "clay";
  /** Enable the signature hover lift. */
  lift?: boolean;
  /** Inner padding (px or CSS). Default 20. */
  padding?: number | string;
  /** Corner radius. Default --radius-2xl (20px). */
  radius?: number | string;
  /** Render as a different element (e.g. "a", "button"). */
  as?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): React.JSX.Element;
