"use client";

import Link from "next/link";
import { Card, Button, IconTile } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { nextDeadline, countdownLabel, type AidDeadline } from "@/lib/deadlines/ca-deadlines";

/**
 * The dashboard's proactive "your next move" - the single most important thing
 * to do right now, chosen across signals the dashboard doesn't otherwise make
 * actionable: an in-progress FAFSA verification, or an urgent statewide aid
 * deadline. Renders nothing when neither is pressing, so it only ever appears
 * when it earns the space (no clutter on a calm week).
 */

const URGENT_DAYS = 21;

export function NextMove({ aidDeadlines }: { aidDeadlines?: AidDeadline[] }) {
  const { lang, t } = useLanguage();
  const { status } = useVerificationStatus();

  const next = aidDeadlines && aidDeadlines.length > 0 ? nextDeadline(aidDeadlines) : null;
  const deadlineUrgent = next && next.days >= 0 && next.days <= URGENT_DAYS;
  const verificationActive = status.group !== null;

  // Priority: verification in progress (not shown elsewhere) beats a deadline
  // that's still weeks out; a genuinely urgent deadline (<=21d) beats both.
  let move: { icon: string; tone: "coral" | "amber" | "blue"; title: string; body: string; href: string; cta: string } | null = null;

  const s = t({
    en: {
      eyebrow: "Your next move",
      verTitle: "Finish your verification",
      verBody: "You started a verification checklist — gather what your school asked for and send it before your deadline.",
      verCta: "Open my checklist",
      deadlineCta: "See what to do",
    },
    es: {
      eyebrow: "Tu próximo paso",
      verTitle: "Termina tu verificación",
      verBody: "Empezaste una lista de verificación — reúne lo que pidió tu escuela y envíalo antes de tu fecha límite.",
      verCta: "Abrir mi lista",
      deadlineCta: "Ver qué hacer",
    },
  });

  if (deadlineUrgent && next) {
    move = {
      icon: "calendar-check",
      tone: next.days <= 7 ? "coral" : "amber",
      title: `${next.short[lang]} · ${countdownLabel(next.days, lang)}`,
      body: next.action[lang],
      href: "/key-dates",
      cta: s.deadlineCta,
    };
  } else if (verificationActive) {
    move = { icon: "shield-check", tone: "blue", title: s.verTitle, body: s.verBody, href: "/verification", cta: s.verCta };
  }
  // No fallback: a non-urgent deadline is already covered by the greeting's
  // "Next up" pill, so NextMove stays hidden and the dashboard reads calm.

  if (!move) return null;

  return (
    <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "18px 22px", background: "var(--gradient-info)" }}>
        <IconTile icon={move.icon} tone={move.tone} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: "var(--blue-700)", marginBottom: 3 }}>
            {s.eyebrow}
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-.4px", color: "var(--ink-900)", lineHeight: 1.2 }}>
            {move.title}
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.5, margin: "5px 0 0" }}>{move.body}</p>
        </div>
        <Link href={move.href} style={{ textDecoration: "none", flexShrink: 0 }}>
          <Button variant="clay" size="sm" iconLeft="arrow-right">{move.cta}</Button>
        </Link>
      </div>
    </Card>
  );
}
