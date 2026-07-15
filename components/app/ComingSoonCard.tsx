"use client";

import Link from "next/link";
import { Card, Icon, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

/**
 * Dashboard card listing what's on the way - keeps future features visible
 * (per the product IA, scholarships and friends live here, not in the tabs).
 */

const STRINGS = {
  en: {
    soon: "Soon",
    items: [
      { icon: "star", label: "Scholarship tracker", href: "/scholarships" },
      { icon: "letter", label: "Appeals", href: null },
    ],
  },
  es: {
    soon: "Pronto",
    items: [
      { icon: "star", label: "Rastreador de becas", href: "/scholarships" },
      { icon: "letter", label: "Apelaciones", href: null },
    ],
  },
};

export function ComingSoonCard() {
  const { t } = useLanguage();
  const s = t(STRINGS);

  const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 14,
    textDecoration: "none",
  };

  return (
    <Card variant="clay" padding={8}>
      {s.items.map((item) => {
        const inner = (
          <>
            <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Icon name={item.icon} size={18} color="var(--gray-400)" />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--gray-500)" }}>{item.label}</span>
            </span>
            <Badge tone="gray">{s.soon}</Badge>
          </>
        );
        return item.href ? (
          <Link key={item.label} href={item.href} style={row}>
            {inner}
          </Link>
        ) : (
          <div key={item.label} style={row}>
            {inner}
          </div>
        );
      })}
    </Card>
  );
}
