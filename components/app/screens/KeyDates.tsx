"use client";

import { useMemo } from "react";
import { Card, Button, Badge, Icon, IconTile, SectionHeading } from "@/components/ui";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";
import { useSavedItems } from "@/hooks/useSavedItems";
import {
  computeDeadlines,
  countdownLabel,
  formatDeadlineDate,
  type AidDeadline,
  type ComputedDeadline,
  type DeadlineTone,
} from "@/lib/deadlines/ca-deadlines";

/**
 * California aid deadline engine, made visible. A proactive hero surfaces the
 * single most-urgent upcoming deadline with a live countdown and the exact next
 * action; below it, every sourced CA + federal deadline is plotted on a
 * counted-down timeline. Built from the app UI kit to match the product.
 */

const TONE_FG: Record<DeadlineTone, string> = {
  coral: "var(--coral-600)",
  amber: "var(--amber-600)",
  blue: "var(--blue-700)",
  gray: "var(--gray-400)",
};
const TILE_TONE: Record<DeadlineTone, "coral" | "amber" | "blue"> = {
  coral: "coral",
  amber: "amber",
  blue: "blue",
  gray: "blue",
};

function monthAbbrev(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", { month: "short" });
}
function dayNum(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00`).getDate();
}

export function KeyDates({ deadlines: rows }: { deadlines: AidDeadline[] }) {
  const { lang, t } = useLanguage();
  const handled = useSavedItems("deadline");
  const deadlines = useMemo(() => computeDeadlines(rows, new Date()), [rows]);
  const next = deadlines.find((d) => d.status !== "past" && !handled.has(d.id)) ?? null;

  const s = t({
    en: {
      eyebrow: "Key dates",
      heading: "California aid deadlines",
      sub: "The dates every California student needs — counted down from today, so nothing sneaks up on you.",
      nextUp: "Next up",
      view: "Official page",
      allDates: "The full timeline",
      full: "Every deadline",
      for: "For",
      approx: "Approximate — the exact date is set by the Federal Register",
      past: "Passed",
      days: "days",
      day: "day",
      markDone: "Mark done",
      done: "Done",
    },
    es: {
      eyebrow: "Fechas clave",
      heading: "Fechas límite de ayuda en California",
      sub: "Las fechas que todo estudiante de California necesita — con cuenta regresiva desde hoy, para que nada te tome por sorpresa.",
      nextUp: "Lo próximo",
      view: "Página oficial",
      allDates: "La línea de tiempo completa",
      full: "Cada fecha límite",
      for: "Para",
      approx: "Aproximada — la fecha exacta la fija el Registro Federal",
      past: "Pasó",
      days: "días",
      day: "día",
      markDone: "Marcar hecho",
      done: "Hecho",
    },
  });

  return (
    <div>
      <SectionHeading
        eyebrow={s.eyebrow}
        title={s.heading}
        subtitle={s.sub}
        action={<Badge tone="blue" dot>{CURRENCY_LABEL[lang]}</Badge>}
        style={{ marginBottom: 24 }}
      />

      {/* Proactive hero: the single most-urgent upcoming deadline. */}
      {next && (
        <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 26 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "22px 24px", background: "var(--gradient-info)" }}>
            <IconTile icon="calendar-check" tone={TILE_TONE[next.tone]} size={54} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".8px", color: "var(--blue-700)", marginBottom: 4 }}>
                {s.nextUp}
              </div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.5px", color: "var(--ink-900)", margin: 0, lineHeight: 1.2 }}>
                {next.title[lang]}
              </h3>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)", marginTop: 4 }}>
                {formatDeadlineDate(next.date)}{next.approx ? " *" : ""} · {next.awardYear}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-metric)", fontSize: 40, fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1, color: TONE_FG[next.tone] }}>
                {next.days <= 0 ? countdownLabel(next.days, lang) : next.days}
              </div>
              {next.days > 0 && (
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-400)", marginTop: 2 }}>
                  {next.days === 1 ? s.day : s.days}
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: "18px 24px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.6, margin: "0 0 14px" }}>{next.action[lang]}</p>
            <a href={next.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="clay" size="sm" iconLeft="arrow-right">{s.view}</Button>
            </a>
          </div>
        </Card>
      )}

      <SectionHeading size="sm" eyebrow={s.allDates} title={s.full} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {deadlines.map((d) => (
          <TimelineRow
            key={d.id}
            d={d}
            lang={lang}
            done={handled.has(d.id)}
            onToggle={() => handled.toggle(d.id)}
            labels={{ for: s.for, approx: s.approx, past: s.past, markDone: s.markDone, doneLabel: s.done }}
          />
        ))}
      </div>

      <div style={{ margin: "16px 2px 0" }}>
        <SourceBadge />
      </div>
    </div>
  );
}

function TimelineRow({
  d,
  lang,
  done,
  onToggle,
  labels,
}: {
  d: ComputedDeadline;
  lang: "en" | "es";
  done: boolean;
  onToggle: () => void;
  labels: { for: string; approx: string; past: string; markDone: string; doneLabel: string };
}) {
  const past = d.status === "past";
  const dim = past || done;
  return (
    <Card variant="clay" padding={16} style={{ opacity: dim ? 0.6 : 1 }}>
      <div style={{ display: "flex", gap: 15, alignItems: "flex-start" }}>
        <div
          style={{
            flexShrink: 0,
            width: 56,
            textAlign: "center",
            padding: "9px 4px",
            borderRadius: 14,
            background: dim ? "var(--track)" : `var(--${TILE_TONE[d.tone]}-100)`,
          }}
        >
          <div style={{ fontFamily: "var(--font-metric)", fontSize: 19, fontWeight: 700, color: done ? "var(--green-600)" : TONE_FG[d.tone], lineHeight: 1 }}>
            {dayNum(d.date)}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: done ? "var(--green-600)" : TONE_FG[d.tone], marginTop: 3 }}>
            {monthAbbrev(d.date)}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="font-display" style={{ fontSize: 15.5, fontWeight: 800, color: done ? "var(--gray-400)" : "var(--ink-900)", textDecoration: done ? "line-through" : "none" }}>{d.title[lang]}</span>
            <Badge tone={done ? "green" : d.tone === "gray" ? "gray" : d.tone}>{done ? labels.doneLabel : past ? labels.past : countdownLabel(d.days, lang)}</Badge>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 3 }}>
            {formatDeadlineDate(d.date)}{d.approx ? " *" : ""} · {labels.for} {d.who[lang]}
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, margin: "8px 0 0" }}>{d.action[lang]}</p>
          {d.approx && <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", margin: "6px 0 0" }}>* {labels.approx}</p>}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          aria-label={done ? labels.doneLabel : labels.markDone}
          title={done ? labels.doneLabel : labels.markDone}
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: done ? "none" : "1.5px solid var(--border-default)",
            background: done ? "var(--green-600)" : "#fff",
            cursor: "pointer",
          }}
        >
          <Icon name="check" size={15} color={done ? "#fff" : "var(--gray-400)"} strokeWidth={done ? 3 : 2} />
        </button>
      </div>
    </Card>
  );
}
