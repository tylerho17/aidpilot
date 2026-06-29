export type DataErrorKind =
  | "schema_drift"
  | "auth_session"
  | "network"
  | "permission"
  | "database";

export function supabaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: string }).code ?? "");
  }
  return "";
}

export function supabaseErrorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const record = error as { message?: string; details?: string; hint?: string; code?: string };
    return [record.message, record.details, record.hint, record.code].filter(Boolean).join(" | ");
  }
  return "";
}

function rawErrorText(error: unknown): string {
  return supabaseErrorText(error);
}

export function isSchemaColumnError(error: unknown): boolean {
  const message = supabaseErrorText(error);
  const code = supabaseErrorCode(error);

  return (
    code === "PGRST204" ||
    /schema cache/i.test(message) ||
    /could not find the .* column/i.test(message) ||
    /column .* does not exist/i.test(message)
  );
}

export function isMissingTableError(error: unknown): boolean {
  const message = supabaseErrorText(error).toLowerCase();
  const code = supabaseErrorCode(error);

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (message.includes("relation") && message.includes("does not exist")) ||
    (message.includes("could not find the table") && message.includes("schema cache"))
  );
}

export function isAuthSessionError(error: unknown): boolean {
  const message = supabaseErrorText(error).toLowerCase();
  const code = supabaseErrorCode(error);

  return (
    code === "PGRST301" ||
    message.includes("jwt") ||
    message.includes("not authenticated") ||
    message.includes("invalid claim") ||
    (message.includes("session") && message.includes("expired"))
  );
}

export function isPermissionError(error: unknown): boolean {
  const code = supabaseErrorCode(error);
  const message = supabaseErrorText(error).toLowerCase();

  return code === "42501" || message.includes("permission denied") || message.includes("row-level security");
}

export function isNetworkError(error: unknown): boolean {
  const message = supabaseErrorText(error).toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    message.includes("ecconnrefused")
  );
}

export function classifyDataError(error: unknown): DataErrorKind {
  if (isAuthSessionError(error)) return "auth_session";
  if (isPermissionError(error)) return "permission";
  if (isSchemaColumnError(error) || isMissingTableError(error)) return "schema_drift";
  if (isNetworkError(error)) return "network";
  return "database";
}

/** Schema drift or connectivity issues where local/demo fallback is appropriate. */
export function isRecoverableWithLocalFallback(error: unknown): boolean {
  const kind = classifyDataError(error);
  return kind === "schema_drift" || kind === "network";
}

function looksLikeTechnicalError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    !message ||
    lower.includes("pgrst") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    (lower.includes("column") && lower.includes("does not exist")) ||
    lower.includes("jwt") ||
    lower.includes("violates") ||
    message.startsWith("{") ||
    message.length > 160
  );
}

export function toFriendlyError(error: unknown, fallback: string): string {
  const kind = classifyDataError(error);
  if (kind === "auth_session") {
    return "Please log in again to continue.";
  }
  if (kind === "permission") {
    return "You do not have permission to complete this action. Please log in again or contact support.";
  }

  const message = rawErrorText(error).trim();
  if (!message || looksLikeTechnicalError(message)) {
    return fallback;
  }
  return message;
}
