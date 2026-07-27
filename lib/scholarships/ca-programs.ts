import type { ScholarshipSource } from "@/lib/types";

/**
 * Offline / pre-seed fallback for the /ca-aid live catalog.
 *
 * The source of truth is now the `scholarship_sources` table (seeded by
 * supabase/025_seed_ca_aid_programs.sql, editable via /admin/scholarships).
 * These rows mirror that seed 1:1 as `ScholarshipSource` objects so the screen
 * still renders the real California programs when Supabase is unconfigured or
 * the catalog hasn't been seeded yet. Keep in sync with 025.
 *
 * Sourced 2026-07-17 from the California Student Aid Commission (csac.ca.gov);
 * cited in docs/content-source.md. `tags` carry UI signals: 'california' scopes
 * this screen, 'cadaa_eligible' drives the Dream-Act filter, 'dream_act_pathway'
 * marks the CADAA entry.
 */

const SEEDED = "2026-07-17T00:00:00.000Z";

function program(p: Partial<ScholarshipSource> & { name: string }): ScholarshipSource {
  return {
    id: `ca_aid:${p.name}`,
    created_at: SEEDED,
    updated_at: SEEDED,
    name: p.name,
    provider: p.provider ?? "California Student Aid Commission",
    amount: p.amount ?? null,
    deadline: p.deadline ?? null,
    eligibility: p.eligibility ?? null,
    url: p.url ?? null,
    application_url: p.application_url ?? p.url ?? null,
    source_url: p.source_url ?? p.url ?? null,
    eligible_states: ["CA"],
    education_levels: ["undergraduate"],
    student_types: p.student_types ?? ["College student"],
    major_keywords: [],
    interest_tags: p.interest_tags ?? [],
    tags: p.tags ?? ["california"],
    need_based: p.need_based ?? true,
    merit_based: false,
    essay_required: false,
    effort_level: "low",
    min_gpa: null,
    source: "ca_aid_v1",
    verified_date: "2026-07-17",
    active: true,
  };
}

export const CA_PROGRAM_FALLBACK: ScholarshipSource[] = [
  program({
    name: "Cal Grant A",
    deadline: "2027-03-02",
    url: "https://www.csac.ca.gov/cal-grant",
    tags: ["california", "cadaa_eligible", "cal-grant"],
    eligibility:
      "Covers UC and CSU systemwide tuition and fees for students with financial need and a qualifying GPA at a four-year college. Apply by March 2 (September 2 for community college students).",
  }),
  program({
    name: "Cal Grant B",
    amount: 1648,
    deadline: "2027-03-02",
    url: "https://www.csac.ca.gov/cal-grant",
    tags: ["california", "cadaa_eligible", "cal-grant"],
    eligibility:
      "An access award for living costs, books, and supplies for students from lower-income families with financial need — plus tuition and fees help after the first year. Apply by March 2 (September 2 for community college students).",
  }),
  program({
    name: "California Chafee Grant",
    amount: 5000,
    deadline: "2027-07-31",
    url: "https://www.csac.ca.gov/chafee",
    student_types: ["Foster youth"],
    tags: ["california", "cadaa_eligible", "foster-youth"],
    eligibility:
      "Up to $5,000 per year (does not need to be repaid) for current or former foster youth who were in foster care at any point between ages 16 and 18. Apply early; accepted through July 31 of the school year.",
  }),
  program({
    name: "Middle Class Scholarship",
    deadline: "2027-03-02",
    url: "https://www.csac.ca.gov/middle-class-scholarship",
    tags: ["california", "cadaa_eligible", "middle-class"],
    eligibility:
      "Helps low-to-middle-income undergraduates (including teaching-credential students) at UC, CSU, or a community college bachelor's program. Award varies by your costs and other aid. Tied to your FAFSA or CA Dream Act Application — file by March 2.",
  }),
  program({
    name: "California College Promise Grant",
    url: "https://www.csac.ca.gov/apply",
    tags: ["california", "cadaa_eligible", "community-college"],
    eligibility:
      "Waives California Community College enrollment (per-unit) fees for students with financial need. Apply anytime through your community college or your FAFSA/CA Dream Act Application.",
  }),
  program({
    name: "California Dream Act aid (CADAA)",
    deadline: "2027-03-02",
    url: "https://dream.csac.ca.gov/",
    student_types: ["Undocumented student"],
    tags: ["california", "dream_act_pathway", "ab540"],
    eligibility:
      "The application that opens the door to Cal Grant, the Middle Class Scholarship, Chafee, the Promise Grant, and more state aid for undocumented and other eligible students who can't file the FAFSA (often AB 540 students). Opens October 1; March 2 for Cal Grant.",
  }),
];

