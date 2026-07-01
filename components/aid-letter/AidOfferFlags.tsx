import { IconTile } from "@/components/ui";

type AidOfferFlagsProps = {
  flags: string[];
};

export default function AidOfferFlags({ flags }: AidOfferFlagsProps) {
  if (flags.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
      {flags.map((flag) => (
        <div
          key={flag}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--gradient-warn)",
            border: "1px solid var(--amber-200)",
          }}
        >
          <IconTile icon="star" tone="amber" size={26} />
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--amber-600)", margin: 0, lineHeight: 1.55 }}>{flag}</p>
        </div>
      ))}
    </div>
  );
}
