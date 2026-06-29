import { ProductCard } from "@/components/ProductUI";

const items = [
  {
    title: "Grants and scholarships",
    body: "Free aid that usually does not need to be repaid.",
  },
  {
    title: "Work-study",
    body: "Money you earn through a job. It is not usually an upfront discount on your bill.",
  },
  {
    title: "Loans",
    body: "Borrowed money that must be repaid.",
  },
  {
    title: "Remaining gap",
    body: "The amount that still needs a plan after aid is counted.",
  },
];

export default function AidCategoryExplainer() {
  return (
    <ProductCard style={{ padding: 22, marginBottom: 20 }}>
      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
        How to read an aid offer
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div key={item.title}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#15212E", marginBottom: 4 }}>{item.title}</div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </ProductCard>
  );
}
