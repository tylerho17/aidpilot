"use client";

import { useMemo, useState } from "react";
import { Card, Button, Icon, IconTile, Badge, SegmentedControl, SectionHeading } from "@/components/ui";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";
import { CA_PROGRAMS, ELIGIBILITY_META, type CaProgram } from "@/lib/scholarships/ca-programs";

/**
 * Curated California aid & scholarships — a static, sourced reference (no
 * matching engine, no student database, per the v1 guardrail). The one filter
 * that actually matters for California's mixed-status students: "open to CA
 * Dream Act applicants." Built from the app UI kit to match the product.
 */

type Filter = "all" | "dream_act";

const PROGRAM_VISUAL: Record<string, { icon: string; tone: "blue" | "green" | "amber" | "coral" | "brand" }> = {
  "cal-grant-a": { icon: "star", tone: "blue" },
  "cal-grant-b": { icon: "star", tone: "green" },
  "chafee-grant": { icon: "shield", tone: "coral" },
  "middle-class-scholarship": { icon: "star", tone: "amber" },
  "promise-grant": { icon: "file", tone: "blue" },
  "ca-dream-act": { icon: "shield-check", tone: "brand" },
};

export function CaAid() {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const s = t({
    en: {
      eyebrow: "California aid",
      heading: "Aid & scholarships",
      sub: "The big California programs worth knowing — what each one is, who it's for, and the deadline. We link you to the official page to apply; we never ask for your personal info.",
      filters: [
        { value: "all", label: "All programs" },
        { value: "dream_act", label: "Open to Dream Act" },
      ],
      whoFor: "Who it's for",
      deadline: "Deadline",
      apply: "Official page",
      note: "Award amounts change each year — check the official page for the current figure. Reference information for the 2026–27 year, not an application or an offer.",
    },
    es: {
      eyebrow: "Ayuda de California",
      heading: "Ayuda y becas",
      sub: "Los grandes programas de California que vale la pena conocer — qué es cada uno, para quién y su fecha límite. Te enlazamos a la página oficial para solicitar; nunca pedimos tu información personal.",
      filters: [
        { value: "all", label: "Todos los programas" },
        { value: "dream_act", label: "Abierto a la Ley Dream" },
      ],
      whoFor: "Para quién",
      deadline: "Fecha límite",
      apply: "Página oficial",
      note: "Los montos cambian cada año — consulta la página oficial para la cifra actual. Información de referencia para el año 2026–27, no una solicitud ni una oferta.",
    },
  });

  const programs = useMemo(
    () => (filter === "dream_act" ? CA_PROGRAMS.filter((p) => p.eligibility !== "fafsa_only") : CA_PROGRAMS),
    [filter]
  );

  return (
    <div>
      <SectionHeading
        eyebrow={s.eyebrow}
        title={s.heading}
        subtitle={s.sub}
        action={<Badge tone="blue" dot>{CURRENCY_LABEL[lang]}</Badge>}
        style={{ marginBottom: 20 }}
      />

      <SegmentedControl
        size="sm"
        options={s.filters}
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        style={{ marginBottom: 20 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {programs.map((p) => (
          <ProgramCard key={p.id} p={p} lang={lang} labels={{ whoFor: s.whoFor, deadline: s.deadline, apply: s.apply }} />
        ))}
      </div>

      <div style={{ margin: "18px 2px 0" }}>
        <SourceBadge />
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "10px 2px 0" }}>{s.note}</p>
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
  const visual = PROGRAM_VISUAL[p.id] ?? { icon: "star", tone: "blue" as const };
  return (
    <Card variant="clay" padding={20} lift style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <IconTile icon={visual.icon} tone={visual.tone} size={46} />
        <Badge tone={elig.tone}>{elig.label[lang]}</Badge>
      </div>

      <h3 className="font-display" style={{ fontSize: 17.5, fontWeight: 900, letterSpacing: "-.3px", color: "var(--ink-900)", margin: "0 0 6px", lineHeight: 1.2 }}>
        {p.name[lang]}
      </h3>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--blue-700)", lineHeight: 1.5, margin: "0 0 16px" }}>
        {p.amount[lang]}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
        <InfoRow icon="shield" label={labels.whoFor} value={p.who[lang]} />
        <InfoRow icon="calendar" label={labels.deadline} value={p.deadline[lang]} />
      </div>

      <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", marginTop: "auto" }}>
        <Button variant="secondary" size="sm" iconLeft="arrow-right">{labels.apply}</Button>
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
        <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--gray-400)" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.5, marginTop: 2 }}>
          {value}
        </span>
      </span>
    </div>
  );
}
