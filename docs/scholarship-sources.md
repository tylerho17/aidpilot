> **⚠️ HISTORICAL — SUPERSEDED. NOT a v1 requirement.**
> This document predates v1. **v1 has no scholarship engine and no scholarship
> database.** Do not treat anything below as current scope. Kept for history
> only. See `docs/DESIGN_SOURCE.md` and the v1 scope note for what governs v1.

# AidPilot Scholarship Sources

## Purpose

This document lists the first 30 real scholarship sources AidPilot should track, verify, and eventually use for student matching. These are not guaranteed scholarships. They are source candidates for the AidPilot scholarship engine.

**Note:** All deadlines, eligibility rules, award amounts, and application links must be verified from official source pages before being shown as active scholarship recommendations.

## Source list

| Number | Source name | Source type | Best for | Why it matters | Verification status | Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | College Board BigFuture Scholarship Search | Scholarship database | Broad national scholarship discovery | Recognized student-facing scholarship search tool | Needs verification | High | Good starting point for broad discovery |
| 2 | Fastweb | Scholarship database | Broad scholarship matching | Long-running scholarship search platform | Needs verification | High | Useful for general scholarship discovery |
| 3 | Scholarships.com | Scholarship database | Broad scholarship matching | Large free scholarship search platform | Needs verification | High | Good for student-facing scholarship browsing |
| 4 | CareerOneStop Scholarship Finder | Public scholarship finder | Scholarships and training aid | Useful for workforce, training, and education aid discovery | Needs verification | High | Good source for structured scholarship data |
| 5 | Scholarship America Browse Scholarships | Scholarship administrator | Verified scholarship programs | Major scholarship administrator with open and upcoming programs | Needs verification | High | Strong source for legitimate programs |
| 6 | Dollars for Scholars | Local scholarship network | Local scholarships | Connects students to local scholarship opportunities | Needs verification | High | Useful because local scholarships can be less competitive |
| 7 | UCI ScholarshipUniverse | School scholarship portal | UC Irvine students | Relevant to AidPilot's Maya demo and UCI student audience | Needs verification | High | Important for school-specific matching |
| 8 | UCI External Scholarships | School scholarship source | UC Irvine students | Official school guidance for external scholarships | Needs verification | High | Should be checked for UCI-specific workflows |
| 9 | California Student Aid Commission | State aid source | California students | Source for Cal Grant and California state aid information | Needs verification | High | Important for state aid tracking |
| 10 | WebGrants 4 Students | California state aid portal | Cal Grant tracking | Students use it to manage Cal Grant information | Needs verification | High | Important for California AidPilot users |
| 11 | Bold.org | Scholarship platform | Broad and niche scholarships | Student-friendly scholarship marketplace | Needs verification | Medium | Separate sweepstakes-style awards from stronger fit opportunities |
| 12 | Niche Scholarships | Scholarship platform | Broad student scholarships and no-essay opportunities | Easy entry scholarships that students recognize | Needs verification | Medium | Label no-essay opportunities clearly |
| 13 | Sallie Mae Scholly | Scholarship platform | Broad scholarship discovery | Student-facing scholarship tool | Needs verification | Medium | Verify current availability and product flow |
| 14 | UNCF Scholarships | Scholarship organization | Black students and HBCU-connected opportunities | Major scholarship and student support organization | Needs verification | High | Important for identity and need-based scholarship matching |
| 15 | Hispanic Scholarship Fund | Scholarship organization | Hispanic students | Major scholarship and support organization | Needs verification | High | Strong candidate for identity-based matching |
| 16 | APIA Scholars | Scholarship organization | Asian American, Native Hawaiian, and Pacific Islander students | Supports underserved and first-generation students | Needs verification | High | Strong fit for identity and first-gen matching |
| 17 | TheDream.US | Scholarship organization | Undocumented students | Important scholarship source for Dreamer students | Needs verification | High | Needs careful eligibility handling |
| 18 | Dell Scholars | Scholarship program | Low-income and first-generation students | Combines scholarship funding with student support | Needs verification | High | Strong example of support plus funding |
| 19 | Jack Kent Cooke Foundation College Scholarship | Scholarship program | High-achieving students with financial need | Large and prestigious scholarship program | Needs verification | High | Useful for high-need, high-achievement users |
| 20 | Coca-Cola Scholars Program | Scholarship program | High school seniors with leadership and service | Nationally recognized scholarship | Needs verification | Medium | More relevant for high school users than current college users |
| 21 | Horatio Alger Scholarships | Scholarship organization | Students overcoming adversity | Major need-based scholarship provider | Needs verification | High | Strong fit for adversity and financial need matching |
| 22 | Society of Women Engineers Scholarships | STEM scholarship source | Women in engineering and related fields | Large engineering scholarship program | Needs verification | High | Strong for women in STEM matching |
| 23 | NSBE Scholarships | STEM scholarship source | Black engineering students | Engineering scholarship and partner opportunities | Needs verification | High | Strong STEM and identity match source |
| 24 | SHPE ScholarSHPE | STEM scholarship source | Hispanic STEM students | Major STEM scholarship source for SHPE members | Needs verification | High | Strong STEM and identity match source |
| 25 | AICPA Scholarships | Major-specific scholarship source | Accounting students | Supports future accounting and CPA students | Needs verification | Medium | Useful for major-based matching |
| 26 | PTK Scholarships | Transfer and community college scholarship source | Community college and transfer students | Useful for transfer-focused AidPilot users | Needs verification | Medium | Important if AidPilot targets community college students |
| 27 | Elks Most Valuable Student Scholarship | National scholarship program | High school seniors | Well-known scholarship with local lodge network | Needs verification | Medium | More relevant for pre-college users |
| 28 | Burger King Scholars | Corporate scholarship program | Students with work, service, and academic background | Accessible corporate scholarship source | Needs verification | Medium | Good example of employer and service-oriented scholarship |
| 29 | Taco Bell Live Más Scholarship | Corporate scholarship program | Creative and passion-driven students | Alternative scholarship not purely GPA-based | Needs verification | Medium | Good fit for creative student matching |
| 30 | Local community foundation scholarships | Local scholarship source | Location-based aid | Local scholarships are often less crowded than national ones | Needs verification | High | AidPilot should eventually ask for student location to surface these |

## Source validation rules

- Prefer official scholarship pages over third-party reposts.
- Mark deadlines as needs verification unless confirmed from the official source.
- Do not promise scholarship eligibility.
- Do not guarantee awards.
- Do not scrape private student portals without permission.
- Prioritize sources with clear eligibility, amount, deadline, and application URL.
- Store a last-checked date.
- Avoid scholarship listings that require payment.
- Flag no-essay sweepstakes separately from merit, need-based, local, and major-specific scholarships.
- Separate scholarships from grants, loans, and tuition discounts.
- Make every recommendation explain why it fits the student.

## Fields AidPilot should eventually store

- source_name
- scholarship_name
- amount_min
- amount_max
- deadline
- opens_at
- eligibility_summary
- student_type
- state
- school
- major
- gpa_requirement
- financial_need_required
- essay_required
- recommendation_required
- citizenship_requirement
- application_url
- source_url
- last_checked_at
- verification_status
- is_sweepstakes
- is_renewable
- match_reason
- student_action_required

## How this improves AidPilot

This source list gives AidPilot the first layer of scholarship supply. The product should not only show sample scholarships. It should eventually check trusted sources, filter by student profile, explain fit, and surface deadlines weekly.
