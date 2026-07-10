"use client";

import type { ReactNode } from "react";

// Client-side provider host. F2 adds the in-memory SessionProvider here.
// Kept intentionally thin: v1 has no auth/user context and stores nothing.
export function ClientProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
