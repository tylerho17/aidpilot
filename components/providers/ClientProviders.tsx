"use client";

import type { ReactNode } from "react";
import { UserDataProvider } from "@/hooks/useUserData";

export function ClientProviders({ children }: { children: ReactNode }) {
  return <UserDataProvider>{children}</UserDataProvider>;
}
