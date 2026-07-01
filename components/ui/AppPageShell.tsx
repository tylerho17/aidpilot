import type { ReactNode } from "react";
import { colors, fontFamily, layout } from "@/lib/design-tokens";

export function AppPageShell({ children }: { children: ReactNode; maxWidth?: number }) {
  return (
    <div
      style={{
        width: "100%",
        fontFamily,
        color: colors.text,
      }}
    >
      {children}
    </div>
  );
}

export const pageSectionStyle = {
  marginBottom: layout.sectionGap,
} as const;
