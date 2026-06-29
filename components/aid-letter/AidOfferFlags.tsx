import { ProductCard } from "@/components/ProductUI";

type AidOfferFlagsProps = {
  flags: string[];
};

export default function AidOfferFlags({ flags }: AidOfferFlagsProps) {
  if (flags.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
      {flags.map((flag) => (
        <ProductCard
          key={flag}
          style={{
            padding: "12px 14px",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#78350F", margin: 0, lineHeight: 1.55 }}>{flag}</p>
        </ProductCard>
      ))}
    </div>
  );
}
