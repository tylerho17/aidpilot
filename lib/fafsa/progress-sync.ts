import { createClient } from "@/lib/supabase/client";
import { FAFSA_STEPS } from "@/lib/fafsa/steps";

/** Guided FAFSA progress rows (plan_key). Uses fafsa_step_progress - not user_fafsa_steps (workflow_step_id). */
const FAFSA_PROGRESS_TABLE = "fafsa_step_progress";

export const FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE =
  "We couldn't sync progress right now, but your progress is saved on this device.";

export type FafsaProgressSyncStatus = "idle" | "synced" | "local-only" | "sync-error";

type FafsaStepProgressRow = {
  plan_key: string;
  completed: boolean;
};

const VALID_PLAN_KEYS = new Set(FAFSA_STEPS.map((step) => step.planKey));

export function mergeCompletedPlanKeys(localKeys: string[], cloudKeys: string[]): string[] {
  const merged = new Set([...localKeys, ...cloudKeys].filter((key) => VALID_PLAN_KEYS.has(key)));
  return [...merged];
}

export async function fetchCloudFafsaProgress(
  userId: string
): Promise<{ completedPlanKeys: string[]; error: unknown | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(FAFSA_PROGRESS_TABLE)
      .select("plan_key, completed")
      .eq("user_id", userId);

    if (error) {
      return { completedPlanKeys: [], error };
    }

    const completedPlanKeys = ((data ?? []) as FafsaStepProgressRow[])
      .filter((row) => row.completed && VALID_PLAN_KEYS.has(row.plan_key))
      .map((row) => row.plan_key);

    return { completedPlanKeys, error: null };
  } catch (error) {
    return { completedPlanKeys: [], error };
  }
}

export async function upsertCloudFafsaStep(
  userId: string,
  planKey: string,
  completed: boolean
): Promise<{ error: unknown | null }> {
  if (!VALID_PLAN_KEYS.has(planKey)) {
    return { error: null };
  }

  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from(FAFSA_PROGRESS_TABLE).upsert(
      {
        user_id: userId,
        plan_key: planKey,
        completed,
        completed_at: completed ? now : null,
        updated_at: now,
      },
      { onConflict: "user_id,plan_key" }
    );

    return { error: error ?? null };
  } catch (error) {
    return { error };
  }
}

export async function pushCloudFafsaProgress(
  userId: string,
  completedPlanKeys: string[]
): Promise<{ error: unknown | null }> {
  const keys = completedPlanKeys.filter((key) => VALID_PLAN_KEYS.has(key));
  if (keys.length === 0) return { error: null };

  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    const rows = keys.map((planKey) => ({
      user_id: userId,
      plan_key: planKey,
      completed: true,
      completed_at: now,
      updated_at: now,
    }));

    const { error } = await supabase.from(FAFSA_PROGRESS_TABLE).upsert(rows, {
      onConflict: "user_id,plan_key",
    });

    return { error: error ?? null };
  } catch (error) {
    return { error };
  }
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
