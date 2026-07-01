export type FafsaRiskLevel = "low" | "medium" | "high";

export type FafsaStep = {
  planKey: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  estimatedTime: string;
  riskLevel: FafsaRiskLevel;
  whoIsInvolved: string;
  whyItMatters: string;
  whatYouNeed: string[];
  exactInstructions: string[];
  commonMistakes: string[];
  troubleshooting: string[];
  privacyReminder: string;
  primaryCtaLabel: string;
  nextPlanKey: string | null;
  previousPlanKey: string | null;
  followUpCtaLabel?: string;
  aidDecoderCtaLabel?: string;
};

export const FAFSA_STEPS: FafsaStep[] = [
  {
    planKey: "create-account",
    stepNumber: 1,
    title: "Create your StudentAid.gov account",
    subtitle: "Set up the official account you will use for FAFSA and federal student aid.",
    estimatedTime: "10–15 min",
    riskLevel: "medium",
    whoIsInvolved: "Student (and a parent or contributor if they need their own account later)",
    whyItMatters:
      "You cannot start or sign the FAFSA without a StudentAid.gov account. Creating it early prevents last-minute lockouts before school deadlines.",
    whatYouNeed: [
      "Your email address (one you check regularly)",
      "Your mobile phone for verification codes",
      "Your legal name as it appears on official documents",
    ],
    exactInstructions: [
      "Go to StudentAid.gov and choose Create Account.",
      "Enter your name, date of birth, and Social Security number on the official site only - never in AidPilot.",
      "Create a username and strong password you will remember.",
      "Verify your email and phone when prompted.",
      "Save your recovery options somewhere safe (not in AidPilot).",
    ],
    commonMistakes: [
      "Using a school email you might lose after graduation.",
      "Creating duplicate accounts when you forget login details.",
      "Letting a parent create the student account (students need their own).",
    ],
    troubleshooting: [
      "Account already exists? Use Forgot Username or Password on StudentAid.gov.",
      "Verification code not arriving? Check spam and try again in a few minutes.",
      "Name mismatch errors? Match your SSA record - contact SSA if needed before retrying.",
    ],
    privacyReminder:
      "Never enter your StudentAid.gov password or Social Security number into AidPilot. Complete account setup only on StudentAid.gov.",
    primaryCtaLabel: "Open StudentAid.gov",
    nextPlanKey: "identify-contributors",
    previousPlanKey: null,
  },
  {
    planKey: "identify-contributors",
    stepNumber: 2,
    title: "Figure out who must contribute",
    subtitle: "Know which parents or spouses must provide information on your FAFSA.",
    estimatedTime: "5–10 min",
    riskLevel: "high",
    whoIsInvolved: "Student plus parents, stepparents, or spouse as required by federal rules",
    whyItMatters:
      "Missing a required contributor delays processing and can reduce aid. Knowing who is involved early gives everyone time to create accounts.",
    whatYouNeed: [
      "Your living situation (who you live with and financial support)",
      "Parents' marital status",
      "Whether you are independent under federal rules (rare for undergraduates)",
    ],
    exactInstructions: [
      "Read the contributor rules on StudentAid.gov for your situation.",
      "List every person who must have a StudentAid.gov account and sign.",
      "Tell contributors they will receive an email invitation after you start FAFSA.",
      "If parents are divorced, confirm which parent(s) must contribute per federal rules.",
      "Mark this step complete once you know who is involved.",
    ],
    commonMistakes: [
      "Assuming only one parent is needed when both must contribute.",
      "Skipping a stepparent who lives in the household.",
      "Waiting until the night before the deadline to involve contributors.",
    ],
    troubleshooting: [
      "Unsure who counts? Use the Federal Student Aid help articles - not social media guesses.",
      "Contributor refuses to help? Talk to your school financial aid office about options.",
      "Independent student? Confirm you meet federal independence criteria before proceeding alone.",
    ],
    privacyReminder:
      "AidPilot does not collect contributor SSNs or tax data. Contributors enter sensitive info only on StudentAid.gov.",
    primaryCtaLabel: "Review contributor rules",
    nextPlanKey: "gather-records",
    previousPlanKey: "create-account",
  },
  {
    planKey: "gather-records",
    stepNumber: 3,
    title: "Gather tax and financial records",
    subtitle: "Collect the documents you and contributors need before starting FAFSA.",
    estimatedTime: "15–30 min",
    riskLevel: "medium",
    whoIsInvolved: "Student and each contributor",
    whyItMatters:
      "Having records ready speeds up FAFSA and reduces errors. Most families use the IRS Direct Data Exchange instead of typing numbers manually.",
    whatYouNeed: [
      "StudentAid.gov accounts for student and contributors",
      "List of schools you want on your FAFSA (up to 20)",
      "Cash, savings, and investment balances (approximate is OK to start)",
      "Note: IRS tax data is usually pulled automatically on StudentAid.gov",
    ],
    exactInstructions: [
      "Write down schools you are applying to or attending.",
      "Ask contributors to log in to StudentAid.gov and consent to IRS data transfer when prompted.",
      "List other income sources (child support, untaxed income) without entering amounts in AidPilot.",
      "Do not upload tax returns or IDs to AidPilot - only use the official FAFSA site.",
      "Keep paper records at home in case your school requests verification later.",
    ],
    commonMistakes: [
      "Typing old tax numbers manually when IRS transfer is available.",
      "Forgetting to list a school code before submitting.",
      "Uploading sensitive documents to non-official apps or email.",
    ],
    troubleshooting: [
      "IRS transfer fails? StudentAid.gov will show next steps - often retry or enter data manually on their site.",
      "Contributor tax data unavailable? They may need to file taxes or request a tax transcript from IRS.gov.",
      "School not found? Search by city or use the federal school code list on StudentAid.gov.",
    ],
    privacyReminder:
      "Do not upload tax returns, W-2s, or IDs to AidPilot. AidPilot is a checklist only - official data entry happens on StudentAid.gov.",
    primaryCtaLabel: "Continue to FAFSA prep",
    nextPlanKey: "start-fafsa",
    previousPlanKey: "identify-contributors",
  },
  {
    planKey: "start-fafsa",
    stepNumber: 4,
    title: "Start your FAFSA form",
    subtitle: "Open the official application and work through the student section.",
    estimatedTime: "30–45 min",
    riskLevel: "high",
    whoIsInvolved: "Student",
    whyItMatters:
      "Starting early reserves your place in line for aid and gives time to fix contributor or IRS issues before deadlines.",
    whatYouNeed: [
      "StudentAid.gov login",
      "School list from Step 3",
      "Contributor contact info",
    ],
    exactInstructions: [
      "Log in at StudentAid.gov and select Start FAFSA for the correct aid year.",
      "Answer student demographic and dependency questions carefully.",
      "Add every school you are considering - you can remove schools later.",
      "Save as you go; you can return without losing progress on StudentAid.gov.",
      "Stop before submitting if contributors are not ready - you will invite them next.",
    ],
    commonMistakes: [
      "Choosing the wrong aid year.",
      "Leaving schools off the list and missing aid from a college you later attend.",
      "Submitting before contributors complete their sections.",
    ],
    troubleshooting: [
      "Form won't load? Try another browser or clear cache - stay on StudentAid.gov only.",
      "Dependency questions confusing? Use the in-app help text on StudentAid.gov.",
      "Need a break? Save and exit - your progress stays on the federal site.",
    ],
    privacyReminder:
      "Complete the FAFSA only on StudentAid.gov. Never paste SSNs or passwords into AidPilot.",
    primaryCtaLabel: "Start FAFSA on StudentAid.gov",
    nextPlanKey: "invite-contributors",
    previousPlanKey: "gather-records",
  },
  {
    planKey: "invite-contributors",
    stepNumber: 5,
    title: "Invite your contributors",
    subtitle: "Send invitations so parents or spouses can complete their FAFSA sections.",
    estimatedTime: "10–20 min",
    riskLevel: "high",
    whoIsInvolved: "Student sends invites; contributors complete their sections",
    whyItMatters:
      "FAFSA cannot be processed until every required contributor signs. Inviting early prevents deadline surprises.",
    whatYouNeed: [
      "Contributor names and email addresses",
      "Contributors' StudentAid.gov accounts (or time for them to create one)",
    ],
    exactInstructions: [
      "From your in-progress FAFSA on StudentAid.gov, send contributor invitations.",
      "Tell contributors to check email and spam for the invitation.",
      "Contributors log in, complete their section, and sign electronically.",
      "Check FAFSA status on StudentAid.gov until all contributors show complete.",
      "Follow up with anyone who has not responded within a few days.",
    ],
    commonMistakes: [
      "Typo in contributor email - invitation never arrives.",
      "Contributor tries to use the student's login instead of their own account.",
      "Assuming submission is done when only the student section is finished.",
    ],
    troubleshooting: [
      "Invitation expired? Resend from StudentAid.gov.",
      "Contributor locked out? They reset password on StudentAid.gov, not AidPilot.",
      "Wrong contributor listed? Correct on StudentAid.gov before submitting.",
    ],
    privacyReminder:
      "Contributors enter tax and identity data only on StudentAid.gov. AidPilot never stores contributor financial information.",
    primaryCtaLabel: "Manage contributor invites",
    nextPlanKey: "review-submit",
    previousPlanKey: "start-fafsa",
  },
  {
    planKey: "review-submit",
    stepNumber: 6,
    title: "Review, sign, and submit",
    subtitle: "Double-check answers and submit your FAFSA to the Department of Education.",
    estimatedTime: "15–20 min",
    riskLevel: "high",
    whoIsInvolved: "Student and all contributors",
    whyItMatters:
      "Submission starts federal and school aid processing. Errors here can delay grants, loans, and work-study offers.",
    whatYouNeed: [
      "All contributor sections complete",
      "Final review time with contributors if possible",
    ],
    exactInstructions: [
      "On StudentAid.gov, open Review and confirm student and contributor sections.",
      "Fix any error flags before submitting.",
      "Each required person signs electronically.",
      "Submit and save your confirmation page or email.",
      "Note your Submission Summary availability date on StudentAid.gov.",
    ],
    commonMistakes: [
      "Submitting with missing contributor signatures.",
      "Ignoring error messages on the review screen.",
      "Losing confirmation - screenshot or print from StudentAid.gov.",
    ],
    troubleshooting: [
      "Submit button disabled? Check for incomplete contributor or student sections.",
      "Made a mistake after submit? You can make corrections on StudentAid.gov - see their correction guide.",
      "No confirmation email? Log in and verify status shows Submitted.",
    ],
    privacyReminder:
      "Your FAFSA submission happens only on StudentAid.gov. AidPilot does not submit FAFSA for you.",
    primaryCtaLabel: "Review on StudentAid.gov",
    nextPlanKey: "check-school-portals",
    previousPlanKey: "invite-contributors",
  },
  {
    planKey: "check-school-portals",
    stepNumber: 7,
    title: "Check your school portals",
    subtitle: "Monitor each college's financial aid and student portals after FAFSA submission.",
    estimatedTime: "10–15 min per school",
    riskLevel: "medium",
    whoIsInvolved: "Student",
    whyItMatters:
      "Schools often require extra forms, ID verification, or earlier deadlines than the federal FAFSA date. Missing portal tasks can reduce aid.",
    whatYouNeed: [
      "Student portal logins for each college",
      "FAFSA submission confirmation",
      "Email access for aid office messages",
    ],
    exactInstructions: [
      "Log in to each college's financial aid or student portal.",
      "Confirm the school received your FAFSA (may take a few days).",
      "Complete any supplemental forms (state aid, institutional aid, CSS Profile if required).",
      "Note each school's priority deadline - it may be earlier than June 30 federal cutoff.",
      "Set calendar reminders to recheck portals every two weeks.",
    ],
    commonMistakes: [
      "Assuming FAFSA alone satisfies every school's requirements.",
      "Missing a state grant application with an earlier deadline.",
      "Ignoring portal messages in a school email you rarely check.",
    ],
    troubleshooting: [
      "School does not show FAFSA? Wait 5–7 days, then call the aid office with your confirmation.",
      "Portal login issues? Use the school's IT help - not third-party apps.",
      "Conflicting deadlines? Follow the earliest date among federal, state, and school.",
    ],
    privacyReminder:
      "Use official school portals only. Do not send SSNs or tax documents through AidPilot.",
    primaryCtaLabel: "Open school portals",
    followUpCtaLabel: "Track school portals",
    nextPlanKey: "respond-verification",
    previousPlanKey: "review-submit",
  },
  {
    planKey: "respond-verification",
    stepNumber: 8,
    title: "Respond to verification requests",
    subtitle: "If selected for verification, submit documents through official channels only.",
    estimatedTime: "Varies",
    riskLevel: "high",
    whoIsInvolved: "Student, contributors, and school financial aid office",
    whyItMatters:
      "Verification holds can freeze aid until resolved. Responding quickly protects grants and loan eligibility.",
    whatYouNeed: [
      "Verification notice from school or StudentAid.gov",
      "Documents requested (usually via school portal)",
    ],
    exactInstructions: [
      "Read the verification letter carefully - requirements differ by school.",
      "Gather only the documents listed (often IRS transcript or signed statement).",
      "Upload or submit through the school portal or method they specify.",
      "Do not send tax returns to AidPilot or random email addresses.",
      "Follow up with the aid office if you do not hear back within two weeks.",
    ],
    commonMistakes: [
      "Submitting wrong document types.",
      "Sending documents to the wrong school when you listed multiple.",
      "Missing deadlines on verification - aid may be cancelled.",
    ],
    troubleshooting: [
      "Unclear request? Call the financial aid office and ask for a checklist.",
      "IRS transcript delay? Request at IRS.gov early.",
      "Data mismatch? Work with the aid office to file a FAFSA correction if needed.",
    ],
    privacyReminder:
      "Verification documents go to your school or federal systems - never upload them to AidPilot.",
    primaryCtaLabel: "Check verification status",
    followUpCtaLabel: "Track verification requests",
    nextPlanKey: "understand-aid-offers",
    previousPlanKey: "check-school-portals",
  },
  {
    planKey: "understand-aid-offers",
    stepNumber: 9,
    title: "Understand your aid offers and next steps",
    subtitle: "Compare offers, separate free money from loans, and plan your response.",
    estimatedTime: "20–30 min",
    riskLevel: "medium",
    whoIsInvolved: "Student and family",
    whyItMatters:
      "Aid offers are not all equal. Understanding grants vs. loans helps you avoid borrowing more than you need and meet acceptance deadlines.",
    whatYouNeed: [
      "Official aid letters or portal offers from schools",
      "Cost of attendance and family budget context",
    ],
    exactInstructions: [
      "Collect official aid offers from each school's portal or mail.",
      "Separate grants and scholarships (free money) from loans.",
      "Use AidPilot's Aid Offer Decoder to compare packages - enter amounts only, no SSNs.",
      "Note acceptance deadlines and required deposits for each school.",
      "Contact aid offices to appeal if your family's situation changed.",
    ],
    commonMistakes: [
      "Comparing schools using sticker price instead of net cost after grants.",
      "Accepting the full loan amount without needing it.",
      "Missing the deadline to accept work-study or institutional grants.",
    ],
    troubleshooting: [
      "No offer yet? Check portal and email; call aid office after posted timeline.",
      "Offer seems wrong? Ask for a line-item explanation from the aid office.",
      "Comparing multiple schools? Use the same cost categories in AidPilot's decoder.",
    ],
    privacyReminder:
      "Enter dollar amounts from aid letters in AidPilot's decoder only - never SSNs, account numbers, or passwords.",
    primaryCtaLabel: "Decode your aid offer",
    followUpCtaLabel: "Track aid offers",
    aidDecoderCtaLabel: "Decode aid offer",
    nextPlanKey: null,
    previousPlanKey: "respond-verification",
  },
];

