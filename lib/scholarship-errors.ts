import { toFriendlyError } from "@/lib/friendly-errors";

/** Paste this file into Supabase SQL Editor on deployed environments. */
export const SCHOLARSHIP_MIGRATION_FILE = "017_scholarship_schema_parity.sql";

export const SCHOLARSHIP_SCHEMA_BANNER_MESSAGE =
  `Scholarship schema is out of date. Ask an admin to run ${SCHOLARSHIP_MIGRATION_FILE} in the Supabase SQL Editor, then reload the schema. You can still browse sources and use the rest of AidPilot.`;

/** @deprecated Use SCHOLARSHIP_SCHEMA_BANNER_MESSAGE */
export const SCHOLARSHIP_SCHEMA_OUT_OF_DATE_MESSAGE = SCHOLARSHIP_SCHEMA_BANNER_MESSAGE;

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") return error.message;
    if ("details" in error && typeof error.details === "string") return error.details;
    if ("hint" in error && typeof error.hint === "string") return error.hint;
  }
  return "";
}

const SCHOLARSHIP_TABLES = ["scholarship_matches", "scholarship_sources"] as const;

export type ScholarshipTableName = (typeof SCHOLARSHIP_TABLES)[number];

function mentionsScholarshipTable(message: string, table?: ScholarshipTableName): boolean {
  if (table) return message.includes(table);
  return SCHOLARSHIP_TABLES.some((name) => message.includes(name));
}

export function isScholarshipSchemaError(error: unknown, table?: ScholarshipTableName): boolean {
  const message = errorText(error).toLowerCase();
  if (!message) return false;

  if (message.includes("scholarship schema is out of date")) return true;

  const isMissingColumn =
    message.includes("pgrst204") ||
    message.includes("schema cache") ||
    (message.includes("could not find") && message.includes("column")) ||
    (message.includes("column") && message.includes("does not exist"));

  if (!isMissingColumn) return false;
  return mentionsScholarshipTable(message, table);
}

export function formatScholarshipError(error: unknown, fallback = "Could not complete scholarship action."): string {
  if (isScholarshipSchemaError(error)) {
    return "Scholarship migration required. See the notice at the top of this page.";
  }
  return toFriendlyError(error, fallback);
}
