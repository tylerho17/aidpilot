import type { ScholarshipPreferences } from "@/lib/scholarship-preferences";

export type StudentProfile = {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string | null;
  first_name: string | null;
  full_name: string | null;
  email: string | null;
  school: string | null;
  school_name: string | null;
  school_id: string | null;
  year: string | null;
  education_level: string | null;
  graduation_year: number | null;
  state: string | null;
  student_type: string | null;
  fafsa_status: string | null;
  aid_types: string[] | null;
  main_goals: string[] | null;
  majors: string[] | null;
  interests: string[] | null;
  first_generation: boolean | null;
  transfer_student: boolean | null;
  pell_grant_eligible: boolean | null;
  cal_grant_eligible: boolean | null;
  gpa: number | null;
  essay_preference: string | null;
  scholarship_preferences?: ScholarshipPreferences | Record<string, unknown> | null;
  is_onboarded: boolean;
};

export const AID_TASK_STATUSES = [
  "Complete",
  "Due Soon",
  "Missing",
  "Needs Review",
  "Optional",
  "Upcoming",
] as const;

export const DEADLINE_STATUSES = [
  "upcoming",
  "due soon",
  "needs attention",
  "completed",
] as const;

export const DOCUMENT_STATUSES = [
  "not_started",
  "needed",
  "submitted",
  "verified",
] as const;

export type AidTaskStatus = (typeof AID_TASK_STATUSES)[number];
export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export type AidTask = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  description: string | null;
  status: AidTaskStatus | string;
  due_date: string | null;
  category: string | null;
  priority: string | null;
  task_source?: string | null;
  stage?: string | null;
  step_order?: number | null;
  why_it_matters?: string | null;
  instructions?: string | null;
  required_info?: string | string[] | null;
  blocking_reason?: string | null;
  action_url?: string | null;
  plan_key?: string | null;
};

export const FAFSA_STAGES = [
  "Get ready",
  "Fill FAFSA",
  "Contributor completion",
  "After submission",
  "Documents and verification",
  "Aid offer review",
] as const;

export type FafsaStage = (typeof FAFSA_STAGES)[number];

export type FafsaWizardAnswer = "yes" | "no" | "not_sure" | "not_applicable" | string;

/** Canonical FAFSA intake fields — matches fafsa_intake_responses columns exactly */
export type FafsaIntakeFields = {
  aid_year: string;
  student_situation: string;
  state: string;
  schools: string;
  fafsa_progress: string;
  has_student_aid_account: FafsaWizardAnswer;
  contributor_required: FafsaWizardAnswer;
  parent_has_student_aid_account: FafsaWizardAnswer;
  has_tax_info: FafsaWizardAnswer;
  has_school_portal_access: FafsaWizardAnswer;
  has_aid_offer: FafsaWizardAnswer;
  has_verification_request: FafsaWizardAnswer;
};

export type FafsaIntakeResponse = Omit<FafsaIntakeFields, "parent_has_student_aid_account"> & {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  parent_has_student_aid_account: FafsaWizardAnswer | null;
  plan_generated_at: string | null;
};

export type FafsaIntakeFormData = FafsaIntakeFields;

export type FafsaPlanTaskInput = {
  plan_key: string;
  title: string;
  stage: FafsaStage;
  step_order: number;
  status: string;
  priority: string;
  why_it_matters: string;
  instructions: string;
  required_info: string;
  blocking_reason: string | null;
  action_url: string | null;
  description?: string | null;
};

export type DocumentItem = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  status: DocumentStatus | string;
  source: string | null;
  due_date: string | null;
  note: string | null;
};

export type ScholarshipMatch = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  scholarship_id: string | null;
  name: string;
  amount: number | null;
  match_percent: number | null;
  deadline: string | null;
  category: string | null;
  why_it_fits: string | null;
  status: string;
  is_saved: boolean;
  is_started: boolean;
  essay_angle: string | null;
  effort_level: string | null;
  recommended_action: string | null;
  ignored: boolean;
  applied: boolean;
  saved_at: string | null;
  applied_at: string | null;
  ignored_at: string | null;
};

export type AidLetter = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  school_name: string | null;
  aid_year: string | null;
  cost_of_attendance: number | null;
  grants_amount: number | null;
  scholarships_amount: number | null;
  loans_amount: number | null;
  work_study_amount: number | null;
  subsidized_loans_amount?: number | null;
  unsubsidized_loans_amount?: number | null;
  parent_plus_loans_amount?: number | null;
  private_loans_amount?: number | null;
  estimated_net_cost: number | null;
  status: string;
  notes: string | null;
};

