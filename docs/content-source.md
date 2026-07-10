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

## NOT yet sourced (stays TODO — next human pass)

Financials guidance, getting-started content, every remaining
`whatItMeans/documentNeeded/commonError` slot, explainer details beyond the
above, counselor screen explainer + "why" slot, triage notSenior note.
