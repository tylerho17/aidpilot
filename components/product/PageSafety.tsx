"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageContentSkeleton } from "@/components/ProductUI";
import { SectionCard } from "@/components/ui/SectionCard";
import { PrimaryButtonLink } from "@/components/ui/PrimaryButton";
import { H2, BodyMuted } from "@/components/ui/Typography";
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
    <SectionCard style={{ padding: 18, marginBottom: 22, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
      <BodyMuted style={{ color: "#78350F", fontSize: 14 }}>{message}</BodyMuted>
    </SectionCard>
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
    <SectionCard style={{ padding: 24, textAlign: "center" }}>
      <H2 style={{ fontSize: 22, marginBottom: 8 }}>{title}</H2>
      <BodyMuted style={{ marginBottom: actionHref ? 16 : 0 }}>{description}</BodyMuted>
      {actionHref && actionLabel ? <PrimaryButtonLink href={actionHref}>{actionLabel}</PrimaryButtonLink> : null}
    </SectionCard>
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
      }}
    >
      <SectionCard style={{ padding: 28, maxWidth: 520, width: "100%" }}>
        <H2 style={{ marginBottom: 12 }}>{title}</H2>
        <BodyMuted style={{ marginBottom: 20 }}>
          Something went wrong while loading this page. Your dashboard and other pages should still work.
        </BodyMuted>
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
      </SectionCard>
    </div>
  );
}
