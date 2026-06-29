"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function DeadlinesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="Deadlines" reset={reset} />;
}
