"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui";
import { money as moneyStyle } from "@/components/app/screens/shared";
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
  borderBottom: "1px solid var(--border-card)",
  color: "var(--ink-800)",
};

const schoolCellStyle = {
  ...cellStyle,
  minWidth: 180,
  fontWeight: 700,
  color: "var(--ink-900)",
};

const headerStyle = {
  textAlign: "left" as const,
  fontSize: 12,
  fontWeight: 700,
  color: "var(--gray-500)",
  padding: "10px 14px",
  whiteSpace: "nowrap" as const,
  borderBottom: "2px solid var(--border-card)",
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
          <tr>
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
              style={{ cursor: onSelect ? "pointer" : "default" }}
              onClick={onSelect ? () => onSelect(offer) : undefined}
            >
              <td style={schoolCellStyle}>{offer.school_name}</td>
              <td style={{ ...cellStyle, ...moneyStyle }}>{money(offer.cost_of_attendance)}</td>
              <td style={{ ...cellStyle, ...moneyStyle, color: "var(--green-600)" }}>{money(calculation.giftAid)}</td>
              <td style={{ ...cellStyle, ...moneyStyle }}>{money(calculation.workStudy)}</td>
              <td style={{ ...cellStyle, ...moneyStyle, color: "var(--amber-600)" }}>{money(calculation.loanTotal)}</td>
              <td style={{ ...cellStyle, ...moneyStyle, fontWeight: 700, color: "var(--ink-900)" }}>{money(calculation.netCostAfterGiftAid)}</td>
              <td style={{ ...cellStyle, ...moneyStyle, fontWeight: 700, color: "var(--coral-600)" }}>
                {money(calculation.remainingGapAfterAllAid)}
              </td>
              <td style={cellStyle}>
                <Badge tone={statusTone(offer.offer_status)}>
                  {AID_OFFER_STATUS_LABELS[offer.offer_status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
