"use client";

import { useTransition, type ChangeEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui";
import { locales, localeNames, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/**
 * Language switcher built from the existing UI kit (Select). Writes the chosen
 * locale to the NEXT_LOCALE cookie (a language preference — not student data)
 * and refreshes so the server re-reads it. No i18n URL routing.
 */
export function LanguageSwitcher({ style }: { style?: React.CSSProperties }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <Select
      aria-label={t("label")}
      value={locale}
      onChange={onChange}
      options={locales.map((l) => ({ value: l, label: localeNames[l] }))}
      style={{ minWidth: 132, ...style }}
    />
  );
}
