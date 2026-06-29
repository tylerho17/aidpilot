import { ProductCard } from "@/components/ProductUI";
import { SCHOLARSHIP_SCHEMA_BANNER_MESSAGE } from "@/lib/scholarship-errors";

export function ScholarshipSchemaBanner() {
  return (
    <ProductCard style={{ padding: 20, marginBottom: 20, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
      <p style={{ fontSize: 14, color: "#78350F", margin: 0, lineHeight: 1.6 }}>{SCHOLARSHIP_SCHEMA_BANNER_MESSAGE}</p>
    </ProductCard>
  );
}
