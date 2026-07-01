"use client";

import Link from "next/link";
import { Card, Logo, IconTile, Button } from "@/components/ui";
import { useUserData } from "@/hooks/useUserData";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { loading, user, isScholarshipAdmin } = useUserData();

  if (loading && !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          fontFamily: "var(--font-body)",
          background: "var(--surface-app)",
        }}
      >
        <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 600 }}>Checking admin access…</p>
      </div>
    );
  }

  if (!user || !isScholarshipAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "var(--font-body)",
          background: "var(--surface-app)",
        }}
      >
        <Card variant="clay" padding={32} style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Logo size={30} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <IconTile icon="shield" tone="coral" size={52} />
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-.4px", margin: "0 0 10px", color: "var(--ink-900)" }}
          >
            You do not have access
          </h1>
          <p style={{ fontSize: 15, color: "var(--gray-500)", margin: "0 0 22px", lineHeight: 1.6 }}>
            Your account does not have scholarship admin access in this environment.
          </p>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-block" }}>
            <Button variant="secondary" iconLeft="arrow-right">
              Back to dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
