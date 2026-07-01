import { isAidTaskComplete, normalizeAidTaskStatus } from "@/lib/data-helpers";
import type { AidTask, FafsaIntakeFormData, FafsaIntakeResponse, FafsaPlanTaskInput, FafsaStage } from "@/lib/types";
import { FAFSA_STAGES } from "@/lib/types";

export const FAFSA_TASK_SOURCE = "fafsa_plan";

const STUDENTAID_URL = "https://studentaid.gov/h/apply-for-aid/fafsa";

function isNo(value: string) {
  return value === "no";
}

function isYes(value: string) {
  return value === "yes";
}

function isNotSure(value: string) {
  return value === "not_sure";
}

function beforeSubmission(progress: string) {
  return ["not_started", "started", "not_sure"].includes(progress);
}

function afterSubmission(progress: string) {
  return ["submitted", "processed", "action_required"].includes(progress);
}

function addTask(
  tasks: FafsaPlanTaskInput[],
  task: Omit<FafsaPlanTaskInput, "status" | "step_order"> & { step_order?: number }
) {
  tasks.push({
    ...task,
    step_order: task.step_order ?? tasks.length + 1,
    status: "Upcoming",
  });
}

export function generateFafsaPlan(intake: FafsaIntakeFormData | FafsaIntakeResponse): FafsaPlanTaskInput[] {
  const tasks: FafsaPlanTaskInput[] = [];
  const year = intake.aid_year;
  const schools = intake.schools.trim() || "your schools";

  addTask(tasks, {
    plan_key: "get_ready:confirm_aid_year",
    title: `Confirm your ${year} FAFSA aid year`,
    stage: "Get ready",
    priority: "High",
    why_it_matters: "Using the correct aid year keeps your application tied to the right enrollment period.",
    instructions: `Verify you are applying for aid year ${year} on StudentAid.gov before you start.`,
    required_info: "Aid year only - no tax numbers or SSN needed here.",
    blocking_reason: null,
    action_url: STUDENTAID_URL,
    description: `Aid year: ${year}`,
  });

  if (isNo(intake.has_student_aid_account) || isNotSure(intake.has_student_aid_account)) {
    addTask(tasks, {
      plan_key: "get_ready:create_studentaid_account",
      title: "Create your StudentAid.gov account",
      stage: "Get ready",
      priority: "High",
      why_it_matters: "You need a StudentAid.gov account before you can start or access FAFSA.",
      instructions: "Create an account with your own email. You will not enter SSN or passwords in AidPilot.",
      required_info: "Email access and ability to verify your identity on StudentAid.gov.",
      blocking_reason: "No StudentAid.gov account yet",
      action_url: "https://studentaid.gov/fsa-id/create-account",
    });
  }

  addTask(tasks, {
    plan_key: "get_ready:confirm_school_list",
    title: "Confirm schools on your FAFSA list",
    stage: "Get ready",
    priority: "High",
    why_it_matters: "Schools only receive your FAFSA if they are listed on your application.",
    instructions: `Add or verify these schools on FAFSA: ${schools}. Use each school's federal school code from their financial aid website.`,
    required_info: "School names only - gather federal school codes from official school sites.",
    blocking_reason: null,
    action_url: STUDENTAID_URL,
  });

  if (isNo(intake.has_tax_info) || isNotSure(intake.has_tax_info)) {
    addTask(tasks, {
      plan_key: "get_ready:gather_financial_access",
      title: "Confirm access to tax and financial information",
      stage: "Get ready",
      priority: "High",
      why_it_matters: "FAFSA may ask whether you can access tax information - you do not enter those numbers in AidPilot.",
      instructions:
        "Check whether you or a parent/contributor can access tax records if FAFSA asks. AidPilot only tracks whether you have access, not account numbers or return values.",
      required_info: "Know whether tax info is available - not the actual tax figures.",
      blocking_reason: "Unclear access to financial information",
      action_url: STUDENTAID_URL,
    });
  } else {
    addTask(tasks, {
      plan_key: "get_ready:review_document_checklist",
      title: "Review what FAFSA may ask for",
      stage: "Get ready",
      priority: "Medium",
      why_it_matters: "Having a short checklist reduces surprises when you sit down to fill out FAFSA.",
      instructions:
        "Skim the official FAFSA checklist on StudentAid.gov. AidPilot tracks readiness only - do not store SSNs, bank numbers, or tax return values here.",
      required_info: "General awareness of what categories FAFSA may cover.",
      blocking_reason: null,
      action_url: STUDENTAID_URL,
    });
  }

  if (beforeSubmission(intake.fafsa_progress)) {
    addTask(tasks, {
      plan_key: "fill_fafsa:start_application",
      title: "Start your FAFSA application",
      stage: "Fill FAFSA",
      priority: "High",
      why_it_matters: "Starting early gives you time to fix mistakes before school deadlines.",
      instructions: "Log in to StudentAid.gov and begin the FAFSA for your aid year. Save as you go.",
      required_info: "StudentAid.gov account access.",
      blocking_reason: intake.fafsa_progress === "not_started" ? "FAFSA not started" : null,
      action_url: STUDENTAID_URL,
    });

    addTask(tasks, {
      plan_key: "fill_fafsa:complete_student_section",
      title: "Complete the student section",
      stage: "Fill FAFSA",
      priority: "High",
      why_it_matters: "The student section must be accurate for schools to calculate your aid.",
      instructions: "Work through the student questions on StudentAid.gov. Double-check state of legal residence and school list.",
      required_info: `State: ${intake.state}. Schools: ${schools}.`,
      blocking_reason: null,
      action_url: STUDENTAID_URL,
    });
  }

  if (isYes(intake.contributor_required) || isNotSure(intake.contributor_required)) {
    const parentAccount = intake.parent_has_student_aid_account ?? "not_sure";
    if (isNo(parentAccount) || isNotSure(parentAccount)) {
      addTask(tasks, {
        plan_key: "contributor:parent_create_account",
        title: "Ask your parent or contributor to create a StudentAid.gov account",
        stage: "Contributor completion",
        priority: "High",
        why_it_matters: "Many students need a parent or other contributor to complete their FAFSA section.",
        instructions:
          "Share official StudentAid.gov instructions with your contributor. They create their own account - AidPilot does not collect their credentials.",
        required_info: "Contributor contact method (text, email, or in person).",
        blocking_reason: "Contributor account not ready",
        action_url: "https://studentaid.gov/fsa-id/create-account",
      });
    }

    addTask(tasks, {
      plan_key: "contributor:complete_contributor_section",
      title: "Complete the contributor section on FAFSA",
      stage: "Contributor completion",
      priority: "High",
      why_it_matters: "FAFSA cannot be processed for many students until the contributor section is finished.",
      instructions:
        "Invite your contributor through StudentAid.gov or sit with them to complete their section. Track progress here - do not enter their SSN or tax numbers in AidPilot.",
      required_info: "Contributor availability and StudentAid.gov access.",
      blocking_reason: "Contributor section incomplete",
      action_url: STUDENTAID_URL,
    });
  }

  if (afterSubmission(intake.fafsa_progress) || intake.fafsa_progress === "started") {
    addTask(tasks, {
      plan_key: "after_submission:save_confirmation",
      title: "Save your FAFSA submission confirmation",
      stage: "After submission",
      priority: "Medium",
      why_it_matters: "Confirmation details help if a school asks for proof of submission.",
      instructions: "Download or screenshot your submission confirmation from StudentAid.gov and keep it with your aid records.",
      required_info: "Submission confirmation from StudentAid.gov.",
      blocking_reason: null,
      action_url: STUDENTAID_URL,
    });
  }

  if (intake.fafsa_progress === "action_required") {
    addTask(tasks, {
      plan_key: "after_submission:resolve_action_required",
      title: "Resolve FAFSA action required items",
      stage: "After submission",
      priority: "High",
      why_it_matters: "Open FAFSA issues can delay aid offers or disbursement.",
      instructions: "Log in to StudentAid.gov, read the action message, and follow official instructions.",
      required_info: "StudentAid.gov login access.",
      blocking_reason: "FAFSA reports action required",
      action_url: STUDENTAID_URL,
    });
  }

  if (afterSubmission(intake.fafsa_progress)) {
    addTask(tasks, {
      plan_key: "after_submission:check_status",
      title: "Check FAFSA processing status",
      stage: "After submission",
      priority: "Medium",
      why_it_matters: "Schools use your processed FAFSA to build aid packages.",
      instructions: "Review status on StudentAid.gov and watch for emails from your schools' financial aid offices.",
      required_info: "StudentAid.gov and school email access.",
      blocking_reason: null,
      action_url: STUDENTAID_URL,
    });
  }

  if (isYes(intake.has_verification_request)) {
    addTask(tasks, {
      plan_key: "verification:complete_documents",
      title: "Complete school verification requests",
      stage: "Documents and verification",
      priority: "High",
      why_it_matters: "Aid may not disburse until verification is finished.",
      instructions: "Check your school portal for requested forms. Upload only through official school channels - not AidPilot.",
      required_info: "School portal access and list of requested documents.",
      blocking_reason: "Verification documents requested",
      action_url: null,
    });
  } else if (isNotSure(intake.has_verification_request)) {
    addTask(tasks, {
      plan_key: "verification:check_portal",
      title: "Check whether your school requested verification",
      stage: "Documents and verification",
      priority: "Medium",
      why_it_matters: "Verification is a common reason aid gets delayed.",
      instructions: "Log in to your school financial aid portal and look for verification or missing document notices.",
      required_info: "School portal login.",
      blocking_reason: null,
      action_url: null,
    });
  }

  if (isNo(intake.has_aid_offer) || isNotSure(intake.has_aid_offer)) {
    addTask(tasks, {
      plan_key: "aid_offer:watch_for_offer",
      title: "Watch for your financial aid offer",
      stage: "Aid offer review",
      priority: "Medium",
      why_it_matters: "You need your offer to compare grants, loans, and net cost.",
      instructions: "Check email and your school aid portal after FAFSA is processed. Mark this complete when an offer arrives.",
      required_info: "School email and aid portal access.",
      blocking_reason: null,
      action_url: null,
    });
  }

  if (isYes(intake.has_aid_offer)) {
    addTask(tasks, {
      plan_key: "aid_offer:review_offer",
      title: "Review your financial aid offer",
      stage: "Aid offer review",
      priority: "High",
      why_it_matters: "Understanding your offer helps you compare out-of-pocket cost and loan amounts.",
      instructions: "Open your aid letter in AidPilot or your school portal. Verify grants, scholarships, loans, and work-study with the financial aid office if anything looks unclear.",
      required_info: "Aid offer letter or portal summary.",
      blocking_reason: null,
      action_url: "/aid-letter",
    });
  }

  const stageOrder = new Map(FAFSA_STAGES.map((stage, index) => [stage, index]));
  const sorted = [...tasks].sort((a, b) => {
    const stageDiff = (stageOrder.get(a.stage) ?? 99) - (stageOrder.get(b.stage) ?? 99);
    if (stageDiff !== 0) return stageDiff;
    return a.step_order - b.step_order;
  });

  let markedDueSoon = false;
  return sorted.map((task, index) => {
    const withOrder = { ...task, step_order: index + 1 };
    if (!markedDueSoon) {
      markedDueSoon = true;
      return { ...withOrder, status: "Due Soon" };
    }
    return withOrder;
  });
}

