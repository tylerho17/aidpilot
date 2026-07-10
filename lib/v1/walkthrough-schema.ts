// AidPilot v1 — walkthrough content schema (v1-flow 3).
//
// The walkthrough renders ONLY from this typed structure. Per AGENT_RULES.md
// Rule 2, the structure (section names, field lists) is real, but every
// *explanation* value (what it means / document needed / common error) is an
// i18n placeholder key that a human fills later — no aid guidance lives in code.
//
// i18n key convention (namespace "walkthrough"):
//   <path>.sections.<sectionKey>.title
//   <path>.sections.<sectionKey>.body                (explainer sections)
//   <path>.sections.<sectionKey>.fields.<fieldKey>.{label,whatItMeans,documentNeeded,commonError}

export type WalkPath = "fafsa" | "cadaa";

export interface WalkField {
  fieldKey: string;
  /** Display name of the field (structure, not guidance). */
  labelKey: string;
  whatItMeansKey: string;
  documentNeededKey: string;
  commonErrorKey: string;
}

export interface WalkSection {
  sectionKey: string;
  titleKey: string;
  /** Explainer sections (contributor/FSA ID etc.) have a body and no fields. */
  explainer: boolean;
  bodyKey?: string;
  fields: WalkField[];
}

export function makeSection(path: WalkPath, sectionKey: string, fieldKeys: string[]): WalkSection {
  const base = `${path}.sections.${sectionKey}`;
  return {
    sectionKey,
    titleKey: `${base}.title`,
    explainer: false,
    fields: fieldKeys.map((fieldKey) => ({
      fieldKey,
      labelKey: `${base}.fields.${fieldKey}.label`,
      whatItMeansKey: `${base}.fields.${fieldKey}.whatItMeans`,
      documentNeededKey: `${base}.fields.${fieldKey}.documentNeeded`,
      commonErrorKey: `${base}.fields.${fieldKey}.commonError`,
    })),
  };
}

export function makeExplainer(path: WalkPath, sectionKey: string): WalkSection {
  const base = `${path}.sections.${sectionKey}`;
  return { sectionKey, titleKey: `${base}.title`, explainer: true, bodyKey: `${base}.body`, fields: [] };
}

/** Session key for a field's reviewed flag: `${path}.${sectionKey}.${fieldKey}`. */
export function reviewKey(path: WalkPath, sectionKey: string, fieldKey: string): string {
  return `${path}.${sectionKey}.${fieldKey}`;
}
