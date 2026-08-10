import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedUserId } from "@/lib/fafsa/progress-sync";

/**
 * Generic per-user "saved / handled" store used by /ca-aid (saved scholarships)
 * and /key-dates (handled deadlines). Anonymous device-local state stays
 * separate from user-scoped local caches, with a best-effort cloud sync to
 * `user_saved_items` (migration 028) so a signed-in student's flags follow them
 * across devices. Degrades to local-only when signed out or the table isn't
 * there yet.
 */

export type SavedItemType = "scholarship" | "deadline";

const TABLE = "user_saved_items";
const anonymousLocalKey = (type: SavedItemType) => `aidpilot.saved.${type}.v1`;
const userLocalKey = (type: SavedItemType, userId: string) => `aidpilot.saved.${type}.user.${userId}.v1`;
const localKey = (type: SavedItemType, userId?: string | null) =>
  userId ? userLocalKey(type, userId) : anonymousLocalKey(type);

export function readLocalSet(type: SavedItemType, userId?: string | null): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(localKey(type, userId));
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((k): k is string => typeof k === "string") : []);
  } catch {
    return new Set();
  }
}

export function writeLocalSet(type: SavedItemType, keys: Set<string>, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localKey(type, userId), JSON.stringify([...keys]));
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

export async function addCloudItem(type: SavedItemType, key: string, userId?: string | null): Promise<void> {
  try {
    const currentUserId = userId ?? (await getAuthenticatedUserId());
    if (!currentUserId) return;
    const supabase = createClient();
    await supabase.from(TABLE).upsert(
      { user_id: currentUserId, item_type: type, item_key: key },
      { onConflict: "user_id,item_type,item_key" }
    );
  } catch {
    /* recoverable - local copy holds offline */
  }
}

export async function removeCloudItem(type: SavedItemType, key: string, userId?: string | null): Promise<void> {
  try {
    const currentUserId = userId ?? (await getAuthenticatedUserId());
    if (!currentUserId) return;
    const supabase = createClient();
    await supabase.from(TABLE).delete().eq("user_id", currentUserId).eq("item_type", type).eq("item_key", key);
  } catch {
    /* recoverable */
  }
}

/** Push any device-local keys not yet in the cloud (called after hydrate merge). */
export async function pushLocalOnly(type: SavedItemType, keys: string[], userId?: string | null): Promise<void> {
  if (keys.length === 0) return;
  try {
    const currentUserId = userId ?? (await getAuthenticatedUserId());
    if (!currentUserId) return;
    const supabase = createClient();
    await supabase.from(TABLE).upsert(
      keys.map((key) => ({ user_id: currentUserId, item_type: type, item_key: key })),
      { onConflict: "user_id,item_type,item_key" }
    );
  } catch {
    /* recoverable */
  }
}
