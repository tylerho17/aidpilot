"use client";

import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

/**
 * Trust chip shown under grounded AI answers. Every FAFSA/CADAA answer is
 * constrained to human-sourced guidance from studentaid.gov and CSAC - this
 * makes that discipline visible (the thing that sets AidPilot apart from
 * "just ask a chatbot"), not just an architectural detail.
 */
export function SourceBadge({ style }: { style?: CSSProperties }) {
  const { t } = useLanguage();
  const label = t({
    en: "Grounded in studentaid.gov & CSAC guidance",
    es: "Basado en guías oficiales de studentaid.gov y CSAC",
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        padding: "4px 10px",
        borderRadius: "var(--radius-pill)",
        background: "var(--blue-50)",
        color: "var(--blue-700)",
        fontSize: 11.5,
        fontWeight: 700,
        lineHeight: 1.3,
        ...style,
      }}
    >
      <Icon name="shield-check" size={13} />
      {label}
    </div>
  );
}
