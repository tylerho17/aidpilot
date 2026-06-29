import { ProductCard } from "@/components/ProductUI";
import ProtectRiskBadge from "@/components/protect/ProtectRiskBadge";
import type { ProtectStatusSnapshot } from "@/lib/protect/getProtectStatus";

export default function ProtectStatusOverview({ snapshot }: { snapshot: ProtectStatusSnapshot }) {
  return (
    <ProductCard
      style={{
        padding: 24,
        marginBottom: 20,
        background: "linear-gradient(135deg,#F4FBF7,#F4F8FE)",
        border: "1px solid #D5F0E2",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#15212E" }}>
          Protection status
        </h2>
        <ProtectRiskBadge status={snapshot.overallStatus} />
      </div>
      <p className="font-display" style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#15212E", lineHeight: 1.35 }}>
        {snapshot.headline}
      </p>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>
        {snapshot.description}
      </p>
    </ProductCard>
  );
}
