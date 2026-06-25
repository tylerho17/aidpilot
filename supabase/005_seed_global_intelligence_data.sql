-- AidPilot global intelligence seed data
-- Run in Supabase SQL Editor after 004_mvp_intelligence_layer.sql
-- Safe to rerun. Uses ON CONFLICT DO NOTHING on unique title/name.

-- ---------------------------------------------------------------------------
-- fafsa_workflow_steps
-- ---------------------------------------------------------------------------
insert into public.fafsa_workflow_steps (step_order, title, description, category, applies_to, default_priority, source_url)
values
  (1, 'Create StudentAid.gov account', 'Set up your FSA ID at StudentAid.gov before starting the FAFSA.', 'Account', 'all', 'high', 'https://studentaid.gov'),
  (2, 'Gather student and contributor information', 'Collect Social Security numbers, tax info, and school codes. AidPilot does not store this data.', 'Preparation', 'all', 'high', 'https://studentaid.gov/h/apply-for-aid/fafsa'),
  (3, 'Invite contributor if needed', 'If a parent or spouse must provide information, invite them through StudentAid.gov.', 'Contributors', 'dependent', 'high', null),
  (4, 'Complete FAFSA', 'Fill out all required FAFSA sections on StudentAid.gov.', 'Application', 'all', 'high', null),
  (5, 'Submit FAFSA', 'Review and submit your FAFSA before your state and school priority deadlines.', 'Application', 'all', 'high', null),
  (6, 'Review FAFSA Submission Summary', 'Save your Submission Summary and confirm your Student Aid Index (SAI).', 'Review', 'all', 'medium', null),
  (7, 'Fix errors or corrections if needed', 'If your school or FAFSA flags errors, make corrections on StudentAid.gov.', 'Corrections', 'all', 'high', null),
  (8, 'Watch for school verification request', 'Check your email and school aid portal for verification selection notices.', 'Verification', 'all', 'high', null),
  (9, 'Submit requested verification documents', 'Upload verification forms through your school portal, not through AidPilot.', 'Verification', 'all', 'high', null),
  (10, 'Check school financial aid portal', 'Log into your school aid portal for messages, holds, and document requests.', 'School portal', 'all', 'medium', null),
  (11, 'Compare aid offers', 'Review grants, scholarships, loans, and work-study from each school you are considering.', 'Aid offer', 'all', 'medium', null),
  (12, 'Contact financial aid office if aid is not enough', 'Ask your school about appeal options, emergency aid, or additional scholarships. Verify deadlines with your aid office.', 'Appeal', 'all', 'medium', null)
on conflict (title) do nothing;

