import type { ScholarshipMatch, ScholarshipSource, StudentProfile } from "@/lib/types";

export type ScholarshipMatchResult = {
  source: ScholarshipSource;
  score: number;
  matchPercent: number;
  rationale: string[];
  essayAngle: string;
  effortLevel: string;
  recommendedAction: string;
};

function throwReadable(error: { message?: string } | null) {
  throw new Error(error?.message ?? JSON.stringify(error));
}

function mapYearToEducationLevel(year: string | null | undefined) {
  if (!year) return "undergraduate";
  const y = year.toLowerCase();
  if (y === "graduate") return "graduate";
  if (y === "transfer") return "undergraduate";
  if (y === "freshman" || y === "sophomore" || y === "junior" || y === "senior") return "undergraduate";
  return "undergraduate";
}

function daysUntil(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const date = new Date(dateStr + "T12:00:00");
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isExpired(source: ScholarshipSource) {
  const days = daysUntil(source.deadline);
  return days !== null && days < 0;
}

function textIncludes(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function arrayOverlap(a: string[] | null | undefined, b: string[] | null | undefined) {
  if (!a?.length || !b?.length) return false;
  const normalized = b.map((v) => v.toLowerCase());
  return a.some((value) => normalized.includes(value.toLowerCase()));
}

function buildEssayAngle(source: ScholarshipSource, profile: StudentProfile) {
  const goals = (profile.main_goals ?? []).join(" ").toLowerCase();
  if (source.essay_required) {
    if (goals.includes("scholarship") || goals.includes("find scholarships")) {
      return "Highlight your aid goals and how this scholarship supports your college plan.";
    }
    if (source.tags?.some((t) => goals.includes(t.toLowerCase()))) {
      return `Connect your story to themes like ${source.tags?.slice(0, 2).join(" and ")}.`;
    }
    return "Share a specific moment that shows your motivation and fit for this award.";
  }
  return "No essay required — focus on eligibility checklist and deadline.";
}

function buildRecommendedAction(source: ScholarshipSource, matchPercent: number) {
  const days = daysUntil(source.deadline);
  const applyUrl = source.application_url ?? source.url;
  if (days !== null && days <= 14) {
    return applyUrl ? `Apply this week: ${applyUrl}` : "Apply this week before the deadline passes.";
  }
  if (matchPercent >= 85) {
    return applyUrl ? `Strong match — start application: ${applyUrl}` : "Strong match — start your application this week.";
  }
  if (source.effort_level === "low") {
    return applyUrl ? `Quick win — review and apply: ${applyUrl}` : "Quick win — review requirements and apply soon.";
  }
  return applyUrl ? `Save and apply when ready: ${applyUrl}` : "Save this match and apply when you have time.";
}

export function scoreScholarshipSource(
  source: ScholarshipSource,
  profile: StudentProfile
): ScholarshipMatchResult | null {
  if (source.active === false || isExpired(source)) return null;

  let score = 35;
  const rationale: string[] = [];

  const state = (profile.state ?? "").toUpperCase();
  const yearLevel = mapYearToEducationLevel(profile.year);
  const studentType = profile.student_type ?? "";
  const goals = profile.main_goals ?? [];
  const goalText = goals.join(" ").toLowerCase();

  if (source.eligible_states?.length) {
    const stateMatches = source.eligible_states.some((s) => s.toUpperCase() === state);
    if (state && stateMatches) {
      score += 20;
      rationale.push(`Matches your state (${profile.state})`);
    }
  } else {
    score += 6;
    rationale.push("Open to multiple states");
  }

  if (source.education_levels?.length) {
    const educationMatches =
      source.education_levels.includes(yearLevel) || source.education_levels.includes("all");
    if (educationMatches) {
      score += 15;
      rationale.push(`Matches your education level (${profile.year ?? "student"})`);
    }
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

  const tagPool = [...(source.tags ?? []), ...(source.interest_tags ?? [])];
  if (tagPool.length && goals.length) {
    const tagHits = tagPool.filter(
      (tag) => goalText.includes(tag.toLowerCase()) || tag.toLowerCase().includes("scholarship")
    );
    if (tagHits.length > 0) {
      score += 15;
      rationale.push("Related to your goals");
    }
  }

  if (source.major_keywords?.length) {
    const interestHits = [...(source.interest_tags ?? []), ...tagPool].some((tag) =>
      goals.some((goal) => textIncludes(goal, tag))
    );
    if (interestHits || source.major_keywords.length > 0) {
      score += 10;
      rationale.push("May fit your academic interests");
    }
  }

  const days = daysUntil(source.deadline);
  if (days !== null && days >= 0 && days <= 30) {
    score += 15;
    rationale.push(`Deadline within ${days} days`);
  } else if (days !== null && days > 30 && days <= 60) {
    score += 10;
    rationale.push(`Deadline within ${days} days`);
  }

  if ((source.amount ?? 0) > 1000) {
    score += 10;
    rationale.push("Award amount over $1,000");
  }

  const effort = (source.effort_level ?? "medium").toLowerCase();
  if (effort === "low") {
    score += 5;
    rationale.push("Lower effort application");
  }

  if (source.essay_required) {
    score -= 3;
  } else {
    rationale.push("No essay required");
  }

  if (source.need_based && arrayOverlap(profile.aid_types, ["Cal Grant", "Pell Grant", "Work-study"])) {
    score += 5;
    rationale.push("May fit need-based aid profile");
  }

  const matchPercent = Math.min(98, Math.max(40, score));
  const essayAngle = buildEssayAngle(source, profile);
  const effortLevel = source.effort_level ?? "medium";
  const recommendedAction = buildRecommendedAction(source, matchPercent);

  return {
    source,
    score,
    matchPercent,
    rationale:
      rationale.length > 0
        ? rationale
        : ["Starter match based on your profile and available scholarship information"],
    essayAngle,
    effortLevel,
    recommendedAction,
  };
}

export function rankScholarshipSources(sources: ScholarshipSource[], profile: StudentProfile) {
  return sources
    .map((source) => scoreScholarshipSource(source, profile))
    .filter((result): result is ScholarshipMatchResult => result !== null)
    .sort((a, b) => b.score - a.score);
}

export async function generateScholarshipMatchesForUser(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  userData: import("@/lib/types").IntelligenceUserData
): Promise<ScholarshipMatch[]> {
  const profile = userData.profile;

  if (!profile) {
    console.error("generateScholarshipMatchesForUser: no student profile");
    return userData.scholarships ?? [];
  }

  let sources = userData.scholarshipSources?.filter((source) => source.active !== false) ?? [];

  if (!sources.length) {
    const { data, error } = await supabase
      .from("scholarship_sources")
      .select("*")
      .eq("active", true)
      .order("deadline");

    if (error) throwReadable(error);
    sources = (data ?? []) as ScholarshipSource[];
  }

  if (!sources.length) {
    return userData.scholarships ?? [];
  }

  const ranked = rankScholarshipSources(sources, profile).slice(0, 20);
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("scholarship_matches")
    .select("*")
    .eq("user_id", userId);

  if (existingError) throwReadable(existingError);

  const existingBySourceId = new Map(
    (existing ?? [])
      .filter((match) => match.scholarship_id)
      .map((match) => [match.scholarship_id as string, match as ScholarshipMatch])
  );

  const results: ScholarshipMatch[] = [];

  for (const match of ranked) {
    const whyItFits =
      match.rationale.join(". ") + ". Verify eligibility with the scholarship provider.";
    const previous = existingBySourceId.get(match.source.id);

    const row = {
      user_id: userId,
      scholarship_id: match.source.id,
      name: match.source.name,
      amount: match.source.amount,
      match_percent: match.matchPercent,
      deadline: match.source.deadline,
      category: match.source.tags?.[0] ?? "General",
      why_it_fits: whyItFits,
      essay_angle: match.essayAngle,
      effort_level: match.effortLevel,
      recommended_action: match.recommendedAction,
      status: previous?.ignored
        ? previous.status
        : previous?.applied
          ? "applied"
          : previous?.is_saved
            ? "saved"
            : match.matchPercent >= 80
              ? "new"
              : "saved",
      is_saved: previous?.is_saved ?? match.matchPercent < 80,
      is_started: previous?.is_started ?? false,
      ignored: previous?.ignored ?? false,
      applied: previous?.applied ?? false,
      saved_at: previous?.saved_at ?? null,
      applied_at: previous?.applied_at ?? null,
      ignored_at: previous?.ignored_at ?? null,
      updated_at: now,
    };

    if (previous) {
      const { data, error } = await supabase
        .from("scholarship_matches")
        .update(row)
        .eq("id", previous.id)
        .select()
        .single();
      if (error) throwReadable(error);
      results.push(data as ScholarshipMatch);
    } else {
      const { data, error } = await supabase
        .from("scholarship_matches")
        .insert(row)
        .select()
        .single();
      if (error) throwReadable(error);
      results.push(data as ScholarshipMatch);
    }
  }

  return results.sort((a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0));
}
