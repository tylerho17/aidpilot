"use client";

import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import { PageErrorBanner } from "@/components/product/PageSafety";

export default function ProtectError() {
  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
          Protect Your Aid
        </h1>
        <ProductCard style={{ padding: 24 }}>
          <PageErrorBanner message="We couldn't load your aid protection status right now. Please try again in a moment." />
        </ProductCard>
      </div>
    </AppShell>
  );
}
