import React from "react";

/**
 * AidPilot avatar — a soft-blue initials chip (the app never shows raw photos
 * in the rail). Falls back to initials; pass `src` for a real image.
 */

const AV_SIZES = { sm: 28, md: 34, lg: 44, xl: 52 };

export function Avatar({
  initials = "AP",
  src,
  alt = "",
  size = "md",   // "sm" | "md" | "lg" | "xl" | number
  onBrand = false,
  className = "",
  style,
}) {
  const dim = typeof size === "number" ? size : (AV_SIZES[size] || AV_SIZES.md);
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dim,
    height: dim,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: Math.round(dim * 0.36),
    background: onBrand ? "#EAF3FF" : "var(--blue-100)",
    color: "var(--blue-700)",
    ...style,
  };
  if (src) {
    return (
      <span className={className} style={base}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
    );
  }
  return (
    <span className={className} style={base} aria-label={alt || initials}>
      {initials}
    </span>
  );
}
