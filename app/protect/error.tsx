"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function ProtectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Protect page error:", error);
  return <PageErrorFallback title="Protect Your Aid" reset={reset} />;
}
