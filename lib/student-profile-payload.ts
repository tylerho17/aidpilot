import type { OnboardingFormData, School, StudentProfile } from "@/lib/types";
import { parseCommaSeparated } from "@/lib/data-helpers";
import type { ScholarshipPreferences } from "@/lib/scholarship-preferences";

/** Columns guaranteed by supabase/schema.sql — safe for required onboarding save. */
export const STUDENT_PROFILE_REQUIRED_SAVE_COLUMNS = [
  "id",
  "first_name",
  "email",
  "school",
  "year",
  "state",
  "student_type",
  "fafsa_status",
  "aid_types",
  "main_goals",
  "is_onboarded",
  "updated_at",
] as const;

/** Canonical profile / scholarship matching columns (added by migrations 015–016). */
export const STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS = [
  "user_id",
  "full_name",
  "school_id",
  "school_name",
  "education_level",
  "graduation_year",
  "majors",
  "interests",
  "gpa",
  "essay_preference",
  "first_generation",
  "transfer_student",
  "pell_grant_eligible",
  "cal_grant_eligible",
  "scholarship_preferences",
] as const;

export const STUDENT_PROFILE_ALLOWED_UPDATE_COLUMNS = new Set<string>([
  ...STUDENT_PROFILE_REQUIRED_SAVE_COLUMNS,
  ...STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS,
]);

type RequiredColumn = (typeof STUDENT_PROFILE_REQUIRED_SAVE_COLUMNS)[number];
type OptionalColumn = (typeof STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS)[number];

export type OnboardingProfileContext = {
  userId: string;
  form: OnboardingFormData;
  resolvedSchool: string;
  matchedSchool: School | undefined;
};

function buildScholarshipPreferences(form: OnboardingFormData): ScholarshipPreferences {
  return {
    interested_categories: form.interested_categories,
    essay_preference: form.essay_preference as ScholarshipPreferences["essay_preference"],
    effort_preference: form.effort_preference as ScholarshipPreferences["effort_preference"],
    state_preference: form.state,
    major_interests: form.major_interests.trim(),
  };
}

export function mapOnboardingToProfileValues({
  userId,
  form,
  resolvedSchool,
  matchedSchool,
}: OnboardingProfileContext): Record<string, unknown> {
  const now = new Date().toISOString();
  const majors = form.majors.length ? form.majors : parseCommaSeparated(form.major_interests);

  return {
    id: userId,
    first_name: form.first_name.trim(),
    email: form.email.trim(),
    school: resolvedSchool,
    year: form.year,
    state: form.state,
    student_type: form.student_type,
    fafsa_status: form.fafsa_status,
    aid_types: form.aid_types,
    main_goals: form.main_goals,
    is_onboarded: true,
    updated_at: now,
    user_id: userId,
    full_name: form.first_name.trim(),
    school_id: matchedSchool?.id ?? form.school_id,
    school_name: resolvedSchool,
    education_level: form.year,
    graduation_year: null,
    majors,
    interests: form.interests,
    gpa: form.gpa.trim() ? Number(form.gpa) : null,
    essay_preference: form.profile_essay_preference,
    first_generation: form.first_generation,
    transfer_student: form.transfer_student,
    pell_grant_eligible: form.pell_grant_eligible,
    cal_grant_eligible: form.cal_grant_eligible,
    scholarship_preferences: buildScholarshipPreferences(form),
  };
}

export function pickAllowedColumns<T extends string>(
  values: Record<string, unknown>,
  allowlist: readonly T[]
): Partial<Record<T, unknown>> {
  const picked: Partial<Record<T, unknown>> = {};

  for (const key of allowlist) {
    if (key in values) {
      picked[key] = values[key];
    }
  }

  return picked;
}

export function buildRequiredOnboardingPayload(
  context: OnboardingProfileContext
): Partial<Record<RequiredColumn, unknown>> {
  const values = mapOnboardingToProfileValues(context);
  return pickAllowedColumns(values, STUDENT_PROFILE_REQUIRED_SAVE_COLUMNS);
}

export function buildOptionalOnboardingFields(
  context: OnboardingProfileContext
): Partial<Record<OptionalColumn, unknown>> {
  const values = mapOnboardingToProfileValues(context);
  return pickAllowedColumns(values, STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS);
}

export function sanitizeProfileUpdates(updates: Partial<StudentProfile>): Partial<StudentProfile> {
  const sanitized: Partial<StudentProfile> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (STUDENT_PROFILE_ALLOWED_UPDATE_COLUMNS.has(key)) {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }

  return sanitized;
}

export function withCanonicalProfileFields(updates: Partial<StudentProfile>): Partial<StudentProfile> {
  const merged: Partial<StudentProfile> = { ...updates };

  if (updates.first_name !== undefined) {
    merged.full_name = updates.first_name;
  }
  if (updates.school !== undefined) {
    merged.school_name = updates.school;
  }
  if (updates.year !== undefined) {
    merged.education_level = updates.year;
  }
  if (updates.id) {
    merged.user_id = updates.id;
  }

  return sanitizeProfileUpdates(merged);
}
