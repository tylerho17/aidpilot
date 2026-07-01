"use client";

import type { ReactNode } from "react";
import { UserDataProvider } from "@/hooks/useUserData";
import { LanguageProvider } from "@/lib/i18n";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <UserDataProvider>{children}</UserDataProvider>
    </LanguageProvider>
  );
}
