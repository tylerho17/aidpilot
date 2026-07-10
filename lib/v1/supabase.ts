import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Minimal anonymous Supabase browser client for F6's completion counter — the
// ONLY server call in the app. No auth, no session persistence, no cookies.
// Returns null when env is not configured so the feature degrades gracefully.

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  return cached;
}
