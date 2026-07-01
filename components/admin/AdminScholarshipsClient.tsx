"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminGate } from "@/components/admin/AdminGate";
import { ProductCard } from "@/components/ProductUI";
import { formatScholarshipDeadline } from "@/lib/data-helpers";
import { createClient } from "@/lib/supabase/client";
import type { ScholarshipSource } from "@/lib/types";

export default function AdminScholarshipsClient() {
  const supabase = useMemo(() => createClient(), []);
  const [sources, setSources] = useState<ScholarshipSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSources() {
      const { data, error: queryError } = await supabase
        .from("scholarship_sources")
        .select("*")
        .order("name");

      if (cancelled) return;

      if (queryError) {
        console.error("Admin scholarships load failed:", queryError);
        setError(queryError.message ?? "Could not load scholarships.");
        setSources([]);
      } else {
        setSources((data ?? []) as ScholarshipSource[]);
      }
      setLoading(false);
    }

    void loadSources();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <AdminGate>
      <div style={{ minHeight: "100vh", background: "#F4F8FE", padding: "32px 24px",  }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            <div>
              <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: "#0B5CAD", textDecoration: "none" }}>← Back to app</Link>
              <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, margin: "10px 0 6px", color: "#15212E" }}>Scholarship admin</h1>
              <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>Manage scholarship sources for matching and weekly reports.</p>
            </div>
            <Link
              href="/admin/scholarships/new"
              style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 20px", borderRadius: 13, textDecoration: "none" }}
            >
              + New scholarship
            </Link>
          </div>

          {error && <p style={{ color: "#C04E57", marginBottom: 16 }}>{error}</p>}

          {loading ? (
            <p style={{ color: "#9AA4B2" }}>Loading scholarships...</p>
          ) : sources.length === 0 ? (
            <ProductCard style={{ padding: 28, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
                No scholarships in the database yet. Run <code>supabase/008_seed_phase_5_scholarships.sql</code> or create your first scholarship.
              </p>
              <Link href="/admin/scholarships/new" style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD" }}>Create scholarship</Link>
            </ProductCard>
          ) : (
            <ProductCard style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px" }}>Name</th>
                      <th style={{ padding: "12px 16px" }}>Amount</th>
                      <th style={{ padding: "12px 16px" }}>Deadline</th>
                      <th style={{ padding: "12px 16px" }}>Active</th>
                      <th style={{ padding: "12px 16px" }}>Verified</th>
                      <th style={{ padding: "12px 16px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#15212E" }}>{source.name}</td>
                        <td style={{ padding: "14px 16px" }}>{source.amount ? `$${source.amount.toLocaleString()}` : "—"}</td>
                        <td style={{ padding: "14px 16px" }}>{formatScholarshipDeadline(source.deadline)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ color: source.active !== false ? "#15885A" : "#9AA4B2", fontWeight: 600 }}>{source.active !== false ? "Active" : "Inactive"}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>{source.verified_date ?? "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <Link href={`/admin/scholarships/${source.id}/edit`} style={{ fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ProductCard>
          )}
        </div>
      </div>
    </AdminGate>
  );
}
