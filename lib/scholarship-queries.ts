import type { SupabaseClient } from "@supabase/supabase-js";
import { isScholarshipSchemaError, SCHOLARSHIP_SCHEMA_BANNER_MESSAGE } from "@/lib/scholarship-errors";
import type { ScholarshipMatch, ScholarshipSource } from "@/lib/types";

/** Base columns from schema.sql + 002_database_expansion.sql */
export const SCHOLARSHIP_MATCH_BASE_SELECT =
  "id,created_at,updated_at,user_id,scholarship_id,name,amount,match_percent,deadline,category,why_it_fits,status,is_saved,is_started" as const;

/** Phase 5 columns from 007/009/017 */
export const SCHOLARSHIP_MATCH_EXTENDED_SELECT =
  `${SCHOLARSHIP_MATCH_BASE_SELECT},essay_angle,effort_level,recommended_action,ignored,applied,saved_at,applied_at,ignored_at` as const;

/** Base columns from 004_mvp_intelligence_layer.sql */
export const SCHOLARSHIP_SOURCE_BASE_SELECT =
  "id,created_at,name,provider,amount,deadline,url,eligible_states,education_levels,student_types,major_keywords,tags,need_based,merit_based,essay_required,min_gpa,source,active" as const;

/** Phase 5 columns from 007/017 */
export const SCHOLARSHIP_SOURCE_EXTENDED_SELECT =
  `${SCHOLARSHIP_SOURCE_BASE_SELECT},updated_at,eligibility,interest_tags,effort_level,application_url,source_url,verified_date` as const;

export type ScholarshipSchemaMode = "extended" | "base";

export type ScholarshipLoadResult<T> = {
  data: T[];
  schemaMode: ScholarshipSchemaMode;
  schemaWarning: string | null;
  error: unknown | null;
};

function normalizeScholarshipMatch(row: Partial<ScholarshipMatch>): ScholarshipMatch {
  const status = row.status ?? "new";
  const isSaved = row.is_saved ?? (status === "saved" || status === "applied");
  const isApplied = row.applied ?? status === "applied";

  return {
    id: row.id ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? null,
    user_id: row.user_id ?? "",
    scholarship_id: row.scholarship_id ?? null,
    name: row.name ?? "Scholarship",
    amount: row.amount ?? null,
    match_percent: row.match_percent ?? null,
    deadline: row.deadline ?? null,
    category: row.category ?? null,
    why_it_fits: row.why_it_fits ?? null,
    status,
    is_saved: isSaved,
    is_started: row.is_started ?? isApplied,
    essay_angle: row.essay_angle ?? null,
    effort_level: row.effort_level ?? null,
    recommended_action: row.recommended_action ?? null,
    ignored: row.ignored ?? status === "ignored",
    applied: isApplied,
    saved_at: row.saved_at ?? null,
    applied_at: row.applied_at ?? null,
    ignored_at: row.ignored_at ?? null,
  };
}

function normalizeScholarshipSource(row: Partial<ScholarshipSource>): ScholarshipSource {
  return {
    id: row.id ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? null,
    name: row.name ?? "Scholarship",
    provider: row.provider ?? null,
    amount: row.amount ?? null,
    deadline: row.deadline ?? null,
    eligibility: row.eligibility ?? null,
    url: row.url ?? null,
    application_url: row.application_url ?? row.url ?? null,
    source_url: row.source_url ?? row.url ?? null,
    eligible_states: row.eligible_states ?? null,
    education_levels: row.education_levels ?? null,
    student_types: row.student_types ?? null,
    major_keywords: row.major_keywords ?? null,
    interest_tags: row.interest_tags ?? null,
    tags: row.tags ?? null,
    need_based: row.need_based ?? false,
    merit_based: row.merit_based ?? false,
    essay_required: row.essay_required ?? false,
    effort_level: row.effort_level ?? null,
    min_gpa: row.min_gpa ?? null,
    source: row.source ?? null,
    verified_date: row.verified_date ?? null,
    active: row.active ?? true,
  };
}

