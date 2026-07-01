import * as React from "react";

/** Custom checkbox row — brand-blue box + white check when selected. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): React.JSX.Element;
