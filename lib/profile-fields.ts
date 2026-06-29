import type { StudentProfile } from "@/lib/types";

export function getProfileFullName(profile: StudentProfile | null | undefined): string {
  return profile?.full_name?.trim() || profile?.first_name?.trim() || "";
}

export function getProfileSchoolName(profile: StudentProfile | null | undefined): string {
  return profile?.school_name?.trim() || profile?.school?.trim() || "";
}

export function getProfileEducationLevel(profile: StudentProfile | null | undefined): string | null {
  return profile?.education_level ?? profile?.year ?? null;
}
