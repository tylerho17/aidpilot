import type {
  AidTask,
  Deadline,
  DocumentItem,
  ScholarshipMatch,
  UserAidOffer,
  UserFafsaStep,
} from "@/lib/types";
import type { ProtectStatusSnapshot } from "@/lib/protect/getProtectStatus";
import { DEMO_ID_PREFIX } from "./config";

/**
 * Demo fixtures - one coherent student story, typed against the REAL database
 * row types so they are drop-in replaceable by live Supabase rows (they could
 * even be seeded verbatim). Dates are computed as offsets from "now" at call
 * time so countdowns ("8 days") stay truthful on any demo day.
 *
 * Every id carries DEMO_ID_PREFIX; screens route mutations on demo ids to
 * local state instead of Supabase (see lib/demo/index.ts).
 */

const DEMO_USER_ID = `${DEMO_ID_PREFIX}user`;

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function timestampDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/* ── This week's to-dos (Home) ── */
export function makeDemoTasks(): AidTask[] {
  const base = {
    updated_at: null,
    user_id: DEMO_USER_ID,
    task_source: null,
    stage: null,
    step_order: null,
    instructions: null,
    required_info: null,
    blocking_reason: null,
    action_url: null,
    plan_key: null,
  };
  return [
    {
      ...base,
      id: `${DEMO_ID_PREFIX}task-verify-identity`,
      created_at: timestampDaysAgo(6),
      title: "Verify your identity",
      description: "Quick photo of your ID",
      status: "Upcoming",
      due_date: isoDaysFromNow(5),
      category: "Verification",
      priority: "medium",
      why_it_matters: "Your school can't release aid until identity verification clears.",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}task-upload-taxes`,
      created_at: timestampDaysAgo(6),
      title: "Upload your 2024 tax return",
      description: "Needed for verification",
      status: "Missing",
      due_date: isoDaysFromNow(3),
      category: "Documents",
      priority: "high",
      why_it_matters: "Verification is the #1 reason aid gets delayed - this clears it.",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}task-accept-cal-grant`,
      created_at: timestampDaysAgo(4),
      title: "Accept your Cal Grant award",
      description: "One tap to lock it in",
      status: "Due Soon",
      due_date: isoDaysFromNow(8),
      category: "Awards",
      priority: "high",
      why_it_matters: "Unaccepted awards can be released back to the state pool.",
    },
  ];
}

/* ── Deadlines (Docs & Dates, Home stat) ── */
export function makeDemoDeadlines(): Deadline[] {
  const base = {
    updated_at: null,
    user_id: DEMO_USER_ID,
    school_id: null,
    action_url: null,
  };
  return [
    {
      ...base,
      id: `${DEMO_ID_PREFIX}deadline-cal-grant`,
      created_at: timestampDaysAgo(20),
      title: "Cal Grant renewal",
      description: "Confirm enrollment and income details",
      deadline_date: isoDaysFromNow(8),
      category: "State aid",
      priority: "high",
      status: "due soon",
      source_type: "state",
      source_name: "California Student Aid Commission",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}deadline-verify-taxes`,
      created_at: timestampDaysAgo(14),
      title: "Verify tax documents",
      description: "Upload the requested pages of your 2024 return",
      deadline_date: isoDaysFromNow(16),
      category: "Verification",
      priority: "medium",
      status: "upcoming",
      source_type: "school",
      source_name: "UC Irvine financial aid office",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}deadline-css-profile`,
      created_at: timestampDaysAgo(10),
      title: "CSS Profile - Stanford",
      description: "Institutional aid form",
      deadline_date: isoDaysFromNow(28),
      category: "Institutional aid",
      priority: "medium",
      status: "upcoming",
      source_type: "school",
      source_name: "Stanford University",
    },
  ];
}

