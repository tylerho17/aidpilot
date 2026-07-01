"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { AdminGate } from "@/components/admin/AdminGate";
import { Card, Badge, Button, IconTile, StatusPanel } from "@/components/ui";
import { formatScholarshipDeadline } from "@/lib/data-helpers";
import { toFriendlyError } from "@/lib/friendly-errors";
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
        setError(toFriendlyError(queryError, "Could not load scholarships."));
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
      <AppChrome>
        <div style={{ fontFamily: "var(--font-body)" }}>
          <Link
            href="/dashboard"
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
            ← Back to app
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h1
                className="font-display"
                style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.7px", color: "var(--ink-900)", margin: 0 }}
              >
                Scholarship admin
              </h1>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "7px 0 0" }}>
                Manage scholarship sources for matching and weekly reports.
              </p>
            </div>
            <Link href="/admin/scholarships/new" style={{ textDecoration: "none", flexShrink: 0 }}>
              <Button variant="clay" iconLeft="plus">
                New scholarship
              </Button>
            </Link>
          </div>

          {error && (
            <StatusPanel tone="coral" icon="shield" title="Something went wrong" style={{ marginBottom: 16 }}>
              {error}
            </StatusPanel>
          )}

          {loading ? (
            <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 600 }}>Loading scholarships…</p>
          ) : sources.length === 0 ? (
            <Card variant="clay" padding={32} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <IconTile icon="star" tone="blue" size={52} />
              </div>
              <p style={{ fontSize: 15, color: "var(--gray-500)", margin: "0 0 18px", lineHeight: 1.6 }}>
                No scholarships in the database yet. Run <code>supabase/008_seed_phase_5_scholarships.sql</code> or create
                your first scholarship.
              </p>
              <Link href="/admin/scholarships/new" style={{ textDecoration: "none", display: "inline-block" }}>
                <Button variant="primary" iconLeft="plus">
                  Create scholarship
                </Button>
              </Link>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sources.map((source) => {
                const isActive = source.active !== false;
                return (
                  <Card
                    key={source.id}
                    variant="clay"
                    padding={18}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "var(--ink-900)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {source.name}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", marginTop: 3 }}>
                        Deadline · {formatScholarshipDeadline(source.deadline)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-metric)",
                        fontWeight: 700,
                        fontSize: 17,
                        letterSpacing: "-.5px",
                        color: "var(--ink-800)",
                        flex: "0 0 auto",
                        minWidth: 90,
                      }}
                    >
                      {source.amount ? `$${source.amount.toLocaleString()}` : "–"}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: "0 0 auto" }}>
                      <Badge tone={isActive ? "green" : "gray"} dot>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                      {source.verified_date ? (
                        <Badge tone="blue" icon="check">
                          Verified {source.verified_date}
                        </Badge>
                      ) : (
                        <Badge tone="gray">Unverified</Badge>
                      )}
                    </div>

                    <Link
                      href={`/admin/scholarships/${source.id}/edit`}
                      style={{ textDecoration: "none", flex: "0 0 auto" }}
                    >
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AppChrome>
    </AdminGate>
  );
}
