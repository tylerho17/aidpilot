import { createClient } from "@/lib/supabase/client";
import {
  classifyDataError,
  isRecoverableWithLocalFallback,
  supabaseErrorCode,
  supabaseErrorText,
} from "@/lib/friendly-errors";
import { FAFSA_STEPS } from "@/lib/fafsa/steps";

/** Guided FAFSA progress rows (plan_key). Uses fafsa_step_progress — not user_fafsa_steps (workflow_step_id). */
const FAFSA_PROGRESS_TABLE = "fafsa_step_progress";

export const FAFSA_PROGRESS_SYNC_FALLBACK_MESSAGE =
  "Progress is saved on this device. Cloud sync is temporarily unavailable.";

export type FafsaProgressSyncStatus = "idle" | "synced" | "local-only" | "sync-error";

let cloudSyncPaused = false;
let lastLoggedSyncFailure: string | null = null;

export function formatFafsaProgressSyncError(error: unknown): string {
  const message = supabaseErrorText(error).trim();
  const code = supabaseErrorCode(error);

  if (message && code) return `${message} (${code})`;
  if (message) return message;
  if (code) return `FAFSA progress sync failed (${code})`;

  if (error && typeof error === "object") {
    const keys = Object.keys(error as object);
    if (keys.length > 0) {
      try {
        return JSON.stringify(error);
      } catch {
        return "Unknown FAFSA progress sync error";
      }
    }
  }

  return "Unknown FAFSA progress sync error";
}

export function isFafsaProgressSyncRecoverable(error: unknown): boolean {
  if (error == null) return true;
  if (isRecoverableWithLocalFallback(error)) return true;

  const kind = classifyDataError(error);
  if (kind === "permission" || kind === "auth_session") return true;

  const message = supabaseErrorText(error).trim();
  const code = supabaseErrorCode(error);
  if (!message && !code) return true;

  return false;
}

export function isFafsaCloudSyncPaused(): boolean {
  return cloudSyncPaused;
}

export function logFafsaProgressSyncFailure(error: unknown): void {
  const formatted = formatFafsaProgressSyncError(error);
  if (formatted === lastLoggedSyncFailure) return;
  lastLoggedSyncFailure = formatted;
  console.warn(`FAFSA progress cloud sync unavailable: ${formatted}`);
}

export function markFafsaCloudSyncSuccess(): void {
  cloudSyncPaused = false;
  lastLoggedSyncFailure = null;
}

function markFafsaCloudSyncFailure(error: unknown): void {
  logFafsaProgressSyncFailure(error);
  if (isFafsaProgressSyncRecoverable(error)) {
    cloudSyncPaused = true;
  }
}

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
): Promise<{ completedPlanKeys: string[]; error: unknown | null; skipped?: boolean }> {
  if (cloudSyncPaused) {
    return { completedPlanKeys: [], error: null, skipped: true };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(FAFSA_PROGRESS_TABLE)
      .select("plan_key, completed")
      .eq("user_id", userId);

    if (error) {
      markFafsaCloudSyncFailure(error);
      return { completedPlanKeys: [], error };
    }

    markFafsaCloudSyncSuccess();

    const completedPlanKeys = ((data ?? []) as FafsaStepProgressRow[])
      .filter((row) => row.completed && VALID_PLAN_KEYS.has(row.plan_key))
      .map((row) => row.plan_key);

    return { completedPlanKeys, error: null };
  } catch (error) {
    markFafsaCloudSyncFailure(error);
    return { completedPlanKeys: [], error };
  }
}

export async function upsertCloudFafsaStep(
  userId: string,
  planKey: string,
  completed: boolean
): Promise<{ error: unknown | null; skipped?: boolean }> {
  if (!VALID_PLAN_KEYS.has(planKey)) {
    return { error: null };
  }

  if (cloudSyncPaused) {
    return { error: null, skipped: true };
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

    if (error) {
      markFafsaCloudSyncFailure(error);
    } else {
      markFafsaCloudSyncSuccess();
    }

    return { error: error ?? null };
  } catch (error) {
    markFafsaCloudSyncFailure(error);
    return { error };
  }
}

export async function pushCloudFafsaProgress(
  userId: string,
  completedPlanKeys: string[]
): Promise<{ error: unknown | null; skipped?: boolean }> {
  const keys = completedPlanKeys.filter((key) => VALID_PLAN_KEYS.has(key));
  if (keys.length === 0) return { error: null };

  if (cloudSyncPaused) {
    return { error: null, skipped: true };
  }

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

    if (error) {
      markFafsaCloudSyncFailure(error);
    } else {
      markFafsaCloudSyncSuccess();
    }

    return { error: error ?? null };
  } catch (error) {
    markFafsaCloudSyncFailure(error);
    return { error };
  }
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
