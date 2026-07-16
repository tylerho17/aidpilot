"use client";

import { Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { AID_LAW_UPDATE, AID_LAW_UPDATE_HREF, CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";

/**
 * Small "Current for the 2026-27 FAFSA" chip. Makes the guide's currency an
 * explicit, honest signal so students trust how up to date it is.
 */
export function CurrencyChip() {
  const { t } = useLanguage();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: "var(--radius-pill)",
        background: "var(--green-100, var(--blue-50))",
        color: "var(--green-600)",
        fontSize: 11.5,
        fontWeight: 700,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      <Icon name="shield-check" size={13} />
      {t(CURRENCY_LABEL)}
    </span>
  );
}

/**
 * "What changed" advisory naming the 2025 One Big Beautiful Bill Act, with a
 * link to StudentAid.gov's official updates hub. Keeps AidPilot honest about
 * recent law changes it doesn't yet cover in depth.
 */
export function WhatsNewNote() {
  const { t } = useLanguage();
  const s = t(AID_LAW_UPDATE);
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: "var(--radius-lg)",
        background: "var(--amber-100)",
        border: "1px solid var(--amber-200)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".5px",
          color: "var(--amber-700)",
          marginBottom: 4,
        }}
      >
        {s.eyebrow}
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.55, margin: 0 }}>{s.body}</p>
      <a
        href={AID_LAW_UPDATE_HREF}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginTop: 8,
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--blue-700)",
          textDecoration: "none",
        }}
      >
        {s.link}
        <Icon name="arrow-right" size={13} />
      </a>
    </div>
  );
}
