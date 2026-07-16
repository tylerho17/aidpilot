"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui";
import { setDemoEnabled } from "@/lib/demo";

/**
 * One-click demo entry: flips the demo-data seam on (localStorage for the
 * client screens, a cookie so the middleware lets a signed-out visitor into
 * the app surfaces) and lands on the dashboard. No account, no data stored.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    setDemoEnabled(true);
    document.cookie = "aidpilot-demo=on; path=/; max-age=86400; samesite=lax";
    router.replace("/dashboard");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-app)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "var(--font-body)",
      }}
    >
      <Logo variant="mark" size={48} />
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-500)", margin: 0 }}>
        Setting up the demo...
      </p>
    </div>
  );
}
