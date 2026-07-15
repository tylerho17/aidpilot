"use client";

import Link from "next/link";
import { Card, IconTile, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

/**
 * Full-page "coming soon" surface for retired/future destinations
 * (scholarship tracker, schools directory). Rendered inside AppChrome so the
 * top bar stays put and the Dashboard tab highlights.
 */

const STRINGS = {
  en: {
    badge: "Coming soon",
    body: "We're building this into AidPilot. Until it lands, your dashboard keeps watch on everything that affects your aid.",
    back: "Back to dashboard",
  },
  es: {
    badge: "Próximamente",
    body: "Estamos construyendo esto dentro de AidPilot. Mientras llega, tu panel vigila todo lo que afecta tu ayuda.",
    back: "Volver al panel",
  },
};

export function ComingSoonScreen({
  icon,
  title,
  description,
}: {
  icon: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
}) {
  const { t } = useLanguage();
  const s = t(STRINGS);

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
      <Card variant="clay" padding={32} style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <IconTile icon={icon} tone="blue" size={62} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <Badge tone="blue" dot>
            {s.badge}
          </Badge>
        </div>
        <h1 className="font-display" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-.5px", color: "var(--ink-900)", margin: "0 0 10px" }}>
          {t(title)}
        </h1>
        <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.65, margin: "0 0 8px" }}>
          {t(description)}
        </p>
        <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.65, margin: "0 0 22px" }}>
          {s.body}
        </p>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="clay" iconLeft="grid">
            {s.back}
          </Button>
        </Link>
      </Card>
    </div>
  );
}
