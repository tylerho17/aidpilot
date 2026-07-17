import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * AI helper for the FAFSA verification screen. Drafts a short, friendly message
 * a student can send their college financial aid office: it confirms they were
 * selected for verification, lists what they believe they need to submit, and
 * asks the office to confirm the exact documents and deadline. Grounded to the
 * student's tracking group and tax-filing situation - it never invents school
 * policies, amounts, or outcomes. Streamed; rate-limited; no storage; degrades
 * to 503 without a key. Mirrors app/api/aid-appeal/draft.
 */

const ANTHROPIC_KEY =
  process.env.ANTHROPIC_API_KEY || process.env.Anthropic_API_Key_AidPilot || "";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const GROUPS: Record<string, string> = {
  V1: "V1 (Standard) — needs to verify income/tax information and family size",
  V4: "V4 (Custom) — needs to verify identity",
  V5: "V5 (Aggregate) — needs to verify income/tax information, family size, and identity",
  unsure: "not sure which group — asking the office to confirm what is needed",
};

const SYSTEM_PROMPT = `You help a student write a short, polite message to their college's financial aid office because they were selected for FAFSA verification.

Rules:
- Write a complete, ready-to-send message based ONLY on what you are told. Do NOT invent school policies, document names beyond the standard ones provided, dollar amounts, dates, or outcomes.
- Purpose of the message: (1) say the student was selected for verification, (2) briefly note what they understand they need to provide, (3) ask the office to confirm the exact documents required and the school's deadline, and (4) ask how to submit them.
- Use clear placeholders in [brackets] for identifying details you don't have: [Your Name], [Student ID], [School]. Never fabricate personal data.
- Keep it concise (about 90-150 words), warm, and factual. Do not exaggerate or promise anything.
- Do not restate federal rules as if they are the school's rules — the school's own list and deadline are the final word, so the message should ASK the office to confirm.
- You are an educational tool, not official advice. Write in the language requested.`;

export async function POST(request: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: "AidPilot's AI isn't available right now." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many drafts at once — give it a minute and try again." }, { status: 429 });
  }

  let group: string;
  let filer: string;
  let schoolName: string;
  let lang: "en" | "es";
  try {
    const body = (await request.json()) as {
      group?: unknown;
      filer?: unknown;
      schoolName?: unknown;
      lang?: unknown;
    };
    group = typeof body.group === "string" && GROUPS[body.group] ? body.group : "unsure";
    filer =
      body.filer === "filed" ? "filed a 2024 tax return" : body.filer === "did_not_file" ? "did not file a 2024 tax return" : "is not sure about their 2024 tax filing";
    schoolName = typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 120) : "";
    lang = body.lang === "es" ? "es" : "en";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const userContent = [
    `The student was selected for FAFSA verification: ${GROUPS[group]}.`,
    `Tax situation: the student ${filer}.`,
    schoolName ? `School: ${schoolName}.` : "No school name given — use a placeholder.",
    `Write the message in ${lang === "es" ? "Spanish" : "English"}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  try {
    const messageStream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 700,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const encoder = new TextEncoder();
    const streamBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of messageStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Verification note stream failed:", streamError);
          controller.error(streamError);
        }
      },
      cancel() {
        messageStream.abort();
      },
    });

    return new Response(streamBody, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The AI is busy right now — try again in a moment." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Verification note API error:", error.status, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    console.error("Verification note failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
