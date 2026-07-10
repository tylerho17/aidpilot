import { makeExplainer, makeSection, type WalkSection } from "./walkthrough-schema";

// FAFSA walkthrough structure — the sections and fields a filer encounters on
// the simplified (post-2024) FAFSA, student + parent contributor.
//
// VERIFY this section/field structure against the current award-year FAFSA on
// studentaid.gov before launch. Structure only: every explanation is an i18n
// placeholder key (human-sourced later); nothing here is aid guidance.

export const FAFSA_SECTIONS: WalkSection[] = [
  // Contributor / FSA ID explainer — concept only, no fields, no data collected.
  makeExplainer("fafsa", "contributorFsaId"),

  makeSection("fafsa", "studentIdentity", [
    "fullName",
    "dateOfBirth",
    "ssn",
    "email",
    "phone",
    "mailingAddress",
  ]),

  makeSection("fafsa", "studentCitizenship", ["citizenshipStatus", "alienRegistrationNumber"]),

  makeSection("fafsa", "studentCircumstances", [
    "maritalStatus",
    "dependencyStatus",
    "unusualCircumstances",
  ]),

  makeSection("fafsa", "studentDemographics", ["gender", "raceEthnicity"]),

  makeSection("fafsa", "studentColleges", ["collegeList"]),

  makeSection("fafsa", "studentFinancials", [
    "irsDataConsent",
    "taxFilingStatus",
    "studentIncome",
    "studentAssets",
  ]),

  makeSection("fafsa", "parentContributor", [
    "parentFullName",
    "parentDateOfBirth",
    "parentSsnStatus",
    "parentEmail",
  ]),

  makeSection("fafsa", "parentFinancials", [
    "parentIrsDataConsent",
    "parentTaxFilingStatus",
    "parentIncome",
    "parentAssets",
    "familySize",
  ]),

  makeSection("fafsa", "reviewAndSign", ["studentSignature", "parentSignature"]),
];
