import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Scholarship admin access is controlled by public.admin_allowlist in Supabase.
 * Use the is_current_user_scholarship_admin() RPC - never client-side env allowlists.
 */
export async function checkScholarshipAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_current_user_scholarship_admin");
  if (error) {
    console.error("Scholarship admin check failed:", error);
    return false;
  }
  return Boolean(data);
}
