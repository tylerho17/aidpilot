import { ProductCard } from "@/components/ProductUI";
import { FAFSA_DEMO_BANNER_MESSAGE } from "@/lib/fafsa-demo-fallback";

export function FafsaDemoBanner() {
  return (
    <ProductCard style={{ padding: 18, marginBottom: 20, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
        {FAFSA_DEMO_BANNER_MESSAGE}
      </p>
    </ProductCard>
  );
}