/* ── Documents (Docs & Dates) ── */
export function makeDemoDocuments(): DocumentItem[] {
  const base = { updated_at: null, user_id: DEMO_USER_ID };
  return [
    {
      ...base,
      id: `${DEMO_ID_PREFIX}doc-tax-return`,
      created_at: timestampDaysAgo(9),
      title: "2024 tax return",
      status: "needed",
      source: "Requested by UC Irvine · for verification",
      due_date: isoDaysFromNow(16),
      note: null,
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}doc-photo-id`,
      created_at: timestampDaysAgo(12),
      title: "Photo ID",
      status: "verified",
      source: `Verified ${new Date(Date.now() - 4 * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      due_date: null,
      note: null,
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}doc-enrollment`,
      created_at: timestampDaysAgo(7),
      title: "Proof of enrollment",
      status: "submitted",
      source: "In review since last week",
      due_date: null,
      note: null,
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}doc-fafsa-summary`,
      created_at: timestampDaysAgo(18),
      title: "FAFSA Submission Summary",
      status: "verified",
      source: "Uploaded from studentaid.gov",
      due_date: null,
      note: null,
    },
  ];
}

/* ── Scholarship matches (Aid & Money, Home stat) ── */
export function makeDemoScholarships(): ScholarshipMatch[] {
  const base = {
    updated_at: null,
    user_id: DEMO_USER_ID,
    scholarship_id: null,
    status: "new",
    is_saved: false,
    is_started: false,
    essay_angle: null,
    effort_level: null,
    recommended_action: null,
    ignored: false,
    applied: false,
    saved_at: null,
    applied_at: null,
    ignored_at: null,
  };
  return [
    {
      ...base,
      id: `${DEMO_ID_PREFIX}match-first-gen`,
      created_at: timestampDaysAgo(2),
      name: "First-Gen Scholars Fund",
      amount: 5000,
      match_percent: 96,
      deadline: isoDaysFromNow(34),
      category: "First-gen",
      why_it_fits: "You're a first-generation student in California with a 3.5+ GPA.",
      effort_level: "No essay",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}match-latina-leaders`,
      created_at: timestampDaysAgo(2),
      name: "Latina Leaders Grant",
      amount: 8000,
      match_percent: 92,
      deadline: isoDaysFromNow(21),
      category: "Heritage",
      why_it_fits: "Your background and leadership roles match this fund's mission.",
      effort_level: "Short essay",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}match-stem-futures`,
      created_at: timestampDaysAgo(5),
      name: "STEM Futures Award",
      amount: 3500,
      match_percent: 88,
      deadline: isoDaysFromNow(48),
      category: "STEM",
      why_it_fits: "Computer science major, sophomore standing.",
      effort_level: "Transcript only",
    },
    {
      ...base,
      id: `${DEMO_ID_PREFIX}match-community-impact`,
      created_at: timestampDaysAgo(5),
      name: "Community Impact Scholarship",
      amount: 2000,
      match_percent: 84,
      deadline: isoDaysFromNow(41),
      category: "Service",
      why_it_fits: "120+ volunteer hours logged with local organizations.",
      effort_level: "Short essay",
    },
  ];
}

/* ── Aid offer (Aid & Money) - the kit's decoded Stanford offer ── */
export function makeDemoOffers(): UserAidOffer[] {
  return [
    {
      id: `${DEMO_ID_PREFIX}offer-stanford`,
      user_id: DEMO_USER_ID,
      school_name: "Stanford University",
      offer_status: "official",
      academic_year: "2026–27",
      cost_of_attendance: 82000,
      tuition_and_fees: 62500,
      housing_and_food: 14200,
      books_and_supplies: 1800,
      transportation: 1500,
      personal_expenses: 2000,
      grants_and_scholarships: 54000,
      work_study: 3200,
      federal_student_loans: 5500,
      parent_plus_loans: 0,
      private_loans: 3000,
      other_aid: 0,
      renewal_notes: "Grants renew with SAP + FAFSA refile each year.",
      notes: null,
      created_at: timestampDaysAgo(11),
      updated_at: timestampDaysAgo(3),
    },
  ];
}

