import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";
import type { VerificationGroup, FilerStatus } from "@/lib/verification/guide";

/**
 * Persistence for the FAFSA verification helper. Device-local (localStorage) so
 * it works instantly and signed-out, plus a best-effort cloud upsert to
 * `user_verification_status` (migration 027) so a signed-in student's group and
 * answers follow them across devices. Mirrors the fafsa progress local+cloud
 * pattern; degrades to local-only when signed out or the table isn't there yet.
 */

const TABLE = "user_verification_status";
const LOCAL_KEY = "aidpilot.verification.status.v1";

export interface VerificationStatus {
  group: VerificationGroup | null;
  filer: FilerStatus;
  schoolName: string;
}

export interface VerificationStatusSnapshot {
  status: VerificationStatus;
  updatedAt: string | null;
}

export const EMPTY_STATUS: VerificationStatus = { group: null, filer: "unsure", schoolName: "" };

const GROUPS = new Set<VerificationGroup>(["V1", "V4", "V5", "unsure"]);
const FILERS = new Set<FilerStatus>(["filed", "did_not_file", "unsure"]);

function normalize(raw: Partial<VerificationStatus> | null | undefined): VerificationStatus {
  const group = raw?.group && GROUPS.has(raw.group) ? raw.group : null;
  const filer = raw?.filer && FILERS.has(raw.filer) ? raw.filer : "unsure";
  const schoolName = typeof raw?.schoolName === "string" ? raw.schoolName.slice(0, 120) : "";
  return { group, filer, schoolName };
}

export function readLocalStatus(): VerificationStatus {
  return readLocalStatusSnapshot().status;
}

export function readLocalStatusSnapshot(): VerificationStatusSnapshot {
  if (typeof window === "undefined") return { status: { ...EMPTY_STATUS }, updatedAt: null };
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return { status: { ...EMPTY_STATUS }, updatedAt: null };
    const parsed = JSON.parse(raw) as Partial<VerificationStatus> & { updatedAt?: unknown };
    return {
      status: normalize(parsed),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return { status: { ...EMPTY_STATUS }, updatedAt: null };
  }
}

export function writeLocalStatus(status: VerificationStatus, updatedAt = new Date().toISOString()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...normalize(status), updatedAt }));
  } catch {
    /* storage blocked (private mode / quota) - the cloud copy still syncs */
  }
}

/** Returns the cloud row for a signed-in user, or null (missing table/row/error). */
export async function fetchCloudStatus(userId: string): Promise<VerificationStatusSnapshot | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("tracking_group, filed_taxes, school_name, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      status: normalize({
        group: data.tracking_group as VerificationGroup,
        filer: data.filed_taxes as FilerStatus,
        schoolName: data.school_name ?? "",
      }),
      updatedAt: typeof data.updated_at === "string" ? data.updated_at : null,
    };
  } catch {
    return null;
  }
}

/** Best-effort upsert of the signed-in user's status. No-op when signed out. */
export async function upsertCloudStatus(status: VerificationStatus): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return;
    const supabase = createClient();
    const n = normalize(status);
    await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        tracking_group: n.group,
        filed_taxes: n.filer,
        school_name: n.schoolName || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {
    /* recoverable - the device-local copy is the source of truth offline */
  }
}
