"use client";

import { useState } from "react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * AidPilot button. Primary is the saturated trust-blue with a soft blue-tinted
 * shadow; secondary is a white outline; ghost is text-only; `clay` is the puffy
 * Claymorphism × Material app button (molded blue, chunky, presses inward).
 * Hover deepens the color and lifts the shadow; press settles it back down.
 */

const SIZES = {
  sm: { padding: "8px 16px", fontSize: 14, radius: 12, icon: 15, gap: 7 },
  md: { padding: "11px 20px", fontSize: 15, radius: 14, icon: 17, gap: 8 },
  lg: { padding: "16px 30px", fontSize: 17, radius: 14, icon: 19, gap: 10 },
} as const;

type ButtonVariant = "primary" | "secondary" | "ghost" | "clay";
type ButtonSize = "sm" | "md" | "lg";
type ButtonShape = "rounded" | "pill";

type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  iconLeft?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "onClick" | "className" | "style" | "disabled"
>;

export function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "ghost" | "clay"
  size = "md", // "sm" | "md" | "lg"
  shape = "rounded", // "rounded" | "pill"
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;
  const clay = variant === "clay";
  const radius = shape === "pill" ? 999 : clay ? Math.max(s.radius + 4, 18) : s.radius;

  let bg: string;
  let color: string;
  let border: string;
  let shadow: string;
  let bgImage = "none";
  if (clay) {
    bg = isDisabled ? "var(--gray-200)" : "var(--blue-700)";
    bgImage = isDisabled
      ? "none"
      : hover
        ? "linear-gradient(180deg,#2A6FBD,#094B8E)"
        : "linear-gradient(180deg,#3E86D6,#0B5CAD)";
    color = isDisabled ? "var(--gray-400)" : "#fff";
    border = "none";
    shadow = isDisabled ? "none" : press ? "var(--shadow-clay-brand-pressed)" : "var(--shadow-clay-brand)";
  } else if (variant === "primary") {
    bg = isDisabled ? "var(--gray-200)" : hover ? "var(--blue-900)" : "var(--blue-700)";
    color = isDisabled ? "var(--gray-400)" : "#fff";
    border = "none";
    shadow = isDisabled ? "none" : hover ? "var(--shadow-btn-lg)" : "var(--shadow-btn)";
  } else if (variant === "secondary") {
    bg = hover && !isDisabled ? "var(--blue-50)" : "#fff";
    color = isDisabled ? "var(--gray-400)" : "var(--blue-700)";
    border = "var(--border-btn-secondary)";
    shadow = "none";
  } else {
    bg = hover && !isDisabled ? "var(--gray-100)" : "transparent";
    color = isDisabled ? "var(--gray-400)" : "var(--gray-500)";
    border = "none";
    shadow = "none";
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        width: fullWidth ? "100%" : "auto",
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        color,
        backgroundColor: bg,
        backgroundImage: bgImage,
        border,
        borderRadius: radius,
        boxShadow: shadow,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform: press && !isDisabled ? (clay ? "translateY(2px)" : "translateY(1px)") : "none",
        transition: "background-color .15s ease, box-shadow .2s ease, transform .1s ease",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Spinner color={variant === "primary" || variant === "clay" ? "#fff" : "var(--blue-700)"} />
      ) : (
        <>
          {iconLeft && <Icon name={iconLeft} size={s.icon} strokeWidth={2.2} />}
          {children}
          {iconRight && <Icon name={iconRight} size={s.icon} strokeWidth={2.2} />}
        </>
      )}
    </button>
  );
}

type SpinnerProps = {
  color: string;
};

function Spinner({ color }: SpinnerProps) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        border: `2.5px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin .7s linear infinite",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
