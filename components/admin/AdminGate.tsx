"use client";

import Link from "next/link";
import { useUserData } from "@/hooks/useUserData";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { loading, user, isScholarshipAdmin } = useUserData();

  if (loading && !user) {
    return (
      <div style={{ minHeight: "100vh", padding: 40, fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
        <p style={{ color: "#9AA4B2" }}>Checking admin access...</p>
      </div>
    );
  }

  if (!user || !isScholarshipAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-hanken), system-ui, sans-serif", background: "#F4F8FE" }}>
        <div style={{ maxWidth: 480, textAlign: "center", background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #E9EDF2" }}>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>You do not have access.</h1>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
            Your account does not have scholarship admin access in this environment.
          </p>
          <Link href="/dashboard" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
