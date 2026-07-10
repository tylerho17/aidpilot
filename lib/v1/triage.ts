// AidPilot v1 — Triage configuration & routing.
//
// IMPORTANT (AGENT_RULES.md Rule 2): the question text, option labels, and
// outcome copy are ALL i18n placeholder keys — no real eligibility guidance is
// written here. The `signal` mapping and `resolveOutcome` below are STRUCTURAL
// scaffolding only: they wire the wizard to an outcome so the flow is testable.
// The real branching policy (which answers map to FAFSA vs CADAA vs counselor)
// is a human-sourced TODO and must be validated before launch.

export type TriageSignal = "fafsa" | "cadaa" | "counselor" | "neutral";
export type TriageOutcome = "fafsa" | "cadaa" | "counselor";

export interface TriageOption {
  valueKey: string;
  signal: TriageSignal;
  icon?: string; // for option-card questions
}

export interface TriageQuestion {
  key: string;
  /** Which UI-kit control renders this question. */
  component: "segmented" | "option";
  options: TriageOption[];
}

// 4 placeholder questions (within the 3–5 range). Keys drive i18n lookups:
// triage.questions.<key>.label and .options.<valueKey>[.title/.desc].
export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {
    key: "grade",
    component: "segmented",
    options: [
      { valueKey: "yes", signal: "neutral" },
      { valueKey: "no", signal: "counselor" },
    ],
  },
  {
    key: "status",
    component: "option",
    options: [
      { valueKey: "a", signal: "fafsa", icon: "shield-check" },
      { valueKey: "b", signal: "cadaa", icon: "star" },
      { valueKey: "c", signal: "counselor", icon: "letter" },
    ],
  },
  {
    key: "household",
    component: "option",
    options: [
      { valueKey: "a", signal: "neutral", icon: "check" },
      { valueKey: "b", signal: "counselor", icon: "letter" },
    ],
  },
  {
    key: "readiness",
    component: "segmented",
    options: [
      { valueKey: "started", signal: "neutral" },
      { valueKey: "notStarted", signal: "neutral" },
    ],
  },
];

// Priority: any "see your counselor" signal wins (incl. mixed-status, which v1
// routes but does NOT solve); then CADAA; otherwise FAFSA. Placeholder rule.
export function resolveOutcome(signals: TriageSignal[]): TriageOutcome {
  if (signals.includes("counselor")) return "counselor";
  if (signals.includes("cadaa")) return "cadaa";
  return "fafsa";
}
