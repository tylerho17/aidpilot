import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IntelligenceUserData,
  ScholarshipMatch,
  ScholarshipSource,
  StudentProfile,
} from "@/lib/types";

export type ScholarshipMatchResult = {
  source: ScholarshipSource;
  score: number;
  matchPercent: number;
  rationale: string[];
};

function throwReadable(error: { message?: string } | null) {
  throw new Error(error?.message ?? JSON.stringify(error));
}

function mapYearToEducationLevel(year: string | null | undefined) {
  if (!year) return "undergraduate";

  const y = year.toLowerCase();

  if (y === "graduate") return "graduate";
  if (y === "transfer") return "undergraduate";

  return "undergraduate";
}

function daysUntil(dateStr: string | null | undefined) {
  if (!dateStr) return null;

  const date = new Date(dateStr + "T12:00:00");
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function scoreScholarshipSource(
  source: ScholarshipSource,
  profile: StudentProfile
): ScholarshipMatchResult {
  let score = 40;
  const rationale: string[] = [];

  const state = (profile.state ?? "").toUpperCase();
  const yearLevel = mapYearToEducationLevel(profile.year);
  const studentType = profile.student_type ?? "";

  if (source.eligible_states?.length) {
    const stateMatches = source.eligible_states.some(
      (eligibleState) => eligibleState.toUpperCase() === state
    );

    if (state && stateMatches) {
      score += 20;
      rationale.push(`Matches your state (${profile.state})`);
    }
  } else {
    score += 8;
    rationale.push("Open to multiple states");
  }

  if (source.education_levels?.length) {
    const educationMatches =
      source.education_levels.includes(yearLevel) ||
      source.education_levels.includes("all");

    if (educationMatches) {
      score += 15;
      rationale.push(`Matches your education level (${profile.year ?? "student"})`);
    }
  } else {
    score += 5;
  }

  if (source.student_types?.length) {
    const typeMatches = source.student_types.some(
      (type) => type.toLowerCase() === studentType.toLowerCase()
    );

    if (typeMatches) {
      score += 15;
      rationale.push("Matches your student type");
    }
  }

  if (source.tags?.length && profile.main_goals?.length) {
    const goalText = profile.main_goals.join(" ").toLowerCase();

    const tagHits = source.tags.filter(
      (tag) =>
        goalText.includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes("scholarship")
    );

    if (tagHits.length > 0) {
      score += 10;
      rationale.push("Related to your goals");
    }
  }

  if (source.major_keywords?.length) {
    score += 5;
    rationale.push("May fit your academic interests");
  }

  const days = daysUntil(source.deadline);

  if (days !== null && days >= 0 && days <= 60) {
    score += 12;
    rationale.push(`Deadline within ${days} days`);
  }

  if (!source.essay_required) {
    score += 3;
    rationale.push("No essay required");
  }

  const hasNeedBasedAid =
    profile.aid_types?.some(
      (aidType) =>
        aidType.toLowerCase().includes("pell") ||
        aidType.toLowerCase().includes("grant")
    ) ?? false;

  if (source.need_based && hasNeedBasedAid) {
    score += 8;
    rationale.push("Need-based award may fit your aid profile");
  }

  const matchPercent = Math.min(98, Math.max(45, score));

  return {
    source,
    score,
    matchPercent,
    rationale:
      rationale.length > 0
        ? rationale
        : ["Starter match based on your profile and available scholarship information"],
  };
}

export function rankScholarshipSources(
  sources: ScholarshipSource[],
  profile: StudentProfile
) {
  return sources
    .filter((source) => source.active !== false)
    .map((source) => scoreScholarshipSource(source, profile))
    .sort((a, b) => b.score - a.score);
}

export async function generateScholarshipMatchesForUser(
  supabase: SupabaseClient,
  userId: string,
  userData: IntelligenceUserData
): Promise<ScholarshipMatch[]> {
  const profile = userData.profile;

  if (!profile) {
    throw new Error("Student profile is required to generate scholarship matches.");
  }

  let sources = userData.scholarshipSources?.filter((source) => source.active !== false) ?? [];

  if (!sources.length) {
    const { data, error } = await supabase
      .from("scholarship_sources")
      .select("*")
      .eq("active", true)
      .order("deadline");

    if (error) {
      throwReadable(error);
    }

    sources = (data ?? []) as ScholarshipSource[];
  }

  if (!sources.length) {
    return userData.scholarships ?? [];
  }

  const ranked = rankScholarshipSources(sources, profile).slice(0, 15);
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("scholarship_matches")
    .select("id, scholarship_id, name")
    .eq("user_id", userId);

  if (existingError) {
    throwReadable(existingError);
  }

  const existingBySourceId = new Map(
    (existing ?? [])
      .filter((match) => match.scholarship_id)
      .map((match) => [match.scholarship_id as string, match])
  );

  const results: ScholarshipMatch[] = [];

  for (const match of ranked) {
    const whyItFits =
      match.rationale.join(". ") +
      ". Verify eligibility with the scholarship provider.";

    const row = {
      user_id: userId,
      scholarship_id: match.source.id,
      name: match.source.name,
      amount: match.source.amount,
      match_percent: match.matchPercent,
      deadline: match.source.deadline,
      category: match.source.tags?.[0] ?? "General",
      why_it_fits: whyItFits,
      status: match.matchPercent >= 80 ? "new" : "saved",
      is_saved: match.matchPercent < 80,
      is_started: false,
      updated_at: now,
    };

    const previousMatch = existingBySourceId.get(match.source.id);

    if (previousMatch) {
      const { data, error } = await supabase
        .from("scholarship_matches")
        .update(row)
        .eq("id", previousMatch.id)
        .select()
        .single();

      if (error) {
        throwReadable(error);
      }

      results.push(data as ScholarshipMatch);
    } else {
      const { data, error } = await supabase
        .from("scholarship_matches")
        .insert(row)
        .select()
        .single();

      if (error) {
        throwReadable(error);
      }

      results.push(data as ScholarshipMatch);
    }
  }

  return results.sort(
    (a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0)
  );
}