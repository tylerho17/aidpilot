// AidPilot v1 — locale configuration.
// No i18n URL routing: the active locale lives in the NEXT_LOCALE cookie and is
// read server-side by i18n/request.ts. This keeps the app no-login and avoids
// leaking anything but a language preference. See AGENT_RULES.md (Rule 5).

export const locales = ["en", "es", "vi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// The cookie next-intl reads/writes for the active locale.
export const LOCALE_COOKIE = "NEXT_LOCALE";

// Native display names for the language switcher (never translated).
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  vi: "Tiếng Việt",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
