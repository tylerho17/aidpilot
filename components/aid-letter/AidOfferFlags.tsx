import { InsightRow } from "@/components/ui/InsightRow";
import { Label } from "@/components/ui/Typography";
import { layout } from "@/lib/design-tokens";

type AidOfferFlagsProps = {
  flags: string[];
};

export default function AidOfferFlags({ flags }: AidOfferFlagsProps) {
  const insights = flags.slice(0, 3);
  if (insights.length === 0) return null;

  return (
    <div style={{ marginTop: layout.stackGap }}>
      <Label style={{ display: "block", marginBottom: layout.stackGapSm }}>AidPilot insights</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapXs }}>
        {insights.map((flag) => (
          <InsightRow key={flag}>{flag}</InsightRow>
        ))}
      </div>
    </div>
  );
}