export function isFafsaPlanTask(task: AidTask) {
  return task.task_source === FAFSA_TASK_SOURCE;
}

export function getFafsaPlanTasks(tasks: AidTask[]) {
  return [...tasks]
    .filter(isFafsaPlanTask)
    .sort((a, b) => {
      const stageA = FAFSA_STAGES.indexOf((a.stage ?? "") as FafsaStage);
      const stageB = FAFSA_STAGES.indexOf((b.stage ?? "") as FafsaStage);
      if (stageA !== stageB) return stageA - stageB;
      return (a.step_order ?? 0) - (b.step_order ?? 0);
    });
}

export function getChecklistOnlyTasks(tasks: AidTask[]) {
  return tasks.filter((task) => !isFafsaPlanTask(task));
}

export function getFafsaPlanProgress(tasks: AidTask[]) {
  const planTasks = getFafsaPlanTasks(tasks);
  if (!planTasks.length) return 0;
  const done = planTasks.filter((t) => isAidTaskComplete(t.status)).length;
  return Math.round((done / planTasks.length) * 100);
}

export function getCurrentFafsaStage(tasks: AidTask[]): FafsaStage | null {
  const planTasks = getFafsaPlanTasks(tasks);
  const open = planTasks.filter((t) => !isAidTaskComplete(t.status));
  if (!open.length) return null;
  return (open[0].stage as FafsaStage) ?? null;
}

export function getNextFafsaAction(tasks: AidTask[]) {
  const planTasks = getFafsaPlanTasks(tasks);
  return (
    planTasks.find((t) => normalizeAidTaskStatus(t.status) === "Due Soon") ??
    planTasks.find((t) => !isAidTaskComplete(t.status)) ??
    null
  );
}

export function getFafsaBlockers(tasks: AidTask[]) {
  return getFafsaPlanTasks(tasks).filter(
    (t) => !isAidTaskComplete(t.status) && Boolean(t.blocking_reason?.trim())
  );
}

export function groupFafsaPlanByStage(tasks: AidTask[]) {
  const planTasks = getFafsaPlanTasks(tasks);
  return FAFSA_STAGES.map((stage) => ({
    stage,
    tasks: planTasks.filter((t) => t.stage === stage),
  })).filter((group) => group.tasks.length > 0);
}
