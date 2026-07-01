import type { StudentProfile } from "@/lib/types";

type ProfileLike = StudentProfile | Partial<StudentProfile> | null | undefined;

export function getProfileFullName(profile: ProfileLike): string {
  return profile?.full_name?.trim() || profile?.first_name?.trim() || "";
}

export function getProfileSchoolName(profile: ProfileLike): string {
  return profile?.school_name?.trim() || profile?.school?.trim() || "";
}

export function getProfileEducationLevel(profile: ProfileLike): string | null {
  return profile?.education_level ?? profile?.year ?? null;
}
