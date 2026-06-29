import type { SupabaseClient } from "@supabase/supabase-js";
import { generateFafsaPlan, FAFSA_TASK_SOURCE } from "@/lib/fafsa-plan";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { AidTask, FafsaIntakeFormData, FafsaIntakeResponse } from "@/lib/types";

export async function persistFafsaPlan(
  supabase: SupabaseClient,
  userId: string,
  intake: FafsaIntakeFormData | FafsaIntakeResponse
): Promise<AidTask[]> {
  const planned = generateFafsaPlan(intake);
  const planKeys = planned.map((t) => t.plan_key);

  const { data: existingRows, error: existingError } = await supabase
    .from("aid_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_source", FAFSA_TASK_SOURCE);

  if (existingError) {
    throw new Error(existingError.message ?? "Could not load existing FAFSA plan tasks.");
  }

  const existingByKey = new Map((existingRows ?? []).map((row) => [(row as AidTask).plan_key, row as AidTask]));
  const saved: AidTask[] = [];
  const now = new Date().toISOString();

  for (const task of planned) {
    const existing = task.plan_key ? existingByKey.get(task.plan_key) : undefined;
    const status =
      existing && isAidTaskComplete(existing.status)
        ? existing.status
        : task.status;

    const payload = {
      user_id: userId,
      title: task.title,
      description: task.description ?? task.instructions,
      status,
      due_date: null,
      category: "FAFSA",
      priority: task.priority,
      task_source: FAFSA_TASK_SOURCE,
      stage: task.stage,
      step_order: task.step_order,
      why_it_matters: task.why_it_matters,
      instructions: task.instructions,
      required_info: task.required_info,
      blocking_reason: task.blocking_reason,
      action_url: task.action_url,
      plan_key: task.plan_key,
      updated_at: now,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from("aid_tasks")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message ?? `Could not update FAFSA task ${task.plan_key}.`);
      saved.push(data as AidTask);
    } else {
      const { data, error } = await supabase.from("aid_tasks").insert(payload).select().single();
      if (error) throw new Error(error.message ?? `Could not create FAFSA task ${task.plan_key}.`);
      saved.push(data as AidTask);
    }
  }

  const staleIds = (existingRows ?? [])
    .map((row) => row as AidTask)
    .filter((row) => row.plan_key && !planKeys.includes(row.plan_key))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase.from("aid_tasks").delete().in("id", staleIds);
    if (deleteError) {
      throw new Error(deleteError.message ?? "Could not remove outdated FAFSA plan tasks.");
    }
  }

  return saved.sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0));
}

export async function saveFafsaIntakeAndPlan(
  supabase: SupabaseClient,
  userId: string,
  form: FafsaIntakeFormData
): Promise<{ intake: FafsaIntakeResponse; planTasks: AidTask[] }> {
  const now = new Date().toISOString();
  const parentAccount =
    form.needs_parent_info === "yes" || form.needs_parent_info === "not_sure"
      ? form.parent_has_account || "not_sure"
      : null;

  const payload = {
    user_id: userId,
    aid_year: form.aid_year,
    student_situation: form.student_situation,
    state: form.state,
    schools: form.schools,
    fafsa_progress: form.fafsa_progress,
    has_studentaid_account: form.has_studentaid_account,
    needs_parent_info: form.needs_parent_info,
    parent_has_account: parentAccount,
    has_tax_info_access: form.has_tax_info_access,
    received_aid_offer: form.received_aid_offer,
    verification_requested: form.verification_requested,
    plan_generated_at: now,
    updated_at: now,
  };

  const { data: intake, error: intakeError } = await supabase
    .from("fafsa_intake_responses")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (intakeError) {
    throw new Error(intakeError.message ?? "Could not save FAFSA readiness answers.");
  }

  const planTasks = await persistFafsaPlan(supabase, userId, intake as FafsaIntakeResponse);
  return { intake: intake as FafsaIntakeResponse, planTasks };
}
