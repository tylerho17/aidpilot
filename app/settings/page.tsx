"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ProductCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";

export default function SettingsPage() {
  const { isDemo } = useUserData();

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Settings
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Manage your AidPilot account and preferences.
        </p>
      </div>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
          Product feedback
        </h2>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
          AidPilot is still early. Your feedback shapes what we build next.
        </p>
        {!isDemo && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0B5CAD", margin: 0 }}>
            Use the feedback form below to send notes from any product page.
          </p>
        )}
        {isDemo && (
          <Link href="/signup" style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "underline" }}>
            Create an account to save feedback to your profile
          </Link>
        )}
      </ProductCard>

      <FeedbackWidget page="/settings" />
    </AppShell>
  );
}
