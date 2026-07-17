"use client";

import { useMemo } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";
import {
  computeDeadlines,
  countdownLabel,
  formatDeadlineDate,
  type ComputedDeadline,
  type DeadlineTone,
} from "@/lib/deadlines/ca-deadlines";

/**
 * California aid deadline engine, made visible. A proactive hero surfaces the
 * single most-urgent upcoming deadline with a live countdown and the exact next
 * action; below it, every sourced CA + federal deadline is plotted on a
 * counted-down timeline. The dates and math are deterministic - no AI, no PII.
 */

const TONE_FG: Record<DeadlineTone, string> = {
  coral: "var(--coral-600)",
  amber: "var(--amber-600)",
  blue: "var(--blue-700)",
  gray: "var(--gray-400)",
};
const TONE_BG: Record<DeadlineTone, string> = {
  coral: "var(--coral-100)",
  amber: "var(--amber-100)",
  blue: "var(--blue-100)",
  gray: "var(--track)",
};

export function KeyDates() {
  const { lang, t } = useLanguage();
  const deadlines = useMemo(() => computeDeadlines(new Date()), []);
  const next = deadlines.find((d) => d.status !== "past") ?? null;

  const s = t({
    en: {
      heading: "California aid deadlines",
      sub: "The dates every California student needs — counted down from today, so nothing sneaks up on you.",
      nextUp: "Next up",
      allDates: "The full timeline",
      for: "For",
      approx: "Approximate — set by the Federal Register",
      view: "Official page",
      past: "Passed",
    },
    es: {
      heading: "Fechas límite de ayuda en California",
      sub: "Las fechas que todo estudiante de California necesita — con cuenta regresiva desde hoy, para que nada te tome por sorpresa.",
      nextUp: "Lo próximo",
      allDates: "La línea de tiempo completa",
      for: "Para",
      approx: "Aproximada — la fija el Registro Federal",
      view: "Página oficial",
      past: "Pasó",
    },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionTitle>{s.heading}</SectionTitle>
        <Badge tone="blue" dot>
          {CURRENCY_LABEL[lang]}
        </Badge>
      </div>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 18px" }}>
        {s.sub}
      </p>

      {/* Proactive hero: the single most-urgent upcoming deadline. */}
      {next && (
        <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "20px 22px", background: "var(--gradient-info)" }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--blue-700)" }}>
              {s.nextUp}
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
              <div style={{ minWidth: 0 }}>
                <h3 className="font-display" style={{ fontSize: 23, fontWeight: 900, letterSpacing: "-.5px", color: "var(--ink-900)", margin: 0 }}>
                  {next.title[lang]}
                </h3>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--blue-700)", marginTop: 4 }}>
                  {formatDeadlineDate(next.date)}
                  {next.approx ? " *" : ""} · {next.awardYear}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="font-display" style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-1px", color: TONE_FG[next.tone], fontFamily: "var(--font-metric)" }}>
                  {next.days <= 0 ? countdownLabel(next.days, lang) : next.days}
                </div>
                {next.days > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-400)" }}>
                    {lang === "es" ? (next.days === 1 ? "día" : "días") : next.days === 1 ? "day" : "days"}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "16px 22px" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.6, margin: "0 0 12px" }}>
              {next.action[lang]}
            </p>
            <a href={next.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="clay" size="sm" iconLeft="arrow-right">
                {s.view}
              </Button>
            </a>
          </div>
        </Card>
      )}

      <SectionTitle>{s.allDates}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {deadlines.map((d) => (
          <TimelineRow key={d.id} d={d} lang={lang} labels={{ for: s.for, approx: s.approx, view: s.view, past: s.past }} />
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
  labels,
}: {
  d: ComputedDeadline;
  lang: "en" | "es";
  labels: { for: string; approx: string; view: string; past: string };
}) {
  const past = d.status === "past";
  return (
    <Card variant="clay" padding={16} style={{ opacity: past ? 0.62 : 1 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            flexShrink: 0,
            width: 58,
            textAlign: "center",
            padding: "8px 4px",
            borderRadius: 12,
            background: TONE_BG[d.tone],
          }}
        >
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: TONE_FG[d.tone], fontFamily: "var(--font-metric)", lineHeight: 1 }}>
            {new Date(`${d.date}T12:00:00`).getDate()}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: TONE_FG[d.tone], marginTop: 2 }}>
            {new Date(`${d.date}T12:00:00`).toLocaleDateString("en-US", { month: "short" })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="font-display" style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink-900)" }}>
              {d.title[lang]}
            </span>
            <Badge tone={d.tone === "gray" ? "gray" : d.tone}>
              {past ? labels.past : countdownLabel(d.days, lang)}
            </Badge>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 3 }}>
            {formatDeadlineDate(d.date)}
            {d.approx ? " *" : ""} · {labels.for} {d.who[lang]}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, margin: "8px 0 0" }}>
            {d.action[lang]}
          </p>
          {d.approx && (
            <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", margin: "6px 0 0" }}>* {labels.approx}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
