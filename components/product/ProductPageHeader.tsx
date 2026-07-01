"use client";

export {
  PageHeader as default,
  PageHeader,
  ProductFlowNav,
} from "@/components/ui/PageHeader";

export {
  primaryButtonStyle as primaryBtn,
  primaryButtonStyle as linkBtn,
  secondaryButtonStyle as secondaryBtn,
} from "@/components/ui";

export { colors as designColors, fontFamily as pageFont } from "@/lib/design-tokens";

/** @deprecated Use colors.text from design-tokens */
export const navy = "#1F2937";
/** @deprecated Use colors.textMuted from design-tokens */
export const muted = "#6B7280";
/** @deprecated Use colors.border from design-tokens */
export const border = "#E5E7EB";
