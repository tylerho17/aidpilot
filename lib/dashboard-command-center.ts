import { decodeAidOffer } from "@/lib/aid-letter-decode";
import { getFafsaBlockers, getFafsaPlanTasks, getNextFafsaAction } from "@/lib/fafsa-plan";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { AidLetter, AidTask, FafsaIntakeResponse } from "@/lib/types";

export type AidProtectionPillar = {
  id: string;
  label: string;
  earned: boolean;
  detail: string;
};

export type AidProtectionScore = {
  score: number;
  maxScore: number;
  label: string;
  pillars: AidProtectionPillar[];
};

const STUDENTAID_ACCOUNT_KEY = "get_ready:create_studentaid_account";
const CONTRIBUTOR_PLAN_PREFIX = "contributor:";
const AFTER_SUBMISSION_PREFIX = "after_submission:";

function afterSubmissionProgress(progress: string) {
  return ["submitted", "processed", "action_required"].includes(progress);
}

function isStudentAidAccountReady(intake: FafsaIntakeResponse | null, planTasks: AidTask[]) {
  if (!intake) return false;
  const accountTask = planTasks.find((task) => task.plan_key === STUDENTAID_ACCOUNT_KEY);
  if (accountTask) return isAidTaskComplete(accountTask.status);
  return intake.has_student_aid_account === "yes";
}

function isContributorReady(intake: FafsaIntakeResponse | null, planTasks: AidTask[]) {
  if (!intake) return false;
  if (intake.contributor_required === "no") {
    return true;
  }

  const contributorTasks = planTasks.filter(
    (task) => task.plan_key?.startsWith(CONTRIBUTOR_PLAN_PREFIX) || task.stage === "Contributor completion"
  );

  if (contributorTasks.length === 0) {
    return intake.contributor_required === "no";
  }

  return contributorTasks.every((task) => isAidTaskComplete(task.status));
}

function isSubmissionStageStarted(intake: FafsaIntakeResponse | null, planTasks: AidTask[]) {
  if (!intake) return false;
  if (afterSubmissionProgress(intake.fafsa_progress)) return true;

  const afterSubmissionTasks = planTasks.filter(
    (task) => task.stage === "After submission" || task.plan_key?.startsWith(AFTER_SUBMISSION_PREFIX)
  );
  if (afterSubmissionTasks.some((task) => isAidTaskComplete(task.status))) return true;

  if (["started", "submitted", "processed", "action_required"].includes(intake.fafsa_progress)) {
    const startTask = planTasks.find((task) => task.plan_key === "fill_fafsa:start_application");
    if (startTask && isAidTaskComplete(startTask.status)) return true;
  }

  return false;
}

function isAidOfferReviewed(intake: FafsaIntakeResponse | null, aidLetter: AidLetter | null, planTasks: AidTask[]) {
  if (aidLetter) {
    const hasNumbers =
      (aidLetter.cost_of_attendance ?? 0) > 0 ||
      (aidLetter.grants_amount ?? 0) > 0 ||
      (aidLetter.scholarships_amount ?? 0) > 0 ||
      (aidLetter.loans_amount ?? 0) > 0;
    if (hasNumbers) return true;
  }

  const reviewTask = planTasks.find((task) => task.plan_key === "aid_offer:review_offer");
  if (reviewTask && isAidTaskComplete(reviewTask.status)) return true;

  return intake?.has_aid_offer === "yes" && Boolean(aidLetter);
}

