import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * AI appeal-letter builder. Turns a student's changed circumstances into a
 * short, ready-to-send professional-judgment / special-circumstances appeal
 * letter to their college financial aid office. Grounded to the situation the
 * student provides - it never invents facts, amounts, or outcomes, and uses
 * [bracketed] placeholders for identifying details so no PII is required.
 * Streamed; rate-limited; no storage; degrades to 503 without a key.
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

const REASONS: Record<string, string> = {
  income_loss: "Loss of income or a job — income dropped since the 2024 tax year the form used",
  medical: "High medical or dental expenses not covered by insurance",
  family_change: "A change in the family — divorce, separation, or the death of a parent or spouse",
  other: "Another special circumstance",
};

const SYSTEM_PROMPT = `You help a student write a short, professional letter to their college's financial aid office requesting a review of their financial aid because their circumstances have changed (a "professional judgment" or special-circumstances appeal).

Rules:
- Write a complete, ready-to-send letter based ONLY on the situation the student describes. Do NOT invent facts, dollar amounts, dates, or details they did not provide.
- Use clear placeholders in [brackets] for identifying details you don't have: [Your Name], [Student ID or FAFSA/Dream ID], [Date]. If a school name is provided, address it to that school's Office of Financial Aid; otherwise use [School] Office of Financial Aid.
- Structure: a brief opening stating the student is a current or incoming student requesting a review of their aid due to a change in circumstances; one or two short paragraphs describing the change and its financial impact factually; a clear request that the office review/reconsider their aid eligibility through professional judgment; an offer to provide documentation; a polite close with a signature placeholder.
- Keep it concise (about 200-280 words), respectful, and factual. Never exaggerate hardship or claim/promise an outcome.
- After the letter, add a short "Before you send" note in 2-3 plain sentences: fill in the bracketed details; attach the documentation the office asks for (for example a termination or layoff letter, medical bills, or benefit statements); and confirm the school's specific appeal process and deadline, since each school handles this differently.
- You are an educational tool, not official advice. Never include personal data you were not given.
- Write in the language requested.`;

export async function POST(request: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: "AidPilot's AI isn't available right now." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many drafts at once — give it a minute and try again." }, { status: 429 });
  }

  let reason: string;
  let details: string;
  let schoolName: string;
  let lang: "en" | "es";
  let context: string;
  try {
    const body = (await request.json()) as {
      reason?: unknown;
      details?: unknown;
      schoolName?: unknown;
      lang?: unknown;
      context?: unknown;
    };
    reason = typeof body.reason === "string" && REASONS[body.reason] ? body.reason : "other";
    details = typeof body.details === "string" ? body.details.trim().slice(0, 1000) : "";
    schoolName = typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 120) : "";
    lang = body.lang === "es" ? "es" : "en";
    context = typeof body.context === "string" ? body.context.trim().slice(0, 300) : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!details) {
    return NextResponse.json({ error: "Tell us briefly what changed so we can draft your letter." }, { status: 400 });
  }

  const userContent = [
    `Situation type: ${REASONS[reason]}.`,
    `What the student says changed: "${details}".`,
    schoolName ? `School: ${schoolName}.` : "No school name given — use a placeholder.",
    context,
    `Write the appeal letter in ${lang === "es" ? "Spanish" : "English"}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  try {
    const messageStream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 900,
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
          console.error("Appeal draft stream failed mid-letter:", streamError);
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
      console.error("Appeal draft API error:", error.status, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    console.error("Appeal draft failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
