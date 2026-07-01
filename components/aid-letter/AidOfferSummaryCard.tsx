"use client";

import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { money as moneyStyle } from "@/components/app/screens/shared";
import AidOfferFlags from "@/components/aid-letter/AidOfferFlags";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_STATUS_LABELS, calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import type { AidOfferRecordStatus, UserAidOffer } from "@/lib/types";

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
    <Card variant="clay" padding={24} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 8px", color: "var(--ink-900)" }}>
            {offer.school_name}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>Offer status</span>
            <Badge tone={statusTone(status)}>{AID_OFFER_STATUS_LABELS[status]}</Badge>
          </div>
        </div>
        {offer.academic_year ? (
          <Badge tone="gray">{offer.academic_year}</Badge>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
        <Stat label="Gift aid" value={money(calc.giftAid)} color="var(--green-600)" />
        <Stat label="Work-study" value={money(calc.workStudy)} color="var(--blue-700)" />
        <Stat label="Loans" value={money(calc.loanTotal)} color="var(--amber-600)" />
        <Stat label="Net after gift aid" value={money(calc.netCostAfterGiftAid)} color="var(--ink-900)" />
        <Stat label="Remaining gap" value={money(calc.remainingGapAfterAllAid)} color="var(--coral-600)" />
        {calc.surplusAid > 0 ? (
          <Stat label="Surplus aid shown" value={money(calc.surplusAid)} color="var(--green-600)" />
        ) : null}
      </div>

      <AidOfferFlags flags={calc.flags} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        <Link href={getAidOfferReportHref(offer.id)} style={{ textDecoration: "none" }}>
          <Button variant="clay" size="sm" iconRight="arrow-right">View Aid Health Report</Button>
        </Link>
        {(status === "draft" || status === "estimated") && onMarkOfficial ? (
          <Button variant="secondary" size="sm" disabled={saving} onClick={() => onMarkOfficial(offer.id)}>
            Mark official
          </Button>
        ) : null}
        {status === "official" && onMarkReviewed ? (
          <Button variant="secondary" size="sm" disabled={saving} onClick={() => onMarkReviewed(offer.id)}>
            Mark reviewed
          </Button>
        ) : null}
        {onEdit ? (
          <Button variant="secondary" size="sm" onClick={() => onEdit(offer)}>
            Edit
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => onDelete(offer.id)}
            style={{ background: "var(--coral-100)", color: "var(--coral-600)", border: "none" }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: 14, borderRadius: "var(--radius-md)", background: "var(--blue-50)", border: "1px solid var(--border-card)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", marginBottom: 4 }}>{label}</div>
      <div style={{ ...moneyStyle, fontSize: 18, color }}>{value}</div>
    </div>
  );
}
