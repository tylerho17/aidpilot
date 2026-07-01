export type ScholarshipPreferences = {
  interested_categories?: string[];
  essay_preference?: "no_preference" | "prefer_no_essay" | "okay_with_essay";
  effort_preference?: "any" | "low" | "medium" | "high";
  state_preference?: string;
  major_interests?: string;
  aid_stage?: string;
  academic_year?: string;
  first_aid_offer_school?: string;
  housing_status?: string;
  aid_goal?: string;
};

export const SCHOLARSHIP_CATEGORY_OPTIONS = [
  "STEM",
  "Business",
  "Health",
  "Arts",
  "Community service",
  "First-generation",
  "Need-based",
  "Transfer",
  "General",
] as const;

export const ESSAY_PREFERENCE_OPTIONS = [
  { value: "no_preference", label: "No preference" },
  { value: "prefer_no_essay", label: "Prefer no essay" },
  { value: "okay_with_essay", label: "Okay with essays" },
] as const;

export const EFFORT_PREFERENCE_OPTIONS = [
  { value: "any", label: "Any effort level" },
  { value: "low", label: "Low effort only" },
  { value: "medium", label: "Up to medium effort" },
  { value: "high", label: "Willing to do high effort" },
] as const;

export function parseScholarshipPreferences(raw: unknown): ScholarshipPreferences {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  return {
    interested_categories: Array.isArray(obj.interested_categories)
      ? obj.interested_categories.filter((v): v is string => typeof v === "string")
      : undefined,
    essay_preference:
      obj.essay_preference === "prefer_no_essay" ||
      obj.essay_preference === "okay_with_essay" ||
      obj.essay_preference === "no_preference"
        ? obj.essay_preference
        : undefined,
    effort_preference:
      obj.effort_preference === "low" ||
      obj.effort_preference === "medium" ||
      obj.effort_preference === "high" ||
      obj.effort_preference === "any"
        ? obj.effort_preference
        : undefined,
    state_preference: typeof obj.state_preference === "string" ? obj.state_preference : undefined,
    major_interests: typeof obj.major_interests === "string" ? obj.major_interests : undefined,
    aid_stage: typeof obj.aid_stage === "string" ? obj.aid_stage : undefined,
    academic_year: typeof obj.academic_year === "string" ? obj.academic_year : undefined,
    first_aid_offer_school:
      typeof obj.first_aid_offer_school === "string" ? obj.first_aid_offer_school : undefined,
    housing_status: typeof obj.housing_status === "string" ? obj.housing_status : undefined,
    aid_goal: typeof obj.aid_goal === "string" ? obj.aid_goal : undefined,
  };
}

export function emptyScholarshipPreferences(): ScholarshipPreferences {
  return {
    interested_categories: [],
    essay_preference: "no_preference",
    effort_preference: "any",
    state_preference: "",
    major_interests: "",
  };
}
