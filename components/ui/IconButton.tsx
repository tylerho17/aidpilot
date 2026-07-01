"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Icon } from "./Icon";

/**
 * Square icon-only button. Three treatments matching AidPilot surfaces:
 * soft (blue tint), ghost (transparent), and solid (brand blue). Used for
 * bookmarks, dismiss, and compact toolbar actions.
 */

const IB_SIZES: Record<"sm" | "md" | "lg", number> = { sm: 30, md: 36, lg: 42 };

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "aria-label" | "disabled" | "onClick" | "className" | "style"
> & {
  icon: string;
  variant?: "soft" | "ghost" | "solid";
  size?: "sm" | "md" | "lg";
  active?: boolean;
  "aria-label"?: string;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
  style?: CSSProperties;
};

export function IconButton({
  icon,
  variant = "soft", // "soft" | "ghost" | "solid"
  size = "md", // "sm" | "md" | "lg"
  active = false,
  "aria-label": ariaLabel,
  disabled = false,
  onClick,
  className = "",
  style,
  ...rest
}: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const dim = IB_SIZES[size] || IB_SIZES.md;

  let bg, color;
  if (variant === "solid") {
    bg = hover ? "var(--blue-900)" : "var(--blue-700)";
    color = "#fff";
  } else if (variant === "ghost") {
    bg = hover ? "var(--gray-100)" : "transparent";
    color = active ? "var(--blue-700)" : "var(--gray-500)";
  } else {
    bg = active ? "var(--blue-100)" : hover ? "var(--blue-100)" : "var(--surface-app)";
    color = "var(--blue-700)";
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: "var(--radius-sm)",
        border: "none",
        backgroundColor: bg,
        color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color .15s ease",
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(dim * 0.5)} color="currentColor" strokeWidth={2} />
    </button>
  );
}
