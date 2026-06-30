"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageContentSkeleton, ProductCard } from "@/components/ProductUI";
import { toFriendlyError } from "@/lib/friendly-errors";

export function PageLoading({ message }: { message: string }) {
  return (
    <AppShell>
      <PageContentSkeleton message={message} />
    </AppShell>
  );
}

export function PageErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <ProductCard style={{ padding: 18, marginBottom: 22, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
        {message}
      </p>
    </ProductCard>
  );
}

export function PageEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <ProductCard style={{ padding: 24, textAlign: "center" }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#0F2744", fontFamily: 'Arial, Helvetica, "Segoe UI", sans-serif' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: "#5B6B7F", margin: actionHref ? "0 0 16px" : 0, lineHeight: 1.6, fontFamily: 'Arial, Helvetica, "Segoe UI", sans-serif' }}>
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          style={{
            display: "inline-flex",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            background: "#0B5CAD",
            padding: "10px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: 'Arial, Helvetica, "Segoe UI", sans-serif',
          }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </ProductCard>
  );
}

export function runSafe<T>(label: string, fn: () => T, fallback: T): { data: T; error: string | null } {
  try {
    return { data: fn(), error: null };
  } catch (error) {
    console.error(`${label}:`, error);
    return {
      data: fallback,
      error: "Some information could not be loaded. Other parts of this page should still work.",
    };
  }
}

export function friendlyActionError(error: unknown, fallback: string): string {
  console.error(fallback, error);
  return toFriendlyError(error, fallback);
}

export function PageErrorFallback({
  title = "This page couldn't load",
  reset,
}: {
  title?: string;
  reset?: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#F4F8FE",
        fontFamily: "var(--font-hanken), system-ui, sans-serif",
      }}
    >
      <ProductCard style={{ padding: 28, maxWidth: 520, width: "100%" }}>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
          {title}
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
          Something went wrong while loading this page. Your dashboard and other pages should still work.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: "#0B5CAD",
              padding: "12px 22px",
              borderRadius: 13,
              textDecoration: "none",
            }}
          >
            Back to dashboard
          </Link>
          {reset ? (
            <button
              type="button"
              onClick={reset}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0B5CAD",
                background: "#fff",
                border: "1.5px solid #DCE7F5",
                padding: "12px 22px",
                borderRadius: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          ) : null}
        </div>
      </ProductCard>
    </div>
  );
}
