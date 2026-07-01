"use client";

import { useState } from "react";
import { colors, fontFamily, radius } from "@/lib/design-tokens";

export function CopyButton({
  label,
  copiedLabel = "Copied",
  text,
  fullWidth = true,
}: {
  label: string;
  copiedLabel?: string;
  text: string;
  fullWidth?: boolean;
}) {
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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : "auto",
        fontSize: 13,
        fontWeight: 600,
        color: colors.primary,
        background: colors.softBlue,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: "10px 14px",
        cursor: "pointer",
        fontFamily,
      }}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export function CopyQuestionRow({ question }: { question: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        background: colors.card,
        fontFamily,
      }}
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: colors.text, fontWeight: 400 }}>{question}</p>
      <button
        type="button"
        onClick={() => void copy()}
        style={{
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 600,
          color: colors.primary,
          background: colors.softBlue,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          padding: "6px 10px",
          cursor: "pointer",
          fontFamily,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
