import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";

/**
 * Generic per-user "saved / handled" store used by /ca-aid (saved scholarships)
 * and /key-dates (handled deadlines). Device-local first (instant, signed-out),
 * with a best-effort cloud sync to `user_saved_items` (migration 028) so a
 * signed-in student's flags follow them across devices. Degrades to local-only
 * when signed out or the table isn't there yet.
 */

export type SavedItemType = "scholarship" | "deadline";

const TABLE = "user_saved_items";
const localKey = (type: SavedItemType) => `aidpilot.saved.${type}.v1`;

export function readLocalSet(type: SavedItemType): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(localKey(type));
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((k): k is string => typeof k === "string") : []);
  } catch {
    return new Set();
  }
}

export function writeLocalSet(type: SavedItemType, keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localKey(type), JSON.stringify([...keys]));
  } catch {
    /* storage blocked - cloud copy still syncs */
  }
}

export async function fetchCloudSet(userId: string, type: SavedItemType): Promise<Set<string> | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("item_key")
      .eq("user_id", userId)
      .eq("item_type", type);
    if (error || !data) return null;
    return new Set(data.map((row) => String((row as { item_key: unknown }).item_key)));
  } catch {
    return null;
  }
}

export async function addCloudItem(type: SavedItemType, key: string): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return;
    const supabase = createClient();
    await supabase.from(TABLE).upsert(
      { user_id: userId, item_type: type, item_key: key },
      { onConflict: "user_id,item_type,item_key" }
    );
  } catch {
    /* recoverable - local copy holds offline */
  }
}

export async function removeCloudItem(type: SavedItemType, key: string): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return;
    const supabase = createClient();
    await supabase.from(TABLE).delete().eq("user_id", userId).eq("item_type", type).eq("item_key", key);
  } catch {
    /* recoverable */
  }
}

/** Push any device-local keys not yet in the cloud (called after hydrate merge). */
export async function pushLocalOnly(type: SavedItemType, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return;
    const supabase = createClient();
    await supabase.from(TABLE).upsert(
      keys.map((key) => ({ user_id: userId, item_type: type, item_key: key })),
      { onConflict: "user_id,item_type,item_key" }
    );
  } catch {
    /* recoverable */
  }
}
