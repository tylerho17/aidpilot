"use client";

import { useMemo, useState } from "react";
import { Card, Button, Icon, Badge, TextField } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import {
  buildChecklist,
  checklistToText,
  GROUP_INFO,
  type VerificationGroup,
  type FilerStatus,
  type ChecklistTone,
} from "@/lib/verification/guide";

/**
 * FAFSA verification helper. A student who was "selected for verification"
 * picks their tracking group (V1/V4/V5) and whether they filed 2024 taxes, and
 * gets a tailored, sourced, printable document checklist - plus an optional
 * AI-drafted note to their aid office. The facts are deterministic (sourced from
 * the Federal Student Aid Handbook), so there's no hallucination surface; the
 * AI only writes the note. The "job" a chatbot can't own: current federal rules
 * + their situation + a reusable artifact, with no PII stored.
 */

type Status = "idle" | "loading" | "done" | "error";

const TONE_BG: Record<ChecklistTone, string> = {
  blue: "var(--blue-100)",
  amber: "var(--amber-100)",
  green: "var(--green-100)",
};
const TONE_FG: Record<ChecklistTone, string> = {
  blue: "var(--blue-700)",
  amber: "var(--amber-700)",
  green: "var(--green-600)",
};

export function VerificationHelper() {
  const { lang, t } = useLanguage();
  const [group, setGroup] = useState<VerificationGroup | null>(null);
  const [filer, setFiler] = useState<FilerStatus>("unsure");
  const [schoolName, setSchoolName] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [copiedList, setCopiedList] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  const s = t({
    en: {
      heading: "Selected for verification?",
      sub: "Being selected doesn't mean you did anything wrong — some students are picked at random, and some schools check every form. Here's exactly what to gather. Nothing you enter is stored.",
      groupLabel: "Which group were you placed in?",
      groupHint: "It's on your FAFSA Submission Summary or your school's request, shown as V1, V4, or V5.",
      groups: [
        { value: "V1" as const, label: "V1 — income & family size" },
        { value: "V4" as const, label: "V4 — identity only" },
        { value: "V5" as const, label: "V5 — both" },
        { value: "unsure" as const, label: "I'm not sure yet" },
      ],
      filerLabel: "Did you (or your parent) file a 2024 tax return?",
      filers: [
        { value: "filed" as const, label: "Yes, filed" },
        { value: "did_not_file" as const, label: "No, didn't file" },
        { value: "unsure" as const, label: "Not sure" },
      ],
      verifies: "You'll need to verify:",
      checklistHeading: "Your verification checklist",
      copyList: "Copy list",
      copied: "Copied",
      print: "Print / Save PDF",
      deadlineTitle: "Don't miss the deadline",
      deadlineBody:
        "Your school can't pay your aid until verification is done. Submit everything by your school's deadline — the federal deadline for 2026–27 is around mid-September 2027, and missing it can cost your Pell Grant.",
      noteHeading: "Need to reach your aid office?",
      noteSub: "We can draft a short message asking them to confirm the exact documents and deadline.",
      schoolLabel: "School (optional)",
      schoolPlaceholder: "e.g. Fresno State",
      draftCta: "Draft a note to my aid office",
      redraft: "Redraft",
      thinking: "Writing your note…",
      yourNote: "Your draft message",
      copyNote: "Copy",
      warming: "AidPilot's AI isn't available right now.",
      genericError: "Something went wrong. Please try again.",
      disclaimer:
        "This is general guidance for the 2026–27 FAFSA, not official advice. Your school's own document list and deadline are the final word — always follow what it asks for.",
    },
    es: {
      heading: "¿Te seleccionaron para verificación?",
      sub: "Que te seleccionen no significa que hiciste algo mal — a algunos estudiantes los eligen al azar y algunas escuelas revisan todos los formularios. Esto es lo que debes reunir. No se guarda nada de lo que escribas.",
      groupLabel: "¿En qué grupo te colocaron?",
      groupHint: "Aparece en tu Resumen de Envío de la FAFSA o en la solicitud de tu escuela, como V1, V4 o V5.",
      groups: [
        { value: "V1" as const, label: "V1 — ingresos y tamaño familiar" },
        { value: "V4" as const, label: "V4 — solo identidad" },
        { value: "V5" as const, label: "V5 — ambos" },
        { value: "unsure" as const, label: "Aún no estoy seguro/a" },
      ],
      filerLabel: "¿Tú (o tu padre/madre) presentaron una declaración de impuestos de 2024?",
      filers: [
        { value: "filed" as const, label: "Sí, la presentamos" },
        { value: "did_not_file" as const, label: "No, no la presentamos" },
        { value: "unsure" as const, label: "No estoy seguro/a" },
      ],
      verifies: "Tendrás que verificar:",
      checklistHeading: "Tu lista de verificación",
      copyList: "Copiar lista",
      copied: "Copiado",
      print: "Imprimir / Guardar PDF",
      deadlineTitle: "No pierdas la fecha límite",
      deadlineBody:
        "Tu escuela no puede pagar tu ayuda hasta que termine la verificación. Entrega todo antes de la fecha límite de tu escuela — la fecha límite federal para 2026–27 es alrededor de mediados de septiembre de 2027, y perderla puede costarte tu Beca Pell.",
      noteHeading: "¿Necesitas contactar a tu oficina de ayuda?",
      noteSub: "Podemos redactar un mensaje corto pidiéndoles que confirmen los documentos exactos y la fecha límite.",
      schoolLabel: "Escuela (opcional)",
      schoolPlaceholder: "ej. Fresno State",
      draftCta: "Redactar un mensaje para mi oficina de ayuda",
      redraft: "Rehacer",
      thinking: "Escribiendo tu mensaje…",
      yourNote: "Tu borrador de mensaje",
      copyNote: "Copiar",
      warming: "El AI de AidPilot no está disponible ahora.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      disclaimer:
        "Esto es orientación general para la FAFSA 2026–27, no asesoría oficial. La lista de documentos y la fecha límite de tu escuela son la palabra final — sigue siempre lo que te pida.",
    },
  });

  const checklist = useMemo(
    () => (group ? buildChecklist(group, filer) : []),
    [group, filer]
  );

  const needsFiler = group === "V1" || group === "V5" || group === "unsure";

  function printList() {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    const text = checklistToText(checklist, lang, s.checklistHeading);
    const escaped = text.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${s.checklistHeading}</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.6;color:#111;white-space:pre-wrap;font-size:14px}</style>` +
        `</head><body>${escaped}</body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(checklistToText(checklist, lang, s.checklistHeading));
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function draftNote() {
    if (status === "loading") return;
    setStatus("loading");
    setNote("");
    setError("");
    setCopiedNote(false);

    const result = await streamAiAnswer(
      "/api/verification/note",
      { group: group ?? "unsure", filer, schoolName: schoolName.trim(), lang },
      (partial) => {
        setStatus("done");
        setNote(partial);
      }
    );

    if (!result.ok) {
      setStatus("error");
      setError(result.warming ? s.warming : result.error);
      return;
    }
    setStatus("done");
    setNote(result.text);
  }

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const groupInfo = group && group !== "unsure" ? GROUP_INFO[group] : null;

  return (
    <div>
      <SectionTitle>{s.heading}</SectionTitle>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 16px" }}>
        {s.sub}
      </p>

      <Card variant="clay" padding={20}>
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--blue-700)", marginBottom: 4 }}>
          {s.groupLabel}
        </div>
        <p style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", margin: "0 0 10px", lineHeight: 1.5 }}>
          {s.groupHint}
        </p>
        <div style={{ display: "grid", gap: 8, marginBottom: needsFiler && group ? 18 : 4 }}>
          {s.groups.map((g) => {
            const sel = group === g.value;
            return (
              <button
                key={g.value}
                onClick={() => setGroup(g.value)}
                style={optionStyle(sel)}
              >
                {g.label}
                <Icon name={sel ? "shield-check" : "arrow-right"} size={16} color={sel ? "var(--blue-700)" : "var(--gray-400)"} />
              </button>
            );
          })}
        </div>

        {group && needsFiler && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--blue-700)", marginBottom: 10 }}>
              {s.filerLabel}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {s.filers.map((f) => {
                const sel = filer === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFiler(f.value)}
                    style={{
                      padding: "9px 14px",
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
          </>
        )}
      </Card>

      {group && (
        <>
          {groupInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 2px 0" }}>
              <Badge tone="blue" dot>
                {groupInfo.code} · {groupInfo.name[lang]}
              </Badge>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)" }}>
                {s.verifies} {groupInfo.verifies[lang]}
              </span>
            </div>
          )}

          <Card variant="clay" padding={0} style={{ marginTop: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "var(--gradient-info)" }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
                {s.checklistHeading}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                <button onClick={printList} style={linkBtn}>
                  <Icon name="letter" size={14} /> {s.print}
                </button>
                <button onClick={() => void copyList()} style={linkBtn}>
                  <Icon name={copiedList ? "check" : "file"} size={14} /> {copiedList ? s.copied : s.copyList}
                </button>
              </span>
            </div>
            <div style={{ padding: "6px 8px" }}>
              {checklist.map((item, i) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 10px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border-card)",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: TONE_BG[item.tone],
                      color: TONE_FG[item.tone],
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      fontFamily: "var(--font-metric)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: "var(--ink-900)" }}>{item.title[lang]}</span>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, marginTop: 3 }}>
                      {item.detail[lang]}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ margin: "12px 2px 0" }}>
            <SourceBadge />
          </div>

          {/* Deadline warning */}
          <Card variant="clay" padding={16} style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}>
              <Icon name="calendar" size={20} color="var(--amber-600)" />
            </span>
            <span>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: "var(--ink-900)" }}>{s.deadlineTitle}</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, marginTop: 3 }}>
                {s.deadlineBody}
              </span>
            </span>
          </Card>

          {/* AI note to aid office */}
          <div style={{ marginTop: 24 }}>
            <SectionTitle>{s.noteHeading}</SectionTitle>
            <Card variant="clay" padding={20}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "0 0 14px" }}>{s.noteSub}</p>
              <TextField
                label={s.schoolLabel}
                placeholder={s.schoolPlaceholder}
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                maxLength={120}
                style={{ marginBottom: 14 }}
              />
              <Button variant="clay" iconLeft="letter" loading={status === "loading"} onClick={() => void draftNote()}>
                {status === "done" ? s.redraft : s.draftCta}
              </Button>
              {status === "error" && (
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)", marginTop: 12 }}>{error}</p>
              )}
            </Card>

            {(status === "loading" || (status === "done" && note)) && (
              <Card variant="clay" padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "var(--gradient-info)" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
                    {status === "loading" && !note ? s.thinking : s.yourNote}
                  </span>
                  {status === "done" && note && (
                    <button onClick={() => void copyNote()} style={linkBtn}>
                      <Icon name={copiedNote ? "check" : "file"} size={14} /> {copiedNote ? s.copied : s.copyNote}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, padding: "16px 18px" }}>
                  {note}
                  {status === "loading" && <span style={{ opacity: 0.5 }}>▍</span>}
                </p>
              </Card>
            )}
          </div>

          <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "18px 2px 0" }}>{s.disclaimer}</p>
        </>
      )}
    </div>
  );
}

function optionStyle(sel: boolean): React.CSSProperties {
  return {
    textAlign: "left",
    padding: "11px 14px",
    borderRadius: "var(--radius-lg)",
    border: `1.5px solid ${sel ? "var(--blue-700)" : "var(--border-default)"}`,
    background: sel ? "var(--blue-50)" : "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    fontSize: 14.5,
    fontWeight: 700,
    color: "var(--ink-800)",
  };
}

const linkBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12.5,
  fontWeight: 700,
  color: "var(--blue-700)",
};
