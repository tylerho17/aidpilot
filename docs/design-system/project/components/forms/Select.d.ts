import * as React from "react";

/** Native select styled to match TextField, with a custom chevron. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "style"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Options as strings or {value,label} objects. */
  options: Array<string | { value: string; label: string }>;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): React.JSX.Element;