export async function loadScholarshipMatches(
  supabase: SupabaseClient,
  userId: string
): Promise<ScholarshipLoadResult<ScholarshipMatch>> {
  const extended = await supabase
    .from("scholarship_matches")
    .select(SCHOLARSHIP_MATCH_EXTENDED_SELECT as "*")
    .eq("user_id", userId)
    .order("match_percent", { ascending: false });

  if (!extended.error) {
    return {
      data: (extended.data ?? []).map((row) => normalizeScholarshipMatch(row as Partial<ScholarshipMatch>)),
      schemaMode: "extended",
      schemaWarning: null,
      error: null,
    };
  }

  if (!isScholarshipSchemaError(extended.error, "scholarship_matches")) {
    return { data: [], schemaMode: "base", schemaWarning: null, error: extended.error };
  }

  const base = await supabase
    .from("scholarship_matches")
    .select(SCHOLARSHIP_MATCH_BASE_SELECT as "*")
    .eq("user_id", userId)
    .order("match_percent", { ascending: false });

  if (base.error) {
    return { data: [], schemaMode: "base", schemaWarning: SCHOLARSHIP_SCHEMA_BANNER_MESSAGE, error: base.error };
  }

  return {
    data: (base.data ?? []).map((row) => normalizeScholarshipMatch(row as Partial<ScholarshipMatch>)),
    schemaMode: "base",
    schemaWarning: SCHOLARSHIP_SCHEMA_BANNER_MESSAGE,
    error: null,
  };
}

export async function loadScholarshipSources(
  supabase: SupabaseClient
): Promise<ScholarshipLoadResult<ScholarshipSource>> {
  const extended = await supabase
    .from("scholarship_sources")
    .select(SCHOLARSHIP_SOURCE_EXTENDED_SELECT as "*")
    .eq("active", true)
    .order("deadline");

  if (!extended.error) {
    return {
      data: (extended.data ?? []).map((row) => normalizeScholarshipSource(row as Partial<ScholarshipSource>)),
      schemaMode: "extended",
      schemaWarning: null,
      error: null,
    };
  }

  if (!isScholarshipSchemaError(extended.error, "scholarship_sources")) {
    return { data: [], schemaMode: "base", schemaWarning: null, error: extended.error };
  }

  const base = await supabase
    .from("scholarship_sources")
    .select(SCHOLARSHIP_SOURCE_BASE_SELECT as "*")
    .eq("active", true)
    .order("deadline");

  if (base.error) {
    return { data: [], schemaMode: "base", schemaWarning: SCHOLARSHIP_SCHEMA_BANNER_MESSAGE, error: base.error };
  }

  return {
    data: (base.data ?? []).map((row) => normalizeScholarshipSource(row as Partial<ScholarshipSource>)),
    schemaMode: "base",
    schemaWarning: SCHOLARSHIP_SCHEMA_BANNER_MESSAGE,
    error: null,
  };
}

export function buildScholarshipMatchWriteRow(
  row: Record<string, unknown>,
  schemaMode: ScholarshipSchemaMode
): Record<string, unknown> {
  if (schemaMode === "extended") return row;

  const baseKeys = new Set(SCHOLARSHIP_MATCH_BASE_SELECT.split(","));
  return Object.fromEntries(Object.entries(row).filter(([key]) => baseKeys.has(key)));
}

export function buildScholarshipMatchActionUpdate(
  action: "save" | "apply" | "ignore",
  now: string,
  schemaMode: ScholarshipSchemaMode
): Record<string, unknown> {
  if (schemaMode === "extended") {
    if (action === "save") {
      return {
        is_saved: true,
        status: "saved",
        saved_at: now,
        ignored: false,
        ignored_at: null,
        updated_at: now,
      };
    }
    if (action === "apply") {
      return {
        applied: true,
        is_started: true,
        is_saved: true,
        applied_at: now,
        saved_at: now,
        status: "applied",
        ignored: false,
        ignored_at: null,
        updated_at: now,
      };
    }
    return {
      ignored: true,
      ignored_at: now,
      status: "ignored",
      updated_at: now,
    };
  }

  if (action === "save") {
    return { is_saved: true, status: "saved", updated_at: now };
  }
  if (action === "apply") {
    return { is_started: true, is_saved: true, status: "applied", updated_at: now };
  }
  return { status: "ignored", updated_at: now };
}
