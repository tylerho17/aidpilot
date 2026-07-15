"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Icon } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { useLanguage } from "@/lib/i18n";
import { FAFSA_GUIDE } from "@/lib/fafsa-guide/fafsa";
import { CADAA_GUIDE } from "@/lib/fafsa-guide/cadaa";
import type { GuideField, GuideSection, GuideText } from "@/lib/fafsa-guide/schema";

/**
 * "Understand every section" - an expandable, read-only walkthrough of the
 * real FAFSA/CADAA structure with human-sourced helper text (what it means /
 * document needed / common mistake). Reviewed checkmarks are a personal
 * reading aid: client-only, stored in localStorage, never sent to Supabase.
 */

const STRINGS = {
  en: {
    heading: "Understand every FAFSA section",
    sub: "What each part of the form asks for, what it means, and the mistakes to avoid. Mark fields as you review them - this stays on your device.",
    explainer: "Explainer",
    reviewed: "reviewed",
    whatItMeans: "What it means",
    documentNeeded: "Document needed",
    commonError: "Common mistake",
    markReviewed: "Mark reviewed",
  },
  es: {
    heading: "Entiende cada sección de la FAFSA",
    sub: "Qué pide cada parte del formulario, qué significa y los errores que debes evitar. Marca los campos al revisarlos - esto se queda en tu dispositivo.",
    explainer: "Explicación",
    reviewed: "revisados",
    whatItMeans: "Qué significa",
    documentNeeded: "Documento necesario",
    commonError: "Error común",
    markReviewed: "Marcar revisado",
  },
};

const HELPER_ROWS: { key: "whatItMeans" | "documentNeeded" | "commonError"; icon: string; tone: string }[] = [
  { key: "whatItMeans", icon: "shield-check", tone: "var(--blue-700)" },
  { key: "documentNeeded", icon: "file", tone: "var(--green-600)" },
  { key: "commonError", icon: "x", tone: "var(--amber-600)" },
];

const STORAGE_KEY = "aidpilot-fafsa-guide-reviewed";

function loadReviewed(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

function FieldRow({
  field,
  path,
  sectionKey,
  reviewed,
  onToggleReviewed,
  divider,
}: {
  field: GuideField;
  path: string;
  sectionKey: string;
  reviewed: boolean;
  onToggleReviewed: () => void;
  divider: boolean;
}) {
  const { t } = useLanguage();
  const s = t(STRINGS);
  const [open, setOpen] = useState(false);

  const helpers = HELPER_ROWS.map((row) => ({ ...row, text: field[row.key] })).filter(
    (row): row is (typeof HELPER_ROWS)[number] & { text: GuideText } => row.text != null
  );
  const expandable = helpers.length > 0;

  return (
    <div style={{ borderBottom: divider ? "1px solid var(--border-card)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px" }}>
        <button
          type="button"
          aria-label={s.markReviewed}
          aria-pressed={reviewed}
          onClick={onToggleReviewed}
          style={{
            width: 21,
            height: 21,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: reviewed ? "none" : "2px solid var(--gray-200)",
            background: reviewed ? "var(--green-600)" : "var(--surface-card)",
            cursor: "pointer",
            padding: 0,
            transition: "background .15s ease",
          }}
        >
          {reviewed && <Icon name="check" size={12} color="#fff" strokeWidth={3.4} />}
        </button>

        <button
          type="button"
          onClick={() => expandable && setOpen((v) => !v)}
          aria-expanded={expandable ? open : undefined}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: expandable ? "pointer" : "default",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: reviewed ? "var(--gray-400)" : "var(--ink-800)",
              fontFamily: "var(--font-body)",
            }}
          >
            {t(field.label)}
          </span>
          {expandable && (
            <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}>
              <Icon name="chevron-down" size={16} color="var(--gray-400)" />
            </span>
          )}
        </button>
      </div>

      {open && expandable && (
        <div className="stagger-children" style={{ padding: "0 12px 14px 45px", display: "grid", gap: 10 }}>
          {helpers.map((row) => (
            <div key={`${path}.${sectionKey}.${field.fieldKey}.${row.key}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name={row.icon} size={16} color={row.tone} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: row.tone }}>
                  {s[row.key]}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.6, marginTop: 2, whiteSpace: "pre-line" }}>
                  {t(row.text)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideSectionCard({
  section,
  path,
  reviewed,
  onToggleReviewed,
}: {
  section: GuideSection;
  path: string;
  reviewed: Set<string>;
  onToggleReviewed: (key: string) => void;
}) {
  const { t } = useLanguage();
  const s = t(STRINGS);
  const [open, setOpen] = useState(false);

  const reviewedCount = section.fields.filter((f) => reviewed.has(`${path}.${section.sectionKey}.${f.fieldKey}`)).length;

  return (
    <Card variant="clay" padding={0} style={{ overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span className="font-display" style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink-900)" }}>
            {t(section.title)}
          </span>
          {section.explainer && <Badge tone="blue">{s.explainer}</Badge>}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {!section.explainer && (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: reviewedCount === section.fields.length ? "var(--green-600)" : "var(--gray-400)" }}>
              {reviewedCount}/{section.fields.length} {s.reviewed}
            </span>
          )}
          <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}>
            <Icon name="chevron-down" size={18} color="var(--gray-400)" />
          </span>
        </span>
      </button>

      {open && (
        <div style={{ padding: section.explainer ? "0 18px 18px" : "0 8px 8px" }}>
          {section.explainer && section.body ? (
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-700)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {t(section.body)}
            </div>
          ) : (
            section.fields.map((field, index) => {
              const key = `${path}.${section.sectionKey}.${field.fieldKey}`;
              return (
                <FieldRow
                  key={key}
                  field={field}
                  path={path}
                  sectionKey={section.sectionKey}
                  reviewed={reviewed.has(key)}
                  onToggleReviewed={() => onToggleReviewed(key)}
                  divider={index < section.fields.length - 1}
                />
              );
            })
          )}
        </div>
      )}
    </Card>
  );
}

export function FafsaGuide({ path = "fafsa" }: { path?: "fafsa" | "cadaa" }) {
  const { t } = useLanguage();
  const s = t(STRINGS);
  const sections = path === "cadaa" ? CADAA_GUIDE : FAFSA_GUIDE;

  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  useEffect(() => {
    setReviewed(loadReviewed());
  }, []);

  const toggleReviewed = useMemo(
    () => (key: string) => {
      setReviewed((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // Storage unavailable - the in-memory toggle still applies.
        }
        return next;
      });
    },
    []
  );

  return (
    <div>
      <SectionTitle>{s.heading}</SectionTitle>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 14px" }}>
        {s.sub}
      </p>
      <div className="stagger-children" style={{ display: "grid", gap: 12 }}>
        {sections.map((section) => (
          <GuideSectionCard
            key={section.sectionKey}
            section={section}
            path={path}
            reviewed={reviewed}
            onToggleReviewed={toggleReviewed}
          />
        ))}
      </div>
    </div>
  );
}
