"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function DocumentsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="Documents" reset={reset} />;
}
