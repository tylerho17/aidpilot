export type TaskStatus =
  | "Complete"
  | "Due Soon"
  | "Missing"
  | "Needs Review"
  | "Optional"
  | "Upcoming";

export type TaskPriority = "High" | "Medium" | "Low";

export type ChecklistTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  category: string;
  priority: TaskPriority;
};

export type DocumentItem = {
  id: string;
  name: string;
  status: "Uploaded" | "Missing" | "Needs Review";
  dueDate: string;
  linkedTaskId: string;
};

export type ScholarshipStatus = "New" | "Saved" | "Applied";

export type ScholarshipMatch = {
  id: string;
  name: string;
  amount: number;
  amountLabel: string;
  match: number;
  deadline: string;
  deadlineUrgent: boolean;
  category: string;
  whyItFits: string;
  status: ScholarshipStatus;
  newThisWeek: boolean;
  strongMatch: boolean;
};

export const MAYA = {
  name: "Maya Chen",
  school: "UC Irvine",
  year: "Sophomore",
  tags: ["First-generation", "Cal Grant recipient", "STEM interest"],
};

export const CHECKLIST_TASKS: ChecklistTask[] = [
  {
    id: "fafsa-submitted",
    title: "FAFSA submitted",
    description: "Your 2025-26 FAFSA was submitted on January 14. AidPilot is monitoring your Student Aid Report for changes.",
    status: "Complete",
    dueDate: "Jan 14, 2026",
    category: "FAFSA",
    priority: "High",
  },
  {
    id: "fafsa-correction",
    title: "FAFSA correction needed",
    description: "Your SAR shows a mismatch in parent income. Submit a correction before UC Irvine processes spring aid.",
    status: "Due Soon",
    dueDate: "Jul 15, 2026",
    category: "FAFSA",
    priority: "High",
  },
  {
    id: "cal-grant-gpa",
    title: "Cal Grant GPA verification",
    description: "California Student Aid Commission needs your school to confirm GPA for Cal Grant renewal.",
    status: "Complete",
    dueDate: "Submitted",
    category: "State Aid",
    priority: "High",
  },
  {
    id: "parent-tax",
    title: "Upload parent tax return",
    description: "UCI financial aid office requested 2024 parent tax return for verification. Submit through the school portal.",
    status: "Missing",
    dueDate: "Jul 18, 2026",
    category: "Documents",
    priority: "High",
  },
  {
    id: "non-filing",
    title: "Upload non-filing letter",
    description: "Parent did not file taxes. A signed non-filing statement is required to complete verification.",
    status: "Missing",
    dueDate: "Jul 20, 2026",
    category: "Documents",
    priority: "High",
  },
  {
    id: "enrollment",
    title: "Verify enrollment status",
    description: "Confirm you are enrolled at least half-time for summer/fall so aid can disburse without a hold.",
    status: "Complete",
    dueDate: "Verified",
    category: "Enrollment",
    priority: "Medium",
  },
  {
    id: "parent-fsa",
    title: "Confirm parent FSA ID",
    description: "Parent FSA ID is active and linked. Needed for any FAFSA corrections this cycle.",
    status: "Complete",
    dueDate: "Done",
    category: "FAFSA",
    priority: "Medium",
  },
  {
    id: "sai-review",
    title: "Review Student Aid Index",
    description: "Your SAI is $4,820. AidPilot flagged this as reasonable for your Pell and Cal Grant eligibility.",
    status: "Complete",
    dueDate: "Done",
    category: "FAFSA",
    priority: "Medium",
  },
  {
    id: "aid-offer",
    title: "Review aid offer",
    description: "Compare grants, loans, and work-study in plain language. Net cost after gift aid is $8,200/year.",
    status: "Complete",
    dueDate: "Done",
    category: "Aid Offers",
    priority: "High",
  },
  {
    id: "accept-cal",
    title: "Accept Cal Grant",
    description: "Cal Grant B award of $1,648 is pending your acceptance in the WebGrants portal.",
    status: "Due Soon",
    dueDate: "Jul 15, 2026",
    category: "State Aid",
    priority: "High",
  },
  {
    id: "accept-pell",
    title: "Accept Pell Grant",
    description: "Pell Grant of $3,697 was accepted and will apply to fall charges automatically.",
    status: "Complete",
    dueDate: "Done",
    category: "Aid Offers",
    priority: "High",
  },
  {
    id: "work-study",
    title: "Decide on work-study",
    description: "You were offered $2,200 in federal work-study. Accept only if you plan to work on campus.",
    status: "Complete",
    dueDate: "Declined",
    category: "Aid Offers",
    priority: "Low",
  },
  {
    id: "loan-offer",
    title: "Review federal loan offer",
    description: "Subsidized loan of $3,500 is available. Only borrow what you need after grants and scholarships.",
    status: "Complete",
    dueDate: "Reviewed",
    category: "Loans",
    priority: "Medium",
  },
  {
    id: "entrance-counseling",
    title: "Complete entrance counseling",
    description: "Required before any federal loan can disburse. Takes about 30 minutes on studentaid.gov.",
    status: "Upcoming",
    dueDate: "Aug 10, 2026",
    category: "Loans",
    priority: "Medium",
  },
  {
    id: "mpn",
    title: "Sign master promissory note",
    description: "One-time MPN covers federal loans for up to 10 years. Complete after entrance counseling.",
    status: "Upcoming",
    dueDate: "Aug 12, 2026",
    category: "Loans",
    priority: "Medium",
  },
  {
    id: "dependency-form",
    title: "Submit dependency form",
    description: "UCI needs a dependency override form if your situation changed since the FAFSA was filed.",
    status: "Complete",
    dueDate: "Submitted",
    category: "Verification",
    priority: "Medium",
  },
  {
    id: "residency",
    title: "Confirm residency status",
    description: "California residency confirmed for in-state tuition and Cal Grant eligibility.",
    status: "Complete",
    dueDate: "Done",
    category: "Enrollment",
    priority: "Medium",
  },
  {
    id: "portal-messages",
    title: "Check school portal messages",
    description: "UCI financial aid sent 1 unread message about summer disbursement timing.",
    status: "Complete",
    dueDate: "Read",
    category: "Enrollment",
    priority: "Medium",
  },
  {
    id: "sap",
    title: "Confirm satisfactory academic progress",
    description: "Your GPA and credit completion meet SAP requirements. No action needed right now.",
    status: "Complete",
    dueDate: "Done",
    category: "Enrollment",
    priority: "Low",
  },
  {
    id: "fafsa-reminder",
    title: "Set reminder for next FAFSA cycle",
    description: "2026-27 FAFSA opens October 1. AidPilot will remind you 2 weeks early.",
    status: "Complete",
    dueDate: "Reminder set",
    category: "Planning",
    priority: "Low",
  },
];

