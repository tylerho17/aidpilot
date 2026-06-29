"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function FafsaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="FAFSA" reset={reset} />;
}
