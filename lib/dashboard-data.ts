export type ChecklistStatus = "done" | "in_progress" | "todo";

export type ChecklistItem = {
  id: number;
  task: string;
  category: string;
  status: ChecklistStatus;
  dueDate?: string;
};

export type ScholarshipItem = {
  id: number;
  name: string;
  amount: string;
  deadline: string;
  effort: "Low" | "Medium" | "High";
  fit: number;
  category: string;
};

export type MissingDocument = {
  id: number;
  name: string;
  requestedBy: string;
  dueDate: string;
};

export type Deadline = {
  id: number;
  title: string;
  date: string;
  type: string;
  urgency: "high" | "medium" | "low";
};

export const aidStatus = {
  overall: "Needs attention",
  fafsaStatus: "Submitted — verification pending",
  aidAtRisk: 12400,
  tasksComplete: 7,
  tasksTotal: 20,
  scholarshipsMatched: 20,
  nextReview: "Friday, June 27",
};

export const weeklyPriorities = [
  {
    id: 1,
    title: "Respond to verification request",
    detail: "Your school needs a signed statement of non-filing from your parent.",
    urgency: "high" as const,
  },
  {
    id: 2,
    title: "Compare aid offers before committing",
    detail: "Two schools sent revised packages — review net cost, not sticker price.",
    urgency: "high" as const,
  },
  {
    id: 3,
    title: "Apply to 3 high-fit scholarships",
    detail: "Deadlines within 14 days with strong match scores.",
    urgency: "medium" as const,
  },
  {
    id: 4,
    title: "Confirm parent FSA ID is active",
    detail: "Required for renewal and any FAFSA corrections this year.",
    urgency: "medium" as const,
  },
];

export const checklistItems: ChecklistItem[] = [
  { id: 1, task: "Create FSA ID (student)", category: "FAFSA", status: "done" },
  { id: 2, task: "Create FSA ID (parent)", category: "FAFSA", status: "done" },
  { id: 3, task: "Complete FAFSA application", category: "FAFSA", status: "done" },
  { id: 4, task: "Submit state grant application", category: "State aid", status: "done", dueDate: "Mar 1" },
  { id: 5, task: "Review Student Aid Report (SAR)", category: "FAFSA", status: "done" },
  { id: 6, task: "Correct FAFSA errors if flagged", category: "FAFSA", status: "done" },
  { id: 7, task: "Add schools to FAFSA school list", category: "FAFSA", status: "done" },
  { id: 8, task: "Complete CSS Profile (if required)", category: "Institutional", status: "in_progress", dueDate: "Feb 15" },
  { id: 9, task: "Submit verification documents", category: "Verification", status: "in_progress", dueDate: "Jun 30" },
  { id: 10, task: "Upload financial aid offer letters", category: "Aid offers", status: "in_progress" },
  { id: 11, task: "Compare net cost across schools", category: "Aid offers", status: "todo", dueDate: "Jul 1" },
  { id: 12, task: "Accept or decline aid by school deadline", category: "Aid offers", status: "todo", dueDate: "May 1" },
  { id: 13, task: "Sign master promissory note (MPN)", category: "Loans", status: "todo" },
  { id: 14, task: "Complete entrance counseling", category: "Loans", status: "todo" },
  { id: 15, task: "Register for fall classes", category: "Enrollment", status: "todo", dueDate: "Aug 15" },
  { id: 16, task: "Confirm housing deposit", category: "Enrollment", status: "todo", dueDate: "May 15" },
  { id: 17, task: "Set up payment plan with bursar", category: "Billing", status: "todo" },
  { id: 18, task: "Renew FAFSA for next year", category: "FAFSA", status: "todo", dueDate: "Oct 1" },
  { id: 19, task: "Check work-study eligibility", category: "Aid offers", status: "todo" },
  { id: 20, task: "Appeal aid package if family circumstances changed", category: "Aid offers", status: "todo" },
];

export const missingDocuments: MissingDocument[] = [
  {
    id: 1,
    name: "Parent non-filing letter",
    requestedBy: "State University financial aid office",
    dueDate: "Jun 30, 2026",
  },
  {
    id: 2,
    name: "Proof of citizenship or eligible status",
    requestedBy: "Federal verification",
    dueDate: "Jul 5, 2026",
  },
  {
    id: 3,
    name: "Signed income verification form",
    requestedBy: "Community College",
    dueDate: "Jul 12, 2026",
  },
];

