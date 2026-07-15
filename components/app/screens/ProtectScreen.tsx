"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Card, StatusPanel, Badge, Button, IconTile } from "@/components/ui";
import { Greeting, SectionTitle } from "@/components/app/screens/shared";
import { useProtectHub } from "@/hooks/useProtectHub";
import { useLanguage } from "@/lib/i18n";
import { isDemoEnabled, makeDemoProtectSnapshot } from "@/lib/demo";
import type {
  ProtectCategorySnapshot,
  ProtectCategoryStatus,
  ProtectOverallStatus,
} from "@/lib/protect/getProtectStatus";
import type { AidAction } from "@/lib/aid-actions/types";

/**
 * The Protect tab - a clay-kit rebuild of the legacy Protect hub. Overall
 * status panel, top action, then one card per watched category (FAFSA,
 * school follow-up, verification, aid offers). Signed-out visitors see the
 * demo story when demo mode is on, otherwise a sign-in prompt.
 */

type PanelTone = "green" | "amber" | "coral" | "blue";

const STRINGS = {
  en: {
    title: "Protect your aid",
    subtitle: "We watch FAFSA steps, school portals, verification, and offers so nothing slips.",
    nextAction: "Do this next",
    categories: "What we're watching",
    signedOutTitle: "Sign in to see your protection status",
    signedOutBody:
      "Protect Your Aid tracks FAFSA steps, school portal follow-up, verification requests, and aid offers so you never miss a requirement that could change your aid.",
    signIn: "Sign in",
    tryAgain: "Try again",
  },
  es: {
    title: "Protege tu ayuda",
    subtitle:
      "Vigilamos los pasos de FAFSA, los portales escolares, la verificación y las ofertas para que nada se escape.",
    nextAction: "Haz esto ahora",
    categories: "Lo que estamos vigilando",
    signedOutTitle: "Inicia sesión para ver tu estado de protección",
    signedOutBody:
      "Protege tu Ayuda sigue los pasos de FAFSA, el seguimiento de portales escolares, las solicitudes de verificación y las ofertas de ayuda para que no se te pase ningún requisito.",
    signIn: "Iniciar sesión",
    tryAgain: "Intentar de nuevo",
  },
};

const STATUS_BADGE: Record<ProtectCategoryStatus, { tone: PanelTone | "gray"; label: string }> = {
  protected: { tone: "green", label: "Protected" },
  in_progress: { tone: "blue", label: "In progress" },
  needs_attention: { tone: "coral", label: "Needs attention" },
  needs_setup: { tone: "amber", label: "Set up" },
  waiting: { tone: "gray", label: "Waiting" },
};

const CATEGORY_ICON: Record<ProtectCategorySnapshot["key"], string> = {
  fafsa: "clipboard",
  school_follow_up: "letter",
  verification: "shield-check",
  aid_offers: "star",
};

function overallPanel(status: ProtectOverallStatus): { tone: PanelTone; icon: string; eyebrow: string } {
  switch (status) {
    case "protected":
      return { tone: "green", icon: "shield-check", eyebrow: "Protected" };
    case "in_progress":
      return { tone: "blue", icon: "shield", eyebrow: "In progress" };
    case "needs_setup":
      return { tone: "amber", icon: "shield", eyebrow: "Set up" };
    case "needs_attention":
    default:
      return { tone: "coral", icon: "shield", eyebrow: "Needs attention" };
  }
}

