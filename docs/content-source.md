# AidPilot — Content Source Ledger (overhaul-ui-revamp)

> **Status: CURRENT.** This is the approved provenance ledger for the FAFSA/CADAA
> guidance rendered by `lib/fafsa-guide/*`. Content goes into helper slots
> verbatim-in-meaning from an official source recorded here; agents never invent
> aid advice. Any `whatItMeans` / `documentNeeded` / `commonError` slot without an
> entry below stays `null` and renders nothing.
>
> **Spanish/Vietnamese:** do NOT machine-translate aid content. Until a native
> draft exists, the `es` value is an explicit verbatim copy of the `en` string
> (English fallback), matching the pattern already used for field labels.

## Origin of the first content pass (ported)

The initial ~38 filled slots were ported VERBATIM from the `v1-pilot` branch
ledger (`v1-pilot:docs/content-source.md`) — contributor/FSA ID, dependency/which
parent, getting-started documents, FAFSA financials/consent, and the CADAA
account/financials/consent entries. That branch's ledger remains the source of
record for those originals.

---

## Sourced 2026-07-16 (this branch) — Student identity + citizenship cluster

Guidance below was read directly from the official StudentAid.gov help pages on
2026-07-16 and placed into `lib/fafsa-guide/fafsa.ts`. **VERIFY against the live
pages before real-user launch** (one source page is currently labeled 2025–26;
the mechanics cited are year-stable). English only — `es` is English fallback.

### Student citizenship status
- Three answer options, verbatim from source: **U.S. citizen or national** (citizen
  by birth or naturalization; nationals born in American Samoa/Swains Island),
  **Eligible noncitizen** (permanent resident with Green Card I-551; or I-94 showing
  Refugee, Asylum Granted, Parolee, T-Visa, or Cuban-Haitian Entrant; plus certain
  others), **Neither U.S. citizen nor eligible noncitizen** (includes DACA, F/M/J
  visas). Not eligible for federal aid — but a student with an SSN who is "neither"
  (e.g., DACA) may still complete the FAFSA for state/college aid.
- **Source:** <https://studentaid.gov/help/citizen>

### A-Number (Alien Registration Number)
- Enter the eight- or nine-digit A-Number; if eight digits, add a leading zero;
  don't enter the "A". Leave blank if you don't have one. Not required for citizens
  of the Freely Associated States (Micronesia, Marshall Islands, Palau). Document
  location (Green Card I-551 / immigration docs) drawn from the citizenship page.
- **Source:** <https://studentaid.gov/help/a-number> (format), <https://studentaid.gov/help/citizen> (documents)

### Identity fields (name, date of birth, SSN, mailing address)
- Enter your name/DOB/address exactly as on your legal ID and match your
  StudentAid.gov account; small mismatches (e.g., "Rd" vs "Road") can cause errors.
  SSN: enter your nine-digit SSN if you have one, else check the "no SSN" box and
  leave blank. **Do not enter an ITIN in the SSN field.**
- **Source:** <https://studentaid.gov/announcements-events/fafsa-support/contributor-social-security-number>
  (exact-match to legal ID, "Rd"/"Road" example, ITIN-not-in-SSN-field, no-SSN checkbox)

### Email / phone
- Use your own email and mobile number; each can be linked to only one
  StudentAid.gov account, and you can only have one account.
- **Source:** <https://studentaid.gov/help/fsa-id> (one FSA ID) + StudentAid.gov
  account-creation guidance (one email/phone/SSN per account)

**Placed in:** `walkthrough.fafsa.sections.studentIdentity.fields.{fullName,
dateOfBirth, ssn, email, phone, mailingAddress}.*` and
`…studentCitizenship.fields.{citizenshipStatus, alienRegistrationNumber}.*`.

---

## Sourced 2026-07-16 (this branch) — CADAA AB 540 / California residency

Guidance below was sourced from the California Student Aid Commission (CSAC).
**VERIFY against csac.ca.gov / dream.csac.ca.gov before real-user launch.**
English only — `es` is English fallback (no machine translation). Complements
the existing `ab540Eligibility` field (eligibility criteria) by explaining the
benefit and the affidavit.

### California residency (AB 540 nonresident tuition exemption)
- AB 540 exempts eligible students from nonresident (out-of-state) tuition, lets
  them pay in-state tuition, and lets them apply for state aid, at California
  public and private colleges. Qualify with 3+ years of full-time attendance (or
  equivalent credits) at California high schools / adult schools / community
  colleges, plus a California graduation path (CA high school diploma; CA
  GED/HiSET/TASC; CA community college associate degree or transfer
  requirements). The AB 540 affidavit is embedded in the CADAA — you affirm
  you'll legalize your immigration status as soon as eligible.
- **Source:** <https://www.csac.ca.gov/post/california-nonresident-tuition-exemption>

**Placed in:** `walkthrough.cadaa.sections.residencyAb540.fields.caResidency.*`.

---

## NOT yet sourced (stays `null` — next human pass)

FAFSA circumstances (marital/dependency/unusual), demographics (gender,
race/ethnicity), family size, remaining CADAA residency/AB540 document details,
and all Spanish/Vietnamese native review. Do not fill without an official source.