const STEP_BY_KEY = new Map(FAFSA_STEPS.map((step) => [step.planKey, step]));

export const FAFSA_GUIDED_STEPS = FAFSA_STEPS;
export type FafsaGuidedStep = FafsaStep;

export function getFafsaStep(planKey: string): FafsaStep | null {
  return STEP_BY_KEY.get(planKey) ?? null;
}

export function getFafsaGuidedStep(planKey: string): FafsaStep | null {
  return getFafsaStep(planKey);
}

export function getFafsaStepHref(planKey: string): string {
  return `/fafsa/steps/${encodeURIComponent(planKey)}`;
}

export function getFafsaGuidedStepHref(planKey: string): string {
  return getFafsaStepHref(planKey);
}

export function getNextIncompleteStep(completedPlanKeys: string[]): FafsaStep | null {
  const completed = new Set(completedPlanKeys);
  return FAFSA_STEPS.find((step) => !completed.has(step.planKey)) ?? null;
}

export function getNextIncompleteGuidedStep(completedPlanKeys: string[]): FafsaStep | null {
  return getNextIncompleteStep(completedPlanKeys);
}

export function getGuidedProgressPercent(completedPlanKeys: string[]): number {
  if (FAFSA_STEPS.length === 0) return 0;
  const completed = completedPlanKeys.filter((key) => STEP_BY_KEY.has(key)).length;
  return Math.round((completed / FAFSA_STEPS.length) * 100);
}

export function getFollowUpTrackerHref(): string {
  return "/fafsa/follow-up";
}

export function getOfficialStudentAidUrl(step: FafsaStep): string {
  if (step.planKey === "understand-aid-offers") return "/aid-letter";
  return "https://studentaid.gov/h/apply-for-aid/fafsa";
}
