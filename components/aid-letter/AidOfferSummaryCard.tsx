"use client";

import { PillBadge, ProductCard } from "@/components/ProductUI";
import AidOfferFlags from "@/components/aid-letter/AidOfferFlags";
import { AID_OFFER_STATUS_LABELS, calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { AidOfferRecordStatus, UserAidOffer } from "@/lib/types";

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

function statusTone(status: AidOfferRecordStatus): "gray" | "amber" | "blue" | "green" {
  switch (status) {
    case "draft":
      return "gray";
    case "estimated":
      return "amber";
    case "official":
      return "blue";
    case "reviewed":
      return "green";
  }
}

type AidOfferSummaryCardProps = {
  offer: UserAidOffer;
  saving?: boolean;
  onMarkOfficial?: (offerId: string) => void;
  onMarkReviewed?: (offerId: string) => void;
  onEdit?: (offer: UserAidOffer) => void;
  onDelete?: (offerId: string) => void;
};

export default function AidOfferSummaryCard({
  offer,
  saving,
  onMarkOfficial,
  onMarkReviewed,
  onEdit,
  onDelete,
}: AidOfferSummaryCardProps) {
  const calc = calculateAidOfferFromRecord(offer);
  const status = offer.offer_status;

  return (
    <ProductCard style={{ padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
            {offer.school_name}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Offer status</span>
            <PillBadge tone={statusTone(status)}>{AID_OFFER_STATUS_LABELS[status]}</PillBadge>
          </div>
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
        {calc.surplusAid > 0 ? (
          <Stat label="Surplus aid shown" value={money(calc.surplusAid)} color="#15885A" />
        ) : null}
      </div>

      <AidOfferFlags flags={calc.flags} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {(status === "draft" || status === "estimated") && onMarkOfficial ? (
          <button type="button" style={secondaryBtn} disabled={saving} onClick={() => onMarkOfficial(offer.id)}>
            Mark official
          </button>
        ) : null}
        {status === "official" && onMarkReviewed ? (
          <button type="button" style={secondaryBtn} disabled={saving} onClick={() => onMarkReviewed(offer.id)}>
            Mark reviewed
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
