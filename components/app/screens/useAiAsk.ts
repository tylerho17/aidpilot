"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n";

/**
 * Shared fetch + typewriter for the grounded /api/fafsa-guide/ask endpoint.
 * Returns the answer text revealed progressively (respecting reduced motion).
 * `error === "__warming__"` means the deployment has no key configured yet -
 * callers localize that case.
 */

export type AiAskStatus = "idle" | "loading" | "done" | "error";

export function useAiAsk() {
  const [status, setStatus] = useState<AiAskStatus>("idle");
  const [text, setText] = useState("");
  const [shown, setShown] = useState(0);
  const [error, setError] = useState("");
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (typer.current) clearInterval(typer.current); }, []);

  async function ask(question: string, lang: Language) {
    if (status === "loading") return;
    setStatus("loading");
    setText("");
    setShown(0);
    setError("");
    if (typer.current) clearInterval(typer.current);
    try {
      const res = await fetch("/api/fafsa-guide/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      const body = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (!res.ok || !body.answer) {
        setStatus("error");
        setError(res.status === 503 ? "__warming__" : body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
      const full = body.answer;
      setText(full);
      const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setShown(full.length);
      } else {
        typer.current = setInterval(() => {
          setShown((n) => {
            if (n >= full.length) {
              if (typer.current) clearInterval(typer.current);
              return n;
            }
            return Math.min(full.length, n + 2);
          });
        }, 14);
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return { status, text, shown, error, ask };
}
