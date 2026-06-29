"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import AidActionList from "@/components/aid-actions/AidActionList";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import { useAidActions } from "@/hooks/useAidActions";

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 18px",
  borderRadius: 12,
  textDecoration: "none",
} as const;

export default function ActionsClient() {
  const { actions, authReady, loading, loadError, userId } = useAidActions();

  if (!authReady || loading) {
    return <PageLoading message="Loading your aid actions..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1
            className="font-display"
            style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E", lineHeight: 1.1 }}
          >
            Aid Action Center
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
            Your most important financial aid tasks in one place.
          </p>
          <PageErrorBanner message="Log in to see your personalized aid actions." />
          <Link href="/login" style={primaryBtn}>
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 22 }}>
          <h1
            className="font-display"
            style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E", lineHeight: 1.1 }}
          >
            Aid Action Center
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Your most important financial aid tasks in one place.
          </p>
        </div>

        {loadError && <PageErrorBanner message={loadError} />}

        <AidActionList actions={actions} />
      </div>
    </AppShell>
  );
}
