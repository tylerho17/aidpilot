"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Dashboard page error:", error);
  return <PageErrorFallback title="Dashboard" reset={reset} />;
}
