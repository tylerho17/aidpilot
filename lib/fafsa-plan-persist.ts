import type { SupabaseClient } from "@supabase/supabase-js";
import { generateFafsaPlan, FAFSA_TASK_SOURCE } from "@/lib/fafsa-plan";
import {
  buildIntakeDbPayload,
  isRequiredInfoTypeMismatch,
  isSchoolsTypeMismatch,
  logFafsaSupabaseError,
  parseIntakeRow,
  supabaseErrorMessage,
  toRequiredInfoArray,
} from "@/lib/fafsa-intake-map";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { AidTask, FafsaIntakeFormData, FafsaIntakeResponse, FafsaPlanTaskInput } from "@/lib/types";

export type SaveFafsaIntakeAndPlanResult = {
  intake: FafsaIntakeResponse;
  planTasks: AidTask[];
  planError: string | null;
};

function buildAidTaskPayload(userId: string, task: FafsaPlanTaskInput, status: string, now: string) {
  return {
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
    required_info: toRequiredInfoArray(task.required_info),
    blocking_reason: task.blocking_reason,
    action_url: task.action_url,
    plan_key: task.plan_key,
    updated_at: now,
  };
}

async function saveAidTaskRow(
  supabase: SupabaseClient,
  existing: AidTask | undefined,
  payload: ReturnType<typeof buildAidTaskPayload>,
  requiredInfoAsText: boolean
) {
  const sendPayload: Record<string, unknown> = requiredInfoAsText
    ? {
        ...payload,
        required_info:
          payload.required_info.length > 0 ? payload.required_info.join(" ") : null,
      }
    : { ...payload };

  console.error("FAFSA task payload", sendPayload);

  if (existing?.id) {
    const result = await supabase
      .from("aid_tasks")
      .update(sendPayload)
      .eq("id", existing.id)
      .select()
      .single();
    console.error("FAFSA task save result", { action: "update", plan_key: payload.plan_key, ...result });
    return result;
  }

  const result = await supabase.from("aid_tasks").insert(sendPayload).select().single();
  console.error("FAFSA task save result", { action: "insert", plan_key: payload.plan_key, ...result });
  return result;
}

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
    logFafsaSupabaseError("FAFSA task save result (load existing failed)", existingError, { userId });
    throw existingError;
  }

  const existingByKey = new Map((existingRows ?? []).map((row) => [(row as AidTask).plan_key, row as AidTask]));
  const saved: AidTask[] = [];
  const now = new Date().toISOString();
  let requiredInfoAsText = false;

  for (const task of planned) {
    const existing = task.plan_key ? existingByKey.get(task.plan_key) : undefined;
    const status =
      existing && isAidTaskComplete(existing.status)
        ? existing.status
        : task.status;

    const payload = buildAidTaskPayload(userId, task, status, now);
    let { data, error } = await saveAidTaskRow(supabase, existing, payload, requiredInfoAsText);

    if (error && isRequiredInfoTypeMismatch(error) && !requiredInfoAsText) {
      requiredInfoAsText = true;
      ({ data, error } = await saveAidTaskRow(supabase, existing, payload, true));
    }

    if (error) {
      logFafsaSupabaseError("FAFSA task save result (failed)", error, payload);
      throw error;
    }

    saved.push(data as AidTask);
  }

  const staleIds = (existingRows ?? [])
    .map((row) => row as AidTask)
    .filter((row) => row.plan_key && !planKeys.includes(row.plan_key))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase.from("aid_tasks").delete().in("id", staleIds);
    if (deleteError) {
      logFafsaSupabaseError("FAFSA task save result (delete stale failed)", deleteError, { staleIds });
      throw deleteError;
    }
  }

  return saved.sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0));
}

async function upsertFafsaIntakeRow(
  supabase: SupabaseClient,
  userId: string,
  form: FafsaIntakeFormData,
  now: string
) {
  let schoolsAsText = false;
  let payload = buildIntakeDbPayload(userId, form, now, { schoolsAsText });

  console.error("FAFSA intake payload", payload);

  const attemptSave = async (row: Record<string, unknown>) => {
    const { data: existing, error: selectError } = await supabase
      .from("fafsa_intake_responses")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      return { data: null, error: selectError };
    }

    if (existing?.id) {
      return supabase
        .from("fafsa_intake_responses")
        .update(row)
        .eq("id", existing.id)
        .select()
        .single();
    }

    return supabase.from("fafsa_intake_responses").insert(row).select().single();
  };

  let result = await attemptSave(payload as Record<string, unknown>);
  console.error("FAFSA intake save result", {
    schoolsAsText,
    error: result.error,
    data: result.data,
    message: result.error ? supabaseErrorMessage(result.error) : null,
  });

  if (result.error && isSchoolsTypeMismatch(result.error) && !schoolsAsText) {
    schoolsAsText = true;
    payload = buildIntakeDbPayload(userId, form, now, { schoolsAsText: true });
    console.error("FAFSA intake payload (retry schools as text)", payload);
    result = await attemptSave(payload as Record<string, unknown>);
    console.error("FAFSA intake save result (retry)", {
      schoolsAsText,
      error: result.error,
      data: result.data,
      message: result.error ? supabaseErrorMessage(result.error) : null,
    });
  }

  return result;
}

export async function saveFafsaIntakeAndPlan(
  supabase: SupabaseClient,
  userId: string,
  form: FafsaIntakeFormData
): Promise<SaveFafsaIntakeAndPlanResult> {
  const now = new Date().toISOString();
  const { data: intake, error: intakeError } = await upsertFafsaIntakeRow(supabase, userId, form, now);

  if (intakeError) {
    logFafsaSupabaseError("FAFSA intake save result (failed)", intakeError, form);
    throw intakeError;
  }

  const normalizedIntake = parseIntakeRow(intake as Record<string, unknown>);

  try {
    const planTasks = await persistFafsaPlan(supabase, userId, normalizedIntake);
    return { intake: normalizedIntake, planTasks, planError: null };
  } catch (planError) {
    logFafsaSupabaseError("FAFSA task save result (plan generation failed)", planError, {
      userId,
      intakeId: normalizedIntake.id,
    });
    return {
      intake: normalizedIntake,
      planTasks: [],
      planError: supabaseErrorMessage(planError),
    };
  }
}
