/**
 * Client helper for the streaming AI endpoints (/api/fafsa-guide/ask,
 * /api/aid-letter/explain). On success those routes stream plain-text deltas;
 * on failure they return JSON with an { error } message (503 = no key
 * configured yet). `onText` is called with the full accumulated answer each
 * time more arrives, so callers can render it as it streams in.
 */

export type StreamAiResult =
  | { ok: true; text: string }
  | { ok: false; error: string; warming: boolean };

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function streamAiAnswer(
  url: string,
  payload: unknown,
  onText: (accumulated: string) => void
): Promise<StreamAiResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: GENERIC_ERROR, warming: false };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, warming: res.status === 503, error: body.error ?? GENERIC_ERROR };
  }

  // Some environments (or a disabled ReadableStream) hand back the whole body.
  if (!res.body) {
    const text = await res.text();
    onText(text);
    return { ok: true, text };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      onText(accumulated);
    }
    accumulated += decoder.decode();
    onText(accumulated);
  } catch {
    // Surface whatever streamed; only treat a totally empty stream as an error.
    if (!accumulated) return { ok: false, error: GENERIC_ERROR, warming: false };
  }

  return { ok: true, text: accumulated };
}
