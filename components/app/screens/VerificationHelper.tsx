"use client";

import { useMemo, useState } from "react";
import { Card, Button, IconTile, OptionCard, SegmentedControl, StatusPanel, SectionHeading, Badge, TextField } from "@/components/ui";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import {
  buildChecklist,
  checklistToText,
  GROUP_INFO,
  type FilerStatus,
  type ChecklistTone,
} from "@/lib/verification/guide";

/**
 * FAFSA verification helper. A student who was "selected for verification"
 * picks their tracking group (V1/V4/V5) and whether they filed 2024 taxes, and
 * gets a tailored, sourced, printable document checklist - plus an optional
 * AI-drafted note to their aid office. The facts are deterministic (sourced from
 * the Federal Student Aid Handbook), so there's no hallucination surface; the
 * AI only writes the note. Built from the app UI kit to match the product.
 */

type Status = "idle" | "loading" | "done" | "error";

const ITEM_TONE: Record<ChecklistTone, "blue" | "amber" | "green"> = {
  blue: "blue",
  amber: "amber",
  green: "green",
};
const ITEM_ICON: Record<string, string> = {
  income_filer: "file",
  income_nonfiler: "file",
  family_size: "clipboard",
  identity: "shield-check",
  school_list: "letter",
};

export function VerificationHelper() {
  const { lang, t } = useLanguage();
  const { status: saved, update } = useVerificationStatus();
  const { group, filer, schoolName } = saved;

  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [copiedList, setCopiedList] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  const s = t({
    en: {
      eyebrow: "FAFSA verification",
      heading: "Selected for verification?",
      sub: "Tell us what your school flagged and we'll lay out exactly what to gather — nothing you enter is stored.",
      reassureEyebrow: "You're not in trouble",
      reassureTitle: "Being selected doesn't mean you did anything wrong.",
      reassureBody: "Some students are picked at random, and some schools check every form. It just means you have a short list of documents to send.",
      groupLabel: "Which group were you placed in?",
      groupHint: "It's on your FAFSA Submission Summary or your school's request, shown as V1, V4, or V5.",
      groups: [
        { value: "V1" as const, icon: "file", title: "V1 — Standard", desc: "Income & family size" },
        { value: "V4" as const, icon: "shield-check", title: "V4 — Custom", desc: "Identity only" },
        { value: "V5" as const, icon: "grid", title: "V5 — Aggregate", desc: "Income, family size & identity" },
        { value: "unsure" as const, icon: "clipboard", title: "I'm not sure yet", desc: "We'll show everything you might need" },
      ],
      filerLabel: "Did you (or your parent) file a 2024 tax return?",
      filers: [
        { value: "filed", label: "Yes, filed" },
        { value: "did_not_file", label: "No, didn't file" },
        { value: "unsure", label: "Not sure" },
      ],
      verifies: "You'll verify",
      checklistEyebrow: "Your checklist",
      checklistTitle: "What to gather",
      copyList: "Copy",
      copied: "Copied",
      print: "Print / PDF",
      deadlineEyebrow: "Deadline",
      deadlineTitle: "Don't miss your school's deadline.",
      deadlineBody:
        "Your school can't pay your aid until verification is done. The federal deadline for 2026–27 is around mid-September 2027, and missing it can cost your Pell Grant — but your school's own date usually comes first.",
      noteEyebrow: "Optional",
      noteTitle: "Reach your aid office",
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
        "General guidance for the 2026–27 FAFSA, not official advice. Your school's own document list and deadline are the final word — always follow what it asks for.",
    },
    es: {
      eyebrow: "Verificación de FAFSA",
      heading: "¿Te seleccionaron para verificación?",
      sub: "Dinos qué marcó tu escuela y te mostramos exactamente qué reunir — no se guarda nada de lo que escribas.",
      reassureEyebrow: "No estás en problemas",
      reassureTitle: "Que te seleccionen no significa que hiciste algo mal.",
      reassureBody: "A algunos estudiantes los eligen al azar y algunas escuelas revisan todos los formularios. Solo significa que tienes una lista corta de documentos para enviar.",
      groupLabel: "¿En qué grupo te colocaron?",
      groupHint: "Aparece en tu Resumen de Envío de la FAFSA o en la solicitud de tu escuela, como V1, V4 o V5.",
      groups: [
        { value: "V1" as const, icon: "file", title: "V1 — Estándar", desc: "Ingresos y tamaño familiar" },
        { value: "V4" as const, icon: "shield-check", title: "V4 — Personalizado", desc: "Solo identidad" },
        { value: "V5" as const, icon: "grid", title: "V5 — Combinado", desc: "Ingresos, tamaño familiar e identidad" },
        { value: "unsure" as const, icon: "clipboard", title: "Aún no estoy seguro/a", desc: "Te mostramos todo lo que podrías necesitar" },
      ],
      filerLabel: "¿Tú (o tu padre/madre) presentaron una declaración de impuestos de 2024?",
      filers: [
        { value: "filed", label: "Sí, la presentamos" },
        { value: "did_not_file", label: "No" },
        { value: "unsure", label: "No sé" },
      ],
      verifies: "Verificarás",
      checklistEyebrow: "Tu lista",
      checklistTitle: "Qué reunir",
      copyList: "Copiar",
      copied: "Copiado",
      print: "Imprimir / PDF",
      deadlineEyebrow: "Fecha límite",
      deadlineTitle: "No pierdas la fecha límite de tu escuela.",
      deadlineBody:
        "Tu escuela no puede pagar tu ayuda hasta que termine la verificación. La fecha federal para 2026–27 es a mediados de septiembre de 2027, y perderla puede costarte tu Beca Pell — pero la fecha de tu escuela suele llegar antes.",
      noteEyebrow: "Opcional",
      noteTitle: "Contacta a tu oficina de ayuda",
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
        "Orientación general para la FAFSA 2026–27, no asesoría oficial. La lista de documentos y la fecha límite de tu escuela son la palabra final — sigue siempre lo que te pida.",
    },
  });

  const checklist = useMemo(() => (group ? buildChecklist(group, filer) : []), [group, filer]);
  const needsFiler = group === "V1" || group === "V5" || group === "unsure";
  const groupInfo = group && group !== "unsure" ? GROUP_INFO[group] : null;

  function printList() {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    const text = checklistToText(checklist, lang, s.checklistTitle);
    const escaped = text.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${s.checklistTitle}</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.6;color:#111;white-space:pre-wrap;font-size:14px}</style>` +
        `</head><body>${escaped}</body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(checklistToText(checklist, lang, s.checklistTitle));
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

  return (
    <div>
      <SectionHeading eyebrow={s.eyebrow} title={s.heading} subtitle={s.sub} style={{ marginBottom: 22 }} />

      <StatusPanel
        tone="blue"
        icon="shield-check"
        eyebrow={s.reassureEyebrow}
        title={s.reassureTitle}
        style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 24 }}
      >
        {s.reassureBody}
      </StatusPanel>

      <Card variant="clay" padding={22}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-.2px" }}>
          {s.groupLabel}
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", margin: "5px 0 14px", lineHeight: 1.5 }}>{s.groupHint}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {s.groups.map((g) => (
            <OptionCard
              key={g.value}
              selected={group === g.value}
              onClick={() => update({ group: g.value })}
              icon={g.icon}
              title={g.title}
              description={g.desc}
            />
          ))}
        </div>

        {group && needsFiler && (
          <div style={{ marginTop: 20 }}>
            <div className="font-display" style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-900)", marginBottom: 12 }}>
              {s.filerLabel}
            </div>
            <SegmentedControl
              size="sm"
              options={s.filers}
              value={filer}
              onChange={(v) => update({ filer: v as FilerStatus })}
            />
          </div>
        )}
      </Card>

      {group && (
        <>
          {groupInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 2px 0", flexWrap: "wrap" }}>
              <Badge tone="blue" dot>
                {groupInfo.code} · {groupInfo.name[lang]}
              </Badge>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)" }}>
                {s.verifies}: {groupInfo.verifies[lang].toLowerCase()}
              </span>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <SectionHeading
              size="sm"
              eyebrow={s.checklistEyebrow}
              title={s.checklistTitle}
              action={
                <span style={{ display: "inline-flex", gap: 8 }}>
                  <Button variant="ghost" size="sm" iconLeft="letter" onClick={printList}>
                    {s.print}
                  </Button>
                  <Button variant="ghost" size="sm" iconLeft={copiedList ? "check" : "file"} onClick={() => void copyList()}>
                    {copiedList ? s.copied : s.copyList}
                  </Button>
                </span>
              }
              style={{ marginBottom: 12 }}
            />
            <Card variant="clay" padding={10}>
              {checklist.map((item, i) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: "14px 12px",
                    borderTop: i === 0 ? "none" : "1px solid var(--border-card)",
                  }}
                >
                  <IconTile icon={ITEM_ICON[item.key] ?? "file"} tone={ITEM_TONE[item.tone]} size={40} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="font-display" style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-900)" }}>{item.title[lang]}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, marginTop: 3 }}>{item.detail[lang]}</div>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ margin: "12px 2px 0" }}>
              <SourceBadge />
            </div>
          </div>

          <StatusPanel
            tone="amber"
            icon="calendar-check"
            eyebrow={s.deadlineEyebrow}
            title={s.deadlineTitle}
            style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginTop: 24 }}
          >
            {s.deadlineBody}
          </StatusPanel>

          <div style={{ marginTop: 28 }}>
            <SectionHeading size="sm" eyebrow={s.noteEyebrow} title={s.noteTitle} subtitle={s.noteSub} style={{ marginBottom: 14 }} />
            <Card variant="clay" padding={22}>
              <TextField
                label={s.schoolLabel}
                placeholder={s.schoolPlaceholder}
                value={schoolName}
                onChange={(e) => update({ schoolName: e.target.value })}
                maxLength={120}
                style={{ marginBottom: 16 }}
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 18px", background: "var(--gradient-info)" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
                    {status === "loading" && !note ? s.thinking : s.yourNote}
                  </span>
                  {status === "done" && note && (
                    <Button variant="ghost" size="sm" iconLeft={copiedNote ? "check" : "file"} onClick={() => void copyNote()}>
                      {copiedNote ? s.copied : s.copyNote}
                    </Button>
                  )}
                </div>
                <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, padding: "18px 20px" }}>
                  {note}
                  {status === "loading" && <span style={{ opacity: 0.5 }}>▍</span>}
                </p>
              </Card>
            )}
          </div>

          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "20px 2px 0" }}>{s.disclaimer}</p>
        </>
      )}
    </div>
  );
}
