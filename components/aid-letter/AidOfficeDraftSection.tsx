"use client";

import { useState } from "react";
import { fontFamily } from "@/lib/design-tokens";
import type { AidOfficeDraft } from "@/lib/aid-letter/buildAidOfficeDraft";

const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

const panelStyle = {
  border: `1px solid ${border}`,
  borderRadius: 6,
  background: "#fff",
  padding: 16,
} as const;

const h2Style = {
  fontSize: 16,
  fontWeight: 700,
  margin: "0 0 12px",
  color: navy,
  fontFamily: fontFamily,
} as const;

const mutedText = {
  fontSize: 14,
  fontWeight: 500,
  color: muted,
  margin: 0,
  lineHeight: 1.6,
  fontFamily: fontFamily,
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
    <button
      type="button"
      onClick={() => void copy()}
      style={{
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 700,
        color: "#0B5CAD",
        background: "#F7FAFD",
        border: `1px solid ${border}`,
        borderRadius: 4,
        padding: "6px 10px",
        cursor: "pointer",
        fontFamily: fontFamily,
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

type AidOfficeDraftSectionProps = {
  draft: AidOfficeDraft;
};

export default function AidOfficeDraftSection({ draft }: AidOfficeDraftSectionProps) {
  return (
    <section style={{ marginBottom: 28, fontFamily: fontFamily }}>
      <h2 style={h2Style}>Questions to ask your aid office</h2>
      {draft.questions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {draft.questions.map((question) => (
            <div
              key={question}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                ...panelStyle,
              }}
            >
              <p style={{ ...mutedText, color: navy }}>{question}</p>
              <CopyButton label="Copy" copiedLabel="Copied" text={question} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ ...mutedText, marginBottom: 20 }}>
          No specific questions were generated for this offer. You can still use the email draft below.
        </p>
      )}

      <h2 style={{ ...h2Style, marginTop: 4 }}>Copyable email draft</h2>
      <div style={panelStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: muted, fontFamily: fontFamily }}>
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
            color: navy,
            fontWeight: 500,
            fontFamily: fontFamily,
            background: "#F7FAFD",
            border: `1px solid ${border}`,
            borderRadius: 4,
            padding: 14,
          }}
        >
          {draft.emailBody}
        </pre>
      </div>
    </section>
  );
}
