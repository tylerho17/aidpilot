/** Normalize aid_tasks.required_info from Supabase text, text[], or null. */
export function normalizeRequiredInfo(value: string | string[] | null | undefined): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  return String(value).trim();
}
