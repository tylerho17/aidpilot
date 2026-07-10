import { makeExplainer, makeSection, type WalkSection } from "./walkthrough-schema";

// CADAA walkthrough structure — the sections and fields a filer encounters on
// the California Dream Act Application.
//
// VERIFY this section/field structure against the current-year CADAA on
// dream.csac.ca.gov before launch. Structure only: every explanation is an i18n
// placeholder key (human-sourced later); nothing here is aid guidance.

export const CADAA_SECTIONS: WalkSection[] = [
  // CSAC account / contributor explainer — concept only, no fields.
  makeExplainer("cadaa", "contributorAccount"),

  makeSection("cadaa", "studentIdentity", [
    "fullName",
    "dateOfBirth",
    "ssnOrItin",
    // Sourced (content-source.md): undocumented/DACA/U-visa/TPS select "neither
    // citizen nor eligible noncitizen". VERIFY against dream.csac.ca.gov.
    "citizenshipStatus",
    "email",
    "phone",
    "mailingAddress",
  ]),

  makeSection("cadaa", "residencyAb540", ["caResidency", "ab540Eligibility"]),

  makeSection("cadaa", "studentCircumstances", ["maritalStatus", "dependencyStatus"]),

  makeSection("cadaa", "studentColleges", ["caCollegeList"]),

  // Financials sourced from dream.csac.ca.gov (content-source.md) — VERIFY
  // there. CADAA enters income MANUALLY; never reuse FAFSA IRS-import language.
  makeSection("cadaa", "studentFinancials", ["taxFilingStatus", "studentIncome", "studentAssets"]),

  makeSection("cadaa", "parentInformation", ["parentFullName", "parentDateOfBirth", "parentEmail"]),

  // Sourced from dream.csac.ca.gov (content-source.md) — VERIFY there.
  makeSection("cadaa", "parentFinancials", [
    "parentTaxFilingStatus",
    "parentIncome",
    "parentAssets",
    "familySize",
  ]),

  makeSection("cadaa", "reviewAndSign", ["studentSignature", "parentSignature"]),
];