export type AppealDraft = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  aid_letter_id: string | null;
  reason: string | null;
  draft_body: string | null;
  status: string;
};

export type School = {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  state: string | null;
  system: string | null;
  school_type: string | null;
  website_url: string | null;
  financial_aid_url: string | null;
  aid_portal_url: string | null;
  priority_deadline: string | null;
  verification_notes: string | null;
};

export type Deadline = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  school_id: string | null;
  title: string;
  description: string | null;
  deadline_date: string;
  category: string | null;
  priority: string | null;
  status: DeadlineStatus | string;
  source_type: string | null;
  source_name: string | null;
  action_url: string | null;
};

export type Scholarship = {
  id: string;
  created_at: string;
  updated_at: string | null;
  source_name: string | null;
  name: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  opens_at: string | null;
  category: string | null;
  eligibility_summary: string | null;
  student_type: string | null;
  state: string | null;
  school_id: string | null;
  major: string | null;
  gpa_requirement: string | null;
  financial_need_required: boolean;
  essay_required: boolean;
  recommendation_required: boolean;
  citizenship_requirement: string | null;
  application_url: string | null;
  source_url: string | null;
  last_checked_at: string | null;
  verification_status: string;
  is_sweepstakes: boolean;
  is_renewable: boolean;
};

export type WeeklyReportRecommendation = {
  title: string;
  body: string;
};

export type WeeklyReport = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  report_week_start: string;
  aid_status: string;
  summary: string | null;
  tasks_due_count: number;
  missing_documents_count: number;
  scholarship_count: number;
  potential_scholarship_amount: number;
  top_task_ids: string[];
  top_scholarship_match_ids: string[];
  recommendations: WeeklyReportRecommendation[];
};

export type Feedback = {
  id: string;
  created_at: string;
  user_id: string | null;
  page: string | null;
  rating: string | null;
  message: string;
  email: string | null;
  status: string;
};

export type OnboardingFormData = {
  first_name: string;
  email: string;
  school: string;
  school_id: string | null;
  year: string;
  state: string;
  student_type: string;
  fafsa_status: string;
  aid_types: string[];
  main_goals: string[];
  interested_categories: string[];
  essay_preference: string;
  effort_preference: string;
  major_interests: string;
  majors: string[];
  interests: string[];
  first_generation: boolean;
  transfer_student: boolean;
  pell_grant_eligible: boolean;
  cal_grant_eligible: boolean;
  gpa: string;
  profile_essay_preference: string;
};

export type AidRecommendation = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  source: string | null;
  related_table: string | null;
  related_id: string | null;
  due_date: string | null;
  confidence: number;
};

export type FafsaWorkflowStep = {
  id: string;
  created_at: string;
  step_order: number;
  title: string;
  description: string | null;
  category: string | null;
  applies_to: string | null;
  default_priority: string | null;
  source_url: string | null;
};

export type UserFafsaStep = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  workflow_step_id: string;
  status: string;
  notes: string | null;
  workflow_step?: FafsaWorkflowStep | null;
};

export type ScholarshipSource = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  name: string;
  provider: string | null;
  amount: number | null;
  deadline: string | null;
  eligibility?: string | null;
  url: string | null;
  application_url?: string | null;
  source_url?: string | null;
  eligible_states: string[] | null;
  education_levels: string[] | null;
  student_types: string[] | null;
  major_keywords: string[] | null;
  interest_tags?: string[] | null;
  tags: string[] | null;
  need_based: boolean;
  merit_based: boolean;
  essay_required: boolean;
  effort_level?: string | null;
  min_gpa: number | null;
  source: string | null;
  verified_date?: string | null;
  active: boolean;
};

export const FAFSA_RECEIVED_STATUSES = [
  "unknown",
  "received",
  "not_received",
  "action_needed",
] as const;

export const PORTAL_CHECKED_STATUSES = ["not_checked", "checked", "action_needed"] as const;

export const DOCUMENTS_REQUESTED_STATUSES = [
  "unknown",
  "none",
  "requested",
  "submitted",
  "completed",
] as const;

export const VERIFICATION_STATUSES = [
  "not_requested",
  "requested",
  "submitted",
  "approved",
  "action_needed",
] as const;

export const AID_OFFER_STATUSES = [
  "not_received",
  "estimated",
  "official",
  "reviewed",
  "accepted_or_declined",
] as const;

