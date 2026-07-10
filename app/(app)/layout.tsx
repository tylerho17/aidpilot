import type { ReactNode } from "react";
import { AppShell } from "@/components/v1/AppShell";

// Layout for the in-app flow (Triage → Walkthrough → Worksheet), on the clay
// surface. The (app) route group keeps these under the shared shell without
// adding a URL segment.
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
