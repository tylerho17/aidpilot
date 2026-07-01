import type { ReactNode } from "react";
import { insightRowStyle } from "@/lib/design-tokens";

export function InsightRow({ children }: { children: ReactNode }) {
  return <div style={insightRowStyle}>{children}</div>;
}