export const DOCUMENTS: DocumentItem[] = [
  { id: "doc-tax", name: "Parent tax return (2024)", status: "Missing", dueDate: "Jul 18, 2026", linkedTaskId: "parent-tax" },
  { id: "doc-nonfiling", name: "Parent non-filing letter", status: "Missing", dueDate: "Jul 20, 2026", linkedTaskId: "non-filing" },
  { id: "doc-enrollment", name: "Proof of enrollment", status: "Uploaded", dueDate: "Verified", linkedTaskId: "enrollment" },
  { id: "doc-dependency", name: "Dependency override form", status: "Uploaded", dueDate: "Submitted", linkedTaskId: "dependency-form" },
  { id: "doc-gpa", name: "Cal Grant GPA verification", status: "Uploaded", dueDate: "Submitted", linkedTaskId: "cal-grant-gpa" },
  { id: "doc-id", name: "Student ID verification", status: "Uploaded", dueDate: "Submitted", linkedTaskId: "residency" },
];

export const SCHOLARSHIPS: ScholarshipMatch[] = [
  {
    id: "fgff",
    name: "First-Gen Future Fund",
    amount: 5000,
    amountLabel: "$5,000",
    match: 96,
    deadline: "Closes in 21 days",
    deadlineUrgent: false,
    category: "First-generation",
    whyItFits: "Built for first-generation California students. Maya's background, UC Irvine profile, and Cal Grant status make this a top match.",
    status: "New",
    newThisWeek: true,
    strongMatch: true,
  },
  {
    id: "women-stem",
    name: "Women in STEM Grant",
    amount: 3500,
    amountLabel: "$3,500",
    match: 91,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "Women in STEM",
    whyItFits: "Maya's computer science coursework and first-gen profile align with this STEM award for undergraduate women.",
    status: "New",
    newThisWeek: true,
    strongMatch: true,
  },
  {
    id: "anteater",
    name: "Anteater Community Award",
    amount: 2000,
    amountLabel: "$2,000",
    match: 88,
    deadline: "Closes in 12 days",
    deadlineUrgent: true,
    category: "UC Irvine",
    whyItFits: "UC Irvine students with community involvement and financial need are a strong match for this campus award.",
    status: "New",
    newThisWeek: true,
    strongMatch: true,
  },
  {
    id: "ca-dream",
    name: "California Dream Scholars",
    amount: 2500,
    amountLabel: "$2,500",
    match: 87,
    deadline: "Closes in 18 days",
    deadlineUrgent: true,
    category: "California students",
    whyItFits: "Open to California residents at public universities. Maya's in-state status and aid profile fit well.",
    status: "New",
    newThisWeek: true,
    strongMatch: true,
  },
  {
    id: "stem-excel",
    name: "STEM Excellence Award",
    amount: 2500,
    amountLabel: "$2,500",
    match: 85,
    deadline: "Closes in 25 days",
    deadlineUrgent: false,
    category: "STEM",
    whyItFits: "For undergraduates pursuing STEM degrees with demonstrated academic progress. Maya's major and GPA qualify.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "community-leaders",
    name: "Community Leaders Fund",
    amount: 1500,
    amountLabel: "$1,500",
    match: 83,
    deadline: "Closes in 14 days",
    deadlineUrgent: true,
    category: "Community service",
    whyItFits: "Maya's volunteer tutoring and food bank work match the service hours requirement.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "pell-match",
    name: "Pell Match Opportunity",
    amount: 1200,
    amountLabel: "$1,200",
    match: 81,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "Low-income students",
    whyItFits: "Supplemental award for Pell-eligible students. Maya's current Pell Grant makes her eligible.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "irvine-transfer",
    name: "Irvine Transfer Bridge",
    amount: 1500,
    amountLabel: "$1,500",
    match: 79,
    deadline: "Closes in 28 days",
    deadlineUrgent: false,
    category: "Transfer students",
    whyItFits: "Supports students who transferred into UC Irvine. Useful if Maya plans a future transfer pathway for friends.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "golden-essay",
    name: "Golden State Essay Prize",
    amount: 1500,
    amountLabel: "$1,500",
    match: 77,
    deadline: "Closes in 19 days",
    deadlineUrgent: false,
    category: "Essay-based",
    whyItFits: "Short essay on overcoming obstacles. Maya's first-gen story is a natural fit for the prompt.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "fg-stem",
    name: "First-Gen STEM Bridge",
    amount: 1300,
    amountLabel: "$1,300",
    match: 75,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "First-generation",
    whyItFits: "Combines first-gen and STEM criteria. Lower effort than full essay scholarships.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "socal-service",
    name: "SoCal Service Award",
    amount: 1000,
    amountLabel: "$1,000",
    match: 73,
    deadline: "Closes in 16 days",
    deadlineUrgent: false,
    category: "Local scholarships",
    whyItFits: "Orange County students with 50+ volunteer hours. Maya exceeds the service threshold.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "local-rotary",
    name: "Orange County Rotary Award",
    amount: 1000,
    amountLabel: "$1,000",
    match: 71,
    deadline: "Closes in 22 days",
    deadlineUrgent: false,
    category: "Local scholarships",
    whyItFits: "Local civic award for students with community leadership and financial need.",
    status: "New",
    newThisWeek: true,
    strongMatch: false,
  },
  {
    id: "csu-transfer",
    name: "CSU Transfer Success Grant",
    amount: 2000,
    amountLabel: "$2,000",
    match: 68,
    deadline: "Closes in 45 days",
    deadlineUrgent: false,
    category: "Transfer students",
    whyItFits: "For students transferring between California public schools. Saved for later review.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "women-eng",
    name: "Women in Engineering Scholarship",
    amount: 2800,
    amountLabel: "$2,800",
    match: 66,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "Women in STEM",
    whyItFits: "Engineering focus with GPA requirement. Maya is close to the GPA cutoff.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "bio-research",
    name: "Biology Research Scholars",
    amount: 3500,
    amountLabel: "$3,500",
    match: 64,
    deadline: "Closes in 60 days",
    deadlineUrgent: false,
    category: "STEM",
    whyItFits: "Requires biology research experience. Better fit if Maya adds a lab role next semester.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "public-health",
    name: "Public Health Pathway Award",
    amount: 1500,
    amountLabel: "$1,500",
    match: 62,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "Essay-based",
    whyItFits: "Essay on community health impact. Maya's volunteer health clinic work is relevant.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "low-income-bridge",
    name: "Low-Income Student Bridge Fund",
    amount: 1800,
    amountLabel: "$1,800",
    match: 60,
    deadline: "Closes in 35 days",
    deadlineUrgent: false,
    category: "Low-income students",
    whyItFits: "Need-based award for students receiving Cal Grant or Pell. Maya qualifies on aid status.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "creative-writing",
    name: "Creative Writing Merit Award",
    amount: 1000,
    amountLabel: "$1,000",
    match: 58,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "Essay-based",
    whyItFits: "Portfolio-based award. Lower priority unless Maya wants to submit writing samples.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "campus-employ",
    name: "Campus Employment Grant",
    amount: 800,
    amountLabel: "$800",
    match: 56,
    deadline: "Plenty of time",
    deadlineUrgent: false,
    category: "UC Irvine",
    whyItFits: "Small campus grant tied to on-campus employment. Pairs with work-study if accepted.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
  {
    id: "health-careers",
    name: "Health Careers Scholarship",
    amount: 2200,
    amountLabel: "$2,200",
    match: 54,
    deadline: "Closes in 50 days",
    deadlineUrgent: false,
    category: "STEM",
    whyItFits: "For pre-health students. Maya could revisit if she adds a health-related minor.",
    status: "Saved",
    newThisWeek: false,
    strongMatch: false,
  },
];

const PRIORITY_ORDER: Record<TaskPriority, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = {
  Missing: 0,
  "Due Soon": 1,
  "Needs Review": 2,
  Optional: 3,
  Upcoming: 4,
  Complete: 5,
};

export function statusToTone(status: TaskStatus): "green" | "amber" | "coral" | "blue" | "gray" {
  switch (status) {
    case "Complete":
      return "green";
    case "Due Soon":
      return "amber";
    case "Missing":
      return "coral";
    case "Needs Review":
      return "blue";
    case "Optional":
    case "Upcoming":
      return "gray";
    default:
      return "gray";
  }
}

export function documentStatusToTone(status: DocumentItem["status"]) {
  switch (status) {
    case "Uploaded":
      return "green" as const;
    case "Missing":
      return "coral" as const;
    case "Needs Review":
      return "blue" as const;
  }
}

export function getCompletedCount() {
  return CHECKLIST_TASKS.filter((t) => t.status === "Complete").length;
}

export function getChecklistProgress() {
  return Math.round((getCompletedCount() / CHECKLIST_TASKS.length) * 100);
}

export function getAttentionCount() {
  return CHECKLIST_TASKS.filter((t) =>
    ["Due Soon", "Missing", "Needs Review"].includes(t.status)
  ).length;
}

export function getMissingDocumentCount() {
  return DOCUMENTS.filter((d) => d.status === "Missing").length;
}

export function getUrgentTasks(limit = 3) {
  return [...CHECKLIST_TASKS]
    .filter((t) => t.status !== "Complete")
    .sort((a, b) => {
      const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    })
    .slice(0, limit);
}

export function getNextDeadline() {
  const urgent = getUrgentTasks(1)[0];
  return urgent?.dueDate ?? "None";
}

export function getWeeklyScholarships() {
  return SCHOLARSHIPS.filter((s) => s.newThisWeek);
}

export function getFeaturedScholarship() {
  return SCHOLARSHIPS.find((s) => s.id === "fgff")!;
}

export function getScholarshipStats() {
  const weekly = getWeeklyScholarships();
  const totalPotential = weekly.reduce((sum, s) => sum + s.amount, 0);
  const strongMatches = weekly.filter((s) => s.strongMatch).length;
  const deadlinesThisMonth = weekly.filter((s) => s.deadlineUrgent).length;
  return {
    newCount: weekly.length,
    totalPotential,
    totalPotentialLabel: `$${totalPotential.toLocaleString()}`,
    strongMatches,
    deadlinesThisMonth,
  };
}

export const DASHBOARD_SUMMARY = {
  aidStatus: "Protected",
  aidAtRisk: "$2,400",
  nextDeadline: "Jul 15, 2026",
  weeklyCheckIn: "On track",
  protectedMessage: "Your aid is protected this week.",
};

export const DEMO_DEADLINES = [
  {
    id: "demo-d1",
    title: "FAFSA priority deadline",
    description: "Submit FAFSA before your school and state priority deadline.",
    deadline_date: "2026-03-02",
    category: "FAFSA",
    priority: "High",
    status: "upcoming",
    source_type: "Federal",
    source_name: "StudentAid.gov",
    action_url: null,
  },
  {
    id: "demo-d2",
    title: "School verification deadline",
    description: "Complete verification documents requested by your school aid office.",
    deadline_date: "2026-07-22",
    category: "Verification",
    priority: "High",
    status: "due soon",
    source_type: "School",
    source_name: "Aid office portal",
    action_url: null,
  },
  {
    id: "demo-d3",
    title: "Scholarship application deadline",
    description: "Start your strongest weekly scholarship match before the deadline passes.",
    deadline_date: "2026-07-30",
    category: "Scholarships",
    priority: "Medium",
    status: "upcoming",
    source_type: "AidPilot",
    source_name: "Weekly scholarship report",
    action_url: null,
  },
  {
    id: "demo-d4",
    title: "Aid appeal deadline",
    description: "If you plan to appeal your aid offer, confirm your school appeal deadline.",
    deadline_date: "2026-08-15",
    category: "Aid Offer",
    priority: "Medium",
    status: "upcoming",
    source_type: "School",
    source_name: "Aid office",
    action_url: null,
  },
];

export const DEMO_AID_LETTER = {
  school_name: "UC Irvine",
  aid_year: "2026-2027",
  grants_amount: 18400,
  scholarships_amount: 3500,
  loans_amount: 5500,
  work_study_amount: 2000,
  estimated_net_cost: 4200,
  status: "sample",
  notes: "Placeholder aid letter for demonstration. Not official financial advice.",
};

export const DEMO_WEEKLY_REPORT = {
  aid_status: "Protected",
  summary:
    "Your aid is protected this week. Two items need attention soon: school document review and verification response.",
  tasks_due_count: 2,
  missing_documents_count: 1,
  scholarship_count: 12,
  potential_scholarship_amount: 24500,
  recommendations: [
    {
      title: "Review school portal",
      body: "Check for missing documents or verification requests this week.",
    },
    {
      title: "Start one scholarship",
      body: "Pick one strong scholarship match and begin the application.",
    },
    {
      title: "Confirm Cal Grant status",
      body: "California students should confirm state aid status before priority deadlines.",
    },
  ],
};

export function deadlineStatusToTone(status: string): "green" | "amber" | "coral" | "blue" | "gray" {
  switch (status) {
    case "complete":
    case "completed":
      return "green";
    case "due soon":
      return "amber";
    case "needs attention":
      return "coral";
    case "upcoming":
      return "blue";
    default:
      return "gray";
  }
}
