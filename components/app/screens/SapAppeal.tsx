"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Icon, OptionCard, StatusPanel, SectionHeading, TextField } from "@/components/ui";
import { SourceBadge } from "@/components/app/SourceBadge";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { useAidPathContext } from "@/hooks/useAidPath";

/**
 * SAP (Satisfactory Academic Progress) appeal builder. A student who lost
 * federal aid for not meeting SAP (GPA / completion pace / max timeframe) tells
 * us what happened and their plan to get back on track, and AidPilot drafts a
 * ready-to-send appeal letter to their financial aid office - grounded in what
 * they typed, with [placeholders] so no PII is needed and nothing is stored.
 * The "job" a chatbot can't own: their situation + the current rules + a
 * reusable artifact + their privacy. Kit-composed to match the product.
 */

type Status = "idle" | "loading" | "done" | "error";

export function SapAppeal() {
  const { lang, t } = useLanguage();
  const aiContext = useAidPathContext();
  const [reason, setReason] = useState<string>("illness_injury");
  const [details, setDetails] = useState("");
  const [plan, setPlan] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const s = t({
    en: {
      eyebrow: "SAP appeal",
      heading: "Lost aid over your grades?",
      sub: "If your school cut your financial aid for not meeting Satisfactory Academic Progress, you can appeal. Tell us what happened and your plan — we'll draft the letter. Nothing is stored.",
      reassureEyebrow: "This is appealable",
      reassureTitle: "A rough term doesn't have to end your aid.",
      reassureBody: "Schools can reinstate aid on probation or an academic plan when something outside your control got in the way — an illness, a loss, a family emergency. A clear appeal is how you ask.",
      reasonLabel: "What got in the way?",
      reasons: [
        { value: "illness_injury", icon: "shield", title: "A serious illness or injury", desc: "Your own health disrupted your studies" },
        { value: "death", icon: "letter", title: "A death in the family", desc: "You lost a relative or someone close" },
        { value: "family_emergency", icon: "shield-check", title: "A family emergency or hardship", desc: "A major personal or family crisis" },
        { value: "other", icon: "clipboard", title: "Another special circumstance", desc: "Something else outside your control" },
      ],
      detailsLabel: "In your own words, what happened?",
      detailsPlaceholder: "e.g. I was hospitalized for three weeks in the spring term and fell behind in my classes.",
      planLabel: "What's changed, and your plan to get back on track?",
      planPlaceholder: "e.g. I've recovered and set up a lighter course load, weekly tutoring, and regular check-ins with my advisor.",
      schoolLabel: "School (optional)",
      schoolPlaceholder: "e.g. Fresno State",
      cta: "Draft my appeal",
      again: "Redraft",
      thinking: "Drafting your appeal…",
      warming: "AidPilot's AI isn't available right now.",
      needDetails: "Tell us briefly what happened first.",
      yourLetter: "Your draft appeal",
      copy: "Copy",
      copied: "Copied",
      print: "Print / Save PDF",
      note: "A draft to review, not official advice — fill in the bracketed details, attach documentation of your circumstance, and use your school's own SAP appeal form and deadline, since each school sets its own.",
      vaultLink: "Keep your documentation in your vault",
    },
    es: {
      eyebrow: "Apelación de SAP",
      heading: "¿Perdiste tu ayuda por tus calificaciones?",
      sub: "Si tu escuela cortó tu ayuda financiera por no cumplir el Progreso Académico Satisfactorio, puedes apelar. Cuéntanos qué pasó y tu plan — redactamos la carta. No se guarda nada.",
      reassureEyebrow: "Esto se puede apelar",
      reassureTitle: "Un semestre difícil no tiene por qué terminar tu ayuda.",
      reassureBody: "Las escuelas pueden restablecer la ayuda con período de prueba o un plan académico cuando algo fuera de tu control se interpuso — una enfermedad, una pérdida, una emergencia familiar. Una apelación clara es cómo lo pides.",
      reasonLabel: "¿Qué se interpuso?",
      reasons: [
        { value: "illness_injury", icon: "shield", title: "Una enfermedad o lesión grave", desc: "Tu propia salud afectó tus estudios" },
        { value: "death", icon: "letter", title: "Un fallecimiento en la familia", desc: "Perdiste a un familiar o alguien cercano" },
        { value: "family_emergency", icon: "shield-check", title: "Una emergencia o dificultad familiar", desc: "Una crisis personal o familiar mayor" },
        { value: "other", icon: "clipboard", title: "Otra circunstancia especial", desc: "Algo más fuera de tu control" },
      ],
      detailsLabel: "En tus palabras, ¿qué pasó?",
      detailsPlaceholder: "ej. Estuve hospitalizado tres semanas en el semestre de primavera y me atrasé en mis clases.",
      planLabel: "¿Qué ha cambiado y cuál es tu plan para recuperarte?",
      planPlaceholder: "ej. Ya me recuperé y organicé una carga de cursos más ligera, tutoría semanal y reuniones regulares con mi asesor.",
      schoolLabel: "Escuela (opcional)",
      schoolPlaceholder: "ej. Fresno State",
      cta: "Redactar mi apelación",
      again: "Rehacer",
      thinking: "Redactando tu apelación…",
      warming: "El AI de AidPilot no está disponible ahora.",
      needDetails: "Primero cuéntanos brevemente qué pasó.",
      yourLetter: "Tu borrador de apelación",
      copy: "Copiar",
      copied: "Copiado",
      print: "Imprimir / Guardar PDF",
      note: "Un borrador para revisar, no asesoría oficial — completa los datos entre corchetes, adjunta documentación de tu circunstancia y usa el formulario y la fecha límite de apelación de SAP de tu escuela, ya que cada escuela fija los suyos.",
      vaultLink: "Guarda tu documentación en tu bóveda",
    },
  });

  function printLetter() {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    const escaped = letter.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
    win.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>SAP appeal letter</title>` +
        `<style>body{font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.6;color:#111;white-space:pre-wrap;font-size:14px}</style>` +
        `</head><body>${escaped}</body></html>`
    );
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

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
      "/api/sap-appeal/draft",
      { reason, details: details.trim(), plan: plan.trim(), schoolName: schoolName.trim(), lang, context: aiContext },
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
      /* clipboard blocked */
    }
  }

  const textarea: React.CSSProperties = {
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
  };

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
        <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-900)", marginBottom: 12 }}>
          {s.reasonLabel}
        </div>
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {s.reasons.map((r) => (
            <OptionCard
              key={r.value}
              selected={reason === r.value}
              onClick={() => setReason(r.value)}
              icon={r.icon}
              title={r.title}
              description={r.desc}
            />
          ))}
        </div>

        <label className="font-display" style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--ink-900)", marginBottom: 8 }}>
          {s.detailsLabel}
        </label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={s.detailsPlaceholder} rows={3} maxLength={1000} style={{ ...textarea, marginBottom: 18 }} />

        <label className="font-display" style={{ display: "block", fontSize: 15, fontWeight: 800, color: "var(--ink-900)", marginBottom: 8 }}>
          {s.planLabel}
        </label>
        <textarea value={plan} onChange={(e) => setPlan(e.target.value)} placeholder={s.planPlaceholder} rows={3} maxLength={600} style={{ ...textarea, marginBottom: 18 }} />

        <TextField label={s.schoolLabel} placeholder={s.schoolPlaceholder} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} maxLength={120} style={{ marginBottom: 16 }} />

        <Button variant="clay" iconLeft="letter" loading={status === "loading"} onClick={() => void draft()}>
          {status === "done" ? s.again : s.cta}
        </Button>

        {status === "error" && <p style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)", marginTop: 12 }}>{error}</p>}
      </Card>

      {(status === "loading" || (status === "done" && letter)) && (
        <Card variant="clay" padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 18px", background: "var(--gradient-info)" }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
              {status === "loading" && !letter ? s.thinking : s.yourLetter}
            </span>
            {status === "done" && letter && (
              <span style={{ display: "inline-flex", gap: 8 }}>
                <Button variant="ghost" size="sm" iconLeft="letter" onClick={printLetter}>{s.print}</Button>
                <Button variant="ghost" size="sm" iconLeft={copied ? "check" : "file"} onClick={() => void copy()}>{copied ? s.copied : s.copy}</Button>
              </span>
            )}
          </div>
          <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, padding: "18px 20px" }}>
            {letter}
            {status === "loading" && <span style={{ opacity: 0.5 }}>▍</span>}
          </p>
        </Card>
      )}

      <div style={{ margin: "14px 2px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <SourceBadge />
        <Link href="/vault" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--blue-700)", textDecoration: "none" }}>
          <Icon name="file" size={14} color="var(--blue-700)" />
          {s.vaultLink}
          <Icon name="arrow-right" size={13} color="var(--blue-700)" />
        </Link>
      </div>
      {status === "done" && letter && (
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "10px 2px 0" }}>{s.note}</p>
      )}
    </div>
  );
}