function ProtectSkeleton() {
  const block: CSSProperties = {
    background: "var(--surface-card)",
    borderRadius: "var(--radius-clay)",
    boxShadow: "var(--shadow-clay)",
  };
  return (
    <div aria-hidden style={{ opacity: 0.7 }}>
      <div style={{ height: 40, width: 260, borderRadius: 12, background: "var(--blue-100)", marginBottom: 10 }} />
      <div style={{ height: 16, width: 360, borderRadius: 8, background: "var(--blue-50)", marginBottom: 24 }} />
      <div style={{ ...block, height: 96, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <div style={{ ...block, height: 190 }} />
        <div style={{ ...block, height: 190 }} />
        <div style={{ ...block, height: 190 }} />
        <div style={{ ...block, height: 190 }} />
      </div>
    </div>
  );
}

function NextActionCard({ action, heading }: { action: AidAction; heading: string }) {
  return (
    <>
      <SectionTitle>{heading}</SectionTitle>
      <Card variant="clay" padding={20} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <IconTile icon="calendar-check" tone={action.priority === "urgent" ? "coral" : "amber"} size={46} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="font-display" style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink-900)" }}>
              {action.title}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", marginTop: 3 }}>
              {action.description}
            </div>
          </div>
          <Link href={action.href} style={{ textDecoration: "none", flexShrink: 0 }}>
            <Button variant="clay" size="sm">
              {action.ctaLabel}
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}

function CategoryCard({ category }: { category: ProtectCategorySnapshot }) {
  const badge = STATUS_BADGE[category.status];
  return (
    <Card variant="clay" padding={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile icon={CATEGORY_ICON[category.key]} tone={badge.tone === "gray" ? "blue" : badge.tone} size={42} />
          <span className="font-display" style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink-900)" }}>
            {category.title}
          </span>
        </div>
        <Badge tone={badge.tone} dot>
          {badge.label}
        </Badge>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6, flex: 1 }}>
        {(category.emptyMessage ? [category.emptyMessage] : category.summaryLines).map((line) => (
          <li
            key={line}
            style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, display: "flex", gap: 8 }}
          >
            <span aria-hidden style={{ color: "var(--blue-500)", fontWeight: 800 }}>
              ·
            </span>
            {line}
          </li>
        ))}
      </ul>

      <Link href={category.href} style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <Button variant="secondary" size="sm" iconRight="arrow-right">
          {category.ctaLabel}
        </Button>
      </Link>
    </Card>
  );
}

export function ProtectScreen() {
  const { authReady, userId, loading, loadError, dataWarning, snapshot, topAction, reload } = useProtectHub();
  const { t } = useLanguage();
  const s = t(STRINGS);

  // Demo seam: signed-out visitors with demo mode on see the coherent demo
  // story; a signed-in user's snapshot always wins (see lib/demo).
  const demoSnapshot = useMemo(() => (!userId && isDemoEnabled() ? makeDemoProtectSnapshot() : null), [userId]);

  if (!authReady || loading) {
    return <ProtectSkeleton />;
  }

  if (!userId && !demoSnapshot) {
    return (
      <div>
        <Greeting title={s.title} subtitle={s.subtitle} />
        <Card variant="clay" padding={24} style={{ maxWidth: 560 }}>
          <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-900)", marginBottom: 8 }}>
            {s.signedOutTitle}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.65, margin: "0 0 18px" }}>
            {s.signedOutBody}
          </p>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button iconRight="arrow-right">{s.signIn}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const view = demoSnapshot ?? snapshot;
  const panel = overallPanel(view.overallStatus);
  const action = demoSnapshot ? null : topAction;

  return (
    <div>
      <Greeting title={s.title} subtitle={s.subtitle} />

      {loadError || dataWarning ? (
        <StatusPanel
          tone="amber"
          icon="shield"
          eyebrow="Heads up"
          title={loadError ?? dataWarning}
          trailing={
            <Button variant="secondary" size="sm" onClick={() => void reload()}>
              {s.tryAgain}
            </Button>
          }
          style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 20 }}
        />
      ) : null}

      <StatusPanel
        tone={panel.tone}
        icon={panel.icon}
        eyebrow={panel.eyebrow}
        title={view.headline}
        trailing={
          <Badge tone={panel.tone} dot>
            {panel.eyebrow}
          </Badge>
        }
        style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 28 }}
      >
        {view.description}
      </StatusPanel>

      {action && <NextActionCard action={action} heading={s.nextAction} />}

      <SectionTitle>{s.categories}</SectionTitle>
      <div
        className="stagger-children"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}
      >
        {view.categories.map((category) => (
          <CategoryCard key={category.key} category={category} />
        ))}
      </div>
    </div>
  );
}
