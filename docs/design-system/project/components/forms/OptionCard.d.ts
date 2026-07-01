import * as React from "react";

/** Selectable option card (onboarding goal/interest pattern). */
export interface OptionCardProps {
  selected?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional leading Icon name. */
  icon?: string;
  title: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function OptionCard(props: OptionCardProps): React.JSX.Element;
