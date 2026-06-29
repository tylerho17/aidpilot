"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function AidLetterError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="Aid Letter" reset={reset} />;
}
