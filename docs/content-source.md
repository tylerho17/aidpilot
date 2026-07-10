# AidPilot v1 — Content Source Ledger

> **Status: CURRENT.** This file is the ONLY approved source of FAFSA/CADAA
> guidance content (AGENT_RULES.md Rule 2). Agents place content from here into
> i18n keys verbatim-in-meaning and never invent aid advice. Any key without an
> entry here stays a `TODO:` placeholder. All facts below are official 2026-27
> guidance supplied by the project owner — **VERIFY against studentaid.gov and
> CSAC before launch.** ES/VI translations are pending native review; do NOT
> machine-translate aid content.

## Contributor / FSA ID (FAFSA)

- Contributor = anyone required to provide info on the FAFSA: the student, their
  spouse, a biological or adoptive parent, or a parent's spouse (stepparent).
  Grandparents, foster parents, legal guardians, siblings, aunts/uncles are NOT
  contributors. Being a contributor does not make someone responsible for paying
  for college.
- Every student and contributor needs their own StudentAid.gov account (FSA ID);
  it is a legally binding signature — never share it. For 2026-27, verification
  is instant (no 1-3 day wait for SSN holders). Need: SSN (if you have one), full
  legal name, date of birth, own email, own mobile number.
- A parent/spouse without an SSN CAN make an account and complete their section;
  they verify with ITIN, mailing address, and ID documents, which can take
  longer. On the invite, check "my parent doesn't have an SSN" → it asks for the
  parent's mailing address, which must match the address on their FSA ID or the
  accounts won't link.
- Student and every contributor must give consent to import IRS tax info — even
  if they didn't file a tax return. If anyone refuses consent, no federal aid.

**Placed in:** `walkthrough.fafsa.sections.contributorFsaId.body`,
`…parentContributor.fields.parentSsnStatus.*`,
`…studentFinancials.fields.irsDataConsent.*`,
`…parentFinancials.fields.parentIrsDataConsent.*`.

## Dependency / which parent (FAFSA)

- Married or living together → both parents' info; both are contributors unless
  they filed taxes jointly (then one reports for both).
- Divorced/separated and NOT living together → only the parent who gave more
  financial support in the last 12 months files (if equal, the higher
  income/assets one). This replaced the old "who you live with" rule.
- If that parent remarried → the stepparent's info is required (prenups ignored).
- Use the free "Who's My FAFSA Parent?" wizard (no account needed).

**Placed in:** `walkthrough.fafsa.sections.parentContributor.fields.whichParent.*`.

## CADAA (California)

- CADAA is California's state aid application; undocumented students file it
  instead of FAFSA to get state/institutional aid (Cal Grants, community college
  fee waivers, university grants, private scholarships) and in-state tuition. It
  does NOT provide federal aid.
- U.S. citizens/green-card holders with undocumented parent(s)/spouse may file
  CADAA instead of FAFSA if they don't want to submit a FAFSA (forgoes federal
  aid).
- SSN: leave blank or enter all zeroes if none; use ITIN if you/parents file
  taxes with one. AB540: generally 3 years at CA schools + graduation; the AB540
  affidavit is embedded in the CADAA. DACA students file CADAA, not FAFSA.

**Placed in:** `walkthrough.cadaa.sections.contributorAccount.body`,
`…studentIdentity.fields.ssnOrItin.whatItMeans`,
`…residencyAb540.fields.ab540Eligibility.whatItMeans`; DACA also reflected in
triage Q1 option label.

## Trust line (landing + CADAA path, all three locales)

> "Information you provide on the California Dream Act Application is used only
> to determine eligibility for state financial aid. It is never shared with the
> federal government or used for immigration enforcement."

**Placed in:** `trust.cadaa` — shown on the landing page, the CADAA triage
result, and the CADAA walkthrough. ES/VI pending native review.

## Privacy line (landing)

> "AidPilot stores nothing about you. Everything you enter stays on your device.
> We never submit anything for you and never see your name, SSN, or finances."

**Placed in:** `trust.privacy` — shown on the landing page and referral page.

## Worksheet disclaimer

> "This is not official advice. Verify with your counselor. You must sign and
> submit on the official government site yourself."

**Placed in:** `worksheet.disclaimerTitle` / `worksheet.disclaimerBody`.

## Getting started / documents (both forms)

- What you'll need: your Social Security number if you have one (for CADAA, an
  ITIN or leave it blank/zeroes), your 2024 federal tax return and W-2s — the
  2026-27 form uses 2024 tax information — records of untaxed income such as
  child support received, and current balances of checking, savings, and any
  investments (plus business or farm records if that applies).
- Create your StudentAid.gov account before you start; for 2026-27, verification
  is now instant. For CADAA, create your login at dream.csac.ca.gov.
- You can list up to 20 colleges. Add any school you might apply to, even if
  you're unsure — you can remove one later, but adding a school late can cost
  you aid.
- File as early as you can (the form opens around October 1). Much state aid is
  first-come, first-served, and California's priority deadline is March 2.

