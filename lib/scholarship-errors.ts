import { toFriendlyError } from "@/lib/friendly-errors";

export const SCHOLARSHIP_SCHEMA_OUT_OF_DATE_MESSAGE =
  "AidPilot's scholarship schema is out of date in this environment. Ask an admin to run the latest scholarship migration and reload the database schema.";

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") return error.message;
    if ("details" in error && typeof error.details === "string") return error.details;
    if ("hint" in error && typeof error.hint === "string") return error.hint;
  }
  return "";
}

export function isScholarshipSchemaError(error: unknown): boolean {
  const message = errorText(error).toLowerCase();
  if (!message) return false;
  return (
    message.includes("schema cache") ||
    (message.includes("could not find") && message.includes("column")) ||
    (message.includes("column") && message.includes("scholarship_matches")) ||
    message.includes("pgrst204")
  );
}

export function formatScholarshipError(error: unknown, fallback = "Could not complete scholarship action."): string {
  if (isScholarshipSchemaError(error)) return SCHOLARSHIP_SCHEMA_OUT_OF_DATE_MESSAGE;
  return toFriendlyError(error, fallback);
}