/* ── FAFSA plan steps (FAFSA tab) - the actual FAFSA journey, mid-flight ── */
export function makeDemoFafsaSteps(): UserFafsaStep[] {
  const steps: Array<{ key: string; title: string; description: string; done: boolean }> = [
    { key: "fsa-id", title: "Create your StudentAid.gov account", description: "You and one parent each need your own FSA ID", done: true },
    { key: "invite-parent", title: "Invite your parent as a contributor", description: "They get an email and confirm their section from their own login", done: true },
    { key: "tax-docs", title: "Gather your 2024 tax documents", description: "Your 1040, W-2s, and any untaxed income records", done: true },
    { key: "irs-consent", title: "Consent to the IRS data transfer", description: "You and your parent each approve it once - it pre-fills the income fields", done: false },
    { key: "student-sections", title: "Complete your student sections", description: "Personal info, your school list (add up to 20), and housing plans", done: false },
    { key: "review", title: "Review everything before signing", description: "Double-check every school made the list - this decides who gets your aid info", done: false },
    { key: "sign-submit", title: "Sign and submit your FAFSA", description: "Both signatures, then one tap - we'll confirm it went through", done: false },
    { key: "submission-summary", title: "Save your FAFSA Submission Summary", description: "Note your Student Aid Index (SAI) - schools use it to build your offer", done: false },
  ];
  return steps.map((s, i) => ({
    id: `${DEMO_ID_PREFIX}fafsa-${s.key}`,
    created_at: timestampDaysAgo(15),
    updated_at: s.done ? timestampDaysAgo(15 - i * 3) : null,
    user_id: DEMO_USER_ID,
    workflow_step_id: `${DEMO_ID_PREFIX}workflow-${s.key}`,
    status: s.done ? "complete" : "pending",
    notes: null,
    workflow_step: {
      id: `${DEMO_ID_PREFIX}workflow-${s.key}`,
      created_at: timestampDaysAgo(60),
      step_order: i + 1,
      title: s.title,
      description: s.description,
      category: "FAFSA",
      applies_to: null,
      default_priority: i === 2 ? "high" : "medium",
      source_url: null,
    },
  }));
}

/* ── Protect tab snapshot - the same coherent story, mid-flight ── */
export function makeDemoProtectSnapshot(): ProtectStatusSnapshot {
  return {
    overallStatus: "in_progress",
    headline: "Your aid protection is in progress",
    description:
      "You are tracking the right things. Keep checking for school portal, verification, and offer updates.",
    topAction: null,
    categories: [
      {
        key: "fafsa",
        title: "FAFSA Guide",
        status: "in_progress",
        href: "/fafsa",
        ctaLabel: "Continue FAFSA",
        summaryLines: ["3 of 8 steps complete", "Next: Consent to the IRS data transfer"],
      },
      {
        key: "school_follow_up",
        title: "School Follow-Up",
        status: "in_progress",
        href: "/fafsa/follow-up",
        ctaLabel: "Open Follow-Up Tracker",
        summaryLines: ["2 schools tracked", "1 portal not checked", "0 document requests"],
      },
      {
        key: "verification",
        title: "Verification",
        status: "needs_attention",
        href: "/fafsa/follow-up",
        ctaLabel: "Track Verification",
        summaryLines: [
          "1 verification request",
          "1 verification task needing action",
          "Aid may not be final until verification is complete.",
        ],
      },
      {
        key: "aid_offers",
        title: "Aid Offers",
        status: "needs_attention",
        href: "/aid-letter",
        ctaLabel: "Open Aid Offer Decoder",
        summaryLines: [
          "1 aid offer added",
          "1 unreviewed offer",
          "Highest remaining gap: $16,300 (Stanford University)",
        ],
      },
    ],
  };
}

/* ── Home status-panel narrative when demo data is active ── */
export const DEMO_PROTECT_PANEL = {
  tone: "green" as const,
  icon: "shield-check",
  eyebrow: "Protected",
  title: "Your aid is protected this week.",
  body: "We're watching your eligibility, enrollment, and requirements. Nothing needs urgent attention.",
  badge: "On track",
};
