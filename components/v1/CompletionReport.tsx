"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, StatusPanel } from "@/components/ui";
import { getSupabase } from "@/lib/v1/supabase";

type ReportState = "idle" | "sending" | "done" | "error";

/**
 * F6 — anonymous self-report. A single "I finished my application" action that
 * increments an anonymous aggregate counter via a Supabase RPC. It sends NO
 * identifiers, NO answers, NO PII — just an anonymous +1 (AGENT_RULES.md Rule 1).
 * The RPC returns the new aggregate total, which we can show back.
 */
export function CompletionReport() {
  const t = useTranslations("report");
  const [state, setState] = useState<ReportState>("idle");
  const [count, setCount] = useState<number | null>(null);

  const supabase = getSupabase();

  async function report() {
    if (!supabase) return;
    setState("sending");
    const { data, error } = await supabase.rpc("increment_completion", {
      counter_key: "completions",
    });
    if (error) {
      setState("error");
      return;
    }
    setCount(typeof data === "number" ? data : null);
    setState("done");
  }

  if (state === "done") {
    return (
      <StatusPanel tone="green" icon="shield-check" title={t("done")}>
        {count !== null ? t("count", { count }) : t("privacyNote")}
      </StatusPanel>
    );
  }

  return (
    <Card variant="clay" padding="clamp(18px, 5vw, 26px)">
      <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-900)", letterSpacing: "-0.3px" }}>
        {t("prompt")}
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, margin: "8px 0 16px" }}>
        {t("body")}
      </p>

      {supabase ? (
        <Button variant="clay" iconLeft="check" loading={state === "sending"} disabled={state === "sending"} onClick={report}>
          {state === "sending" ? t("sending") : t("button")}
        </Button>
      ) : (
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)" }}>{t("unconfigured")}</div>
      )}

      {state === "error" && (
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--coral-600)", marginTop: 12 }}>{t("error")}</div>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginTop: 14 }}>
        {t("privacyNote")}
      </div>
    </Card>
  );
}
