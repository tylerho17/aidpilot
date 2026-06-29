-- Phase 6: sample/demo scholarships for the tracker (clearly labeled, not real official awards)
-- Run after 023_scholarship_tracker.sql

insert into public.scholarships (
  name, provider, description, amount_min, amount_max, deadline,
  eligibility_summary, application_url, scholarship_type, is_active
)
values
  (
    '[Sample] Local Community Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1000, 2500, '2026-08-15',
    'Demo: local students with community involvement.',
    'https://example.org/aidpilot-demo/local-community',
    'local', true
  ),
  (
    '[Sample] First-Generation Student Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1500, 3000, '2026-07-28',
    'Demo: first-generation college students.',
    'https://example.org/aidpilot-demo/first-gen',
    'first_gen', true
  ),
  (
    '[Sample] Need-Based College Grant Search',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    2000, 4000, '2026-09-01',
    'Demo: students with demonstrated financial need.',
    'https://example.org/aidpilot-demo/need-based',
    'need_based', true
  ),
  (
    '[Sample] Major-Specific Department Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1000, 3500, '2026-08-20',
    'Demo: students in a specific academic major.',
    'https://example.org/aidpilot-demo/major-specific',
    'major_specific', true
  ),
  (
    '[Sample] Campus Foundation Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    500, 2000, '2026-09-10',
    'Demo: enrolled students at a participating campus.',
    'https://example.org/aidpilot-demo/campus-foundation',
    'school_specific', true
  ),
  (
    '[Sample] Transfer Student Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1500, 4500, '2026-08-05',
    'Demo: community college transfer students.',
    'https://example.org/aidpilot-demo/transfer',
    'transfer', true
  ),
  (
    '[Sample] Outside Essay Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1000, 2500, '2026-07-20',
    'Demo: short essay required; verify requirements with provider.',
    'https://example.org/aidpilot-demo/essay',
    'general', true
  ),
  (
    '[Sample] Local Business Scholarship',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    500, 1500, '2026-08-30',
    'Demo: local business supporting area students.',
    'https://example.org/aidpilot-demo/local-business',
    'local', true
  ),
  (
    '[Sample] Merit-Based Honors Award',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    2000, 5000, '2026-09-15',
    'Demo: strong academic record and leadership.',
    'https://example.org/aidpilot-demo/merit',
    'merit_based', true
  ),
  (
    '[Sample] Identity-Based Support Grant',
    'AidPilot Demo Fund',
    'Sample opportunity for tracking practice. Not a real scholarship.',
    1000, 3000, '2026-08-12',
    'Demo: eligibility tied to identity or background criteria.',
    'https://example.org/aidpilot-demo/identity',
    'identity_based', true
  )
on conflict (name) do nothing;
