import Link from "next/link";
import { ProductCard } from "@/components/ProductUI";
import ProtectRiskBadge from "@/components/protect/ProtectRiskBadge";
import type { ProtectCategorySnapshot } from "@/lib/protect/getProtectStatus";

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 16px",
  borderRadius: 12,
  textDecoration: "none",
} as const;

export default function ProtectCategoryCard({ category }: { category: ProtectCategorySnapshot }) {
  return (
    <ProductCard style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#15212E" }}>
          {category.title}
        </h3>
        <ProtectRiskBadge status={category.status} />
      </div>

      <ul style={{ margin: 0, paddingLeft: 18, color: "#374151", fontSize: 14, fontWeight: 500, lineHeight: 1.65 }}>
        {category.summaryLines.map((line) => (
          <li key={line} style={{ marginBottom: 4 }}>
            {line}
          </li>
        ))}
      </ul>

      {category.emptyMessage ? (
        <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          {category.emptyMessage}
        </p>
      ) : null}

      <div style={{ marginTop: "auto" }}>
        <Link href={category.href} style={primaryBtn}>
          {category.ctaLabel}
        </Link>
      </div>
    </ProductCard>
  );
}
