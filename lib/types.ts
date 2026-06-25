export type StudentProfile = {
  id: string;
  created_at: string;
  updated_at: string | null;
  first_name: string | null;
  email: string | null;
  school: string | null;
  year: string | null;
  state: string | null;
  student_type: string | null;
  fafsa_status: string | null;
  aid_types: string[] | null;
  main_goals: string[] | null;
  is_onboarded: boolean;
};

export type AidTask = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  category: string | null;
  priority: string | null;
};

export type DocumentItem = {
  id: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  title: string;
  status: string;
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
  status: string;
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
  year: string;
  state: string;
  student_type: string;
  fafsa_status: string;
  aid_types: string[];
  main_goals: string[];
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
  name: string;
  provider: string | null;
  amount: number | null;
  deadline: string | null;
  url: string | null;
  eligible_states: string[] | null;
  education_levels: string[] | null;
  student_types: string[] | null;
  major_keywords: string[] | null;
  tags: string[] | null;
  need_based: boolean;
  merit_based: boolean;
  essay_required: boolean;
  min_gpa: number | null;
  source: string | null;
  active: boolean;
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