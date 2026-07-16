import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { FAFSA_GUIDE } from "@/lib/fafsa-guide/fafsa";
import { CADAA_GUIDE } from "@/lib/fafsa-guide/cadaa";
import type { GuideSection } from "@/lib/fafsa-guide/schema";

/**
 * Ask AidPilot - grounded FAFSA/CADAA Q&A.
 *
 * Answers come from Claude constrained to AidPilot's human-sourced guide
 * content (lib/fafsa-guide) - the model is instructed to decline anything the
 * guide doesn't cover. Questions are never stored; no auth or PII involved.
 * Without ANTHROPIC_API_KEY the route degrades to a 503 the UI explains.
 */

const MAX_QUESTION_CHARS = 500;

// Best-effort per-instance rate limit (serverless instances each get their
// own bucket - good enough to blunt casual abuse of a public endpoint).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
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

/** Flatten the typed guide into a compact English grounding document. */
function renderGuide(name: string, sections: GuideSection[]): string {
  const parts: string[] = [`# ${name}`];
  for (const section of sections) {
    parts.push(`## ${section.title.en}`);
    if (section.explainer && section.body) {
      parts.push(section.body.en);
      continue;
    }
    for (const field of section.fields) {
      const lines = [`- Field: ${field.label.en}`];
      if (field.whatItMeans) lines.push(`  What it means: ${field.whatItMeans.en}`);
      if (field.documentNeeded) lines.push(`  Document needed: ${field.documentNeeded.en}`);
      if (field.commonError) lines.push(`  Common mistake: ${field.commonError.en}`);
      parts.push(lines.join("\n"));
    }
  }
  return parts.join("\n\n");
}

// Static per process - build once so the cached prompt prefix stays identical.
const GROUNDING = [
  renderGuide("FAFSA (Free Application for Federal Student Aid) guide", FAFSA_GUIDE),
  renderGuide("CADAA (California Dream Act Application) guide", CADAA_GUIDE),
].join("\n\n---\n\n");

const SYSTEM_PROMPT = `You are AidPilot's FAFSA guide assistant, answering questions from students and families working through financial aid forms.

Ground rules:
- Answer ONLY from the guide content provided below. If the guide does not cover the question, say you don't have sourced guidance on it and point the student to studentaid.gov (or dream.csac.ca.gov for CADAA questions) or their school's financial aid office. Never guess deadlines, dollar amounts, or eligibility rules that are not in the guide.
- Keep answers short: two to five plain-language sentences a stressed high-schooler can follow. No headers or bullet lists unless the question truly needs steps.
- Never ask for, encourage sharing of, or repeat personal data (SSNs, tax figures, passwords, immigration status details). If a question includes personal data, answer generically without repeating it.
- You are an educational tool, not official financial aid advice - if a question is really a personal-situation judgment call (which parent files, unusual circumstances), explain what the guide says and recommend confirming with a counselor.

<guide>
${GROUNDING}
</guide>`;

// Resolve the Anthropic key from the standard name first, then this
// deployment's custom var name. Add more fallbacks here if the env var is
// ever renamed - the code doesn't care what it's called.
const ANTHROPIC_KEY =
  process.env.ANTHROPIC_API_KEY || process.env.Anthropic_API_Key_AidPilot || "";

export async function POST(request: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "AI answers aren't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions at once - give it a minute and try again." },
      { status: 429 }
    );
  }

  let question: string;
  let lang: "en" | "es";
  try {
    const body = (await request.json()) as { question?: unknown; lang?: unknown };
    question = typeof body.question === "string" ? body.question.trim() : "";
    lang = body.lang === "es" ? "es" : "en";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!question || question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json(
      { error: `Questions must be 1-${MAX_QUESTION_CHARS} characters.` },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // The grounding document is static - cache it across questions.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Answer in ${lang === "es" ? "Spanish" : "English"}.\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Couldn't generate an answer for that - try rephrasing." },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The AI is busy right now - try again in a moment." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Ask AidPilot API error:", error.status, error.message);
      return NextResponse.json(
        { error: "Something went wrong answering that. Please try again." },
        { status: 502 }
      );
    }
    console.error("Ask AidPilot failed:", error);
    return NextResponse.json(
      { error: "Something went wrong answering that. Please try again." },
      { status: 500 }
    );
  }
}
