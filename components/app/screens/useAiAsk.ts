"use client";

import { useRef, useState } from "react";
import type { Language } from "@/lib/i18n";
import { streamAiAnswer } from "@/lib/ai/stream-answer";

/**
 * Shared streaming fetch for the grounded /api/fafsa-guide/ask endpoint. The
 * answer streams in token-by-token (text grows as it arrives). `shown` tracks
 * how much to reveal - here it just follows the streamed length. `error ===
 * "__warming__"` means the deployment has no key configured yet - callers
 * localize that case.
 */

export type AiAskStatus = "idle" | "loading" | "done" | "error";

export function useAiAsk() {
  const [status, setStatus] = useState<AiAskStatus>("idle");
  const [text, setText] = useState("");
  const [shown, setShown] = useState(0);
  const [error, setError] = useState("");
  const runRef = useRef(0);

  async function ask(question: string, lang: Language, context?: string) {
    if (status === "loading") return;
    const runId = ++runRef.current;
    setStatus("loading");
    setText("");
    setShown(0);
    setError("");

    const result = await streamAiAnswer("/api/fafsa-guide/ask", { question, lang, context }, (partial) => {
      if (runRef.current !== runId) return;
      setStatus("done");
      setText(partial);
      setShown(partial.length);
    });

    if (runRef.current !== runId) return;
    if (!result.ok) {
      setStatus("error");
      setError(result.warming ? "__warming__" : result.error);
      return;
    }
    setStatus("done");
    setText(result.text);
    setShown(result.text.length);
  }

  return { status, text, shown, error, ask };
}
