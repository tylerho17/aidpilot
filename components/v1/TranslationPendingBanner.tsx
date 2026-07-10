"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui";
import { defaultLocale } from "@/lib/i18n";

/**
 * Honest signal that non-EN locales are machine stubs pending native review
 * (AGENT_RULES.md Rule 5). Shown only when the active locale is not English.
 * Uses the amber "due-soon / attention" status tone from the design system.
 */
export function TranslationPendingBanner() {
  const locale = useLocale();
  const t = useTranslations("translationBanner");
  if (locale === defaultLocale) return null;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--status-warn-fill)",
        color: "var(--status-warn-fg)",
        border: "1px solid var(--status-warn-border)",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
      }}
    >
      <Icon name="shield" size={16} strokeWidth={2.2} style={{ flexShrink: 0 }} />
      <span>{t("text")}</span>
    </div>
  );
}
