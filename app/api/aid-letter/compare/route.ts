import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * AI aid-offer comparison. Given the computed numbers for 2+ school offers
 * (sticker cost, free money, loans, and the real gap left to cover), it explains
 * in plain language which school actually costs the least FOR THIS STUDENT and
 * why - the "sticker price isn't what you pay" insight. Uses only the numbers
 * provided; streamed; rate-limited; no storage; 503 without a key.
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

const MAX_AMOUNT = 1_000_000;
function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < -MAX_AMOUNT || n > MAX_AMOUNT) return null;
  return Math.round(n);
}

type OfferInput = { school: string; costOfAttendance: number; freeMoney: number; loans: number; gap: number };

const SYSTEM_PROMPT = `You compare college financial aid offers in plain language for a student and family who may be the first to go to college.

Rules:
- Use ONLY the numbers provided for each school. Never invent, assume, or estimate other numbers.
- Definitions: "sticker cost" is the total cost of attendance; "free money" is grants and scholarships that never get repaid; "loans" is borrowed money repaid with interest (optional); "gap" is what's left to cover out of pocket after free money, work-study, and loans - the number that actually matters.
- Lead with the answer: name the school with the LOWEST gap (the most affordable for this student) and say the gap in dollars. Make the point that the highest sticker price is often NOT the most expensive to attend, and the lowest sticker is not automatically cheapest either - what matters is the gap and the debt.
- Then, in one or two sentences, note the tradeoffs: which leaves the most debt (loans), and any school with a large gap relative to its cost.
- Warm, concrete, 4 to 6 sentences. Reference the actual school names and dollar figures. No headers, no bullet lists, no markdown.
- Close by noting this is an educational summary from the numbers entered, loans are optional, and the student should confirm specifics and ask each financial aid office about anything unclear.
- Write in the language requested.`;

export async function POST(request: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: "AidPilot's AI isn't available right now." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many comparisons at once — give it a minute and try again." }, { status: 429 });
  }

  let offers: OfferInput[];
  let lang: "en" | "es";
  let context: string;
  try {
    const body = (await request.json()) as { offers?: unknown; lang?: unknown; context?: unknown };
    lang = body.lang === "es" ? "es" : "en";
    context = typeof body.context === "string" ? body.context.trim().slice(0, 300) : "";
    const raw = Array.isArray(body.offers) ? body.offers.slice(0, 8) : [];
    offers = raw
      .map((o) => {
        const r = o as Record<string, unknown>;
        const school = typeof r.school === "string" ? r.school.trim().slice(0, 120) : "";
        const costOfAttendance = num(r.costOfAttendance);
        const freeMoney = num(r.freeMoney);
        const loans = num(r.loans);
        const gap = num(r.gap);
        if (!school || costOfAttendance === null || freeMoney === null || loans === null || gap === null) return null;
        return { school, costOfAttendance, freeMoney, loans, gap };
      })
      .filter((o): o is OfferInput => o !== null);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (offers.length < 2) {
    return NextResponse.json({ error: "Need at least two offers to compare." }, { status: 400 });
  }

  const facts = offers
    .map(
      (o) =>
        `${o.school}: sticker cost $${o.costOfAttendance}, free money $${o.freeMoney}, loans $${o.loans}, gap to cover $${o.gap}.`
    )
    .join("\n");

  const userContent = `${context ? `${context}\n\n` : ""}Compare these offers in ${lang === "es" ? "Spanish" : "English"}:\n\n${facts}`;

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
          console.error("Offer compare stream failed:", streamError);
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
      console.error("Offer compare API error:", error.status, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    console.error("Offer compare failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
