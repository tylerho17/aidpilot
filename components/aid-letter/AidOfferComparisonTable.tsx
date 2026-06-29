"use client";

import { useMemo } from "react";
import { PillBadge } from "@/components/ProductUI";
import {
  AID_OFFER_STATUS_LABELS,
  calculateAidOfferFromRecord,
  compareOffersByNetCost,
} from "@/lib/aid-letter/calculateAidOffer";
import type { AidOfferRecordStatus, UserAidOffer } from "@/lib/types";

type AidOfferComparisonTableProps = {
  offers: UserAidOffer[];
  onSelect?: (offer: UserAidOffer) => void;
};

const HEADERS = [
  "School",
  "Cost of attendance",
  "Grants/scholarships",
  "Work-study",
  "Loans",
  "Net after gift aid",
  "Remaining gap",
  "Status",
] as const;

const cellStyle = {
  padding: "12px 14px",
  fontSize: 14,
  whiteSpace: "nowrap" as const,
};

const schoolCellStyle = {
  ...cellStyle,
  minWidth: 180,
  fontWeight: 700,
  color: "#15212E",
};

const headerStyle = {
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: 700,
  color: "#9AA4B2",
  padding: "10px 14px",
  whiteSpace: "nowrap" as const,
};

const schoolHeaderStyle = {
  ...headerStyle,
  minWidth: 180,
};

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

export default function AidOfferComparisonTable({ offers, onSelect }: AidOfferComparisonTableProps) {
  const rows = useMemo(() => {
    return offers
      .map((offer) => ({
        offer,
        calculation: calculateAidOfferFromRecord(offer),
      }))
      .sort(compareOffersByNetCost);
  }, [offers]);

  if (offers.length === 0) return null;

  return (
    <div
      className="overflow-x-auto"
      style={{
        marginBottom: 20,
        width: "100%",
        maxWidth: "100%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <table style={{ width: "max-content", minWidth: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #EAEEF3" }}>
            {HEADERS.map((header) => (
              <th key={header} style={header === "School" ? schoolHeaderStyle : headerStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ offer, calculation }) => (
            <tr
              key={offer.id}
              style={{ borderBottom: "1px solid #EAEEF3", cursor: onSelect ? "pointer" : "default" }}
              onClick={onSelect ? () => onSelect(offer) : undefined}
            >
              <td style={schoolCellStyle}>{offer.school_name}</td>
              <td style={{ ...cellStyle, color: "#374151" }}>{money(offer.cost_of_attendance)}</td>
              <td style={{ ...cellStyle, color: "#15885A", fontWeight: 600 }}>{money(calculation.giftAid)}</td>
              <td style={{ ...cellStyle, color: "#374151" }}>{money(calculation.workStudy)}</td>
              <td style={{ ...cellStyle, color: "#B7791F", fontWeight: 600 }}>{money(calculation.loanTotal)}</td>
              <td style={{ ...cellStyle, fontWeight: 700, color: "#15212E" }}>{money(calculation.netCostAfterGiftAid)}</td>
              <td style={{ ...cellStyle, fontWeight: 700, color: "#C04E57" }}>
                {money(calculation.remainingGapAfterAllAid)}
              </td>
              <td style={cellStyle}>
                <PillBadge tone={statusTone(offer.offer_status)}>
                  {AID_OFFER_STATUS_LABELS[offer.offer_status]}
                </PillBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
