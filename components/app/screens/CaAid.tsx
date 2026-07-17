"use client";

import { useMemo, useState } from "react";
import { Card, Button, Icon, Badge } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";
import { CA_PROGRAMS, ELIGIBILITY_META, type CaProgram } from "@/lib/scholarships/ca-programs";

/**
 * Curated California aid & scholarships — a static, sourced reference (no
 * matching engine, no student database, per the v1 guardrail). The one filter
 * that actually matters for California's mixed-status students: "open to CA
 * Dream Act applicants," so undocumented students immediately see what they
 * qualify for instead of assuming aid isn't for them.
 */

type Filter = "all" | "dream_act";

export function CaAid() {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const s = t({
    en: {
      heading: "California aid & scholarships",
      sub: "The big California programs worth knowing — what each one is, who it's for, and the deadline. We link you to the official page to apply; we never ask for your personal info.",
      all: "All programs",
      dreamAct: "Open to Dream Act",
      whoFor: "Who it's for",
      deadline: "Deadline",
      apply: "Official page",
      note: "Award amounts change each year — check the official page for the current figure. This is reference information for the 2026–27 year, not an application or an offer.",
    },
    es: {
      heading: "Ayuda y becas de California",
      sub: "Los grandes programas de California que vale la pena conocer — qué es cada uno, para quién y su fecha límite. Te enlazamos a la página oficial para solicitar; nunca pedimos tu información personal.",
      all: "Todos los programas",
      dreamAct: "Abierto a la Ley Dream",
      whoFor: "Para quién",
      deadline: "Fecha límite",
      apply: "Página oficial",
      note: "Los montos de los premios cambian cada año — consulta la página oficial para la cifra actual. Esta es información de referencia para el año 2026–27, no una solicitud ni una oferta.",
    },
  });

  const programs = useMemo(
    () => (filter === "dream_act" ? CA_PROGRAMS.filter((p) => p.eligibility !== "fafsa_only") : CA_PROGRAMS),
    [filter]
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SectionTitle>{s.heading}</SectionTitle>
        <Badge tone="blue" dot>
          {CURRENCY_LABEL[lang]}
        </Badge>
      </div>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 16px" }}>
        {s.sub}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {([
          { key: "all" as const, label: s.all },
          { key: "dream_act" as const, label: s.dreamAct },
        ]).map((f) => {
          const sel = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "9px 16px",
                borderRadius: 999,
                border: `1.5px solid ${sel ? "var(--blue-700)" : "var(--border-default)"}`,
                background: sel ? "var(--blue-50)" : "#fff",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 700,
                color: sel ? "var(--blue-700)" : "var(--ink-800)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {programs.map((p) => (
          <ProgramCard key={p.id} p={p} lang={lang} labels={{ whoFor: s.whoFor, deadline: s.deadline, apply: s.apply }} />
        ))}
      </div>

      <div style={{ margin: "16px 2px 0" }}>
        <SourceBadge />
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "10px 2px 0" }}>{s.note}</p>
    </div>
  );
}

function ProgramCard({
  p,
  lang,
  labels,
}: {
  p: CaProgram;
  lang: "en" | "es";
  labels: { whoFor: string; deadline: string; apply: string };
}) {
  const elig = ELIGIBILITY_META[p.eligibility];
  return (
    <Card variant="clay" padding={20} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <h3 className="font-display" style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-.3px", color: "var(--ink-900)", margin: 0 }}>
          {p.name[lang]}
        </h3>
        <Badge tone={elig.tone}>{elig.label[lang]}</Badge>
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--blue-700)", lineHeight: 1.5, margin: "0 0 14px" }}>
        {p.amount[lang]}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <InfoRow icon="shield" label={labels.whoFor} value={p.who[lang]} />
        <InfoRow icon="calendar" label={labels.deadline} value={p.deadline[lang]} />
      </div>

      <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", marginTop: "auto" }}>
        <Button variant="secondary" size="sm" iconLeft="arrow-right">
          {labels.apply}
        </Button>
      </a>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>
        <Icon name={icon} size={16} color="var(--gray-400)" />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-400)" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.5, marginTop: 2 }}>
          {value}
        </span>
      </span>
    </div>
  );
}
