export type StudentProfile = {
  id: string;
  created_at: string;
  updated_at: string;
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
  updated_at: string;
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
  updated_at: string;
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
  updated_at: string;
  user_id: string;
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
