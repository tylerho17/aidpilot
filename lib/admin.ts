/**
 * Admin allowlist for AidPilot admin UI.
 * Set NEXT_PUBLIC_ADMIN_EMAILS (comma-separated) in .env.local and Vercel.
 * Also add the same email(s) to public.admin_allowlist in Supabase (see 007 migration).
 */
export const ADMIN_EMAILS: string[] = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
