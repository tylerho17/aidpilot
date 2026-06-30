"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import ProtectCategoryCard from "@/components/protect/ProtectCategoryCard";
import ProtectNextActionCard from "@/components/protect/ProtectNextActionCard";
import ProtectStatusOverview from "@/components/protect/ProtectStatusOverview";
import { PageLoading } from "@/components/product/PageSafety";
import { useProtectHub } from "@/hooks/useProtectHub";

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
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "10px 16px",
  borderRadius: 999,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

function PageIntro() {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
        Protect Your Aid
      </h1>
      <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
        Track the steps that help you avoid missing FAFSA, school portal, verification, and aid offer actions.
      </p>
    </div>
  );
}

export default function ProtectHubClient() {
  const { authReady, userId, loading, loadError, dataWarning, snapshot, topAction, reload } = useProtectHub();

  if (!authReady || loading) {
    return <PageLoading message="Loading your aid protection status..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <PageIntro />
          <ProductCard
            style={{
              padding: 18,
              marginBottom: 18,
              background: "#EAF3FF",
              border: "1px solid #D7E7FB",
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, color: "#1E3A5F", margin: 0, lineHeight: 1.65 }}>
              Protect Your Aid means staying on top of FAFSA steps, school portal follow-up, verification requests, and aid
              offers so you do not miss requirements that could change your aid.
            </p>
          </ProductCard>
          <ProductCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Log in to see your personalized aid protection status.
            </p>
            <Link href="/login" style={primaryBtn}>
              Sign in
            </Link>
          </ProductCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <PageIntro />

        {loadError ? (
          <ProductCard style={{ padding: 18, marginBottom: 18, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.6 }}>
              {loadError}
            </p>
            <button type="button" style={secondaryBtn} onClick={() => void reload()}>
              Try again
            </button>
          </ProductCard>
        ) : (
          <>
            {dataWarning ? (
              <ProductCard style={{ padding: 18, marginBottom: 18, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.6 }}>
                  {dataWarning}
                </p>
                <button type="button" style={secondaryBtn} onClick={() => void reload()}>
                  Try again
                </button>
              </ProductCard>
            ) : null}
            <ProtectStatusOverview snapshot={snapshot} />
            <ProtectNextActionCard action={topAction} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {snapshot.categories.map((category) => (
                <ProtectCategoryCard key={category.key} category={category} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
