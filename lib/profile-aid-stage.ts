import { parseScholarshipPreferences } from "@/lib/scholarship-preferences";
import type { AidStage } from "@/lib/onboarding-aid-stage";
import type { StudentProfile } from "@/lib/types";

export function getProfileAidStage(profile: StudentProfile | null | undefined): AidStage | null {
  if (!profile?.scholarship_preferences) return null;
  const prefs = parseScholarshipPreferences(profile.scholarship_preferences);
  const stage = prefs.aid_stage;
  if (
    stage === "applying_for_fafsa" ||
    stage === "waiting_for_offer" ||
    stage === "comparing_offers" ||
    stage === "closing_gap"
  ) {
    return stage;
  }
  return null;
}
