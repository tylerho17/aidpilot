"use client";

import { useState, type FormEvent } from "react";
import { Card, IconTile, Button, TextField } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { SourceBadge } from "@/components/app/SourceBadge";

/**
 * Ask AidPilot - a question box over the sourced FAFSA guide. Calls the
 * grounded /api/fafsa-guide/ask route; questions are never stored. Degrades
 * to a friendly notice when the deployment has no AI key configured.
 */

const STRINGS = {
  en: {
    heading: "Ask AidPilot",
    sub: "Questions about the FAFSA, answered from our sourced guide. Don't include personal details - we never need your SSN or passwords.",
    placeholder: "e.g. Which parent has to fill out the FAFSA?",
    ask: "Ask",
    asking: "Thinking...",
    disclaimer: "AI answers are educational, based on AidPilot's sourced guide - not official financial aid advice.",
    genericError: "Something went wrong. Please try again.",
  },
  es: {
    heading: "Pregúntale a AidPilot",
    sub: "Preguntas sobre la FAFSA, respondidas desde nuestra guía verificada. No incluyas datos personales - nunca necesitamos tu SSN ni contraseñas.",
    placeholder: "p. ej. ¿Cuál padre tiene que llenar la FAFSA?",
    ask: "Preguntar",
    asking: "Pensando...",
    disclaimer: "Las respuestas de IA son educativas, basadas en la guía verificada de AidPilot - no son asesoría oficial de ayuda financiera.",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
  },
};

export function AskAidPilot() {
  const { lang, t } = useLanguage();
  const s = t(STRINGS);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    const result = await streamAiAnswer(
      "/api/fafsa-guide/ask",
      { question: trimmed, lang },
      (partial) => setAnswer(partial)
    );

    if (!result.ok) {
      setError(result.warming ? s.genericError : result.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle>{s.heading}</SectionTitle>
      <Card variant="clay" padding={20}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <IconTile icon="plane" tone="brand" size={44} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "0 0 12px" }}>
              {s.sub}
            </p>
            <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <TextField
                  value={question}
                  maxLength={500}
                  placeholder={s.placeholder}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <Button type="submit" variant="clay" loading={loading} disabled={!question.trim()}>
                {loading ? s.asking : s.ask}
              </Button>
            </form>

            {error && (
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--amber-700)", lineHeight: 1.6, margin: "12px 0 0" }}>
                {error}
              </p>
            )}

            {answer && (
              <div
                className="animate-slide-in"
                style={{
                  marginTop: 14,
                  padding: "14px 16px",
                  borderRadius: "var(--radius-lg)",
                  backgroundImage: "var(--gradient-info)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--ink-800)",
                  lineHeight: 1.65,
                  whiteSpace: "pre-line",
                }}
              >
                {answer}
              </div>
            )}

            {answer && <SourceBadge />}

            <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "12px 0 0" }}>
              {s.disclaimer}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
