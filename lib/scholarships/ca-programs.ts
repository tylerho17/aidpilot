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
