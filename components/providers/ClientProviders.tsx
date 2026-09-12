"use client";

import { useEffect, type ReactNode } from "react";
import { UserDataProvider } from "@/hooks/useUserData";
import { LanguageProvider } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { setAidPathUserId } from "@/lib/aid-path/profile-store";

function AidPathScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let authEventVersion = 0;
    try {
      const supabase = createClient();
      const initialVersion = authEventVersion;
      void supabase.auth
        .getUser()
        .then(({ data }) => {
          if (!cancelled && authEventVersion === initialVersion) {
            setAidPathUserId(data.user?.id ?? null);
          }
        })
        .catch(() => {
          if (!cancelled && authEventVersion === initialVersion) {
            setAidPathUserId(null);
          }
        });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "TOKEN_REFRESHED") return;
        authEventVersion += 1;
        setAidPathUserId(session?.user?.id ?? null);
      });

      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    } catch {
      setAidPathUserId(null);
    }
  }, []);

  return <>{children}</>;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <UserDataProvider>
        <AidPathScope>{children}</AidPathScope>
      </UserDataProvider>
    </LanguageProvider>
  );
}
