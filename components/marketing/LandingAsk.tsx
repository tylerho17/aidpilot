"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { streamAiAnswer } from "@/lib/ai/stream-answer";
import { SourceBadge } from "@/components/app/SourceBadge";
import { Tape, paperShadow, linedPaper } from "./skeuo";

/**
 * Live "Ask AidPilot" teaser on the marketing landing. A visitor types a real
 * FAFSA question and gets a grounded answer inline (same public, rate-limited
 * /api/fafsa-guide/ask endpoint the app uses) - no signup. Styled as a sheet of
 * notebook paper the copilot "writes" on, with a typewriter reveal.
 */

const EXAMPLES = [
  "Which parent fills out the FAFSA?",
  "What is an FSA ID?",
  "What documents do I need?",
  "Do I need my SSN?",
];

export function LandingAsk() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [answer, setAnswer] = useState("");
  const [shown, setShown] = useState(0); // typewriter cursor
  const [errorMsg, setErrorMsg] = useState("");

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || status === "loading") return;
    setQuestion(trimmed);
    setStatus("loading");
    setAnswer("");
    setShown(0);
    setErrorMsg("");

    // Real streaming - the answer is "written" onto the paper as it arrives.
    const result = await streamAiAnswer(
      "/api/fafsa-guide/ask",
      { question: trimmed, lang: "en" },
      (partial) => {
        setStatus("done");
        setAnswer(partial);
        setShown(partial.length);
      }
    );

    if (!result.ok) {
      setStatus("error");
      setErrorMsg(
        result.warming
          ? "The copilot is warming up - try the full demo instead."
          : result.error
      );
      return;
    }
    setStatus("done");
    setAnswer(result.text);
    setShown(result.text.length);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(question);
  }

  return (
    <section style={{ background: "#fff", padding: "88px 44px", borderTop: "1px solid #ECE8DE" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--blue-50)", color: "var(--blue-700)", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 800, marginBottom: 18 }}>
          <Icon name="plane" size={15} color="var(--blue-700)" /> Powered by AidPilot AI
        </div>
        <h2 className="font-display" style={{ fontSize: "clamp(32px,4.5vw,46px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--ink-900)", margin: "0 0 12px", lineHeight: 1.05 }}>
          Stuck on the FAFSA? Just ask.
        </h2>
        <p style={{ fontSize: 17, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 32px", lineHeight: 1.5 }}>
          Real answers from sourced financial-aid guidance - no account, no jargon. Try it right now.
        </p>

        {/* Notebook the copilot writes on */}
        <div style={{ position: "relative", background: linedPaper, borderRadius: 10, boxShadow: paperShadow, padding: "34px 26px 26px", textAlign: "left" }}>
          <Tape style={{ top: -12, left: "50%", marginLeft: -38, transform: "rotate(-2deg)" }} />

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={question}
              maxLength={200}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the FAFSA..."
              aria-label="Ask a FAFSA question"
              style={{
                flex: 1,
                minWidth: 220,
                boxSizing: "border-box",
                borderRadius: 12,
                border: "1.5px solid var(--border-default)",
                padding: "14px 16px",
                fontSize: 16,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                outline: "none",
                color: "var(--ink-800)",
                background: "rgba(255,255,255,.9)",
              }}
            />
            <Button type="submit" size="lg" iconRight="arrow-right" loading={status === "loading"}>
              Ask
            </Button>
          </form>

          {/* Example chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => void ask(ex)}
                disabled={status === "loading"}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--blue-700)",
                  background: "var(--blue-50)",
                  border: "1px solid var(--blue-100)",
                  borderRadius: 999,
                  padding: "7px 13px",
                  cursor: status === "loading" ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Answer / states */}
          {status !== "idle" && (
            <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px dashed var(--border-default)", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: "var(--blue-700)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-clay-sm)" }}>
                <Icon name="plane" size={19} color="#fff" strokeWidth={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {status === "loading" && (
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-400)" }}>AidPilot is reading the guide…</span>
                )}
                {status === "error" && (
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--amber-700)" }}>{errorMsg}</span>
                )}
                {status === "done" && (
                  <>
                    <p style={{ fontSize: 15.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                      {answer.slice(0, shown)}
                      {shown < answer.length && <span style={{ opacity: 0.5 }}>▍</span>}
                    </p>
                    {answer && <SourceBadge />}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 16 }}>
          Educational guidance from sourced material - not official financial-aid advice.
        </p>
      </div>
    </section>
  );
}
