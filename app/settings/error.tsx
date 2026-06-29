"use client";

import { useEffect } from "react";
import { PageErrorFallback } from "@/components/product/PageSafety";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings page error:", error);
  }, [error]);

  return <PageErrorFallback title="Settings" reset={reset} />;
}
