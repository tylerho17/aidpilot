"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminScholarshipForm } from "@/components/admin/AdminScholarshipForm";
import { StatusPanel } from "@/components/ui";
import { formValuesToPayload, sourceToFormValues } from "@/lib/scholarship-form-helpers";
import { toFriendlyError } from "@/lib/friendly-errors";
import { createClient } from "@/lib/supabase/client";
import type { ScholarshipSource } from "@/lib/types";

export default function AdminScholarshipEditClient({ id }: { id: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [source, setSource] = useState<ScholarshipSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSource() {
      const { data, error: queryError } = await supabase.from("scholarship_sources").select("*").eq("id", id).maybeSingle();

      if (cancelled) return;

      if (queryError) {
        setError(toFriendlyError(queryError, "Could not load scholarship."));
        setSource(null);
      } else if (!data) {
        setError("Scholarship not found.");
        setSource(null);
      } else {
        setSource(data as ScholarshipSource);
      }
      setLoading(false);
    }

    void loadSource();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function handleUpdate(values: ReturnType<typeof sourceToFormValues>) {
    const payload = formValuesToPayload(values);
    const { error: updateError } = await supabase.from("scholarship_sources").update(payload).eq("id", id);
    if (updateError) throw new Error(toFriendlyError(updateError, "Could not save scholarship."));
    router.push("/admin/scholarships");
  }

  return (
    <AdminGate>
      <AppChrome>
        <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-body)" }}>
          <Link
            href="/admin/scholarships"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--blue-700)",
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            ← All scholarships
          </Link>
          <h1
            className="font-display"
            style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.6px", color: "var(--ink-900)", margin: "0 0 20px" }}
          >
            Edit scholarship
          </h1>
          {loading && <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 600 }}>Loading…</p>}
          {error && !loading && (
            <StatusPanel tone="coral" icon="shield" title="Something went wrong">
              {error}
            </StatusPanel>
          )}
          {source && !loading && (
            <AdminScholarshipForm initial={sourceToFormValues(source)} submitLabel="Save changes" onSubmit={handleUpdate} />
          )}
        </div>
      </AppChrome>
    </AdminGate>
  );
}
