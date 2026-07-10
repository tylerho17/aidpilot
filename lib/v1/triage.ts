// AidPilot v1 — REAL triage logic: routes a student to FAFSA, CADAA, or their
// counselor.
//
// Routing policy (per product spec):
//   - Route CONSERVATIVELY — when in doubt, route to the counselor.
//   - v1 does NOT solve the mixed-status / non-SSN-parent-contributor case;
//     those students are routed to the counselor, full stop.
//   - Exactly three questions. Do not add eligibility edge cases here.
//
// Privacy (AGENT_RULES.md Rule 1): triage answers include sensitive eligibility
// information. They live ONLY in the triage page's component state — they are
// never written to session state, storage, or the network. Only the resulting
// `path` ('fafsa' | 'cadaa' | null) is written to session state.

export type TriageOutcome = "fafsa" | "cadaa" | "counselor";
export type TriageQuestionKey = "citizenship" | "parentSsn" | "senior";

export interface TriageAnswers {
  citizenship?: "yes" | "no" | "notSure";
  parentSsn?: "yes" | "no" | "notSure";
  senior?: "yes" | "no";
}

export type TriageStep =
  | { kind: "question"; key: TriageQuestionKey }
  | { kind: "outcome"; outcome: TriageOutcome; info?: "notSenior" };

export interface TriageQuestionDef {
  key: TriageQuestionKey;
  /** Which UI-kit control renders this question. */
  component: "option" | "segmented";
  /** Option valueKeys; i18n: triage.questions.<key>.options.<valueKey>. */
  options: string[];
}

// Question definitions (render metadata). Question/answer TEXT lives in
// messages/en.json under triage.questions.*.
export const TRIAGE_QUESTIONS: Record<TriageQuestionKey, TriageQuestionDef> = {
  // Q1 — citizenship/eligibility.
  // VERIFY against CSAC "which application is right for me" before launch.
  citizenship: { key: "citizenship", component: "option", options: ["yes", "no", "notSure"] },

  // Q2 — parent contributor SSN (asked only when Q1 = yes).
  // VERIFY against CSAC "which application is right for me" before launch.
  parentSsn: { key: "parentSsn", component: "option", options: ["yes", "no", "notSure"] },

  // Q3 — eligibility framing: current CA senior / recent grad heading to college.
  // VERIFY against CSAC "which application is right for me" before launch.
  senior: { key: "senior", component: "segmented", options: ["yes", "no"] },
};

/** Fixed ask-order (used for progress display and the back button). */
export const QUESTION_ORDER: TriageQuestionKey[] = ["citizenship", "parentSsn", "senior"];

/**
 * Pure resolver: given the answers so far, return the next question to ask or
 * the final outcome.
 *
 * Branching (conservative — any doubt → counselor):
 *   Q1 citizenship: yes → Q2 · no/undocumented/AB540 → CADAA candidate (skip Q2)
 *                   · not sure → counselor
 *   Q2 parentSsn:   yes → FAFSA candidate · no (mixed-status) → counselor
 *                   · not sure → counselor
 *   Q3 senior:      yes → resolved candidate path · no → counselor + info note
 */
export function nextTriageStep(a: TriageAnswers): TriageStep {
  // Q1 — citizenship/eligibility
  if (a.citizenship === undefined) return { kind: "question", key: "citizenship" };
  if (a.citizenship === "notSure") return { kind: "outcome", outcome: "counselor" };

  // Q2 — parent contributor SSN (FAFSA candidates only)
  if (a.citizenship === "yes") {
    if (a.parentSsn === undefined) return { kind: "question", key: "parentSsn" };
    if (a.parentSsn !== "yes") {
      // "no" = mixed-status (NOT solved in v1) · "notSure" = doubt → counselor
      return { kind: "outcome", outcome: "counselor" };
    }
  }

  // Q3 — eligibility framing (both FAFSA and CADAA candidates)
  if (a.senior === undefined) return { kind: "question", key: "senior" };
  if (a.senior === "no") return { kind: "outcome", outcome: "counselor", info: "notSenior" };

  return { kind: "outcome", outcome: a.citizenship === "yes" ? "fafsa" : "cadaa" };
}
