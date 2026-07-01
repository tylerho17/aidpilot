import * as React from "react";

/** Soft-blue initials avatar (or image). */
export interface AvatarProps {
  /** 1–2 letter initials fallback. */
  initials?: string;
  /** Optional image URL. */
  src?: string;
  alt?: string;
  /** Named size or explicit px. Default "md". */
  size?: "sm" | "md" | "lg" | "xl" | number;
  /** Slightly brighter fill for the dark sidebar. */
  onBrand?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Avatar(props: AvatarProps): React.JSX.Element;
