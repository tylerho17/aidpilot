import { ProductCard } from "@/components/ProductUI";

type FafsaSyncBannerProps = {
  message: string;
};

export function FafsaSyncBanner({ message }: FafsaSyncBannerProps) {
  return (
    <ProductCard
      style={{
        padding: 16,
        marginBottom: 18,
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>{message}</p>
    </ProductCard>
  );
}
