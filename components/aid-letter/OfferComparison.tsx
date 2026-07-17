"use client";

import { useMemo, useState } from "react";
import { Card, Button, Icon } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { useLanguage } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { useAidPathContext } from "@/hooks/useAidPath";
import { buildAidOfferComparison } from "@/lib/aid-letter/buildAidOfferComparison";
import AidOfferComparisonTable from "@/components/aid-letter/AidOfferComparisonTable";
import type { UserAidOffer } from "@/lib/types";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * Side-by-side offer comparison with an AI "which is cheapest FOR YOU, and why"
 * narrative. Reuses the existing comparison engine + table for the numbers and
 * adds the plain-language read that reframes sticker price into real cost - the
 * decision moment a general chatbot can't own (your offers, current framing,
 * a reusable read, your privacy).
 */
export function OfferComparison({ offers }: { offers: UserAidOffer[] }) {
  const { lang, t } = useLanguage();
  const aiContext = useAidPathContext();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const comparison = useMemo(() => buildAidOfferComparison(offers), [offers]);
  const bestPick = comparison.lowestGap?.offer.school_name ?? null;

  const s = t({
    en: {
      heading: "Compare your offers",
      sub: "The highest sticker price usually isn't the most expensive to attend. Here's the real cost at each school.",
      best: "Lowest real cost for you",
      cta: "Explain the difference with AI",
      again: "Explain again",
      thinking: "Comparing your offers…",
      warming: "AidPilot's AI isn't available right now.",
      genericError: "Something went wrong. Please try again.",
      note: "AI summary from your numbers — not official financial-aid advice. Loans are optional.",
    },
    es: {
      heading: "Compara tus ofertas",
      sub: "El precio de lista más alto casi nunca es el más caro de asistir. Este es el costo real en cada escuela.",
      best: "Menor costo real para ti",
      cta: "Explica la diferencia con IA",
      again: "Explicar de nuevo",
      thinking: "Comparando tus ofertas…",
      warming: "El AI de AidPilot no está disponible ahora.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      note: "Resumen de IA a partir de tus cifras — no es asesoría oficial. Los préstamos son opcionales.",
    },
  });

  async function explain() {
    if (status === "loading") return;
    setStatus("loading");
    setText("");
    setError("");

    const payload = comparison.rows.map((row) => ({
      school: row.offer.school_name || "School",
      costOfAttendance: row.offer.cost_of_attendance,
      freeMoney: row.calculation.giftAid,
      loans: row.calculation.loanTotal,
      gap: row.calculation.remainingGapAfterAllAid,
    }));

    const result = await streamAiAnswer(
      "/api/aid-letter/compare",
      { offers: payload, lang, context: aiContext },
      (partial) => {
        setStatus("done");
        setText(partial);
      }
    );

    if (!result.ok) {
      setStatus("error");
      setError(result.warming ? s.warming : result.error);
      return;
    }
    setStatus("done");
    setText(result.text);
  }

  return (
    <div style={{ marginTop: 8 }}>
      <SectionTitle>{s.heading}</SectionTitle>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.6, margin: "-6px 2px 14px" }}>{s.sub}</p>

      {bestPick && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            padding: "10px 14px",
            borderRadius: "var(--radius-pill)",
            background: "var(--green-100, var(--blue-50))",
            color: "var(--green-600)",
            fontSize: 13,
            fontWeight: 700,
            width: "fit-content",
          }}
        >
          <Icon name="shield-check" size={15} />
          {s.best}: {bestPick} · {usd(comparison.lowestGap!.calculation.remainingGapAfterAllAid)} gap
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: "var(--radius-clay)", marginBottom: 14 }}>
        <AidOfferComparisonTable offers={offers} />
      </div>

      <Card variant="clay" padding={18}>
        <Button variant="clay" size="sm" iconLeft="plane" loading={status === "loading"} onClick={() => void explain()}>
          {status === "done" ? s.again : s.cta}
        </Button>

        {status === "error" && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)", marginTop: 12 }}>{error}</p>
        )}

        {(status === "loading" || (status === "done" && text)) && (
          <div style={{ marginTop: 14 }}>
            {status === "loading" && !text ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-400)" }}>{s.thinking}</span>
            ) : (
              <>
                <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
                  {text}
                  {status === "loading" && <span style={{ opacity: 0.5 }}>▍</span>}
                </p>
                {status === "done" && (
                  <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, marginTop: 10 }}>{s.note}</p>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
