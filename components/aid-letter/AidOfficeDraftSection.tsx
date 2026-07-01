"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import type { AidOfficeDraft } from "@/lib/aid-letter/buildAidOfficeDraft";

const h2Style = {
  fontSize: 18,
  fontWeight: 900,
  letterSpacing: "-.3px",
  margin: "0 0 12px",
  color: "var(--ink-900)",
} as const;

function CopyButton({ label, copiedLabel, text }: { label: string; copiedLabel: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      iconLeft={copied ? "check" : undefined}
      onClick={() => void copy()}
      style={{ flexShrink: 0 }}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

type AidOfficeDraftSectionProps = {
  draft: AidOfficeDraft;
};

export default function AidOfficeDraftSection({ draft }: AidOfficeDraftSectionProps) {
  return (
    <Card variant="clay" padding={24}>
      <h2 className="font-display" style={h2Style}>
        Questions to ask your aid office
      </h2>
      {draft.questions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {draft.questions.map((question) => (
            <div
              key={question}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-card)",
                background: "var(--blue-50)",
              }}
            >
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.55 }}>
                {question}
              </p>
              <CopyButton label="Copy" copiedLabel="Copied" text={question} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 22px", lineHeight: 1.6 }}>
          No specific questions were generated for this offer. You can still use the email draft below.
        </p>
      )}

      <h2 className="font-display" style={{ ...h2Style, marginTop: 4 }}>
        Copyable email draft
      </h2>
      <div
        style={{
          padding: 16,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-card)",
          background: "var(--surface-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--gray-500)" }}>
            Subject: {draft.emailSubject}
          </p>
          <CopyButton label="Copy email" copiedLabel="Copied" text={draft.emailText} />
        </div>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 14,
            lineHeight: 1.65,
            color: "var(--ink-800)",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
            background: "var(--blue-50)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: 14,
          }}
        >
          {draft.emailBody}
        </pre>
      </div>
    </Card>
  );
}
