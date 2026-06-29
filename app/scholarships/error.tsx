"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function ScholarshipsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="Scholarships" reset={reset} />;
}