/** Which "aid & scholarships" tag scopes a source to the /ca-aid screen. */
export const CA_AID_TAG = "california";

/** True when a program is open to CA Dream Act applicants (not only FAFSA). */
export function isDreamActEligible(source: ScholarshipSource): boolean {
  const tags = source.tags ?? [];
  return tags.includes("cadaa_eligible") || tags.includes("dream_act_pathway");
}

/**
 * Spanish overlay for the curated CA programs, keyed by their (stable) English
 * name. `scholarship_sources` is English-only, so this restores bilingual copy
 * for the programs that matter most to California's Spanish-speaking families
 * without a schema change. Admin-added scholarships without an entry here fall
 * back to their English text. (A scalable path later: an `i18n` jsonb column on
 * scholarship_sources.) Author-reviewed Spanish; a native check is still ideal.
 */
const PROVIDER_ES = "Comisión de Ayuda Estudiantil de California";

const CA_AID_ES: Record<string, { name: string; provider: string; eligibility: string }> = {
  "Cal Grant A": {
    name: "Cal Grant A",
    provider: PROVIDER_ES,
    eligibility:
      "Cubre la matrícula y las cuotas del sistema de UC y CSU para estudiantes con necesidad económica y un GPA que califique en una universidad de cuatro años. Solicita antes del 2 de marzo (2 de septiembre para estudiantes de colegio comunitario).",
  },
  "Cal Grant B": {
    name: "Cal Grant B",
    provider: PROVIDER_ES,
    eligibility:
      "Un subsidio de acceso para gastos de vida, libros y materiales para estudiantes de familias de bajos ingresos con necesidad económica — más ayuda con la matrícula y las cuotas después del primer año. Solicita antes del 2 de marzo (2 de septiembre para estudiantes de colegio comunitario).",
  },
  "California Chafee Grant": {
    name: "Beca Chafee de California",
    provider: PROVIDER_ES,
    eligibility:
      "Hasta $5,000 por año (no se debe reembolsar) para jóvenes de crianza actuales o anteriores que estuvieron en cuidado de crianza en algún momento entre los 16 y los 18 años. Solicita temprano; se acepta hasta el 31 de julio del año escolar.",
  },
  "Middle Class Scholarship": {
    name: "Beca de Clase Media",
    provider: PROVIDER_ES,
    eligibility:
      "Ayuda a estudiantes de licenciatura de ingresos bajos a medios (incluidos los de credencial docente) en UC, CSU o un programa de licenciatura de colegio comunitario. El monto varía según tus costos y otra ayuda. Ligada a tu FAFSA o Solicitud de la Ley Dream — presenta antes del 2 de marzo.",
  },
  "California College Promise Grant": {
    name: "Beca California College Promise",
    provider: PROVIDER_ES,
    eligibility:
      "Exime las cuotas de inscripción (por unidad) del colegio comunitario de California para estudiantes con necesidad económica. Solicita en cualquier momento a través de tu colegio comunitario o tu FAFSA/Solicitud de la Ley Dream.",
  },
  "California Dream Act aid (CADAA)": {
    name: "Ayuda de la Ley Dream de California (CADAA)",
    provider: PROVIDER_ES,
    eligibility:
      "La solicitud que abre la puerta al Cal Grant, la Beca de Clase Media, Chafee, la Beca Promise y más ayuda estatal para estudiantes indocumentados y otros elegibles que no pueden presentar la FAFSA (a menudo estudiantes AB 540). Se abre el 1 de octubre; 2 de marzo para el Cal Grant.",
  },
};

/** Localize a catalog row's display text; falls back to the row's English. */
export function localizeProgram(
  p: ScholarshipSource,
  lang: "en" | "es"
): { name: string; provider: string | null; eligibility: string | null } {
  if (lang === "es") {
    const es = CA_AID_ES[p.name];
    if (es) return { name: es.name, provider: es.provider, eligibility: es.eligibility };
  }
  return { name: p.name, provider: p.provider, eligibility: p.eligibility ?? null };
}
