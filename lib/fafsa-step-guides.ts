import type { FafsaStage } from "@/lib/types";

const STUDENTAID_URL = "https://studentaid.gov/h/apply-for-aid/fafsa";
const CREATE_ACCOUNT_URL = "https://studentaid.gov/fsa-id/create-account";

export const FAFSA_STEP_PRIVACY_REMINDER =
  "Never enter your Social Security number, FAFSA password, bank account numbers, or tax return values into AidPilot. Complete those only on StudentAid.gov or your school's official portal.";

export type FafsaStepGuide = {
  plan_key: string;
  title: string;
  stage: FafsaStage;
  why_it_matters: string;
  before_you_start: string[];
  instructions: string[];
  common_mistakes: string[];
  if_stuck: string[];
  action_url: string | null;
  privacy_reminder: string;
};

const GUIDES: FafsaStepGuide[] = [
  {
    plan_key: "get_ready:confirm_aid_year",
    title: "Confirm your FAFSA aid year",
    stage: "Get ready",
    why_it_matters:
      "Picking the wrong aid year is one of the easiest mistakes to make — and schools may not see your application for the term you actually plan to attend.",
    before_you_start: [
      "Know which school year you are applying for (for example, fall 2025 = aid year 2025-26).",
      "Have your list of schools handy so you apply for the right enrollment period.",
    ],
    instructions: [
      "Go to StudentAid.gov and sign in (or start a new FAFSA).",
      "Look for the aid year on the first screen — it usually shows as something like 2025-26.",
      "Match that year to when you plan to start or continue college.",
      "If you are unsure, check your school's financial aid website for which aid year they are accepting.",
      "Do not continue until the aid year looks correct.",
    ],
    common_mistakes: [
      "Starting a FAFSA for last year when you meant this fall.",
      "Assuming the website picks the right year for you without checking.",
      "Confusing the calendar year with the aid year (they are different).",
    ],
    if_stuck: [
      "Email or call your school's financial aid office and ask: \"Which FAFSA aid year should I file for my start term?\"",
      "If you already started the wrong year, do not panic — ask the school whether you need to start a new FAFSA for the correct year.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "get_ready:create_studentaid_account",
    title: "Create your StudentAid.gov account",
    stage: "Get ready",
    why_it_matters:
      "You cannot start, sign, or check FAFSA without your own StudentAid.gov account. This is separate from your school email or application portal.",
    before_you_start: [
      "A personal email address you check regularly (not a shared family inbox if you can avoid it).",
      "Your full legal name as it appears on official documents.",
      "About 10–15 minutes and a quiet place to focus.",
      "A phone or device to receive verification codes.",
    ],
    instructions: [
      "Open StudentAid.gov and choose to create an account (sometimes called FSA ID).",
      "Use your own email — you will need it for password resets and FAFSA updates.",
      "Follow the identity verification steps on StudentAid.gov only.",
      "Write down your username somewhere safe — not in AidPilot.",
      "Complete any email or phone verification the site asks for before you close the tab.",
      "Log out and log back in once to confirm the account works.",
    ],
    common_mistakes: [
      "Letting a parent create an account using the student's email (the student needs their own account).",
      "Using an email you never check and missing important FAFSA messages later.",
      "Sharing passwords in a group chat or saving them in AidPilot.",
      "Rushing through verification and getting locked out.",
    ],
    if_stuck: [
      "Use the official \"Forgot username\" or \"Forgot password\" links on StudentAid.gov — not third-party sites.",
      "If identity verification fails, read the on-screen help on StudentAid.gov or contact Federal Student Aid support through their official site.",
      "Ask a school counselor to walk you through account setup in person — they should not type your SSN for you.",
    ],
    action_url: CREATE_ACCOUNT_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "contributor:identify_contributors",
    title: "Identify your required FAFSA contributors",
    stage: "Contributor completion",
    why_it_matters:
      "FAFSA may need information from a parent, stepparent, or spouse — not every student needs the same people. Knowing who is required saves days of back-and-forth.",
    before_you_start: [
      "Your basic living situation (who you live with most of the year).",
      "Whether you are married or have dependents of your own.",
      "Access to StudentAid.gov help articles on \"Who is a contributor?\"",
    ],
    instructions: [
      "Start FAFSA on StudentAid.gov — the form will ask questions about your household.",
      "Answer honestly about who provides financial support and who you live with.",
      "When FAFSA names a required contributor, write down their role (for example, Parent 1) and their name.",
      "Tell that person they will need their own StudentAid.gov account — separate from yours.",
      "If FAFSA says no contributor is needed, you can skip inviting anyone.",
      "If you are not sure, choose \"I'm not sure\" in AidPilot's readiness wizard and confirm on StudentAid.gov.",
    ],
    common_mistakes: [
      "Assuming you never need a parent when FAFSA rules say you do.",
      "Inviting the wrong person (for example, a grandparent who is not your legal parent on FAFSA).",
      "Waiting until the night before a deadline to tell your contributor they are required.",
    ],
    if_stuck: [
      "Read the contributor help on StudentAid.gov while you answer FAFSA questions — the form explains who counts.",
      "Call your school's financial aid office with a general description of your household (no SSNs needed on the phone).",
      "If your parents are divorced, FAFSA has specific rules — follow what the official form asks, not family assumptions.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "contributor:parent_create_account",
    title: "Ask your parent or contributor to create their own StudentAid.gov account",
    stage: "Contributor completion",
    why_it_matters:
      "Your contributor must sign in with their own account to complete their FAFSA section. You cannot do this part for them.",
    before_you_start: [
      "The name and contact info for the person FAFSA listed as your contributor.",
      "A time when they can sit down for 10–15 minutes without distractions.",
      "Official link: studentaid.gov account creation (send them the real site — not a screenshot of your login).",
    ],
    instructions: [
      "Text or talk to your contributor and explain FAFSA needs their section completed.",
      "Send them the official StudentAid.gov create-account link — they must use their own email.",
      "Ask them to finish identity verification on StudentAid.gov the same day if possible.",
      "Confirm they saved their username — you do not need their password.",
      "Once their account works, move on to inviting them inside your FAFSA (next step).",
    ],
    common_mistakes: [
      "Creating an account for your parent using your email address.",
      "Sharing your FAFSA password so they can \"just log in as you.\"",
      "Assuming a parent who filed FAFSA for an older sibling can reuse that login for your application without checking.",
    ],
    if_stuck: [
      "Offer to sit with them while they create the account on StudentAid.gov — you can read steps aloud without typing their SSN.",
      "If they had an account years ago, use \"Forgot username\" on StudentAid.gov before making a duplicate.",
      "School financial aid offices can explain why a contributor is required without collecting sensitive data.",
    ],
    action_url: CREATE_ACCOUNT_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "get_ready:gather_financial_access",
    title: "Gather tax and financial records",
    stage: "Get ready",
    why_it_matters:
      "FAFSA may ask whether you or a contributor can access tax information. Having records ready prevents stopping halfway through the form.",
    before_you_start: [
      "Know whether you or a parent filed taxes for the year FAFSA asks about.",
      "Locate where tax documents are stored (IRS account, tax preparer, filing cabinet) — you do not upload these to AidPilot.",
      "List of any untaxed income or special situations you might need to report on StudentAid.gov.",
    ],
    instructions: [
      "Check StudentAid.gov for which tax year FAFSA uses for your aid year.",
      "Ask your contributor whether they can log in to the IRS or access their tax return if FAFSA requests it.",
      "Make a simple checklist on paper: who filed, where documents live, who can answer money questions.",
      "Do not enter dollar amounts or SSNs into AidPilot — only track whether you can access the info.",
      "Set a 30-minute block to sit down with your contributor if their section will need financial answers.",
    ],
    common_mistakes: [
      "Waiting until FAFSA is open to hunt for tax forms.",
      "Guessing income numbers instead of looking them up on StudentAid.gov.",
      "Entering bank balances or tax figures into unofficial apps or screenshots shared in group chats.",
    ],
    if_stuck: [
      "If taxes were not filed, FAFSA has paths for that — follow the official questions on StudentAid.gov.",
      "Your school's financial aid office can explain what documents they may ask for later (verification is separate from FAFSA).",
      "Use IRS.gov official tools only when FAFSA directs you there.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "get_ready:review_document_checklist",
    title: "Review what FAFSA may ask for",
    stage: "Get ready",
    why_it_matters:
      "A quick preview of FAFSA topics helps you feel less overwhelmed when you see the real form.",
    before_you_start: [
      "StudentAid.gov account (or plan to create one).",
      "Rough list of schools you are considering.",
      "Awareness of whether a contributor may be involved.",
    ],
    instructions: [
      "Open the official FAFSA checklist on StudentAid.gov.",
      "Skim each section: student info, school list, contributor (if any), and sign/submit.",
      "Note which parts you can answer alone and which need your contributor.",
      "Bookmark StudentAid.gov so you return to the real site, not a random blog post.",
    ],
    common_mistakes: [
      "Using outdated blog checklists from before FAFSA rule changes.",
      "Printing and filling PDFs that are not the official online FAFSA.",
      "Storing SSNs or account passwords on a phone notes app labeled \"FAFSA.\"",
    ],
    if_stuck: [
      "Attend a FAFSA night at your high school or college — they walk through the official site.",
      "Ask one trusted question at a time to your financial aid office.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "fill_fafsa:start_application",
    title: "Start your FAFSA form",
    stage: "Fill FAFSA",
    why_it_matters:
      "Starting early gives you time to fix mistakes, invite contributors, and meet school deadlines without panic.",
    before_you_start: [
      "Working StudentAid.gov account.",
      "Confirmed aid year.",
      "School names or federal school codes (from each school's financial aid website).",
      "Contributor contact info if FAFSA may need one.",
    ],
    instructions: [
      "Sign in at StudentAid.gov and select FAFSA for your aid year.",
      "Choose \"Start a new FAFSA\" if you have not begun, or resume if you saved progress.",
      "Work through one section at a time — use Save as you go.",
      "Stop if you are unsure about an answer; look up help text on the same page before guessing.",
      "Do not submit until student and contributor sections (if required) are complete.",
    ],
    common_mistakes: [
      "Submitting before inviting a required contributor.",
      "Closing the browser without saving and losing progress.",
      "Copying answers from a friend's FAFSA — your answers must be yours.",
    ],
    if_stuck: [
      "Use the ? help icons on each FAFSA question.",
      "Take a break and return the same day — FAFSA saves your place when you use Save.",
      "Contact Federal Student Aid through official channels linked from StudentAid.gov.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "fill_fafsa:complete_student_section",
    title: "Complete the student section of FAFSA",
    stage: "Fill FAFSA",
    why_it_matters:
      "Schools use your student answers to match you to the right aid programs and residency rules.",
    before_you_start: [
      "Legal name and date of birth consistent with your StudentAid.gov account.",
      "Current address and state of legal residence.",
      "List of colleges to receive your FAFSA.",
    ],
    instructions: [
      "Open your in-progress FAFSA on StudentAid.gov.",
      "Complete all student questions — read each one slowly.",
      "Double-check your state of legal residence and school list before moving on.",
      "If a question asks for SSN or financial numbers, enter them only on StudentAid.gov.",
      "Save and note whether FAFSA says a contributor is still required.",
    ],
    common_mistakes: [
      "Listing a school you are no longer applying to.",
      "Mixing up mailing address with college campus address.",
      "Selecting the wrong dependency or marital status because you rushed.",
    ],
    if_stuck: [
      "Compare tricky questions to StudentAid.gov glossary entries.",
      "Ask your school counselor to explain a question concept — not to enter your SSN.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "contributor:invite_contributor",
    title: "Invite your contributor if required",
    stage: "Contributor completion",
    why_it_matters:
      "FAFSA cannot be fully processed for many students until the invited contributor completes their section and signs.",
    before_you_start: [
      "Contributor has their own working StudentAid.gov account.",
      "Contributor's email address they used for that account.",
      "Your FAFSA started and student section mostly complete.",
    ],
    instructions: [
      "Inside your FAFSA on StudentAid.gov, find the option to invite or add a contributor.",
      "Enter the contributor's information exactly as they used on their account.",
      "Send the invite and tell them to check email (and spam folder).",
      "Ask them to log in and complete their section promptly.",
      "Check FAFSA status to confirm their section shows complete before you submit.",
    ],
    common_mistakes: [
      "Inviting before the contributor created an account.",
      "Using a parent's old email they no longer access.",
      "Submitting FAFSA while contributor status still says incomplete.",
    ],
    if_stuck: [
      "Cancel and resend the invite if the email bounced — verify spelling with your contributor.",
      "Sit together and complete the contributor section in one session if they are willing.",
      "Financial aid office can confirm whether your FAFSA is waiting on a contributor.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "contributor:complete_contributor_section",
    title: "Complete the contributor section on FAFSA",
    stage: "Contributor completion",
    why_it_matters:
      "An incomplete contributor section is the top reason a student's FAFSA sits unfinished even when the student part is done.",
    before_you_start: [
      "Contributor account ready and invite accepted (if applicable).",
      "Access to tax or financial info on StudentAid.gov only.",
      "Scheduled time for student and contributor to communicate if questions come up.",
    ],
    instructions: [
      "Contributor signs in to StudentAid.gov with their own account.",
      "Opens the FAFSA they were invited to — not the student's login.",
      "Answers each contributor question on the official form.",
      "Reviews and signs when FAFSA prompts for signature.",
      "Student checks that FAFSA shows both sections complete before final submit.",
    ],
    common_mistakes: [
      "Student filling out contributor answers while logged in as themselves.",
      "Contributor skipping signature because they thought invite was enough.",
      "Entering estimates when FAFSA offers a data retrieval option — follow on-screen guidance.",
    ],
    if_stuck: [
      "Use StudentAid.gov live help during business hours.",
      "Ask financial aid whether professional judgment is possible if family situation changed — that comes after FAFSA.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "after_submission:review_summary",
    title: "Review your FAFSA Submission Summary",
    stage: "After submission",
    why_it_matters:
      "Your Submission Summary is the official record of what you filed. Schools and you use it to catch errors early.",
    before_you_start: [
      "Submitted FAFSA for the correct aid year.",
      "StudentAid.gov login.",
      "A few minutes to read carefully — not while multitasking.",
    ],
    instructions: [
      "Log in to StudentAid.gov after you submit FAFSA.",
      "Download or view your FAFSA Submission Summary (name may vary slightly by year).",
      "Check name, schools listed, dependency status, and contributor status.",
      "If something looks wrong, follow StudentAid.gov instructions to make a correction — do not retype data in AidPilot.",
      "Save a copy in a secure place on your device or print it for your records.",
    ],
    common_mistakes: [
      "Assuming submit means perfect — typos happen.",
      "Throwing away the summary and forgetting which schools received your FAFSA.",
      "Screenshotting the summary with SSN visible and texting it to friends.",
    ],
    if_stuck: [
      "Use FAFSA correction process on StudentAid.gov for fixable errors.",
      "Call a school listed on the summary to ask if they received your application — have your name and aid year ready, not your SSN in email.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "after_submission:save_confirmation",
    title: "Save your FAFSA submission confirmation",
    stage: "After submission",
    why_it_matters:
      "If a school says they never got your FAFSA, your confirmation page is proof you submitted on time.",
    before_you_start: [
      "Just-submitted FAFSA or access to StudentAid.gov submission history.",
    ],
    instructions: [
      "On the confirmation screen, download PDF or take a screenshot without sharing it publicly.",
      "Note the date and time you submitted.",
      "Store the file somewhere you will find it during aid season.",
      "Check that every school you wanted is listed on the confirmation.",
    ],
    common_mistakes: [
      "Closing the browser before saving confirmation.",
      "Only telling your parent \"I submitted\" without keeping proof.",
    ],
    if_stuck: [
      "Log back in to StudentAid.gov — submitted FAFSAs usually appear in your dashboard.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "after_submission:resolve_action_required",
    title: "Resolve FAFSA action required items",
    stage: "After submission",
    why_it_matters:
      "Open issues on StudentAid.gov can delay aid offers or loan processing until you fix them.",
    before_you_start: [
      "StudentAid.gov login.",
      "Email access for messages from Federal Student Aid.",
    ],
    instructions: [
      "Sign in and read any banner or message marked action required.",
      "Follow the exact steps StudentAid.gov lists — each issue has its own fix.",
      "Complete corrections or uploads only on the official site.",
      "Recheck status after 24–48 hours.",
    ],
    common_mistakes: [
      "Ignoring emails thinking they are spam — verify sender is official.",
      "Trying to fix issues through unofficial third-party services.",
    ],
    if_stuck: [
      "Contact Federal Student Aid support through StudentAid.gov.",
      "Tell your school's financial aid office you have an action required flag — they may know common fixes.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "after_submission:check_status",
    title: "Check FAFSA processing status",
    stage: "After submission",
    why_it_matters:
      "Schools often wait for a processed FAFSA before building your aid package.",
    before_you_start: [
      "Submission confirmation saved.",
      "School email you check regularly.",
    ],
    instructions: [
      "Log in to StudentAid.gov weekly during aid season.",
      "Note whether status says received, processed, or action required.",
      "Watch for emails from colleges' financial aid offices.",
      "If status is unchanged for weeks, contact one school on your list for timing expectations.",
    ],
    common_mistakes: [
      "Checking once and assuming nothing will change.",
      "Expecting an aid offer the day after submit — processing takes time.",
    ],
    if_stuck: [
      "Ask financial aid: \"Has my FAFSA been received?\" — they can often see this without you emailing SSNs.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "verification:check_portal",
    title: "Check your school financial aid portal",
    stage: "Documents and verification",
    why_it_matters:
      "Schools post verification requests and missing documents on their portal — not always by paper mail.",
    before_you_start: [
      "School portal login (often same as applicant or student portal).",
      "List of schools where you submitted FAFSA.",
    ],
    instructions: [
      "Log in to each school's financial aid or student portal.",
      "Look for sections labeled Financial Aid, To-Do List, or Verification.",
      "Write down any requested forms and due dates on paper.",
      "Upload documents only through the school's official portal.",
    ],
    common_mistakes: [
      "Only checking email and missing portal tasks.",
      "Uploading forms to the wrong school.",
      "Sending tax returns over regular email — use secure school systems only.",
    ],
    if_stuck: [
      "Call financial aid and ask how to activate your portal account.",
      "If you were accepted at multiple schools, check each portal separately.",
    ],
    action_url: null,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "verification:complete_documents",
    title: "Upload requested verification documents",
    stage: "Documents and verification",
    why_it_matters:
      "Federal aid often cannot disburse until verification is finished — this is normal and not a sign you did something wrong.",
    before_you_start: [
      "List of documents your school requested (from their portal or email).",
      "Originals or clear scans — follow school format rules.",
      "Due date from the financial aid office.",
    ],
    instructions: [
      "Read each request carefully — schools ask for specific forms (not always the same as FAFSA).",
      "Complete forms with accurate information on the school's site.",
      "Upload through the official portal before the deadline.",
      "Keep copies of what you submitted.",
      "Mark complete in AidPilot only after the school portal shows received.",
    ],
    common_mistakes: [
      "Submitting partial packets and assuming one document was enough.",
      "Using unofficial PDFs from random websites instead of school forms.",
      "Missing deadlines because you waited for physical mail.",
    ],
    if_stuck: [
      "Ask financial aid which item is blocking disbursement.",
      "If family taxes are complicated, request a meeting — do not email SSNs or full tax returns unencrypted.",
    ],
    action_url: null,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "aid_offer:watch_for_offer",
    title: "Watch for your financial aid offer",
    stage: "Aid offer review",
    why_it_matters:
      "Your offer shows grants, scholarships, loans, and estimated cost — you need it to compare schools.",
    before_you_start: [
      "FAFSA submitted and schools listed.",
      "Admission decisions (offers often come after acceptance).",
      "Email and portal access for each school.",
    ],
    instructions: [
      "Check email daily during spring of your senior year (or your college start term).",
      "Log in to each school's aid portal when admitted.",
      "Note whether aid is estimated or final.",
      "When an offer arrives, open AidPilot's aid letter tool or your school site to review — not random calculators with your SSN.",
    ],
    common_mistakes: [
      "Assuming no email means no aid — check spam and portal.",
      "Comparing schools using sticker price instead of net cost after grants.",
    ],
    if_stuck: [
      "Contact financial aid if admitted but no offer after their published timeline.",
    ],
    action_url: null,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "aid_offer:review_offer",
    title: "Enter and review your financial aid offer",
    stage: "Aid offer review",
    why_it_matters:
      "Understanding grants vs loans vs work-study helps you avoid borrowing more than you need.",
    before_you_start: [
      "Official aid offer letter or portal summary from your school.",
      "Questions written down for financial aid (optional).",
    ],
    instructions: [
      "Open your school's official aid offer or portal.",
      "Find cost of attendance, grants, scholarships, loans, and work-study.",
      "Use AidPilot's aid letter page to enter summary numbers for planning — never enter SSN or bank info.",
      "Subtract grants and scholarships from cost to estimate what you still need to cover.",
      "Call financial aid if any line item is confusing before accepting loans.",
    ],
    common_mistakes: [
      "Accepting all loans offered without reading interest terms.",
      "Confusing one-time grants with renewable aid.",
      "Entering aid letter data into random scholarship sites.",
    ],
    if_stuck: [
      "Schedule a 15-minute call with financial aid to walk through your offer line by line.",
      "Compare two schools using the same categories (grants, loans, net cost).",
    ],
    action_url: "/aid-letter",
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
  {
    plan_key: "get_ready:confirm_school_list",
    title: "Confirm schools on your FAFSA list",
    stage: "Get ready",
    why_it_matters:
      "If a school is not on your FAFSA, their financial aid office may not receive your application.",
    before_you_start: [
      "Final or near-final list of colleges you are applying to or attending.",
      "Each school's federal school code from their financial aid website.",
    ],
    instructions: [
      "For each school, search \"[school name] federal school code\" on the school's official site.",
      "Add every school you want to receive your FAFSA — you can usually add up to the limit FAFSA allows.",
      "Remove schools you are definitely not attending if FAFSA lets you edit the list.",
      "Double-check spelling and campus location (some systems have multiple campuses).",
    ],
    common_mistakes: [
      "Adding only your first-choice school and missing backup colleges.",
      "Using unofficial code lists from outdated blog posts.",
    ],
    if_stuck: [
      "Call the school's financial aid office and ask for the correct federal school code for your program.",
    ],
    action_url: STUDENTAID_URL,
    privacy_reminder: FAFSA_STEP_PRIVACY_REMINDER,
  },
];

const GUIDE_BY_KEY = new Map(GUIDES.map((guide) => [guide.plan_key, guide]));

export function getFafsaStepGuide(planKey: string): FafsaStepGuide | null {
  return GUIDE_BY_KEY.get(planKey) ?? null;
}

export function listFafsaStepGuideKeys(): string[] {
  return GUIDES.map((guide) => guide.plan_key);
}
