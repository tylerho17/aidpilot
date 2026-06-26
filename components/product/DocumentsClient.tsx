"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  documentStatusToTone,
  formatDocumentStatus,
  formatDueDate,
  getMissingDocumentCountFromDocs,
} from "@/lib/data-helpers";
import type { DocumentItem } from "@/lib/types";

const DOCUMENT_STATUSES = ["not_started", "needed", "submitted", "verified"] as const;

function DocRow({
  name,
  status,
  due,
  tone,
  action,
}: {
  name: string;
  status: string;
  due: string;
  tone: "green" | "amber" | "coral" | "blue" | "gray";
  action?: ReactNode;
}) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#15212E" }}>{name}</span>
        <PillBadge tone={tone}>{formatDocumentStatus(status)}</PillBadge>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Due {due}</span>
        {action}
      </div>
    </div>
  );
}

export default function DocumentsClient() {
  const { loading, documents, updateDocumentStatus } = useUserData();
  const [error, setError] = useState("");

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading documents...</p>
      </AppShell>
    );
  }

  const missing = getMissingDocumentCountFromDocs(documents);

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Documents
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track requested documents without uploading sensitive files.
        </p>
      </div>

      <StatCard label="Documents needed" value={String(missing)} color="#C04E57" style={{ marginBottom: 22, maxWidth: 220 }} />

      {error && (
        <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{error}</p>
      )}

      <ProductCard style={{ padding: 26, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Document tracker</h2>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.5 }}>Status only. No file uploads in AidPilot.</p>
        {documents.length === 0 ? (
          <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
            No documents tracked yet. Your school may request verification documents — add them here when you are ready.
          </p>
        ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {documents.map((doc: DocumentItem) => (
            <DocRow
              key={doc.id}
              name={doc.title}
              status={doc.status}
              due={formatDueDate(doc.due_date, "No date")}
              tone={documentStatusToTone(doc.status)}
              action={
                <select
                  value={doc.status}
                  onChange={async (e) => {
                    setError("");
                    try {
                      await updateDocumentStatus(doc.id, e.target.value);
                    } catch (err) {
                      console.error("Failed to update document:", err);
                      setError(err instanceof Error ? err.message : "Could not update document status.");
                    }
                  }}
                  style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, border: "1px solid #E5E7EB", padding: "5px 10px", fontFamily: "inherit", background: "#fff" }}
                >
                  {DOCUMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>{formatDocumentStatus(status)}</option>
                  ))}
                </select>
              }
            />
          ))}
        </div>
        )}
      </ProductCard>

      <ProductCard style={{ padding: 22, background: "#FFF7E6", border: "1px solid #F2E6C8", marginBottom: 22 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
          Upload required documents through your school portal. AidPilot tracks status only and never collects tax files, FAFSA logins, or SSNs.
        </p>
      </ProductCard>

      <Link href="/checklist" style={{ display: "inline-block", fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
        View full checklist
      </Link>
    </AppShell>
  );
}
