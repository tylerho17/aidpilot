"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminScholarshipForm } from "@/components/admin/AdminScholarshipForm";
import { EMPTY_SCHOLARSHIP_FORM, formValuesToPayload } from "@/lib/scholarship-form-helpers";
import { createClient } from "@/lib/supabase/client";

export default function AdminScholarshipNewClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleCreate(values: typeof EMPTY_SCHOLARSHIP_FORM) {
    const payload = formValuesToPayload(values);
    const { error } = await supabase.from("scholarship_sources").insert(payload);
    if (error) throw new Error(error.message ?? JSON.stringify(error));
    router.push("/admin/scholarships");
  }

  return (
    <AdminGate>
      <div style={{ minHeight: "100vh", background: "#F4F8FE", padding: "32px 24px", fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/admin/scholarships" style={{ fontSize: 13, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>← All scholarships</Link>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 20px", color: "#15212E" }}>New scholarship</h1>
          <AdminScholarshipForm initial={EMPTY_SCHOLARSHIP_FORM} submitLabel="Create scholarship" onSubmit={handleCreate} />
        </div>
      </div>
    </AdminGate>
  );
}
