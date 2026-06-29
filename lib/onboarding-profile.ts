import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentProfile } from "@/lib/types";
import {
  buildOptionalOnboardingFields,
  buildRequiredOnboardingPayload,
  type OnboardingProfileContext,
  STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS,
} from "@/lib/student-profile-payload";

export const PROFILE_OPTIONAL_SAVE_NOTICE_KEY = "aidpilot_profile_optional_notice";
export const PROFILE_OPTIONAL_SAVE_NOTICE_MESSAGE =
  "We saved your required profile info. Some optional matching details can be updated later in Settings.";

export function isProfileSchemaColumnError(error: unknown): boolean {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message ?? "")
      : error instanceof Error
        ? error.message
        : String(error ?? "");

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";

  return (
    code === "PGRST204" ||
    /schema cache/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /column .* does not exist/i.test(message)
  );
}

async function saveOptionalProfileFieldsIndividually(
  supabase: SupabaseClient,
  userId: string,
  fields: Partial<Record<(typeof STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS)[number], unknown>>
): Promise<boolean> {
  const now = new Date().toISOString();
  let anySkipped = false;

  for (const column of STUDENT_PROFILE_OPTIONAL_SAVE_COLUMNS) {
    if (!(column in fields)) {
      continue;
    }

    const { error } = await supabase
      .from("student_profiles")
      .update({ [column]: fields[column], updated_at: now })
      .eq("id", userId);

    if (!error) {
      continue;
    }

    if (isProfileSchemaColumnError(error)) {
      anySkipped = true;
      continue;
    }

    console.error(`Optional onboarding profile field "${column}" failed:`, error);
    throw new Error("We couldn't save your optional profile details. Please try again.");
  }

  return anySkipped;
}

export async function saveOnboardingProfile(
  supabase: SupabaseClient,
  context: OnboardingProfileContext
): Promise<{ optionalFieldsSkipped: boolean }> {
  const requiredPayload = buildRequiredOnboardingPayload(context);
  const { error: requiredError } = await supabase.from("student_profiles").upsert(requiredPayload);

  if (requiredError) {
    if (isProfileSchemaColumnError(requiredError)) {
      throw new Error(
        "Your profile could not be saved because the database schema is out of date. Please contact support."
      );
    }
    throw new Error("We couldn't save your profile. Please try again.");
  }

  const optionalFields = buildOptionalOnboardingFields(context);
  const optionalFieldsSkipped = await saveOptionalProfileFieldsIndividually(
    supabase,
    context.userId,
    optionalFields
  );

  return { optionalFieldsSkipped };
}

export function pickOptionalProfileFields(profile: Partial<StudentProfile>) {
  return {
    user_id: profile.user_id ?? profile.id,
    full_name: profile.full_name,
    school_id: profile.school_id,
    school_name: profile.school_name,
    education_level: profile.education_level,
    graduation_year: profile.graduation_year,
    majors: profile.majors,
    interests: profile.interests,
    first_generation: profile.first_generation,
    transfer_student: profile.transfer_student,
    pell_grant_eligible: profile.pell_grant_eligible,
    cal_grant_eligible: profile.cal_grant_eligible,
    gpa: profile.gpa,
    essay_preference: profile.essay_preference,
    scholarship_preferences: profile.scholarship_preferences,
  };
}

export type { OnboardingProfileContext };
