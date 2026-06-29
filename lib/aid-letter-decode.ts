export type AidOfferInput = {
  school_name: string;
  cost_of_attendance: number;
  grants: number;
  scholarships: number;
  work_study: number;
  subsidized_loans: number;
  unsubsidized_loans: number;
  parent_plus_loans: number;
  private_loans: number;
};

export type AidOfferWarning = {
  id: "parent_plus" | "private_loan" | "loan_heavy" | "loan_high" | "gap" | "general";
  title: string;
  message: string;
  tone: "amber" | "red" | "blue";
};

export type AidOfferLoanBreakdown = {
  subsidized: number;
  unsubsidized: number;
  parentPlus: number;
  private: number;
};

export type AidOfferDecode = {
  totalFreeMoney: number;
  totalLoans: number;
  netCostAfterFreeMoney: number;
  estimatedGapAfterAllAid: number;
  loanBreakdown: AidOfferLoanBreakdown;
  warnings: AidOfferWarning[];
};

const LOAN_HIGH_COA_RATIO = 0.5;
const LOAN_HIGH_ABSOLUTE = 15000;
const GAP_WARNING_THRESHOLD = 1000;

export const LOAN_TYPE_EXPLANATIONS = {
  subsidized:
    "Generally the safer federal student loan — the government may pay interest while you are in school at least half-time.",
  unsubsidized:
    "Federal loan where interest can build while you are in school. You are responsible for all interest over time.",
  parentPlus:
    "A federal loan in your parent's name. Your parent is responsible for repayment, not you.",
  private:
    "From a bank or lender, not the government. Compare rates, cosigner rules, and repayment terms carefully before accepting.",
} as const;

export function decodeAidOffer(input: AidOfferInput): AidOfferDecode {
  const coa = Math.max(0, input.cost_of_attendance);
  const grants = Math.max(0, input.grants);
  const scholarships = Math.max(0, input.scholarships);
  const workStudy = Math.max(0, input.work_study);

  const loanBreakdown: AidOfferLoanBreakdown = {
    subsidized: Math.max(0, input.subsidized_loans),
    unsubsidized: Math.max(0, input.unsubsidized_loans),
    parentPlus: Math.max(0, input.parent_plus_loans),
    private: Math.max(0, input.private_loans),
  };

  const totalFreeMoney = grants + scholarships;
  const totalLoans =
    loanBreakdown.subsidized +
    loanBreakdown.unsubsidized +
    loanBreakdown.parentPlus +
    loanBreakdown.private;

  const netCostAfterFreeMoney = Math.max(0, coa - totalFreeMoney);
  const estimatedGapAfterAllAid = Math.max(0, coa - totalFreeMoney - workStudy - totalLoans);

  const warnings = buildAidOfferWarnings({
    coa,
    totalFreeMoney,
    totalLoans,
    estimatedGapAfterAllAid,
    workStudy,
    loanBreakdown,
  });

  return {
    totalFreeMoney,
    totalLoans,
    netCostAfterFreeMoney,
    estimatedGapAfterAllAid,
    loanBreakdown,
    warnings,
  };
}

function buildAidOfferWarnings({
  coa,
  totalFreeMoney,
  totalLoans,
  estimatedGapAfterAllAid,
  workStudy,
  loanBreakdown,
}: {
  coa: number;
  totalFreeMoney: number;
  totalLoans: number;
  estimatedGapAfterAllAid: number;
  workStudy: number;
  loanBreakdown: AidOfferLoanBreakdown;
}): AidOfferWarning[] {
  const warnings: AidOfferWarning[] = [];

  if (coa <= 0) {
    warnings.push({
      id: "general",
      title: "AidPilot heads-up",
      message:
        "Enter your cost of attendance to decode your offer. Use the official aid letter or portal from your school.",
      tone: "blue",
    });
    return warnings;
  }

  if (loanBreakdown.parentPlus > 0) {
    warnings.push({
      id: "parent_plus",
      title: "Parent debt warning",
      message: `Your package includes $${loanBreakdown.parentPlus.toLocaleString()} in Parent PLUS loans. That debt is in your parent's name — talk together about repayment before accepting.`,
      tone: "amber",
    });
  }

  if (loanBreakdown.private > 0) {
    warnings.push({
      id: "private_loan",
      title: "Private loan caution",
      message: `You listed $${loanBreakdown.private.toLocaleString()} in private loans. These often have fewer protections than federal loans — compare interest rates and read terms closely with your family.`,
      tone: "red",
    });
  }

  if (totalLoans > totalFreeMoney && totalLoans > 0) {
    warnings.push({
      id: "loan_heavy",
      title: "Loan-heavy package",
      message: `Loans ($${totalLoans.toLocaleString()}) exceed free money ($${totalFreeMoney.toLocaleString()}). See if you can increase grants, scholarships, or work-study before accepting every loan offered.`,
      tone: "amber",
    });
  }

  if (totalLoans > 0) {
    const loanShareOfCoa = totalLoans / coa;
    if (loanShareOfCoa >= LOAN_HIGH_COA_RATIO || totalLoans >= LOAN_HIGH_ABSOLUTE) {
      warnings.push({
        id: "loan_high",
        title: "High borrowing level",
        message: `Loans make up about ${Math.round(loanShareOfCoa * 100)}% of your cost of attendance ($${totalLoans.toLocaleString()} total). Borrow only what you need and ask your aid office for repayment estimates.`,
        tone: "red",
      });
    }
  }

  if (estimatedGapAfterAllAid >= GAP_WARNING_THRESHOLD) {
    warnings.push({
      id: "gap",
      title: "AidPilot heads-up",
      message: `After free money, work-study, and loans, about $${estimatedGapAfterAllAid.toLocaleString()} may still be uncovered. Look at outside scholarships, payment plans, or a careful appeal — confirm with your financial aid office.`,
      tone: "blue",
    });
  } else if (totalFreeMoney < coa * 0.25 && totalLoans > 0) {
    warnings.push({
      id: "general",
      title: "AidPilot heads-up",
      message:
        "Free money covers less than a quarter of your cost. Your package relies heavily on loans — double-check each line item with your school.",
      tone: "blue",
    });
  } else if (estimatedGapAfterAllAid === 0 && totalLoans > 0) {
    warnings.push({
      id: "general",
      title: "AidPilot heads-up",
      message:
        "Listed aid appears to cover your cost of attendance, but loans must be repaid. Accept only what you need and understand interest terms before signing.",
      tone: "blue",
    });
  } else if (totalFreeMoney >= coa && totalLoans === 0 && workStudy === 0) {
    warnings.push({
      id: "general",
      title: "AidPilot heads-up",
      message:
        "Your listed free money meets or exceeds cost of attendance on paper. Still confirm what's renewable each year and what you must accept by deadline.",
      tone: "blue",
    });
  }

  return warnings;
}

export function parseAidAmount(value: string) {
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function formatAidAmountInput(value: number) {
  return value > 0 ? String(value) : "";
}
