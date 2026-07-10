// AidPilot v1 — walkthrough content aggregator.
// Structure lives in fafsa.sections.ts / cadaa.sections.ts (real section/field
// lists, placeholder explanations); the schema/builders in walkthrough-schema.ts.

import { FAFSA_SECTIONS } from "./fafsa.sections";
import { CADAA_SECTIONS } from "./cadaa.sections";
import type { WalkPath, WalkSection } from "./walkthrough-schema";

export type { WalkPath, WalkSection, WalkField } from "./walkthrough-schema";
export { reviewKey } from "./walkthrough-schema";

export const WALKTHROUGH: Record<WalkPath, WalkSection[]> = {
  fafsa: FAFSA_SECTIONS,
  cadaa: CADAA_SECTIONS,
};

/** All reviewable fields for a path (progress + worksheet). */
export function allFields(path: WalkPath) {
  return WALKTHROUGH[path].flatMap((s) => s.fields.map((f) => ({ section: s, field: f })));
}
