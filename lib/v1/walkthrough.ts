// AidPilot v1 — Walkthrough content model (FAFSA + CADAA).
//
// IMPORTANT (AGENT_RULES.md Rule 2): this file defines STRUCTURE only. Every
// piece of user-facing text is an i18n placeholder key (see messages/en.json →
// "walkthrough"). There is NO real FAFSA/CADAA guidance here — the "what it
// means / document needed / common error" content is human-sourced later.
//
// Answers the user types live only in client-side session state (Rule 1) and are
// keyed by `answerKey`. Nothing here is transmitted.

export type WalkInput = "text" | "number" | "textarea";
export type WalkPath = "fafsa" | "cadaa";

export interface WalkField {
  fieldKey: string;
  /** Session answers key: `${path}.${sectionKey}.${fieldKey}`. */
  answerKey: string;
  labelKey: string;
  whatItMeansKey: string;
  documentNeededKey: string;
  commonErrorKey: string;
  input: WalkInput;
}

export interface WalkSection {
  sectionKey: string;
  titleKey: string;
  /** Explainer-only sections (e.g. contributor/FSA ID) carry a body, no fields. */
  bodyKey?: string;
  explainerOnly: boolean;
  fields: WalkField[];
}

// i18n keys are relative to the "walkthrough" namespace.
function field(path: WalkPath, sectionKey: string, fieldKey: string, input: WalkInput): WalkField {
  const base = `${path}.sections.${sectionKey}.fields.${fieldKey}`;
  return {
    fieldKey,
    answerKey: `${path}.${sectionKey}.${fieldKey}`,
    labelKey: `${base}.label`,
    whatItMeansKey: `${base}.whatItMeans`,
    documentNeededKey: `${base}.documentNeeded`,
    commonErrorKey: `${base}.commonError`,
    input,
  };
}

function explainer(path: WalkPath, sectionKey: string): WalkSection {
  const base = `${path}.sections.${sectionKey}`;
  return { sectionKey, titleKey: `${base}.title`, bodyKey: `${base}.body`, explainerOnly: true, fields: [] };
}

function section(path: WalkPath, sectionKey: string, fields: WalkField[]): WalkSection {
  return { sectionKey, titleKey: `${path}.sections.${sectionKey}.title`, explainerOnly: false, fields };
}

function buildPath(path: WalkPath): WalkSection[] {
  return [
    // Contributor / FSA-ID (or CADAA account) explainer — explainer only, no fields.
    explainer(path, "account"),
    section(path, "about", [
      field(path, "about", "fullName", "text"),
      field(path, "about", "dob", "text"),
    ]),
    section(path, "money", [
      field(path, "money", "householdSize", "number"),
      field(path, "money", "parentIncome", "number"),
    ]),
  ];
}

export const WALKTHROUGH: Record<WalkPath, WalkSection[]> = {
  fafsa: buildPath("fafsa"),
  cadaa: buildPath("cadaa"),
};

/** All fillable fields for a path (used for progress + the worksheet). */
export function fillableFields(path: WalkPath): WalkField[] {
  return WALKTHROUGH[path].flatMap((s) => s.fields);
}
