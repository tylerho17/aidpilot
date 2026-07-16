import type { GuideSection } from "./schema";

// California Dream Act Application guide content. CADAA enters income MANUALLY - never reuse FAFSA IRS-import language.
//
// Ported VERBATIM from the v1-pilot branch (lib/v1/cadaa.sections.ts +
// messages/{en,es}.json, es.overrides.json taking precedence) by
// scripts in the overhaul-ui-revamp work. Unsourced placeholder helper slots
// were dropped at port time and render as null - never edit this content by
// paraphrasing; source new text the same way the originals were sourced.
//
// VERIFY this section/field structure against the current award-year form
// before real-user launch.

export const CADAA_GUIDE: GuideSection[] = [
  {
    "sectionKey": "contributorAccount",
    "title": {
      "en": "Your CSAC account & contributors",
      "es": "Your CSAC account & contributors"
    },
    "explainer": true,
    "body": {
      "en": "The California Dream Act Application (CADAA) is California’s state aid application. Undocumented students file it INSTEAD of the FAFSA to get state and institutional aid — Cal Grants, community college fee waivers, university grants, private scholarships — and in-state tuition. It does NOT provide federal aid.\n\nDACA students file the CADAA, not the FAFSA.\n\nU.S. citizens and green-card holders with undocumented parent(s) or spouse may file the CADAA instead of the FAFSA if they don’t want to submit a FAFSA — doing so forgoes federal aid.\n\nCreate your login at dream.csac.ca.gov before you start.\n\nWhat you’ll need: an ITIN if you or your parents file taxes with one (no SSN? leave it blank or enter all zeroes), your 2024 tax information and W-2s (the 2026–27 form uses 2024 tax information), records of untaxed income such as child support received, and current balances of checking, savings, and any investments — plus business or farm records if that applies.\n\nFile as early as you can — the form opens around October 1. Much state aid is first-come, first-served, and California’s priority deadline is March 2.",
      "es": "La CADAA es la solicitud estatal de California; los estudiantes indocumentados la presentan en lugar de la FAFSA para recibir ayuda estatal (Cal Grants, exención de cuotas en colegios comunitarios, becas institucionales) y pagar matrícula estatal. No otorga ayuda federal.\n\nDACA students file the CADAA, not the FAFSA.\n\nU.S. citizens and green-card holders with undocumented parent(s) or spouse may file the CADAA instead of the FAFSA if they don’t want to submit a FAFSA — doing so forgoes federal aid.\n\nCreate your login at dream.csac.ca.gov before you start.\n\nLo que necesitarás: tu número de Seguro Social si lo tienes (para la CADAA, un ITIN o déjalo en blanco o con ceros), tu declaración de impuestos federales de 2024 y formularios W-2, registros de ingresos no tributables, y los saldos actuales de tus cuentas bancarias e inversiones.\n\nFile as early as you can — the form opens around October 1. Much state aid is first-come, first-served, and California’s priority deadline is March 2."
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
        "fieldKey": "ssnOrItin",
        "label": {
          "en": "SSN or ITIN (if you have one)",
          "es": "SSN or ITIN (if you have one)"
        },
        "whatItMeans": {
          "en": "Entering an SSN or ITIN is optional. Enter your ITIN if you have one; if you have neither, leave it blank or enter all zeroes.",
          "es": "Entering an SSN or ITIN is optional. Enter your ITIN if you have one; if you have neither, leave it blank or enter all zeroes."
        },
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "citizenshipStatus",
        "label": {
          "en": "Citizenship status",
          "es": "Citizenship status"
        },
        "whatItMeans": {
          "en": "Undocumented, DACA, U-visa, and TPS students select “neither citizen nor eligible noncitizen.”",
          "es": "Undocumented, DACA, U-visa, and TPS students select “neither citizen nor eligible noncitizen.”"
        },
        "documentNeeded": null,
        "commonError": {
          "en": "Indicating you are a citizen or eligible noncitizen redirects you to the FAFSA.",
          "es": "Indicating you are a citizen or eligible noncitizen redirects you to the FAFSA."
        }
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
    "sectionKey": "residencyAb540",
    "title": {
      "en": "California residency & AB 540",
      "es": "California residency & AB 540"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "caResidency",
        "label": {
          "en": "California residency",
          "es": "California residency"
        },
        "whatItMeans": {
          "en": "AB 540 (the California Nonresident Tuition Exemption) lets eligible students pay in-state tuition instead of the much higher nonresident tuition, and apply for state aid, at California public and private colleges. You generally qualify with 3 or more years of full-time attendance (or equivalent credits) at California high schools, adult schools, or community colleges, plus graduating from a California high school — or a California GED/HiSET/TASC, or a California community college associate degree or transfer requirements.",
          "es": "AB 540 (the California Nonresident Tuition Exemption) lets eligible students pay in-state tuition instead of the much higher nonresident tuition, and apply for state aid, at California public and private colleges. You generally qualify with 3 or more years of full-time attendance (or equivalent credits) at California high schools, adult schools, or community colleges, plus graduating from a California high school — or a California GED/HiSET/TASC, or a California community college associate degree or transfer requirements."
        },
        "documentNeeded": {
          "en": "Records of your California school attendance and graduation — a high school transcript or diploma, a California GED/HiSET/TASC certificate, or community college records.",
          "es": "Records of your California school attendance and graduation — a high school transcript or diploma, a California GED/HiSET/TASC certificate, or community college records."
        },
        "commonError": {
          "en": "Thinking you file a separate AB 540 form. The AB 540 affidavit is built into the CADAA — you sign it to affirm you’ll legalize your immigration status as soon as you’re eligible. Still check with your college in case it needs additional steps.",
          "es": "Thinking you file a separate AB 540 form. The AB 540 affidavit is built into the CADAA — you sign it to affirm you’ll legalize your immigration status as soon as you’re eligible. Still check with your college in case it needs additional steps."
        }
      },
      {
        "fieldKey": "ab540Eligibility",
        "label": {
          "en": "AB 540 eligibility",
          "es": "AB 540 eligibility"
        },
        "whatItMeans": {
          "en": "AB 540 generally means 3 years at California schools plus graduation. The AB 540 affidavit is embedded in the CADAA.",
          "es": "AB 540 generally means 3 years at California schools plus graduation. The AB 540 affidavit is embedded in the CADAA."
        },
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
        "fieldKey": "caCollegeList",
        "label": {
          "en": "California colleges to receive your information",
          "es": "California colleges to receive your information"
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
        "fieldKey": "taxFilingStatus",
        "label": {
          "en": "Tax filing status",
          "es": "Tax filing status"
        },
        "whatItMeans": {
          "en": "If you haven’t filed your 2024 taxes yet, choose “will file,” use estimates, and update after filing. If you choose “not going to file,” you still report income — W-2 box 1 plus box 8, or net profit if self-employed.",
          "es": "If you haven’t filed your 2024 taxes yet, choose “will file,” use estimates, and update after filing. If you choose “not going to file,” you still report income — W-2 box 1 plus box 8, or net profit if self-employed."
        },
        "documentNeeded": {
          "en": "W-2s (box 1 and box 8), or records of net profit if self-employed.",
          "es": "W-2s (box 1 and box 8), or records of net profit if self-employed."
        },
        "commonError": {
          "en": "Earning over the IRS filing threshold flags the form and requires getting an ITIN and filing.",
          "es": "Earning over the IRS filing threshold flags the form and requires getting an ITIN and filing."
        }
      },
      {
        "fieldKey": "studentIncome",
        "label": {
          "en": "Student income",
          "es": "Student income"
        },
        "whatItMeans": {
          "en": "The 2026–27 CADAA uses 2024 tax information. The CADAA does not import IRS data — you enter income and tax information manually.",
          "es": "The 2026–27 CADAA uses 2024 tax information. The CADAA does not import IRS data — you enter income and tax information manually."
        },
        "documentNeeded": null,
        "commonError": null
      },
      {
        "fieldKey": "studentAssets",
        "label": {
          "en": "Student assets",
          "es": "Student assets"
        },
        "whatItMeans": null,
        "documentNeeded": null,
        "commonError": null
      }
    ]
  },
  {
    "sectionKey": "parentInformation",
    "title": {
      "en": "Parent — identity",
      "es": "Parent — identity"
    },
    "explainer": false,
    "fields": [
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
      "en": "Parent — financials",
      "es": "Parent — financials"
    },
    "explainer": false,
    "fields": [
      {
        "fieldKey": "parentTaxFilingStatus",
        "label": {
          "en": "Parent tax filing status",
          "es": "Parent tax filing status"
        },
        "whatItMeans": {
          "en": "If they haven’t filed their 2024 taxes yet, choose “will file,” use estimates, and update after filing. If “not going to file,” income is still reported — W-2 box 1 plus box 8, or net profit if self-employed.",
          "es": "If they haven’t filed their 2024 taxes yet, choose “will file,” use estimates, and update after filing. If “not going to file,” income is still reported — W-2 box 1 plus box 8, or net profit if self-employed."
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
        "whatItMeans": {
          "en": "Dependent students provide parent household and income information.",
          "es": "Dependent students provide parent household and income information."
        },
        "documentNeeded": null,
        "commonError": {
          "en": "If circumstances changed, complete the form as best you can, submit, then talk to the school’s financial aid office.",
          "es": "If circumstances changed, complete the form as best you can, submit, then talk to the school’s financial aid office."
        }
      },
      {
        "fieldKey": "parentAssets",
        "label": {
          "en": "Parent assets",
          "es": "Parent assets"
        },
        "whatItMeans": null,
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
        "whatItMeans": {
          "en": "After you submit, CSAC emails a nine-digit Dream ID. Use it to create a WebGrants 4 Students account to check your status.",
          "es": "After you submit, CSAC emails a nine-digit Dream ID. Use it to create a WebGrants 4 Students account to check your status."
        },
        "documentNeeded": {
          "en": "Cal Grant GPA verification — submit it by March 2.",
          "es": "Cal Grant GPA verification — submit it by March 2."
        },
        "commonError": null
      },
      {
        "fieldKey": "parentSignature",
        "label": {
          "en": "Parent signature",
          "es": "Parent signature"
        },
        "whatItMeans": {
          "en": "For dependent students, the parent signs with a Parent PIN.",
          "es": "For dependent students, the parent signs with a Parent PIN."
        },
        "documentNeeded": null,
        "commonError": {
          "en": "Save the Parent PIN — it’s reused every year.",
          "es": "Save the Parent PIN — it’s reused every year."
        }
      }
    ]
  }
];
