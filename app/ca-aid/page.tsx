import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { CaAid } from "@/components/app/screens/CaAid";
import { createClient } from "@/lib/supabase/server";
import { loadScholarshipSources } from "@/lib/scholarship-queries";
import { CA_PROGRAM_FALLBACK, CA_AID_TAG } from "@/lib/scholarships/ca-programs";
import type { ScholarshipSource } from "@/lib/types";

export const metadata: Metadata = {
  title: "California aid & scholarships | AidPilot",
  description: "The major California aid programs — Cal Grant, Chafee, Middle Class Scholarship, Dream Act aid — with who qualifies, the award, and deadlines. Sourced from CSAC.",
};

/**
 * Loads the California aid programs from the live scholarship_sources catalog
 * (tagged 'california'), falling back to the static CA_PROGRAM_FALLBACK when
 * Supabase is unconfigured, errors, or hasn't been seeded (025) yet — so the
 * screen always renders the real programs.
 */
async function loadCaPrograms(): Promise<ScholarshipSource[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await loadScholarshipSources(supabase);
    if (error) return CA_PROGRAM_FALLBACK;
    const ca = data.filter((source) => (source.tags ?? []).includes(CA_AID_TAG));
    // Show the live catalog once the curated CA set (025) has been seeded;
    // until then fall back to the full static set rather than a sparse list.
    const seeded = ca.some((source) => source.source === "ca_aid_v1");
    return seeded ? ca : CA_PROGRAM_FALLBACK;
  } catch {
    return CA_PROGRAM_FALLBACK;
  }
}

export default async function CaAidPage() {
  const programs = await loadCaPrograms();
  return (
    <AppChrome>
      <CaAid programs={programs} />
    </AppChrome>
  );
}
