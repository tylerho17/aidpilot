import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * AI Satisfactory Academic Progress (SAP) appeal-letter builder. A student who
 * lost federal aid for not meeting SAP (GPA, pace/completion, or max timeframe)
 * describes what happened AND what has changed / their plan to get back on
 * track — the two things a SAP appeal must show — and gets a ready-to-send
 * letter to their financial aid office. Grounded to what the student provides;
 * never invents facts, and uses [bracketed] placeholders for PII. Streamed,
 * rate-limited, no storage, 503 without a key. Mirrors app/api/aid-appeal/draft.
 *
 * SAP framing sourced 2026-07-17 from the Federal Student Aid Handbook
 * (School-Determined Requirements, SAP) and StudentAid.gov; cited in
 * docs/content-source.md.
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
  illness_injury: "A serious illness or injury (the student's own) that disrupted their studies",
  death: "The death of a relative or someone close to the student",
  family_emergency: "A family emergency or major personal hardship",
  other: "Another special or extenuating circumstance",
};

const SYSTEM_PROMPT = `You help a student write a short, professional Satisfactory Academic Progress (SAP) appeal letter to their college's financial aid office, asking to have their federal aid eligibility reinstated after they did not meet SAP standards (GPA, completion pace, or maximum timeframe).

Rules:
- Write a complete, ready-to-send letter based ONLY on what the student tells you. Do NOT invent facts, grades, GPAs, dates, dollar amounts, or outcomes they did not provide.
- A SAP appeal MUST do two things, so make sure the letter clearly covers both: (1) explain WHY the student failed to meet SAP (the circumstance), and (2) explain WHAT HAS CHANGED and the student's concrete plan to meet SAP going forward. If the student didn't give a plan, include a brief, honest placeholder plan they can complete (e.g., "[meet with my academic advisor to build a plan; reduce my course load to X units; use tutoring]").
- Use clear placeholders in [brackets] for identifying details you don't have: [Your Name], [Student ID], [Date], [Term/semester]. If a school name is provided, address it to that school's Office of Financial Aid; otherwise use [School] Office of Financial Aid.
- Structure: brief opening stating the student is appealing the loss of financial aid due to not meeting SAP and is requesting reconsideration; one or two short paragraphs describing the circumstance factually and its impact on their studies; a clear paragraph on what has changed and the specific steps they'll take (their plan); a request to reinstate aid eligibility (for example on financial-aid probation or under an academic plan); an offer to provide documentation; a polite close with a signature placeholder.
- Keep it concise (about 220-300 words), respectful, and factual. Never exaggerate hardship or claim/promise an outcome.
- After the letter, add a short "Before you send" note in 2-3 plain sentences: fill in the bracketed details; attach documentation of the circumstance (for example medical notes, a death certificate or obituary, or other proof); and confirm the school's own SAP appeal form, process, and deadline, since each school sets its own.
- You are an educational tool, not official advice. Never include personal data you were not given. Write in the language requested.`;

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
  let plan: string;
  let schoolName: string;
  let lang: "en" | "es";
  let context: string;
  try {
    const body = (await request.json()) as {
      reason?: unknown;
      details?: unknown;
      plan?: unknown;
      schoolName?: unknown;
      lang?: unknown;
      context?: unknown;
    };
    reason = typeof body.reason === "string" && REASONS[body.reason] ? body.reason : "other";
    details = typeof body.details === "string" ? body.details.trim().slice(0, 1000) : "";
    plan = typeof body.plan === "string" ? body.plan.trim().slice(0, 600) : "";
    schoolName = typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 120) : "";
    lang = body.lang === "es" ? "es" : "en";
    context = typeof body.context === "string" ? body.context.trim().slice(0, 300) : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!details) {
    return NextResponse.json({ error: "Tell us briefly what happened so we can draft your appeal." }, { status: 400 });
  }

  const userContent = [
    `Circumstance type: ${REASONS[reason]}.`,
    `What the student says happened: "${details}".`,
    plan ? `What has changed / the student's plan to get back on track: "${plan}".` : "The student did not give a specific plan — include a brief bracketed placeholder plan.",
    schoolName ? `School: ${schoolName}.` : "No school name given — use a placeholder.",
    context,
    `Write the SAP appeal letter in ${lang === "es" ? "Spanish" : "English"}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  try {
    const messageStream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 1000,
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
          console.error("SAP appeal stream failed mid-letter:", streamError);
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
      console.error("SAP appeal API error:", error.status, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    console.error("SAP appeal failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
