import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkScholarshipAdminServer(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_current_user_scholarship_admin");
  if (error) {
    console.error("Middleware admin check failed:", error);
    return false;
  }
  return Boolean(data);
}
