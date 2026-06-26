import type { ScholarshipSource } from "@/lib/types";

export type ScholarshipSourceFormValues = {
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  eligible_states: string;
  education_levels: string;
  student_types: string;
  major_keywords: string;
  interest_tags: string;
  tags: string;
  essay_required: boolean;
  effort_level: string;
  application_url: string;
  source_url: string;
  source: string;
  verified_date: string;
  active: boolean;
  need_based: boolean;
  merit_based: boolean;
};

export function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinCsv(values: string[] | null | undefined): string {
  return (values ?? []).join(", ");
}

export function sourceToFormValues(source: ScholarshipSource): ScholarshipSourceFormValues {
  return {
    name: source.name ?? "",
    provider: source.provider ?? "",
    amount: source.amount != null ? String(source.amount) : "",
    deadline: source.deadline ?? "",
    eligibility: source.eligibility ?? "",
    eligible_states: joinCsv(source.eligible_states),
    education_levels: joinCsv(source.education_levels),
    student_types: joinCsv(source.student_types),
    major_keywords: joinCsv(source.major_keywords),
    interest_tags: joinCsv(source.interest_tags),
    tags: joinCsv(source.tags),
    essay_required: source.essay_required ?? false,
    effort_level: source.effort_level ?? "medium",
    application_url: source.application_url ?? source.url ?? "",
    source_url: source.source_url ?? source.url ?? "",
    source: source.source ?? "",
    verified_date: source.verified_date ?? "",
    active: source.active !== false,
    need_based: source.need_based ?? false,
    merit_based: source.merit_based ?? false,
  };
}

export function formValuesToPayload(values: ScholarshipSourceFormValues) {
  const amount = values.amount.trim() ? Number(values.amount) : null;
  return {
    name: values.name.trim(),
    provider: values.provider.trim() || null,
    amount: Number.isFinite(amount) ? amount : null,
    deadline: values.deadline.trim() || null,
    eligibility: values.eligibility.trim() || null,
    eligible_states: splitCsv(values.eligible_states),
    education_levels: splitCsv(values.education_levels),
    student_types: splitCsv(values.student_types),
    major_keywords: splitCsv(values.major_keywords),
    interest_tags: splitCsv(values.interest_tags),
    tags: splitCsv(values.tags),
    essay_required: values.essay_required,
    effort_level: values.effort_level || "medium",
    application_url: values.application_url.trim() || null,
    source_url: values.source_url.trim() || null,
    url: values.application_url.trim() || values.source_url.trim() || null,
    source: values.source.trim() || null,
    verified_date: values.verified_date.trim() || null,
    active: values.active,
    need_based: values.need_based,
    merit_based: values.merit_based,
    updated_at: new Date().toISOString(),
  };
}

export const EMPTY_SCHOLARSHIP_FORM: ScholarshipSourceFormValues = {
  name: "",
  provider: "",
  amount: "",
  deadline: "",
  eligibility: "",
  eligible_states: "",
  education_levels: "undergraduate",
  student_types: "College student",
  major_keywords: "",
  interest_tags: "",
  tags: "",
  essay_required: false,
  effort_level: "medium",
  application_url: "",
  source_url: "",
  source: "admin",
  verified_date: new Date().toISOString().slice(0, 10),
  active: true,
  need_based: false,
  merit_based: false,
};
