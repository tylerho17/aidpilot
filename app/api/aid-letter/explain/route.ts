import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * AI aid-letter decoder - explains a college financial aid offer's numbers in
 * plain language. Input is amounts only (no PII); the model is constrained to
 * the numbers provided and the standard aid-category framing (grants = free,
 * loans = optional, remaining gap = what needs a plan). Rate-limited; no
 * storage; degrades to 503 without a key.
 */

const ANTHROPIC_KEY =
  process.env.ANTHROPIC_API_KEY || process.env.Anthropic_API_Key_AidPilot || "";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
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

const MAX_AMOUNT = 500_000;

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0 || n > MAX_AMOUNT) return null;
  return Math.round(n);
}

const SYSTEM_PROMPT = `You explain a college financial aid offer in plain language for a student and family who may be the first in their family to go to college.

Rules:
- Use ONLY the dollar amounts provided in the message. Never invent, assume, or estimate other numbers.
- Aid categories: grants and scholarships are free money that is never repaid; work-study is money earned through a part-time job, not paid up front; loans are borrowed money repaid with interest and are OPTIONAL (a student can accept all, part, or none); the out-of-pocket / remaining gap is what is left after grants, work-study, and any loans, and is the real number to plan around.
- Write 3 to 5 warm, concrete sentences. Reference the actual dollar figures and the school name. Lead with the good news (how much is free money), then explain loans and the real cost.
- If loans are a large share of the offer, or the out-of-pocket is large relative to the cost, gently flag it and mention options: decline or reduce loans, compare offers across schools, ask the financial aid office about an appeal or payment plan.
- Close by noting this is an educational summary and the student should confirm specifics with the school's financial aid office.
- No headers, no bullet lists, no markdown. Just plain sentences.
- Answer in the language requested.`;

export async function POST(request: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "AidPilot's AI isn't available right now." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests - give it a minute and try again." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const costOfAttendance = num(body.costOfAttendance);
  const grants = num(body.grants);
  const workStudy = num(body.workStudy);
  const loans = num(body.loans);
  if (costOfAttendance === null || grants === null || workStudy === null || loans === null) {
    return NextResponse.json({ error: "Invalid offer amounts." }, { status: 400 });
  }
  const outOfPocket = Math.max(0, costOfAttendance - grants - workStudy - loans);
  const schoolName = typeof body.schoolName === "string" ? body.schoolName.slice(0, 100).trim() : "";
  const lang = body.lang === "es" ? "es" : "en";

  const facts = [
    schoolName ? `School: ${schoolName}` : "School: (unnamed)",
    `Cost of attendance (one year): $${costOfAttendance.toLocaleString()}`,
    `Grants and scholarships (free money): $${grants.toLocaleString()}`,
    `Work-study offered: $${workStudy.toLocaleString()}`,
    `Loans offered: $${loans.toLocaleString()}`,
    `Out-of-pocket / remaining gap: $${outOfPocket.toLocaleString()}`,
  ].join("\n");

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  try {
    // Stream the explanation so it renders as it's written instead of a wait.
    const messageStream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 600,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Explain this financial aid offer in ${lang === "es" ? "Spanish" : "English"}:\n\n${facts}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of messageStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("Aid-letter explain stream failed mid-answer:", streamError);
          controller.error(streamError);
        }
      },
      cancel() {
        messageStream.abort();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The AI is busy right now - try again in a moment." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Aid-letter explain API error:", error.status, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    console.error("Aid-letter explain failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
