import type { AidForm, AidPathProfile, ParentSituation, Timeline } from "./profile-store";

/**
 * Turns a triage profile into personalized guidance. Every line is grounded in
 * the same human-sourced facts as the guide (CADAA routing, the which-parent
 * 12-month-support rule, the ~Oct 1 / March 2 dates, unusual circumstances) -
 * this is routing and framing, not new aid advice. ES is an English fallback
 * (no machine translation), matching the guide content.
 */

export type AidPathGuidance = {
  form: AidForm;
  /** Short label, e.g. "CADAA path". */
  pathLabel: string;
  /** One line on which form to file and why. */
  pathLine: string;
  /** Which-parent / contributor guidance, if answered. */
  parentLine: string | null;
  /** What to do now, based on timeline. */
  timelineLine: string | null;
  /** Compact context string handed to the AI so answers are tailored. */
  aiContext: string;
};

const en = {
  pathLabel: { fafsa: "FAFSA path", cadaa: "CADAA path", unsure: "Let's find your path" } as Record<AidForm, string>,
  pathLine: {
    fafsa:
      "You'll file the FAFSA for federal, state, and college aid. Create your StudentAid.gov account before you start.",
    cadaa:
      "As an undocumented California student, you'll file the California Dream Act Application (CADAA) — not the FAFSA — for state aid like Cal Grants, community college fee waivers, and in-state tuition. The CADAA doesn't provide federal aid.",
    unsure:
      "Most students file the FAFSA. If you're an undocumented California student without an SSN, you'll file the CADAA instead. The citizenship section below can help you decide.",
  } as Record<AidForm, string>,
  parentLine: {
    together: "Your parents are married or living together, so both provide their information as contributors.",
    divorced:
      "Your parents are divorced or separated and not living together, so the parent who gave you more financial support in the last 12 months provides their information — if support was equal, the one with higher income and assets. If that parent has remarried, your stepparent's information is included too.",
    single: "One parent provides their information as your contributor.",
    cant_provide:
      "If you can't provide parent information — no contact, or an unsafe situation — answer the unusual-circumstances question. You'll be treated as provisionally independent and finish with your school's financial aid office.",
  } as Record<ParentSituation, string>,
  timelineLine: {
    senior:
      "You're a senior — file as soon as you can. The form opens around October 1, and California's priority deadline is March 2.",
    junior:
      "You're a junior — you can't file yet, but create your StudentAid.gov account and gather your documents so you're ready when the form opens (around October 1).",
    underclass: "You've got time — the application comes the year before you start college. For now, an account and a plan are plenty.",
    college: "You're already in college — you renew your application each year, so keep an eye on your school's deadlines.",
  } as Record<Timeline, string>,
};

const FORM_CONTEXT: Record<AidForm, string> = {
  fafsa: "on the FAFSA path (files the FAFSA for federal/state/college aid)",
  cadaa: "on the CADAA path (an undocumented California student who files the California Dream Act Application, not the FAFSA)",
  unsure: "still deciding between the FAFSA and the CADAA",
};
const PARENT_CONTEXT: Record<ParentSituation, string> = {
  together: "parents are married or living together",
  divorced: "parents are divorced or separated and not living together",
  single: "has one parent contributor",
  cant_provide: "cannot provide parent information",
};
const TIMELINE_CONTEXT: Record<Timeline, string> = {
  senior: "a high school senior applying now",
  junior: "a high school junior planning ahead",
  underclass: "a high school underclassman",
  college: "already in college",
};

export function describeAidPath(p: AidPathProfile): AidPathGuidance {
  const form: AidForm = p.form ?? "unsure";
  // ES falls back to EN (aid content is not machine-translated).
  const parentLine = p.parents ? en.parentLine[p.parents] : null;
  const timelineLine = p.timeline ? en.timelineLine[p.timeline] : null;

  const contextParts = [`is ${FORM_CONTEXT[form]}`];
  if (p.parents) contextParts.push(PARENT_CONTEXT[p.parents]);
  if (p.timeline) contextParts.push(TIMELINE_CONTEXT[p.timeline]);

  return {
    form,
    pathLabel: en.pathLabel[form],
    pathLine: en.pathLine[form],
    parentLine,
    timelineLine,
    aiContext: `The student ${contextParts.join("; ")}. Tailor the answer to this situation.`,
  };
}