export const SCHOOL_AID_TASK_TYPES = [
  "portal_check",
  "document_request",
  "verification",
  "aid_offer",
  "general",
] as const;

export const SCHOOL_AID_TASK_STATUSES = ["todo", "done", "skipped"] as const;

export const SCHOOL_AID_TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type FafsaReceivedStatus = (typeof FAFSA_RECEIVED_STATUSES)[number];
export type PortalCheckedStatus = (typeof PORTAL_CHECKED_STATUSES)[number];
export type DocumentsRequestedStatus = (typeof DOCUMENTS_REQUESTED_STATUSES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
export type AidOfferStatus = (typeof AID_OFFER_STATUSES)[number];
export type SchoolAidTaskType = (typeof SCHOOL_AID_TASK_TYPES)[number];
export type SchoolAidTaskStatus = (typeof SCHOOL_AID_TASK_STATUSES)[number];
export type SchoolAidTaskPriority = (typeof SCHOOL_AID_TASK_PRIORITIES)[number];

export type UserSchoolAidStatus = {
  id: string;
  user_id: string;
  school_name: string;
  portal_url: string | null;
  school_email: string | null;
  fafsa_received_status: FafsaReceivedStatus;
  portal_checked_status: PortalCheckedStatus;
  documents_requested_status: DocumentsRequestedStatus;
  verification_status: VerificationStatus;
  aid_offer_status: AidOfferStatus;
  last_checked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSchoolAidTask = {
  id: string;
  user_id: string;
  school_aid_status_id: string;
  title: string;
  description: string | null;
  task_type: SchoolAidTaskType;
  status: SchoolAidTaskStatus;
  priority: SchoolAidTaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserAidOffer = {
  id: string;
  user_id: string;
  school_name: string;
  offer_status: AidOfferRecordStatus;
  academic_year: string | null;
  cost_of_attendance: number;
  tuition_and_fees: number;
  housing_and_food: number;
  books_and_supplies: number;
  transportation: number;
  personal_expenses: number;
  grants_and_scholarships: number;
  work_study: number;
  federal_student_loans: number;
  parent_plus_loans: number;
  private_loans: number;
  other_aid: number;
  renewal_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const AID_OFFER_RECORD_STATUSES = ["draft", "estimated", "official", "reviewed"] as const;

export type AidOfferRecordStatus = (typeof AID_OFFER_RECORD_STATUSES)[number];

export const SCHOLARSHIP_TYPES = [
  "general",
  "need_based",
  "merit_based",
  "local",
  "major_specific",
  "identity_based",
  "first_gen",
  "transfer",
  "school_specific",
] as const;

export type ScholarshipType = (typeof SCHOLARSHIP_TYPES)[number];

export const USER_SCHOLARSHIP_STATUSES = [
  "saved",
  "researching",
  "applying",
  "submitted",
  "won",
  "rejected",
  "skipped",
] as const;

export type UserScholarshipStatus = (typeof USER_SCHOLARSHIP_STATUSES)[number];

export const SCHOLARSHIP_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type ScholarshipPriority = (typeof SCHOLARSHIP_PRIORITIES)[number];

export type CatalogScholarship = {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  eligibility_summary: string | null;
  application_url: string | null;
  scholarship_type: ScholarshipType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserScholarshipMatch = {
  id: string;
  user_id: string;
  scholarship_id: string | null;
  custom_name: string | null;
  custom_provider: string | null;
  custom_amount: number | null;
  custom_deadline: string | null;
  custom_application_url: string | null;
  match_reason: string | null;
  fit_score: number | null;
  status: UserScholarshipStatus;
  priority: ScholarshipPriority;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  scholarship?: CatalogScholarship | null;
};

export type IntelligenceUserData = {
  profile: StudentProfile | null;
  tasks: AidTask[];
  documents: DocumentItem[];
  scholarships: ScholarshipMatch[];
  deadlines: Deadline[];
  aidLetters: AidLetter[];
  weeklyReports: WeeklyReport[];
  recommendations: AidRecommendation[];
  userFafsaSteps: UserFafsaStep[];
  workflowSteps: FafsaWorkflowStep[];
  scholarshipSources: ScholarshipSource[];

  // Compatibility aliases in case older/newer files use slightly different names.
  aid_letters?: AidLetter[];
  weekly_reports?: WeeklyReport[];
  aidRecommendations?: AidRecommendation[];
  fafsaSteps?: UserFafsaStep[];
};