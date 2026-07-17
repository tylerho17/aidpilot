"use client";

import { useState } from "react";
import { Card, Button, Icon, TextField } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { useAidPathContext } from "@/hooks/useAidPath";

/**
 * Aid appeal builder. A student describes a change in circumstances (income
 * loss, medical bills, family change) and AidPilot drafts a ready-to-send
 * professional-judgment appeal letter to their financial aid office - grounded
 * in what they typed, with [placeholders] for identifying details so no PII is
 * needed. The "job" a general chatbot can't own: their context, current rules,
 * a reusable artifact, and their privacy.
 */

type Status = "idle" | "loading" | "done" | "error";

/** Read a query param on the client (empty on the server). */
function urlParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

export function AppealBuilder() {
  const { lang, t } = useLanguage();
  const aiContext = useAidPathContext();
  // Prefill from a deep link (the offer comparison sends ?school=…&reason=…).
  // AppChrome renders this client-side only (it gates on authReady), so reading
  // the URL in the lazy initializer is safe - no SSR value to mismatch, and no
  // setState in an effect.
  const [reason, setReason] = useState(() => {
    const r = urlParam("reason");
    return ["income_loss", "medical", "family_change", "other"].includes(r) ? r : "income_loss";
  });
  const [details, setDetails] = useState("");
  const [schoolName, setSchoolName] = useState(() => urlParam("school").slice(0, 120));
  const [status, setStatus] = useState<Status>("idle");
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function printLetter() {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return; // popup blocked - the Copy button is the fallback
    const escaped = letter.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Aid appeal letter</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.6;color:#111;white-space:pre-wrap;font-size:14px}</style>` +
        `</head><body>${escaped}</body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  const s = t({
    en: {
      heading: "Build an aid appeal",
      sub: "If your family's situation changed since your form, you can ask your school to review your aid. Tell us what happened and we'll draft the letter — nothing is stored.",
      reasonLabel: "What changed?",
      reasons: [
        { value: "income_loss", label: "Lost income or a job" },
        { value: "medical", label: "High medical or dental bills" },
        { value: "family_change", label: "Divorce, separation, or a death" },
        { value: "other", label: "Another special circumstance" },
      ],
      detailsLabel: "In your own words, what happened?",
      detailsPlaceholder: "e.g. My dad was laid off in March 2026 and our household income dropped by about half.",
      schoolLabel: "School (optional)",
      schoolPlaceholder: "e.g. Fresno State",
      cta: "Draft my letter",
      again: "Redraft",
      thinking: "Drafting your letter…",
      warming: "AidPilot's AI isn't available right now.",
      genericError: "Something went wrong. Please try again.",
      needDetails: "Tell us briefly what changed first.",
      yourLetter: "Your draft letter",
      copy: "Copy",
      copied: "Copied",
      print: "Print / Save PDF",
      note: "This is a draft to review, not official advice — fill in the bracketed details, attach any documents your school asks for, and check your school's own appeal process and deadline.",
    },
    es: {
      heading: "Crea una apelación de ayuda",
      sub: "Si la situación de tu familia cambió desde tu formulario, puedes pedirle a tu escuela que revise tu ayuda. Cuéntanos qué pasó y redactamos la carta — no se guarda nada.",
      reasonLabel: "¿Qué cambió?",
      reasons: [
        { value: "income_loss", label: "Pérdida de ingresos o empleo" },
        { value: "medical", label: "Gastos médicos o dentales altos" },
        { value: "family_change", label: "Divorcio, separación o un fallecimiento" },
        { value: "other", label: "Otra circunstancia especial" },
      ],
      detailsLabel: "En tus palabras, ¿qué pasó?",
      detailsPlaceholder: "ej. A mi papá lo despidieron en marzo de 2026 y el ingreso del hogar bajó a la mitad.",
      schoolLabel: "Escuela (opcional)",
      schoolPlaceholder: "ej. Fresno State",
      cta: "Redactar mi carta",
      again: "Rehacer",
      thinking: "Redactando tu carta…",
      warming: "El AI de AidPilot no está disponible ahora.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      needDetails: "Primero cuéntanos brevemente qué cambió.",
      yourLetter: "Tu borrador de carta",
      copy: "Copiar",
      copied: "Copiado",
      print: "Imprimir / Guardar PDF",
      note: "Este es un borrador para revisar, no asesoría oficial — completa los datos entre corchetes, adjunta los documentos que pida tu escuela y revisa el proceso y la fecha límite de apelación de tu escuela.",
    },
  });

  async function draft() {
    if (status === "loading") return;
    if (!details.trim()) {
      setStatus("error");
      setError(s.needDetails);
      return;
    }
    setStatus("loading");
    setLetter("");
    setError("");
    setCopied(false);

    const result = await streamAiAnswer(
      "/api/aid-appeal/draft",
      { reason, details: details.trim(), schoolName: schoolName.trim(), lang, context: aiContext },
      (partial) => {
        setStatus("done");
        setLetter(partial);
      }
    );

    if (!result.ok) {
      setStatus("error");
      setError(result.warming ? s.warming : result.error);
      return;
    }
    setStatus("done");
    setLetter(result.text);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked - user can select manually */
    }
  }

  return (
    <div>
      <SectionTitle>{s.heading}</SectionTitle>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 16px" }}>{s.sub}</p>

      <Card variant="clay" padding={20}>
        <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--blue-700)", marginBottom: 10 }}>
          {s.reasonLabel}
        </div>
        <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
          {s.reasons.map((r) => {
            const sel = reason === r.value;
            return (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                style={{
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
                }}
              >
                {r.label}
                <Icon name={sel ? "shield-check" : "arrow-right"} size={16} color={sel ? "var(--blue-700)" : "var(--gray-400)"} />
              </button>
            );
          })}
        </div>

        <label style={{ display: "block", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--blue-700)", marginBottom: 8 }}>
          {s.detailsLabel}
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={s.detailsPlaceholder}
          rows={3}
          maxLength={1000}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1.5px solid var(--border-default)",
            fontSize: 14.5,
            fontWeight: 500,
            color: "var(--ink-800)",
            lineHeight: 1.5,
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            marginBottom: 14,
          }}
        />

        <TextField
          label={s.schoolLabel}
          placeholder={s.schoolPlaceholder}
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          maxLength={120}
          style={{ marginBottom: 16 }}
        />

        <Button variant="clay" iconLeft="letter" loading={status === "loading"} onClick={() => void draft()}>
          {status === "done" ? s.again : s.cta}
        </Button>

        {status === "error" && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)", marginTop: 12 }}>{error}</p>
        )}
      </Card>

      {(status === "loading" || (status === "done" && letter)) && (
        <Card variant="clay" padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "var(--gradient-info)" }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
              {status === "loading" && !letter ? s.thinking : s.yourLetter}
            </span>
            {status === "done" && letter && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                <button
                  onClick={printLetter}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--blue-700)" }}
                >
                  <Icon name="letter" size={14} />
                  {s.print}
                </button>
                <button
                  onClick={() => void copy()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--blue-700)" }}
                >
                  <Icon name={copied ? "check" : "file"} size={14} />
                  {copied ? s.copied : s.copy}
                </button>
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, padding: "16px 18px" }}>
            {letter}
            {status === "loading" && <span style={{ opacity: 0.5 }}>▍</span>}
          </p>
        </Card>
      )}

      {status === "done" && letter && (
        <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "12px 2px 0" }}>{s.note}</p>
      )}
    </div>
  );
}
