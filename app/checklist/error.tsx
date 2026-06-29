"use client";

import { PageErrorFallback } from "@/components/product/PageSafety";

export default function ChecklistError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageErrorFallback title="Checklist" reset={reset} />;
}
