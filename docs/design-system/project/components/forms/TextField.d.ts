import * as React from "react";

/**
 * Rounded text input with focus ring, optional label, leading icon, hint, error.
 *
 * @startingPoint section="Components" subtitle="Text inputs, selects, checkboxes" viewport="700x220"
 */
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style"> {
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the field coral and replaces the hint. */
  error?: string;
  /** Leading Icon name. */
  icon?: string;
  style?: React.CSSProperties;
}
export declare function TextField(props: TextFieldProps): React.JSX.Element;