export const upcomingDeadlines: Deadline[] = [
  { id: 1, title: "Verification documents due", date: "Jun 30, 2026", type: "Verification", urgency: "high" },
  { id: 2, title: "Merit scholarship decision deadline", date: "Jul 1, 2026", type: "Scholarship", urgency: "high" },
  { id: 3, title: "Housing deposit", date: "Jul 15, 2026", type: "Enrollment", urgency: "medium" },
  { id: 4, title: "Summer payment plan setup", date: "Jul 20, 2026", type: "Billing", urgency: "medium" },
  { id: 5, title: "Fall registration opens", date: "Aug 1, 2026", type: "Enrollment", urgency: "low" },
];

export const scholarshipItems: ScholarshipItem[] = [
  { id: 1, name: "Horizon STEM Scholars", amount: "$5,000", deadline: "Jul 8, 2026", effort: "Medium", fit: 94, category: "STEM" },
  { id: 2, name: "First-Gen Future Fund", amount: "$2,500", deadline: "Jul 10, 2026", effort: "Low", fit: 91, category: "First-generation" },
  { id: 3, name: "Community Leaders Award", amount: "$1,000", deadline: "Jul 12, 2026", effort: "Low", fit: 88, category: "Community service" },
  { id: 4, name: "State Future Teachers Grant", amount: "$3,000", deadline: "Jul 15, 2026", effort: "Medium", fit: 87, category: "Education" },
  { id: 5, name: "Rural Scholars Initiative", amount: "$4,000", deadline: "Jul 18, 2026", effort: "Medium", fit: 85, category: "Regional" },
  { id: 6, name: "Women in Engineering", amount: "$2,500", deadline: "Jul 20, 2026", effort: "Medium", fit: 84, category: "STEM" },
  { id: 7, name: "Campus Part-Time Grant", amount: "$1,500", deadline: "Jul 22, 2026", effort: "Low", fit: 83, category: "Campus" },
  { id: 8, name: "Public Service Pathway", amount: "$2,000", deadline: "Jul 25, 2026", effort: "Low", fit: 82, category: "Public service" },
  { id: 9, name: "Arts & Culture Fellowship", amount: "$1,800", deadline: "Jul 28, 2026", effort: "High", fit: 80, category: "Arts" },
  { id: 10, name: "Health Careers Scholarship", amount: "$3,500", deadline: "Aug 1, 2026", effort: "Medium", fit: 79, category: "Healthcare" },
  { id: 11, name: "Transfer Student Success", amount: "$2,200", deadline: "Aug 3, 2026", effort: "Low", fit: 78, category: "Transfer" },
  { id: 12, name: "Environmental Action Award", amount: "$1,200", deadline: "Aug 5, 2026", effort: "Low", fit: 77, category: "Environment" },
  { id: 13, name: "Business Innovators Prize", amount: "$2,800", deadline: "Aug 8, 2026", effort: "High", fit: 76, category: "Business" },
  { id: 14, name: "Veterans Family Support", amount: "$1,500", deadline: "Aug 10, 2026", effort: "Low", fit: 75, category: "Military family" },
  { id: 15, name: "Latino Student Achievement", amount: "$2,000", deadline: "Aug 12, 2026", effort: "Medium", fit: 74, category: "Diversity" },
  { id: 16, name: "Honors College Supplement", amount: "$4,500", deadline: "Aug 15, 2026", effort: "High", fit: 73, category: "Academic" },
  { id: 17, name: "Workforce Ready Scholarship", amount: "$1,000", deadline: "Aug 18, 2026", effort: "Low", fit: 72, category: "Career" },
  { id: 18, name: "Single Parent Student Fund", amount: "$2,500", deadline: "Aug 20, 2026", effort: "Medium", fit: 71, category: "Family" },
  { id: 19, name: "Cybersecurity Scholars", amount: "$3,000", deadline: "Aug 22, 2026", effort: "High", fit: 70, category: "STEM" },
  { id: 20, name: "Local Rotary Club Award", amount: "$1,000", deadline: "Aug 25, 2026", effort: "Low", fit: 69, category: "Local" },
];
