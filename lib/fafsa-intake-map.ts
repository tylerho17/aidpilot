import type { FafsaIntakeFormData, FafsaIntakeResponse } from "@/lib/types";

export const FAFSA_INTAKE_SAVE_COLUMNS = [
  "user_id",
  "aid_year",
  "student_situation",
  "state",
  "schools",
  "fafsa_progress",
  "has_student_aid_account",
  "contributor_required",
  "parent_has_student_aid_account",
  "has_tax_info",
  "has_school_portal_access",
  "has_aid_offer",
  "has_verification_request",
  "plan_generated_at",
  "updated_at",
] as const;

/** DB row — schools may be text[] in production */
export type FafsaIntakeDbPayload = {
  user_id: string;
  aid_year: string;
  student_situation: string;
  state: string;
  schools: string[] | string;
  fafsa_progress: string;
  has_student_aid_account: string;
  contributor_required: string;
  parent_has_student_aid_account: string | null;
  has_tax_info: string;
  has_school_portal_access: string;
  has_aid_offer: string;
  has_verification_request: string;
  plan_generated_at: string;
  updated_at: string;
};

export function normalizeFafsaAnswer(value: unknown, fallback = "not_sure"): string {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

export function splitSchoolsInput(value: string): string[] {
  const parts = value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : ["Not set yet"];
}

export function formatSchoolsFromDb(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  if (typeof value === "string") return value;
  return "";
}

export function toRequiredInfoArray(value: string | null | undefined): string[] {
  const trimmed = value?.trim();
  if (!trimmed) return [];
  return [trimmed];
}

export function buildIntakeDbPayload(
  userId: string,
  form: FafsaIntakeFormData,
  now: string,
  options?: { schoolsAsText?: boolean }
): FafsaIntakeDbPayload {
  const contributorRequired = normalizeFafsaAnswer(form.contributor_required);
  const parentAccount =
    contributorRequired === "yes" || contributorRequired === "not_sure"
      ? normalizeFafsaAnswer(form.parent_has_student_aid_account)
      : null;

  const schoolList = splitSchoolsInput(form.schools);

  return {
    user_id: userId,
    aid_year: form.aid_year,
    student_situation: form.student_situation,
    state: form.state,
    schools: options?.schoolsAsText ? schoolList.join(", ") : schoolList,
    fafsa_progress: form.fafsa_progress,
    has_student_aid_account: normalizeFafsaAnswer(form.has_student_aid_account),
    contributor_required: contributorRequired,
    parent_has_student_aid_account: parentAccount,
    has_tax_info: normalizeFafsaAnswer(form.has_tax_info),
    has_school_portal_access: normalizeFafsaAnswer(form.has_school_portal_access),
    has_aid_offer: normalizeFafsaAnswer(form.has_aid_offer, "no"),
    has_verification_request: normalizeFafsaAnswer(form.has_verification_request),
    plan_generated_at: now,
    updated_at: now,
  };
}

export function isSchoolsTypeMismatch(error: unknown): boolean {
  const message = supabaseErrorMessage(error).toLowerCase();
  return message.includes("schools") && (message.includes("text[]") || message.includes("array"));
}

export function isRequiredInfoTypeMismatch(error: unknown): boolean {
  const message = supabaseErrorMessage(error).toLowerCase();
  return message.includes("required_info") && (message.includes("text[]") || message.includes("array"));
}

export function supabaseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as { message?: string; details?: string; hint?: string; code?: string };
    return [record.message, record.details, record.hint, record.code].filter(Boolean).join(" | ");
  }
  return String(error);
}

export function logFafsaSupabaseError(label: string, error: unknown, payload?: unknown) {
  console.error(label, {
    error,
    message: supabaseErrorMessage(error),
    payload,
    supabase:
      error && typeof error === "object"
        ? {
            message: "message" in error ? (error as { message?: string }).message : undefined,
            code: "code" in error ? (error as { code?: string }).code : undefined,
            details: "details" in error ? (error as { details?: string }).details : undefined,
            hint: "hint" in error ? (error as { hint?: string }).hint : undefined,
          }
        : undefined,
  });
}

/** Read DB row into canonical intake shape (legacy column fallback for old rows only). */
export function parseIntakeRow(row: Record<string, unknown>): FafsaIntakeResponse {
  const contributorRequired = normalizeFafsaAnswer(
    row.contributor_required ?? row.needs_parent_info
  );
  const parentRaw = row.parent_has_student_aid_account ?? row.parent_has_account;
  const parentAccount =
    parentRaw == null && contributorRequired === "no"
      ? null
      : normalizeFafsaAnswer(parentRaw);

  return {
    id: String(row.id ?? ""),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : null,
    user_id: String(row.user_id ?? ""),
    aid_year: String(row.aid_year ?? ""),
    student_situation: String(row.student_situation ?? "Applying to college"),
    state: String(row.state ?? "CA"),
    schools: formatSchoolsFromDb(row.schools),
    fafsa_progress: normalizeFafsaAnswer(row.fafsa_progress, "not_started"),
    has_student_aid_account: normalizeFafsaAnswer(
      row.has_student_aid_account ?? row.has_studentaid_account
    ),
    contributor_required: contributorRequired,
    parent_has_student_aid_account: parentAccount,
    has_tax_info: normalizeFafsaAnswer(row.has_tax_info ?? row.has_tax_info_access),
    has_school_portal_access: normalizeFafsaAnswer(row.has_school_portal_access),
    has_aid_offer: normalizeFafsaAnswer(row.has_aid_offer ?? row.received_aid_offer, "no"),
    has_verification_request: normalizeFafsaAnswer(
      row.has_verification_request ?? row.verification_requested
    ),
    plan_generated_at: row.plan_generated_at ? String(row.plan_generated_at) : null,
  };
}
