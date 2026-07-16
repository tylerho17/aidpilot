"use client";

import { useState } from "react";
import { Card, Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useAidPath } from "@/hooks/useAidPath";
import {
  isAidPathComplete,
  resetAidPath,
  updateAidPath,
  type AidForm,
  type ParentSituation,
  type Timeline,
} from "@/lib/aid-path/profile-store";
import { describeAidPath } from "@/lib/aid-path/guidance";

type Field = "form" | "parents" | "timeline";
type Option = { value: string; label: string; sub?: string };

/**
 * Three-question triage that personalizes the whole plan: which form to file
 * (FAFSA vs CADAA), which parent contributes, and where the student is in the
 * timeline. Answers are coarse categories stored on-device only. When answered,
 * shows a personalized "Your path" summary instead of the generic checklist.
 */
export function AidPathIntake() {
  const { t } = useLanguage();
  const profile = useAidPath();
  const complete = isAidPathComplete(profile);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);

  const s = t({
    en: {
      intro: "Answer 3 quick questions and AidPilot tailors your plan — nothing leaves your device.",
      yourPath: "Your path",
      edit: "Redo",
      next: "of 3",
      q: [
        {
          field: "form" as Field,
          title: "Which application fits you?",
          options: [
            { value: "fafsa", label: "FAFSA", sub: "I'm a U.S. citizen or eligible noncitizen, or I have an SSN" },
            { value: "cadaa", label: "CADAA", sub: "I'm an undocumented California student without an SSN" },
            { value: "unsure", label: "I'm not sure yet" },
          ],
        },
        {
          field: "parents" as Field,
          title: "Who fills out the parent part?",
          options: [
            { value: "together", label: "Parents married or living together" },
            { value: "divorced", label: "Parents divorced or separated" },
            { value: "single", label: "One parent / single parent" },
            { value: "cant_provide", label: "I can't get my parents' info" },
          ],
        },
        {
          field: "timeline" as Field,
          title: "Where are you right now?",
          options: [
            { value: "senior", label: "High school senior" },
            { value: "junior", label: "High school junior" },
            { value: "underclass", label: "Sophomore or earlier" },
            { value: "college", label: "Already in college" },
          ],
        },
      ] as { field: Field; title: string; options: Option[] }[],
    },
    es: {
      intro: "Responde 3 preguntas rápidas y AidPilot personaliza tu plan — nada sale de tu dispositivo.",
      yourPath: "Tu ruta",
      edit: "Rehacer",
      next: "de 3",
      q: [
        {
          field: "form" as Field,
          title: "¿Cuál solicitud te corresponde?",
          options: [
            { value: "fafsa", label: "FAFSA", sub: "Soy ciudadano/a o no ciudadano/a elegible, o tengo un SSN" },
            { value: "cadaa", label: "CADAA", sub: "Soy estudiante indocumentado/a de California sin SSN" },
            { value: "unsure", label: "Aún no estoy seguro/a" },
          ],
        },
        {
          field: "parents" as Field,
          title: "¿Quién llena la parte de los padres?",
          options: [
            { value: "together", label: "Padres casados o viviendo juntos" },
            { value: "divorced", label: "Padres divorciados o separados" },
            { value: "single", label: "Un solo padre / madre" },
            { value: "cant_provide", label: "No puedo obtener su información" },
          ],
        },
        {
          field: "timeline" as Field,
          title: "¿En qué etapa estás?",
          options: [
            { value: "senior", label: "Último año de preparatoria" },
            { value: "junior", label: "Penúltimo año" },
            { value: "underclass", label: "Antes del penúltimo año" },
            { value: "college", label: "Ya estoy en la universidad" },
          ],
        },
      ] as { field: Field; title: string; options: Option[] }[],
    },
  });

  const guide = describeAidPath(profile);

  // ── Personalized summary ──
  if (complete && !editing) {
    return (
      <Card variant="clay" padding={0} style={{ overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 18px", background: "var(--gradient-info)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="shield-check" size={18} color="var(--blue-700)" />
              <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
                {s.yourPath}
              </span>
            </span>
            <button
              onClick={() => { setStep(0); setEditing(true); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--blue-700)" }}
            >
              {s.edit}
            </button>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-900)", marginTop: 6, letterSpacing: "-.3px" }} className="font-display">
            {guide.pathLabel}
          </div>
        </div>
        <div style={{ padding: "14px 18px 18px", display: "grid", gap: 12 }}>
          <PathLine icon="plane" text={guide.pathLine} />
          {guide.parentLine && <PathLine icon="shield" text={guide.parentLine} />}
          {guide.timelineLine && <PathLine icon="calendar" text={guide.timelineLine} />}
        </div>
      </Card>
    );
  }

  // ── Intake wizard ──
  const question = s.q[step];
  function answer(field: Field, value: string) {
    if (field === "form") updateAidPath({ form: value as AidForm });
    else if (field === "parents") updateAidPath({ parents: value as ParentSituation });
    else updateAidPath({ timeline: value as Timeline });
    if (step < 2) setStep(step + 1);
    else setEditing(false);
  }
  const selected = profile[question.field];

  return (
    <Card variant="clay" padding={20} style={{ marginBottom: 20 }}>
      {!editing && step === 0 && (
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, margin: "0 0 14px" }}>{s.intro}</p>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 99, background: i <= step ? "var(--blue-700)" : "var(--border-default)", transition: "width .2s ease" }} />
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>{step + 1} {s.next}</span>
      </div>
      <div style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink-900)", marginBottom: 12, letterSpacing: "-.2px" }} className="font-display">
        {question.title}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {question.options.map((opt) => {
          const isSel = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => answer(question.field, opt.value)}
              style={{
                textAlign: "left",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "var(--radius-lg)",
                border: `1.5px solid ${isSel ? "var(--blue-700)" : "var(--border-default)"}`,
                background: isSel ? "var(--blue-50)" : "var(--surface-1, #fff)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--ink-800)" }}>{opt.label}</span>
                {opt.sub && <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--gray-500)", marginTop: 2, lineHeight: 1.4 }}>{opt.sub}</span>}
              </span>
              <Icon name={isSel ? "shield-check" : "arrow-right"} size={16} color={isSel ? "var(--blue-700)" : "var(--gray-400)"} />
            </button>
          );
        })}
      </div>
      {editing && (
        <button
          onClick={() => { resetAidPath(); setEditing(false); setStep(0); }}
          style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--gray-400)" }}
        >
          Clear my answers
        </button>
      )}
    </Card>
  );
}

function PathLine({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--blue-50)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        <Icon name={icon} size={15} color="var(--blue-700)" />
      </span>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}
