"use client";

import { useMemo, useState } from "react";
import { Card, Button, Icon, IconTile, Badge, SegmentedControl, SectionHeading } from "@/components/ui";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { CURRENCY_LABEL } from "@/lib/fafsa-guide/currency";
import { isDreamActEligible } from "@/lib/scholarships/ca-programs";
import type { ScholarshipSource } from "@/lib/types";

/**
 * Curated California aid & scholarships — now rendered from the LIVE
 * `scholarship_sources` catalog (server-loaded, editable via /admin/scholarships)
 * instead of a hardcoded array. The one filter that matters for California's
 * mixed-status students: "open to CA Dream Act applicants." UI chrome is
 * bilingual; program data is English from the catalog. Built from the app UI kit.
 */

type Filter = "all" | "dream_act";

function visualFor(p: ScholarshipSource, index: number): { icon: string; tone: "blue" | "green" | "amber" | "coral" | "brand" } {
  const tags = p.tags ?? [];
  if (tags.includes("dream_act_pathway")) return { icon: "shield-check", tone: "brand" };
  if (tags.includes("foster-youth")) return { icon: "shield", tone: "coral" };
  if (tags.includes("community-college")) return { icon: "file", tone: "blue" };
  const rotate = ["blue", "green", "amber"] as const;
  return { icon: "star", tone: rotate[index % rotate.length] };
}

function eligibilityChip(p: ScholarshipSource): { key: "both" | "pathway" | "fafsa"; tone: "green" | "amber" | "blue" } {
  const tags = p.tags ?? [];
  if (tags.includes("dream_act_pathway")) return { key: "pathway", tone: "amber" };
  if (tags.includes("cadaa_eligible")) return { key: "both", tone: "green" };
  return { key: "fafsa", tone: "blue" };
}

function formatAmount(n: number | null): string | null {
  return n && n > 0 ? `$${n.toLocaleString("en-US")}` : null;
}

function formatDeadline(d: string | null): string | null {
  if (!d) return null;
  const parsed = new Date(`${d.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CaAid({ programs }: { programs: ScholarshipSource[] }) {
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
      award: "Award",
      deadline: "Deadline",
      varies: "Award varies — see official page",
      rolling: "Rolling — apply anytime",
      perYear: "/yr",
      apply: "Official page",
      chips: { both: "FAFSA or Dream Act", pathway: "Dream Act pathway", fafsa: "FAFSA only" },
      empty: "No programs to show yet.",
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
      award: "Monto",
      deadline: "Fecha límite",
      varies: "El monto varía — consulta la página oficial",
      rolling: "Continua — solicita en cualquier momento",
      perYear: "/año",
      apply: "Página oficial",
      chips: { both: "FAFSA o Ley Dream", pathway: "Vía Ley Dream", fafsa: "Solo FAFSA" },
      empty: "Aún no hay programas para mostrar.",
      note: "Los montos cambian cada año — consulta la página oficial para la cifra actual. Información de referencia para el año 2026–27, no una solicitud ni una oferta.",
    },
  });

  const filtered = useMemo(
    () => (filter === "dream_act" ? programs.filter(isDreamActEligible) : programs),
    [programs, filter]
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

      {filtered.length === 0 ? (
        <Card variant="clay" padding={28} style={{ textAlign: "center", color: "var(--gray-500)", fontWeight: 600 }}>
          {s.empty}
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((p, i) => (
            <ProgramCard key={p.id} p={p} index={i} labels={s} />
          ))}
        </div>
      )}

      <div style={{ margin: "18px 2px 0" }}>
        <SourceBadge />
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "10px 2px 0" }}>{s.note}</p>
    </div>
  );
}

function ProgramCard({
  p,
  index,
  labels,
}: {
  p: ScholarshipSource;
  index: number;
  labels: {
    award: string; deadline: string; varies: string; rolling: string; perYear: string; apply: string;
    chips: { both: string; pathway: string; fafsa: string };
  };
}) {
  const visual = visualFor(p, index);
  const chip = eligibilityChip(p);
  const amount = formatAmount(p.amount);
  const deadline = formatDeadline(p.deadline);
  const href = p.application_url || p.source_url || p.url || "#";

  return (
    <Card variant="clay" padding={20} lift style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <IconTile icon={visual.icon} tone={visual.tone} size={46} />
        <Badge tone={chip.tone}>{labels.chips[chip.key]}</Badge>
      </div>

      <h3 className="font-display" style={{ fontSize: 17.5, fontWeight: 900, letterSpacing: "-.3px", color: "var(--ink-900)", margin: "0 0 2px", lineHeight: 1.2 }}>
        {p.name}
      </h3>
      {p.provider && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 12 }}>{p.provider}</div>
      )}

      {p.eligibility && (
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.55, margin: "0 0 16px" }}>
          {p.eligibility}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18, marginTop: "auto" }}>
        <InfoRow icon="star" label={labels.award} value={amount ? `${amount}${labels.perYear}` : labels.varies} />
        <InfoRow icon="calendar" label={labels.deadline} value={deadline ?? labels.rolling} />
      </div>

      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
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
