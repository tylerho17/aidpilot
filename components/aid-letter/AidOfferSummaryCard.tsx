"use client";

import { PillBadge, ProductCard } from "@/components/ProductUI";
import AidOfferFlags from "@/components/aid-letter/AidOfferFlags";
import { AID_OFFER_STATUS_LABELS, calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 13,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

type AidOfferSummaryCardProps = {
  offer: UserAidOffer;
  saving?: boolean;
  onMarkReviewed?: (offerId: string) => void;
  onEdit?: (offer: UserAidOffer) => void;
  onDelete?: (offerId: string) => void;
};

export default function AidOfferSummaryCard({
  offer,
  saving,
  onMarkReviewed,
  onEdit,
  onDelete,
}: AidOfferSummaryCardProps) {
  const calc = calculateAidOfferFromRecord(offer);

  return (
    <ProductCard style={{ padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
            {offer.school_name}
          </h3>
          <PillBadge tone={offer.offer_status === "reviewed" ? "green" : "blue"}>
            {AID_OFFER_STATUS_LABELS[offer.offer_status]}
          </PillBadge>
        </div>
        {offer.academic_year ? (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#9AA4B2" }}>{offer.academic_year}</span>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label="Gift aid" value={money(calc.giftAid)} color="#15885A" />
        <Stat label="Work-study" value={money(calc.workStudy)} color="#0B5CAD" />
        <Stat label="Loans" value={money(calc.loanTotal)} color="#B7791F" />
        <Stat label="Net after gift aid" value={money(calc.netCostAfterGiftAid)} color="#15212E" />
        <Stat label="Remaining gap" value={money(calc.remainingGapAfterAllAid)} color="#C04E57" />
      </div>

      <AidOfferFlags flags={calc.flags} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {offer.offer_status !== "reviewed" && onMarkReviewed ? (
          <button type="button" style={secondaryBtn} disabled={saving} onClick={() => onMarkReviewed(offer.id)}>
            Mark as reviewed
          </button>
        ) : null}
        {onEdit ? (
          <button type="button" style={secondaryBtn} onClick={() => onEdit(offer)}>
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            style={{ ...secondaryBtn, background: "#FEF2F2", color: "#C04E57" }}
            disabled={saving}
            onClick={() => onDelete(offer.id)}
          >
            Delete
          </button>
        ) : null}
      </div>
    </ProductCard>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color }}>
        {value}
      </div>
    </div>
  );
}
