import type { SupabaseClient } from "@supabase/supabase-js";
import { FAFSA_WORKFLOW_STEP_SEEDS } from "@/lib/intelligence/fafsa-workflow-data";
import { SCHOLARSHIP_SOURCE_SEEDS } from "@/lib/intelligence/scholarship-sources-data";
import type { FafsaWorkflowStep } from "@/lib/types";

export async function seedFafsaWorkflowSteps(supabase: SupabaseClient) {
  for (const step of FAFSA_WORKFLOW_STEP_SEEDS) {
    const { data: existing } = await supabase
      .from("fafsa_workflow_steps")
      .select("id")
      .eq("title", step.title)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("fafsa_workflow_steps").insert(step);
      if (error) throw error;
    }
  }
}

export async function seedScholarshipSources(supabase: SupabaseClient) {
  for (const source of SCHOLARSHIP_SOURCE_SEEDS) {
    const { data: existing } = await supabase
      .from("scholarship_sources")
      .select("id")
      .eq("name", source.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("scholarship_sources").insert(source);
      if (error) throw error;
    }
  }
}

export async function seedGlobalIntelligenceData(supabase: SupabaseClient) {
  await seedFafsaWorkflowSteps(supabase);
  await seedScholarshipSources(supabase);
}

export async function seedUserFafsaSteps(supabase: SupabaseClient, userId: string) {
  const { count } = await supabase
    .from("user_fafsa_steps")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) return;

  const { data: steps, error: stepsError } = await supabase
    .from("fafsa_workflow_steps")
    .select("*")
    .order("step_order");

  if (stepsError) throw stepsError;
  if (!steps?.length) return;

  const rows = (steps as FafsaWorkflowStep[]).map((step) => ({
    user_id: userId,
    workflow_step_id: step.id,
    status: "not_started",
  }));

  const { error } = await supabase.from("user_fafsa_steps").insert(rows);
  if (error) throw error;
}
