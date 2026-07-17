import type { SupabaseClient } from "@supabase/supabase-js";
import type { Language } from "@/lib/i18n";
import { CA_DEADLINES, type AidDeadline } from "./ca-deadlines";
import { createClient } from "@/lib/supabase/server";

/**
 * Server loader for the live `aid_deadlines` catalog (migration 026). Maps the
 * bilingual jsonb rows to the app's `AidDeadline` shape so the compute engine
 * and screens are unchanged. Returns [] on any error (table missing / RLS /
 * unconfigured Supabase) so callers can fall back to CA_DEADLINES.
 */

const SELECT = "slug,deadline_date,award_year,approx,href,sort,title,short,audience,action";

type BiText = Record<Language, string> | null | undefined;

/** Coerce a jsonb value into a bilingual string, tolerating partial/missing data. */
function bi(value: BiText): Record<Language, string> {
  const en = value?.en ?? "";
  const es = value?.es ?? en;
  return { en, es };
}

function mapRow(row: Record<string, unknown>): AidDeadline | null {
  const slug = typeof row.slug === "string" ? row.slug : null;
  const date = typeof row.deadline_date === "string" ? row.deadline_date.slice(0, 10) : null;
  if (!slug || !date) return null;
  return {
    id: slug,
    date,
    approx: Boolean(row.approx),
    awardYear: typeof row.award_year === "string" ? row.award_year : "",
    title: bi(row.title as BiText),
    short: bi(row.short as BiText),
    who: bi(row.audience as BiText),
    action: bi(row.action as BiText),
    href: typeof row.href === "string" ? row.href : "#",
  };
}

export async function loadAidDeadlines(supabase: SupabaseClient): Promise<AidDeadline[]> {
  try {
    const { data, error } = await supabase
      .from("aid_deadlines")
      .select(SELECT)
      .eq("active", true)
      .order("sort");
    if (error || !data) return [];
    return data.map((row) => mapRow(row as Record<string, unknown>)).filter((d): d is AidDeadline => d !== null);
  } catch {
    return [];
  }
}

/**
 * Server-component entry point: load the live catalog, falling back to the
 * static CA_DEADLINES when Supabase is unconfigured, errors, or hasn't been
 * seeded (026) yet — so /key-dates and the dashboard pill always have rows.
 * Server-only (uses the cookie-bound Supabase client).
 */
export async function getAidDeadlines(): Promise<AidDeadline[]> {
  try {
    const supabase = await createClient();
    const rows = await loadAidDeadlines(supabase);
    return rows.length > 0 ? rows : CA_DEADLINES;
  } catch {
    return CA_DEADLINES;
  }
}
