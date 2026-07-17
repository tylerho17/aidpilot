-- AidPilot: seed the core California aid programs into the live scholarship
-- catalog (scholarship_sources), so /ca-aid renders from the DB and is editable
-- via /admin/scholarships instead of a hardcoded TypeScript array.
--
-- Run after 007_phase_5_scholarship_engine.sql (adds the extended columns used
-- below). Safe to rerun: ON CONFLICT (name) DO NOTHING.
--
-- Sourced 2026-07-17 from the California Student Aid Commission (csac.ca.gov).
-- `tags` carries UI signals: 'california' scopes the /ca-aid screen;
-- 'cadaa_eligible' drives the "Open to Dream Act" filter; 'dream_act_pathway'
-- marks the CADAA entry itself. Amounts change yearly — the card links to the
-- official page for the current figure, so only clean fixed amounts are stored.

insert into public.scholarship_sources (
  name, provider, amount, deadline, url, application_url, source_url,
  eligible_states, education_levels, student_types, major_keywords, interest_tags, tags,
  eligibility, need_based, merit_based, essay_required, effort_level, source, verified_date, active
)
values
  (
    'Cal Grant A', 'California Student Aid Commission', null, '2027-03-02',
    'https://www.csac.ca.gov/cal-grant', 'https://www.csac.ca.gov/cal-grant', 'https://www.csac.ca.gov/cal-grant',
    array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['grant'],
    array['california', 'cadaa_eligible', 'cal-grant'],
    'Covers UC and CSU systemwide tuition and fees for students with financial need and a qualifying GPA at a four-year college. Apply by March 2 (September 2 for community college students).',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  ),
  (
    'Cal Grant B', 'California Student Aid Commission', 1648, '2027-03-02',
    'https://www.csac.ca.gov/cal-grant', 'https://www.csac.ca.gov/cal-grant', 'https://www.csac.ca.gov/cal-grant',
    array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['grant'],
    array['california', 'cadaa_eligible', 'cal-grant'],
    'An access award for living costs, books, and supplies for students from lower-income families with financial need — plus tuition and fees help after the first year. Apply by March 2 (September 2 for community college students).',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  ),
  (
    'California Chafee Grant', 'California Student Aid Commission', 5000, '2027-07-31',
    'https://www.csac.ca.gov/chafee', 'https://www.csac.ca.gov/chafee', 'https://www.csac.ca.gov/chafee',
    array['CA'], array['undergraduate'], array['Foster youth'], array[]::text[], array['foster youth'],
    array['california', 'cadaa_eligible', 'foster-youth'],
    'Up to $5,000 per year (does not need to be repaid) for current or former foster youth who were in foster care at any point between ages 16 and 18. Apply early; accepted through July 31 of the school year.',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  ),
  (
    'Middle Class Scholarship', 'California Student Aid Commission', null, '2027-03-02',
    'https://www.csac.ca.gov/middle-class-scholarship', 'https://www.csac.ca.gov/middle-class-scholarship', 'https://www.csac.ca.gov/middle-class-scholarship',
    array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['grant'],
    array['california', 'cadaa_eligible', 'middle-class'],
    'Helps low-to-middle-income undergraduates (including teaching-credential students) at UC, CSU, or a community college bachelor''s program. Award varies by your costs and other aid. Tied to your FAFSA or CA Dream Act Application — file by March 2.',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  ),
  (
    'California College Promise Grant', 'California Student Aid Commission', null, null,
    'https://www.csac.ca.gov/apply', 'https://www.csac.ca.gov/apply', 'https://www.csac.ca.gov/apply',
    array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['fee waiver'],
    array['california', 'cadaa_eligible', 'community-college'],
    'Waives California Community College enrollment (per-unit) fees for students with financial need. Apply anytime through your community college or your FAFSA/CA Dream Act Application.',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  ),
  (
    'California Dream Act aid (CADAA)', 'California Student Aid Commission', null, '2027-03-02',
    'https://dream.csac.ca.gov/', 'https://dream.csac.ca.gov/', 'https://dream.csac.ca.gov/',
    array['CA'], array['undergraduate'], array['Undocumented student'], array[]::text[], array['dream act'],
    array['california', 'dream_act_pathway', 'ab540'],
    'The application that opens the door to Cal Grant, the Middle Class Scholarship, Chafee, the Promise Grant, and more state aid for undocumented and other eligible students who can''t file the FAFSA (often AB 540 students). Opens October 1; March 2 for Cal Grant.',
    true, false, false, 'low', 'ca_aid_v1', '2026-07-17', true
  )
on conflict (name) do nothing;
