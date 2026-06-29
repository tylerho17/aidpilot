function rawErrorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: string }).message ?? "");
  }
  return "";
}

function looksLikeTechnicalError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    !message ||
    lower.includes("pgrst") ||
    lower.includes("schema cache") ||
    lower.includes("could not find") ||
    lower.includes("column") && lower.includes("does not exist") ||
    lower.includes("jwt") ||
    lower.includes("violates") ||
    message.startsWith("{") ||
    message.length > 160
  );
}

export function toFriendlyError(error: unknown, fallback: string): string {
  const message = rawErrorText(error).trim();
  if (!message || looksLikeTechnicalError(message)) {
    return fallback;
  }
  return message;
}
