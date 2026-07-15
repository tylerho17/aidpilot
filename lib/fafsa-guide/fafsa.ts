import type { GuideSection } from "./schema";

// FAFSA guide content - the sections and fields a filer encounters on the simplified (post-2024) FAFSA, student + parent contributor.
//
// Ported VERBATIM from the v1-pilot branch (lib/v1/fafsa.sections.ts +
// messages/{en,es}.json, es.overrides.json taking precedence) by
// scripts in the overhaul-ui-revamp work. Unsourced placeholder helper slots
// were dropped at port time and render as null - never edit this content by
// paraphrasing; source new text the same way the originals were sourced.
//
// VERIFY this section/field structure against the current award-year form
// before real-user launch.

export const FAFSA_GUIDE: GuideSection[] = [
  {
    "sectionKey": "contributorFsaId",
    "title": {
      "en": "Contributors & the FSA ID",
      "es": "Contributors & the FSA ID"
    },
    "explainer": true,
    "body": {
      "en": "A contributor is anyone required to provide information on the FAFSA: you (the student), your spouse, a biological or adoptive parent, or a parent’s spouse (stepparent). Grandparents, foster parents, legal guardians, siblings, and aunts or uncles are NOT contributors. Being a contributor does not make someone responsible for paying for college.\n\nEvery student and contributor needs their own StudentAid.gov account (FSA ID). It is a legally binding signature — never share it. For 2026–27, verification is instant for SSN holders (no more 1–3 day wait). You’ll need: your SSN (if you have one), full legal name, date of birth, your own email, and your own mobile number.\n\nA parent or spouse without an SSN CAN make an account and complete their section — they verify with an ITIN, mailing address, and ID documents, which can take longer.\n\nYou and every contributor must give consent to import IRS tax information — even if they didn’t file a tax return. If anyone refuses consent, no federal aid.\n\nWhat you’ll need: your Social Security number if you have one, your 2024 federal tax return and W-2s (the 2026–27 form uses 2024 tax information), records of untaxed income such as child support received, and current balances of checking, savings, and any investments — plus business or farm records if that applies.\n\nCreate your StudentAid.gov account before you start.\n\nFile as early as you can — the form opens around October 1. Much state aid is first-come, first-served, and California’s priority deadline is March 2.",
      "es": "Un contribuyente es cualquier persona que debe proporcionar información en la FAFSA: el estudiante, su cónyuge, un padre biológico o adoptivo, o el cónyuge de un padre. Los abuelos, tutores legales, padres de crianza y hermanos no son contribuyentes. Ser contribuyente no te hace responsable de pagar los estudios.\n\nEvery student and contributor needs their own StudentAid.gov account (FSA ID). It is a legally binding signature — never share it. For 2026–27, verification is instant for SSN holders (no more 1–3 day wait). You’ll need: your SSN (if you have one), full legal name, date of birth, your own email, and your own mobile number.\n\nA parent or spouse without an SSN CAN make an account and complete their section — they verify with an ITIN, mailing address, and ID documents, which can take longer.\n\nYou and every contributor must give consent to import IRS tax information — even if they didn’t file a tax return. If anyone refuses consent, no federal aid.\n\nLo que necesitarás: tu número de Seguro Social si lo tienes (para la CADAA, un ITIN o déjalo en blanco o con ceros), tu declaración de impuestos federales de 2024 y formularios W-2, registros de ingresos no tributables, y los saldos actuales de tus cuentas bancarias e inversiones.\n\nCreate your StudentAid.gov account before you start.\n\nFile as early as you can — the form opens around October 1. Much state aid is first-come, first-served, and California’s priority deadline is March 2."
    },
    "fields": []
  },
  {
    "sectionKey": "studentIdentity",
    "title": {
      "en": "Student — personal information",
      "es": "Student — personal information"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "fullName",
        "label": {
          "en": "Full legal name",
          "es": "Full legal name"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "dateOfBirth",
        "label": {
          "en": "Date of birth",
          "es": "Date of birth"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "ssn",
        "label": {
          "en": "Social Security Number",
          "es": "Social Security Number"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "email",
        "label": {
          "en": "Email address",
          "es": "Email address"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "phone",
        "label": {
          "en": "Phone number",
          "es": "Phone number"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "mailingAddress",
        "label": {
          "en": "Mailing address",
          "es": "Mailing address"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "studentCitizenship",
    "title": {
      "en": "Student — citizenship status",
      "es": "Student — citizenship status"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "citizenshipStatus",
        "label": {
          "en": "Citizenship status",
          "es": "Citizenship status"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "alienRegistrationNumber",
        "label": {
          "en": "A-Number (Alien Registration Number)",
          "es": "A-Number (Alien Registration Number)"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "studentCircumstances",
    "title": {
      "en": "Student — circumstances",
      "es": "Student — circumstances"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "maritalStatus",
        "label": {
          "en": "Marital status",
          "es": "Marital status"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "dependencyStatus",
        "label": {
          "en": "Dependency questions",
          "es": "Dependency questions"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "unusualCircumstances",
        "label": {
          "en": "Unusual circumstances",
          "es": "Unusual circumstances"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "studentDemographics",
    "title": {
      "en": "Student — demographics",
      "es": "Student — demographics"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "gender",
        "label": {
          "en": "Gender",
          "es": "Gender"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "raceEthnicity",
        "label": {
          "en": "Race and ethnicity",
          "es": "Race and ethnicity"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "studentColleges",
    "title": {
      "en": "Student — colleges",
      "es": "Student — colleges"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "collegeList",
        "label": {
          "en": "Colleges to receive your information",
          "es": "Colleges to receive your information"
        },
        "whatItMeans": {
          "en": "You can list up to 20 colleges. Add any school you might apply to, even if you’re unsure — you can remove one later.",
          "es": "You can list up to 20 colleges. Add any school you might apply to, even if you’re unsure — you can remove one later."
        },
        "documentNeeded": null,
        "commonError": {
          "en": "Adding a school late can cost you aid — add every school you might apply to now; you can remove one later.",
          "es": "Adding a school late can cost you aid — add every school you might apply to now; you can remove one later."
        }
      }
    ]
  },
  {
    "sectionKey": "studentFinancials",
    "title": {
      "en": "Student — financials",
      "es": "Student — financials"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "irsDataConsent",
        "label": {
          "en": "Consent to transfer federal tax information",
          "es": "Consent to transfer federal tax information"
        },
        "whatItMeans": {
          "en": "You and each contributor must give consent and approval to import federal tax information from the IRS — required for federal aid even if you didn’t file taxes. Once you consent, your 2024 tax data imports automatically, and you won’t be able to see or edit the imported numbers (a security feature).",
          "es": "Tú y cada contribuyente deben dar su consentimiento para importar la información tributaria federal del IRS. Es obligatorio para recibir ayuda federal, incluso si no declaraste impuestos; si alguien se niega, no recibirás ayuda federal."
        },
        "documentNeeded": null,
        "commonError": {
          "en": "If anyone refuses consent, no federal aid.",
          "es": "If anyone refuses consent, no federal aid."
        }
      },
      {
        "fieldKey": "taxFilingStatus",
        "label": {
          "en": "Tax filing status",
          "es": "Tax filing status"
        },
        "whatItMeans": {
          "en": "If you didn’t file a 2024 tax return, use your 2024 income information and enter 0 where questions don’t apply.",
          "es": "If you didn’t file a 2024 tax return, use your 2024 income information and enter 0 where questions don’t apply."
        },
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "studentIncome",
        "label": {
          "en": "Student income",
          "es": "Student income"
        },
        "whatItMeans": {
          "en": "The 2026–27 form uses your 2024 tax information.",
          "es": "The 2026–27 form uses your 2024 tax information."
        },
        "documentNeeded": {
          "en": "Your 2024 federal tax return and W-2s, plus records of untaxed income such as child support received.",
          "es": "Your 2024 federal tax return and W-2s, plus records of untaxed income such as child support received."
        },
        "commonError": null
      },
      {
        "fieldKey": "studentAssets",
        "label": {
          "en": "Student assets",
          "es": "Student assets"
        },
        "whatItMeans": {
          "en": "Report the current balances of your cash, savings, and investments as of the day you sign — not the tax-year amounts.",
          "es": "Report the current balances of your cash, savings, and investments as of the day you sign — not the tax-year amounts."
        },
        "documentNeeded": {
          "en": "Current balances of checking, savings, and any investments — plus business or farm records if that applies.",
          "es": "Current balances of checking, savings, and any investments — plus business or farm records if that applies."
        },
        "commonError": {
          "en": "Don’t include your parents’ assets in your section — report your own assets; your parent reports theirs separately.",
          "es": "Don’t include your parents’ assets in your section — report your own assets; your parent reports theirs separately."
        }
      }
    ]
  },
  {
    "sectionKey": "parentContributor",
    "title": {
      "en": "Parent contributor — identity",
      "es": "Parent contributor — identity"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "whichParent",
        "label": {
          "en": "Which parent(s) must contribute",
          "es": "Which parent(s) must contribute"
        },
        "whatItMeans": {
          "en": "If your parents are married or living together, both parents’ information goes on the FAFSA — both are contributors unless they filed taxes jointly (then one reports for both). If they are divorced or separated and NOT living together, only the parent who gave you more financial support in the last 12 months files; if support was equal, the one with higher income and assets. This replaced the old “who you live with” rule.",
          "es": "If your parents are married or living together, both parents’ information goes on the FAFSA — both are contributors unless they filed taxes jointly (then one reports for both). If they are divorced or separated and NOT living together, only the parent who gave you more financial support in the last 12 months files; if support was equal, the one with higher income and assets. This replaced the old “who you live with” rule."
        },
        "documentNeeded": {
          "en": "None — use the free “Who’s My FAFSA Parent?” wizard on StudentAid.gov (no account needed).",
          "es": "None — use the free “Who’s My FAFSA Parent?” wizard on StudentAid.gov (no account needed)."
        },
        "commonError": {
          "en": "If the filing parent remarried, the stepparent’s information is required — prenuptial agreements are ignored.",
          "es": "If the filing parent remarried, the stepparent’s information is required — prenuptial agreements are ignored."
        }
      },
      {
        "fieldKey": "parentFullName",
        "label": {
          "en": "Parent full legal name",
          "es": "Parent full legal name"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "parentDateOfBirth",
        "label": {
          "en": "Parent date of birth",
          "es": "Parent date of birth"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "parentSsnStatus",
        "label": {
          "en": "Parent Social Security Number",
          "es": "Parent Social Security Number"
        },
        "whatItMeans": {
          "en": "A parent or spouse without an SSN CAN make a StudentAid.gov account and complete their section. They verify with an ITIN, mailing address, and ID documents, which can take longer. They can enter income without a tax return and are not asked about citizenship status.",
          "es": "Un padre o madre sin número de Seguro Social puede crear una cuenta y completar su sección; se verifica con su ITIN, dirección postal y documentos de identidad, lo cual puede tardar más."
        },
        "documentNeeded": {
          "en": "ITIN (if they have one), mailing address, and ID documents.",
          "es": "ITIN (if they have one), mailing address, and ID documents."
        },
        "commonError": {
          "en": "On the invite, check “my parent doesn’t have an SSN” — it then asks for the parent’s mailing address, which must match the address on their FSA ID or the accounts won’t link.",
          "es": "On the invite, check “my parent doesn’t have an SSN” — it then asks for the parent’s mailing address, which must match the address on their FSA ID or the accounts won’t link."
        }
      },
      {
        "fieldKey": "parentEmail",
        "label": {
          "en": "Parent email address",
          "es": "Parent email address"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "parentFinancials",
    "title": {
      "en": "Parent contributor — financials",
      "es": "Parent contributor — financials"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "parentIrsDataConsent",
        "label": {
          "en": "Parent consent to transfer federal tax information",
          "es": "Parent consent to transfer federal tax information"
        },
        "whatItMeans": {
          "en": "Every contributor must give consent and approval to import federal tax information from the IRS — even if they didn’t file a tax return. Once they consent, their 2024 tax data imports automatically and can’t be seen or edited (a security feature).",
          "es": "Every contributor must give consent and approval to import federal tax information from the IRS — even if they didn’t file a tax return. Once they consent, their 2024 tax data imports automatically and can’t be seen or edited (a security feature)."
        },
        "documentNeeded": null,
        "commonError": {
          "en": "If any contributor refuses consent, no federal aid.",
          "es": "If any contributor refuses consent, no federal aid."
        }
      },
      {
        "fieldKey": "parentTaxFilingStatus",
        "label": {
          "en": "Parent tax filing status",
          "es": "Parent tax filing status"
        },
        "whatItMeans": {
          "en": "If they didn’t file a 2024 tax return, use their 2024 income information and enter 0 where questions don’t apply.",
          "es": "If they didn’t file a 2024 tax return, use their 2024 income information and enter 0 where questions don’t apply."
        },
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "parentIncome",
        "label": {
          "en": "Parent income",
          "es": "Parent income"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": {
          "en": "If income dropped since 2024 (a job loss, for example), complete the form as instructed, then contact the school’s financial aid office to request an aid adjustment — you can’t update a processed FAFSA with new tax information yourself.",
          "es": "If income dropped since 2024 (a job loss, for example), complete the form as instructed, then contact the school’s financial aid office to request an aid adjustment — you can’t update a processed FAFSA with new tax information yourself."
        }
      },
      {
        "fieldKey": "parentAssets",
        "label": {
          "en": "Parent assets",
          "es": "Parent assets"
        },
        "whatItMeans": {
          "en": "Report the current balances of cash, savings, and investments as of the day you sign — not the tax-year amounts. Parents report their assets separately from the student’s.",
          "es": "Report the current balances of cash, savings, and investments as of the day you sign — not the tax-year amounts. Parents report their assets separately from the student’s."
        },
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "familySize",
        "label": {
          "en": "Family size",
          "es": "Family size"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "reviewAndSign",
    "title": {
      "en": "Review & sign",
      "es": "Review & sign"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "studentSignature",
        "label": {
          "en": "Student signature",
          "es": "Student signature"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "parentSignature",
        "label": {
          "en": "Parent signature",
          "es": "Parent signature"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  }
];
