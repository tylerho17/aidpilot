"use client";

import type { CSSProperties } from "react";
import {
  logoAspect,
  logoFull, logoFullWhite,
  logoMark, logoMarkWhite,
  logoWord, logoWordWhite,
} from "./logo-assets";

/**
 * The AidPilot logo - the real brand artwork: a blue "A" monogram whose counter
 * is a paper-plane, beside the two-tone "Aid" (ink) / "Pilot" (blue) wordmark.
 * `variant` picks mark / full lockup / wordmark; `on="brand"` swaps to the white
 * knockout for the blue sidebar and dark surfaces. `size` is the rendered height.
 */

const ART = {
  full:     { light: logoFull,  brand: logoFullWhite,  aspect: logoAspect.full },
  mark:     { light: logoMark,  brand: logoMarkWhite,  aspect: logoAspect.mark },
  wordmark: { light: logoWord,  brand: logoWordWhite,  aspect: logoAspect.word },
};

type LogoVariant = "full" | "mark" | "wordmark";
type LogoOn = "light" | "brand";

type LogoProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "height" | "width"
> & {
  variant?: LogoVariant;
  on?: LogoOn;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function Logo({
  variant = "full",   // "full" | "mark" | "wordmark"
  on = "light",       // "light" | "brand"
  size = 32,          // rendered height in px
  className = "",
  style,
  ...rest
}: LogoProps) {
  const art = ART[variant] || ART.full;
  const src = on === "brand" ? art.brand : art.light;
  return (
    <img
      src={src}
      alt="AidPilot"
      className={className}
      style={{
        height: size,
        width: Math.round(size * art.aspect),
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      {...rest}
    />
  );
}
