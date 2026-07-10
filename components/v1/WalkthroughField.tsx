"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, TextField, Icon } from "@/components/ui";
import { useSession } from "@/components/v1/session";
import type { WalkField } from "@/lib/v1/walkthrough";

/**
 * A single walkthrough field: a labeled input plus a collapsible helper with the
 * three placeholder explanations (what it means / document needed / common
 * mistake). The typed value lives ONLY in client session state (Rule 1).
 */
export function WalkthroughField({ field }: { field: WalkField }) {
  const t = useTranslations("walkthrough");
  const { answers, setAnswer } = useSession();
  const [open, setOpen] = useState(false);

  const value = answers[field.answerKey];
  const strValue = typeof value === "string" || typeof value === "number" ? String(value) : "";

  const helpRows = [
    { icon: "shield-check", label: t("helper.whatItMeans"), text: t(field.whatItMeansKey) },
    { icon: "file", label: t("helper.documentNeeded"), text: t(field.documentNeededKey) },
    { icon: "letter", label: t("helper.commonError"), text: t(field.commonErrorKey) },
  ];

  return (
    <Card variant="clay" padding="clamp(16px, 4vw, 22px)">
      <TextField
        label={t(field.labelKey)}
        value={strValue}
        type={field.input === "number" ? "number" : "text"}
        inputMode={field.input === "number" ? "numeric" : undefined}
        onChange={(e) => setAnswer(field.answerKey, e.target.value)}
      />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          padding: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--blue-700)",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <Icon
          name="chevron-down"
          size={16}
          strokeWidth={2.4}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
        />
        {open ? t("hideHelp") : t("showHelp")}
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {helpRows.map((r) => (
            <div key={r.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name={r.icon} size={16} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-700)" }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.5 }}>
                  {r.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