export function calculateAidProtectionScore({
  fafsaIntake,
  tasks,
  aidLetter,
}: {
  fafsaIntake: FafsaIntakeResponse | null;
  tasks: AidTask[];
  aidLetter: AidLetter | null;
}): AidProtectionScore {
  const planTasks = getFafsaPlanTasks(tasks);

  const pillars: AidProtectionPillar[] = [
    {
      id: "intake",
      label: "FAFSA readiness captured",
      earned: Boolean(fafsaIntake),
      detail: fafsaIntake
        ? "Your readiness answers are saved in AidPilot."
        : "Complete the FAFSA readiness wizard so AidPilot knows your situation.",
    },
    {
      id: "studentaid_account",
      label: "StudentAid.gov account ready",
      earned: isStudentAidAccountReady(fafsaIntake, planTasks),
      detail: isStudentAidAccountReady(fafsaIntake, planTasks)
        ? "Your account step is done or not needed."
        : "Create your StudentAid.gov account before starting FAFSA.",
    },
    {
      id: "contributor",
      label: "Contributor step handled",
      earned: isContributorReady(fafsaIntake, planTasks),
      detail: isContributorReady(fafsaIntake, planTasks)
        ? "Contributor work is complete or not required for you."
        : "Finish contributor setup or confirm FAFSA does not need one.",
    },
    {
      id: "submission",
      label: "FAFSA submission underway",
      earned: isSubmissionStageStarted(fafsaIntake, planTasks),
      detail: isSubmissionStageStarted(fafsaIntake, planTasks)
        ? "You have started FAFSA or reached after-submission steps."
        : "Start or submit FAFSA on StudentAid.gov when you are ready.",
    },
    {
      id: "aid_offer",
      label: "Aid offer reviewed",
      earned: isAidOfferReviewed(fafsaIntake, aidLetter, planTasks),
      detail: isAidOfferReviewed(fafsaIntake, aidLetter, planTasks)
        ? "Your aid offer is in AidPilot for review."
        : "Decode your aid letter when it arrives to compare free money and loans.",
    },
  ];

  const earnedCount = pillars.filter((pillar) => pillar.earned).length;
  const score = earnedCount * 20;

  let label = "Getting started";
  if (score >= 80) label = "Well protected";
  else if (score >= 60) label = "On track";
  else if (score >= 40) label = "Building momentum";
  else if (score >= 20) label = "Early stage";

  return { score, maxScore: 100, label, pillars };
}

export function summarizeAidOffer(aidLetter: AidLetter | null) {
  if (!aidLetter) return null;

  const subsidized = aidLetter.subsidized_loans_amount ?? 0;
  const unsubsidized = aidLetter.unsubsidized_loans_amount ?? 0;
  const parentPlus = aidLetter.parent_plus_loans_amount ?? 0;
  const privateLoans = aidLetter.private_loans_amount ?? 0;
  const legacyLoans = aidLetter.loans_amount ?? 0;
  const totalLoanBreakdown = subsidized + unsubsidized + parentPlus + privateLoans;

  const decoded = decodeAidOffer({
    school_name: aidLetter.school_name ?? "",
    cost_of_attendance: aidLetter.cost_of_attendance ?? 0,
    grants: aidLetter.grants_amount ?? 0,
    scholarships: aidLetter.scholarships_amount ?? 0,
    work_study: aidLetter.work_study_amount ?? 0,
    subsidized_loans: subsidized,
    unsubsidized_loans: unsubsidized || (totalLoanBreakdown === 0 ? legacyLoans : 0),
    parent_plus_loans: parentPlus,
    private_loans: privateLoans,
  });

  const hasData =
    (aidLetter.cost_of_attendance ?? 0) > 0 ||
    decoded.totalFreeMoney > 0 ||
    decoded.totalLoans > 0;

  if (!hasData) return null;

  return {
    schoolName: aidLetter.school_name ?? "Your school",
    freeMoney: decoded.totalFreeMoney,
    loans: decoded.totalLoans,
    gap: decoded.estimatedGapAfterAllAid,
  };
}

export function buildWeeklyFocus({
  fafsaIntake,
  tasks,
  fafsaBlockers,
  attentionCount,
  scholarshipNewCount,
}: {
  fafsaIntake: FafsaIntakeResponse | null;
  tasks: AidTask[];
  fafsaBlockers: AidTask[];
  attentionCount: number;
  scholarshipNewCount: number;
}) {
  const items: string[] = [];
  const nextFafsa = getNextFafsaAction(tasks);

  if (!fafsaIntake) {
    items.push("Build your FAFSA plan in the readiness wizard (about 3 minutes).");
  } else if (nextFafsa) {
    items.push(`FAFSA: ${nextFafsa.title}`);
  } else {
    items.push("FAFSA plan steps look complete - keep checking StudentAid.gov and your school portal.");
  }

  if (fafsaBlockers.length > 0) {
    items.push(`Clear blocker: ${fafsaBlockers[0].blocking_reason}`);
  } else {
    items.push("No major FAFSA blockers detected in your plan.");
  }

  if (scholarshipNewCount > 0) {
    items.push(`Review ${scholarshipNewCount} new scholarship match${scholarshipNewCount === 1 ? "" : "es"}.`);
  } else if (attentionCount > 0) {
    items.push(`Check ${attentionCount} checklist item${attentionCount === 1 ? "" : "s"} that need attention.`);
  } else {
    items.push("Scan your school email and aid portal for official updates.");
  }

  return items.slice(0, 3);
}

export function getFafsaBlockersForDashboard(tasks: AidTask[]) {
  return getFafsaBlockers(tasks);
}
