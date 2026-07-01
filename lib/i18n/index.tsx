"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

/**
 * Lightweight, modular i18n seam.
 *
 * Each surface keeps its own typed dictionary ({ en: {...}, es: {...} }) and
 * reads it through useLanguage().t(dict) - no global string table, so screens
 * adopt translation incrementally and tree-shake cleanly. Saved DATA VALUES
 * stay canonical English everywhere; only display labels localize.
 *
 * Preference order: localStorage "aidpilot-lang" -> browser default (es for
 * Spanish locales on first visit) -> "en". Backed by useSyncExternalStore so
 * the server renders "en" and the client adopts the stored preference at
 * hydration without a mismatch.
 */

export type Language = "en" | "es";

const STORAGE_KEY = "aidpilot-lang";

/* ── Tiny external store (module-level so every consumer stays in sync) ── */
const listeners = new Set<() => void>();
let memoryLang: Language | null = null;

function resolveClientLang(): Language {
  if (memoryLang) return memoryLang;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") {
      memoryLang = stored;
      return stored;
    }
  } catch {
    // localStorage unavailable - fall through to the browser locale.
  }
  memoryLang = typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
  return memoryLang;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setStoredLanguage(next: Language): void {
  memoryLang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore - the in-memory value still applies for this session.
  }
  listeners.forEach((notify) => notify());
}

/* ── Provider + hook ── */
type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, resolveClientLang, () => "en" as Language);
  const setLang = useCallback((next: Language) => setStoredLanguage(next), []);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Default to English outside the provider rather than crashing a page.
  const lang: Language = context?.lang ?? "en";
  const setLang = context?.setLang ?? (() => undefined);

  const t = useCallback(<T,>(dict: Record<Language, T>): T => dict[lang], [lang]);

  return { lang, setLang, t };
}