**Placed in:** `walkthrough.fafsa.sections.contributorFsaId.body` (what-you'll-
need, create-account-first, file-early paragraphs),
`walkthrough.cadaa.sections.contributorAccount.body` (CADAA flavor),
`…fafsa.studentColleges.fields.collegeList.{whatItMeans,commonError}`,
`…cadaa.studentColleges.fields.caCollegeList.{whatItMeans,commonError}`,
`…fafsa.studentFinancials.fields.studentIncome.documentNeeded` (tax docs).

## Financials / consent (FAFSA)

- You and each contributor must give consent and approval to import federal tax
  information from the IRS. It's required for federal aid even if you didn't
  file taxes, and if anyone refuses, you won't get federal aid. Once you
  consent, your 2024 tax data imports automatically — and you won't be able to
  see or edit the imported numbers (a security feature).
- If you didn't file a 2024 tax return, use your 2024 income information and
  enter 0 where questions don't apply.
- Report the current balances of your cash, savings, and investments as of the
  day you sign — not the tax-year amounts. Report your own assets; your parent
  reports theirs separately. Don't include your parents' assets in your section.
- Non-SSN parent: a parent without an SSN can still create an account and enter
  income without a tax return, and isn't asked about citizenship status.
- Changed circumstances: if your income dropped since 2024 (a job loss, for
  example), complete the form as instructed, then contact the school's financial
  aid office to request an aid adjustment. You can't update a processed FAFSA
  with new tax information yourself.

**Placed in:** `walkthrough.fafsa.sections.studentFinancials.fields.
{irsDataConsent.whatItMeans, taxFilingStatus.whatItMeans,
studentIncome.whatItMeans, studentAssets.whatItMeans/documentNeeded/commonError}`,
`…parentFinancials.fields.{parentIrsDataConsent.whatItMeans,
parentTaxFilingStatus.whatItMeans, parentIncome.commonError,
parentAssets.whatItMeans}`, `…parentContributor.fields.parentSsnStatus.
whatItMeans` (extended with income-without-return + not-asked-citizenship).

## CADAA financials / consent (sourced from dream.csac.ca.gov)

- The 2026-27 CADAA uses 2024 tax information. Entering an SSN or ITIN is
  optional: enter your ITIN if you have one; if you have neither, enter all
  zeroes. On citizenship, undocumented / DACA / U-visa / TPS students select
  "neither citizen nor eligible noncitizen" (indicating citizen/eligible
  noncitizen redirects you to the FAFSA).
- The CADAA does NOT import IRS data — you enter income and tax information
  manually. Do not reuse FAFSA IRS-import language here (standing guardrail).
- Tax filing status: haven't filed yet → "will file," use estimates, update
  after filing; "not going to file" → still report income (W-2 box 1 + 8;
  self-employed net profit). Earning over the IRS filing threshold flags the
  form and requires getting an ITIN and filing.
- Dependent students provide parent household/income info; the parent signs
  with a Parent PIN (save it — reused yearly).
- Changed circumstances: complete as best you can, submit, then talk to the
  school's financial aid office.
- After submitting: CSAC emails a nine-digit Dream ID → create a WebGrants 4
  Students account to check status. Submit Cal Grant GPA verification by
  March 2.

**Placed in:** `walkthrough.cadaa.sections.studentIdentity.fields.
{ssnOrItin.whatItMeans, citizenshipStatus.whatItMeans/commonError}` (the
citizenshipStatus field was added to the CADAA content model to host the
sourced citizenship-selection guidance),
`…studentFinancials.fields.{taxFilingStatus.*, studentIncome.whatItMeans}`,
`…parentFinancials.fields.{parentTaxFilingStatus.whatItMeans,
parentIncome.whatItMeans/commonError}`,
`…reviewAndSign.fields.{studentSignature.whatItMeans/documentNeeded,
parentSignature.whatItMeans/commonError}`. VERIFY against dream.csac.ca.gov.

## Spanish draft strings (ES — NEEDS_NATIVE_REVIEW, not final)

Draft Spanish supplied by the project owner for: trust line (`trust.cadaa`),
privacy line (`trust.privacy`), FAFSA consent
(`walkthrough.fafsa…irsDataConsent.whatItMeans`), contributor definition +
what-you'll-need documents (first + documents paragraphs of
`walkthrough.fafsa…contributorFsaId.body`), non-SSN parent
(`walkthrough.fafsa…parentSsnStatus.whatItMeans`), CADAA overview + documents
(first + documents paragraphs of `walkthrough.cadaa…contributorAccount.body`).

**Mechanics:** ES drafts live in `messages/es.overrides.json`;
`scripts/gen-stub-locales.mjs` deep-merges them over the EN clone when
regenerating, so `es.json` stays reproducible and remains flagged
`NEEDS_NATIVE_REVIEW`. If an EN explainer body changes, re-compose the two body
overrides. **Vietnamese has NO drafts** — vi.json stays a pure EN stub until
native review; never machine-translate.

## NOT yet sourced (stays TODO — next human pass)

Every remaining `whatItMeans/documentNeeded/commonError` slot not listed in a
placement map above (identity fields, FAFSA citizenship, circumstances,
demographics, family size, CADAA residency documents, etc.), counselor screen
explainer + "why" slot, triage notSenior note, all Vietnamese translations,
native review of the Spanish drafts.
