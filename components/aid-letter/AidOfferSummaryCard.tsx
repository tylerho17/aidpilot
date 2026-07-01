"use client";

import { PillBadge } from "@/components/ProductUI";
import { SecondaryButton, SoftButtonLink, SectionCard } from "@/components/ui";
import AidOfferFlags from "@/components/aid-letter/AidOfferFlags";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_STATUS_LABELS, calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import { H3, Label } from "@/components/ui/Typography";
import { MetricValue } from "@/components/ui/Typography";
import { buttons, colors, layout } from "@/lib/design-tokens";
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
  const metrics = [
    { label: "Gift aid", value: calc.giftAid, tone: colors.green },
    { label: "Work-study", value: calc.workStudy, tone: colors.primary },
    { label: "Loans", value: calc.loanTotal, tone: colors.amber },
    { label: "Net after gift aid", value: calc.netCostAfterGiftAid, tone: colors.text },
    { label: "Remaining gap", value: calc.remainingGapAfterAllAid, tone: colors.coral },
  ];

  return (
    <SectionCard style={{ marginBottom: layout.sectionGap }}>
      <div style={{ marginBottom: layout.stackGap }}>
        <H3 style={{ marginBottom: layout.stackGapSm }}>{offer.school_name}</H3>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: layout.stackGapSm }}>
          <PillBadge tone={statusTone(status)}>{AID_OFFER_STATUS_LABELS[status]}</PillBadge>
          {offer.academic_year ? <Label>{offer.academic_year}</Label> : null}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: `${layout.stackGapSm}px ${layout.stackGap}px`,
          marginBottom: layout.stackGapSm,
        }}
      >
        {metrics.map((row) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: layout.stackGapSm, alignItems: "baseline" }}>
            <Label>{row.label}</Label>
            <MetricValue color={row.tone} style={{ fontSize: 18, lineHeight: "26px" }}>
              {money(row.value)}
            </MetricValue>
          </div>
        ))}
      </div>

      <AidOfferFlags flags={calc.flags} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: buttons.gap, marginTop: layout.stackGap }}>
        <SoftButtonLink href={getAidOfferReportHref(offer.id)}>View Aid Health Report</SoftButtonLink>
        {(status === "draft" || status === "estimated") && onMarkOfficial ? (
          <SecondaryButton disabled={saving} onClick={() => onMarkOfficial(offer.id)}>
            Mark official
          </SecondaryButton>
        ) : null}
        {status === "official" && onMarkReviewed ? (
          <SecondaryButton disabled={saving} onClick={() => onMarkReviewed(offer.id)}>
            Mark reviewed
          </SecondaryButton>
        ) : null}
        {onEdit ? <SecondaryButton onClick={() => onEdit(offer)}>Edit</SecondaryButton> : null}
        {onDelete ? (
          <SecondaryButton
            disabled={saving}
            onClick={() => onDelete(offer.id)}
            style={{ background: colors.softCoral, color: colors.coral, borderColor: colors.softCoral }}
          >
            Delete
          </SecondaryButton>
        ) : null}
      </div>
    </SectionCard>
  );
}
