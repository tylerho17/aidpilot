import type { SupabaseClient } from "@supabase/supabase-js";
import type { FafsaWorkflowStep } from "@/lib/types";

export type GlobalIntelligenceStatus = {
  fafsaWorkflowStepCount: number;
  scholarshipSourceCount: number;
};

function throwReadable(error: { message?: string } | null): never {
  throw new Error(error?.message ?? JSON.stringify(error));
}

/** Read-only check. Global tables must be seeded via Supabase SQL, not the browser client. */
export async function verifyGlobalIntelligenceData(
  supabase: SupabaseClient
): Promise<GlobalIntelligenceStatus> {
  const [fafsaRes, sourcesRes] = await Promise.all([
    supabase.from("fafsa_workflow_steps").select("*", { count: "exact", head: true }),
    supabase.from("scholarship_sources").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  if (fafsaRes.error) throwReadable(fafsaRes.error);
  if (sourcesRes.error) throwReadable(sourcesRes.error);

  return {
    fafsaWorkflowStepCount: fafsaRes.count ?? 0,
    scholarshipSourceCount: sourcesRes.count ?? 0,
  };
}

/** @deprecated No client-side writes. Use verifyGlobalIntelligenceData instead. */
export async function seedGlobalIntelligenceData(supabase: SupabaseClient) {
  return verifyGlobalIntelligenceData(supabase);
}

/**
 * Seeds user-owned FAFSA step rows only. Never writes to fafsa_workflow_steps.
 * Safe to call multiple times; inserts only missing rows.
 */
export async function seedUserFafsaSteps(supabase: SupabaseClient, userId: string) {
  const { data: steps, error: stepsError } = await supabase
    .from("fafsa_workflow_steps")
    .select("*")
    .order("step_order");

  if (stepsError) throwReadable(stepsError);
  if (!steps?.length) return;

  const { data: existing, error: existingError } = await supabase
    .from("user_fafsa_steps")
    .select("workflow_step_id")
    .eq("user_id", userId);

  if (existingError) throwReadable(existingError);

  const existingIds = new Set((existing ?? []).map((row) => row.workflow_step_id));
  const missing = (steps as FafsaWorkflowStep[])
    .filter((step) => !existingIds.has(step.id))
    .map((step) => ({
      user_id: userId,
      workflow_step_id: step.id,
      status: "not_started",
    }));

  if (!missing.length) return;

  const { error } = await supabase
    .from("user_fafsa_steps")
    .upsert(missing, { onConflict: "user_id,workflow_step_id", ignoreDuplicates: true });

  if (error) throwReadable(error);
}
