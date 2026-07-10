"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "@/components/v1/session";

// Client-side provider host. Holds the in-memory, non-persisted session store
// (F2). v1 has no auth/user context and stores nothing outside this tab.
export function ClientProviders({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
