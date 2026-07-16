/**
 * Single source of truth for which award year AidPilot's guidance covers, plus
 * a sourced "what's new" advisory. The guide content is a human-sourced
 * snapshot, so this makes its currency VISIBLE and honest rather than leaving
 * users to wonder whether the data is up to date. When the 2027-28 FAFSA form
 * is published (opens ~Oct 1, 2026), re-source the content and bump these
 * values in one place.
 */

export const CURRENT_AWARD_YEAR = "2026–27";
export const CURRENT_TAX_YEAR = "2024";

/** "Current for the 2026-27 FAFSA" chip text. */
export const CURRENCY_LABEL: Record<"en" | "es", string> = {
  en: `Current for the ${CURRENT_AWARD_YEAR} FAFSA`,
  es: `Actualizado para la FAFSA ${CURRENT_AWARD_YEAR}`,
};

export const AID_LAW_UPDATE_HREF = "https://studentaid.gov/announcements-events/big-updates";

/**
 * Recent-law advisory. Sourced from StudentAid.gov's One Big Beautiful Bill Act
 * updates (page last updated 2026-07-06) and the OBBBA financial-assets help
 * article. Facts: OBBBA was signed 2025-07-04; for the 2026-27 FAFSA, reported
 * assets now exclude small businesses, family farms, and commercial fishing
 * businesses; loan limits, repayment plans, and Pell also changed (phasing in
 * from 2026). We state the high-level change and link to the official hub
 * rather than restate specifics we haven't fully sourced.
 */
type AidLawCopy = { eyebrow: string; body: string; link: string };

export const AID_LAW_UPDATE: Record<"en" | "es", AidLawCopy> = {
  en: {
    eyebrow: `What changed for ${CURRENT_AWARD_YEAR}`,
    body: `The 2025 One Big Beautiful Bill Act updated federal aid. On the ${CURRENT_AWARD_YEAR} FAFSA, reported assets now exclude small businesses, family farms, and commercial fishing businesses. Loan limits, repayment plans, and Pell Grants also changed, phasing in from 2026.`,
    link: "Read the official updates",
  },
  es: {
    eyebrow: `Qué cambió para ${CURRENT_AWARD_YEAR}`,
    body: `The 2025 One Big Beautiful Bill Act updated federal aid. On the ${CURRENT_AWARD_YEAR} FAFSA, reported assets now exclude small businesses, family farms, and commercial fishing businesses. Loan limits, repayment plans, and Pell Grants also changed, phasing in from 2026.`,
    link: "Ver las actualizaciones oficiales",
  },
};
