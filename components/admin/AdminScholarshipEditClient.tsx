"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminScholarshipForm } from "@/components/admin/AdminScholarshipForm";
import { formValuesToPayload, sourceToFormValues } from "@/lib/scholarship-form-helpers";
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
        setError(queryError.message ?? "Could not load scholarship.");
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
    if (updateError) throw new Error(updateError.message ?? JSON.stringify(updateError));
    router.push("/admin/scholarships");
  }

  return (
    <AdminGate>
      <div style={{ minHeight: "100vh", background: "#F4F8FE", padding: "32px 24px",  }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/admin/scholarships" style={{ fontSize: 13, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>← All scholarships</Link>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 20px", color: "#15212E" }}>Edit scholarship</h1>
          {loading && <p style={{ color: "#9AA4B2" }}>Loading...</p>}
          {error && !loading && <p style={{ color: "#C04E57" }}>{error}</p>}
          {source && !loading && (
            <AdminScholarshipForm initial={sourceToFormValues(source)} submitLabel="Save changes" onSubmit={handleUpdate} />
          )}
        </div>
      </div>
    </AdminGate>
  );
}