-- ---------------------------------------------------------------------------
-- scholarship_sources (starter/sample data)
-- ---------------------------------------------------------------------------
insert into public.scholarship_sources (name, provider, amount, deadline, url, eligible_states, education_levels, student_types, major_keywords, tags, need_based, merit_based, essay_required, min_gpa, source, active)
values
  ('California Dream Act Scholarship Fund', 'Sample CA Foundation', 5000, '2026-07-18', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['dream act', 'california'], true, false, true, 2.5, 'sample', true),
  ('First-Gen College Success Award', 'Sample National Fund', 2500, '2026-08-01', null, array[]::text[], array['undergraduate'], array['College student'], array[]::text[], array['first generation'], true, false, true, 2.0, 'sample', true),
  ('STEM Future Leaders Grant', 'Sample STEM Alliance', 4000, '2026-07-25', null, array[]::text[], array['undergraduate'], array['College student'], array['stem', 'engineering', 'science'], array['stem'], false, true, true, 3.0, 'sample', true),
  ('Women in Engineering Scholarship', 'Sample Women in Tech', 3500, '2026-08-20', null, array[]::text[], array['undergraduate', 'graduate'], array['College student'], array['engineering'], array['women', 'stem'], false, true, true, 3.0, 'sample', true),
  ('Community Service Leaders Award', 'Sample Service Network', 1500, '2026-07-14', null, array['CA', 'AZ', 'NV'], array['undergraduate'], array['College student', 'High school student'], array[]::text[], array['community service'], true, true, true, 2.5, 'sample', true),
  ('Transfer Student Bridge Grant', 'Sample Transfer Fund', 3000, '2026-08-05', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['transfer'], true, false, false, 2.5, 'sample', true),
  ('Pell Match Opportunity', 'Sample Access Fund', 2000, '2026-08-15', null, array[]::text[], array['undergraduate'], array['College student'], array[]::text[], array['pell', 'need-based'], true, false, false, null, 'sample', true),
  ('Golden State Essay Award', 'Sample CA Writers Guild', 1000, '2026-07-19', null, array['CA'], array['undergraduate'], array['College student', 'High school student'], array['writing', 'english'], array['essay'], false, true, true, 3.0, 'sample', true),
  ('SoCal Service Scholarship', 'Sample Regional Fund', 1800, '2026-07-16', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['service', 'southern california'], true, false, true, 2.5, 'sample', true),
  ('Local Rotary Club Award', 'Sample Rotary District', 1200, '2026-07-22', null, array['CA', 'OR', 'WA'], array['undergraduate', 'high school'], array['College student', 'High school student'], array[]::text[], array['local', 'rotary'], true, true, false, 2.5, 'sample', true),
  ('CSU Transfer Excellence Award', 'Sample CSU Foundation', 2500, '2026-08-30', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['csu', 'transfer'], false, true, true, 3.2, 'sample', true),
  ('Biology Research Starter Grant', 'Sample Bio Society', 2200, '2026-09-15', null, array[]::text[], array['undergraduate', 'graduate'], array['College student'], array['biology', 'research'], array['biology', 'research'], false, true, true, 3.3, 'sample', true),
  ('Public Health Pathways Award', 'Sample Health Fund', 2800, '2026-09-10', null, array[]::text[], array['undergraduate'], array['College student'], array['public health', 'nursing'], array['health'], true, false, true, 3.0, 'sample', true),
  ('Low-Income Bridge Scholarship', 'Sample Access Network', 3500, '2026-08-25', null, array[]::text[], array['undergraduate'], array['College student'], array[]::text[], array['low income', 'need-based'], true, false, false, 2.0, 'sample', true),
  ('Creative Writing Talent Award', 'Sample Arts Council', 1500, '2026-09-20', null, array[]::text[], array['undergraduate'], array['College student'], array['writing', 'creative'], array['arts', 'essay'], false, true, true, 2.8, 'sample', true),
  ('Campus Employment Support Grant', 'Sample Work-Study Fund', 1000, '2026-09-05', null, array[]::text[], array['undergraduate'], array['College student'], array[]::text[], array['work-study', 'employment'], true, false, false, null, 'sample', true),
  ('Health Careers Starter Award', 'Sample Medical Foundation', 3200, '2026-09-12', null, array['CA', 'TX', 'FL'], array['undergraduate'], array['College student'], array['health', 'pre-med', 'nursing'], array['health careers'], true, true, true, 3.0, 'sample', true),
  ('Anteater Excellence Scholarship', 'Sample UC Foundation', 5000, '2026-07-12', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['uc', 'merit'], false, true, true, 3.5, 'sample', true),
  ('Irvine Transfer Success Fund', 'Sample OC Foundation', 2800, '2026-08-05', null, array['CA'], array['undergraduate'], array['College student'], array[]::text[], array['transfer', 'orange county'], true, false, true, 3.0, 'sample', true),
  ('FG STEM Accelerator', 'Sample STEM Access', 4500, '2026-08-10', null, array[]::text[], array['undergraduate'], array['College student'], array['stem', 'computer science', 'math'], array['first generation', 'stem'], true, true, true, 3.0, 'sample', true),
  ('High School to College Bridge Award', 'Sample Prep Fund', 1000, '2026-07-30', null, array[]::text[], array['high school'], array['High school student'], array[]::text[], array['high school'], true, false, true, 2.5, 'sample', true),
  ('Graduate Research Fellowship (Sample)', 'Sample Grad Fund', 6000, '2026-09-01', null, array[]::text[], array['graduate'], array['College student'], array['research'], array['graduate', 'research'], false, true, true, 3.5, 'sample', true),
  ('Parent Advocate Education Grant', 'Sample Family Fund', 800, '2026-08-18', null, array[]::text[], array['undergraduate'], array['Parent'], array[]::text[], array['parent'], true, false, false, null, 'sample', true),
  ('Texas First-Year Opportunity', 'Sample TX Fund', 2000, '2026-07-28', null, array['TX'], array['undergraduate'], array['College student', 'High school student'], array[]::text[], array['texas'], true, false, true, 2.5, 'sample', true),
  ('Florida Sunshine Merit Award', 'Sample FL Foundation', 2500, '2026-08-08', null, array['FL'], array['undergraduate'], array['College student'], array[]::text[], array['florida', 'merit'], false, true, false, 3.2, 'sample', true)
on conflict (name) do nothing;
