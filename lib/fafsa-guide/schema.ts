import type { Language } from "@/lib/i18n";

/**
 * FAFSA/CADAA guide content schema. The guide renders ONLY from this typed
 * structure: section names and field lists are real form structure; every
 * helper (what it means / document needed / common error) is human-sourced
 * text ported verbatim from the v1-pilot content ledger, or null where the
 * source still had a placeholder - null slots never render.
 */

/** A bilingual string. Spanish falls back to English at port time when untranslated. */
export type GuideText = Record<Language, string>;

export interface GuideField {
  fieldKey: string;
  /** Display name of the field (structure, not guidance). */
  label: GuideText;
  whatItMeans: GuideText | null;
  documentNeeded: GuideText | null;
  commonError: GuideText | null;
}

export interface GuideSection {
  sectionKey: string;
  title: GuideText;
  /** Explainer sections (contributor/FSA ID etc.) have a body and no fields. */
  explainer: boolean;
  body?: GuideText | null;
  fields: GuideField[];
}
