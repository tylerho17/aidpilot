"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SectionHeading, Card, StatusPanel, Button } from "@/components/ui";
import { useSession } from "@/components/v1/session";
import { CompletionReport } from "@/components/v1/CompletionReport";
import { WALKTHROUGH } from "@/lib/v1/walkthrough";
import type { WorksheetData } from "@/lib/v1/worksheet-pdf";

// F5 / v1-flow 5 — Worksheet. Compiles the walked path's sections/fields into a
// printable prep sheet, generated client-side only. Nothing is transmitted.
export default function WorksheetPage() {
  const t = useTranslations("worksheet");
  // Section titles and field labels come from the walkthrough content model,
  // whose i18n keys live in the "walkthrough" namespace.
  const tw = useTranslations("walkthrough");
  const locale = useLocale();
  const router = useRouter();
  const { path } = useSession();
  const [busy, setBusy] = useState(false);

  // No form path → nothing to build (counselor-routed students don't get a
  // worksheet; their next step is the counselor).
  if (!path || path === "counselor") {
    const counselor = path === "counselor";
    return (
      <>
        <SectionHeading eyebrow={t("eyebrow")} title={t("empty.title")} />
        <StatusPanel
          tone={counselor ? "amber" : "blue"}
          icon={counselor ? "letter" : "file"}
          title={t("empty.title")}
        >
          {t("empty.body")}
        </StatusPanel>
        <div>
          <Button
            iconRight="arrow-right"
            onClick={() => router.push(counselor ? "/counselor" : "/walkthrough")}
          >
            {counselor ? t("empty.counselorCta") : t("empty.cta")}
          </Button>
        </div>
      </>
    );
  }

  const pathLabel = t(`pathLabel.${path}`);
  const generatedOn = t("generatedOn", { date: new Date().toLocaleDateString(locale) });

  const sections = WALKTHROUGH[path]
    .filter((s) => !s.explainer)
    .map((s) => ({
      title: tw(s.titleKey),
      rows: s.fields.map((f) => ({ label: tw(f.labelKey), value: "" })),
    }));

  const data: WorksheetData = {
    brand: "AidPilot",
    title: t("docTitle", { path: pathLabel }),
    generatedOn,
    disclaimerTitle: t("disclaimerTitle"),
    disclaimer: t("disclaimerBody"),
    sections,
  };

  async function download() {
    setBusy(true);
    try {
      const { generateWorksheetPdf } = await import("@/lib/v1/worksheet-pdf");
      const blob = await generateWorksheetPdf(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aidpilot-worksheet-${path}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {/* Disclaimer — also embedded in the PDF */}
      <StatusPanel tone="amber" icon="shield" title={t("disclaimerTitle")}>
        {t("disclaimerBody")}
      </StatusPanel>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button variant="clay" iconLeft="file" loading={busy} disabled={busy} onClick={download}>
          {busy ? t("generating") : t("download")}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          {t("print")}
        </Button>
      </div>

      {/* On-screen preview (printable) */}
      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--gray-500)", marginTop: 4 }}>
        {t("summaryTitle")}
      </div>
      <Card variant="clay" padding="clamp(18px, 5vw, 28px)">
        <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-900)", letterSpacing: "-0.4px" }}>
          {data.title}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)", marginTop: 4, marginBottom: 8 }}>
          {generatedOn}
        </div>
        {sections.map((s) => (
          <div key={s.title} style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--blue-700)", marginBottom: 8 }}>
              {s.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {s.rows.map((r) => (
                <div key={r.label} style={{ borderBottom: "1px solid var(--border-card)", paddingBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)" }}>{r.label}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-metric)",
                      fontSize: 16,
                      fontWeight: 600,
                      color: r.value.trim() ? "var(--ink-800)" : "var(--gray-300)",
                      marginTop: 3,
                    }}
                  >
                    {r.value.trim() || t("noValue")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* F6 — anonymous completion self-report (the only server write; no PII) */}
      <CompletionReport />
    </>
  );
}
