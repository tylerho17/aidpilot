"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminScholarshipForm } from "@/components/admin/AdminScholarshipForm";
import { EMPTY_SCHOLARSHIP_FORM, formValuesToPayload } from "@/lib/scholarship-form-helpers";
import { toFriendlyError } from "@/lib/friendly-errors";
import { createClient } from "@/lib/supabase/client";

export default function AdminScholarshipNewClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleCreate(values: typeof EMPTY_SCHOLARSHIP_FORM) {
    const payload = formValuesToPayload(values);
    const { error } = await supabase.from("scholarship_sources").insert(payload);
    if (error) throw new Error(toFriendlyError(error, "Could not create scholarship."));
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
            New scholarship
          </h1>
          <AdminScholarshipForm initial={EMPTY_SCHOLARSHIP_FORM} submitLabel="Create scholarship" onSubmit={handleCreate} />
        </div>
      </AppChrome>
    </AdminGate>
  );
}
