"use client";

import { Card, Button, Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { useAiAsk } from "@/components/app/screens/useAiAsk";
import { SourceBadge } from "@/components/app/SourceBadge";

/**
 * AI FAFSA coach - for the step you're currently on, asks the grounded guide
 * endpoint exactly how to complete it and what to have ready. Same sourced
 * content and safety as Ask AidPilot; personalized to the current step.
 */
export function FafsaCoach({ stepTitle }: { stepTitle: string }) {
  const { lang, t } = useLanguage();
  const { status, text, shown, error, ask } = useAiAsk();

  const s = t({
    en: {
      eyebrow: "AI coach",
      heading: `Working on "${stepTitle}"?`,
      sub: "Ask AidPilot exactly how to do this step - what to have ready and the mistakes to avoid.",
      cta: "Help me with this step",
      again: "Ask again",
      thinking: "AidPilot is checking the guide…",
      warming: "AidPilot's AI isn't available right now.",
      note: "Educational guidance from sourced material - not official financial-aid advice.",
    },
    es: {
      eyebrow: "Guía con IA",
      heading: `¿Trabajando en "${stepTitle}"?`,
      sub: "Pregúntale a AidPilot cómo hacer este paso - qué tener listo y los errores a evitar.",
      cta: "Ayúdame con este paso",
      again: "Preguntar de nuevo",
      thinking: "AidPilot está revisando la guía…",
      warming: "El AI de AidPilot no está disponible ahora.",
      note: "Guía educativa de material verificado - no es asesoría oficial de ayuda financiera.",
    },
  });

  const question =
    lang === "es"
      ? `Estoy en este paso de la FAFSA: "${stepTitle}". En pasos claros y sencillos, ¿cómo lo completo, qué necesito tener listo y qué errores debo evitar?`
      : `I'm on this FAFSA step: "${stepTitle}". In plain, simple steps, how do I complete it, what should I have ready, and what mistakes should I avoid?`;

  return (
    <Card variant="clay" padding={20} style={{ marginTop: 20, backgroundImage: "linear-gradient(150deg, #fff 60%, var(--blue-50) 160%)" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: "var(--blue-700)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-clay-sm)" }}>
          <Icon name="plane" size={20} color="#fff" strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--blue-700)" }}>
            {s.eyebrow}
          </div>
          <div className="font-display" style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-900)", marginTop: 2 }}>
            {s.heading}
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "4px 0 12px" }}>
            {s.sub}
          </p>

          <Button variant="clay" size="sm" iconLeft="plane" loading={status === "loading"} onClick={() => void ask(question, lang)}>
            {status === "done" ? s.again : s.cta}
          </Button>

          {status !== "idle" && (
            <div style={{ marginTop: 14 }}>
              {status === "loading" && (
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-400)" }}>{s.thinking}</span>
              )}
              {status === "error" && (
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)" }}>
                  {error === "__warming__" ? s.warming : error}
                </span>
              )}
              {status === "done" && (
                <>
                  <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                    {text.slice(0, shown)}
                    {shown < text.length && <span style={{ opacity: 0.5 }}>▍</span>}
                  </p>
                  {text && <SourceBadge />}
                  <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 8, lineHeight: 1.5 }}>{s.note}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
