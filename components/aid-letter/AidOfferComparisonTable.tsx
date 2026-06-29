"use client";

import { useMemo } from "react";
import { PillBadge } from "@/components/ProductUI";
import {
  AID_OFFER_STATUS_LABELS,
  calculateAidOfferFromRecord,
  compareOffersByNetCost,
} from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

type AidOfferComparisonTableProps = {
  offers: UserAidOffer[];
  onSelect?: (offer: UserAidOffer) => void;
};

function money(value: number) {
  return `$${value.toLocaleString()}`;
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
    <div style={{ overflowX: "auto", marginBottom: 20 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #EAEEF3" }}>
            {["School", "Cost of attendance", "Grants/scholarships", "Work-study", "Loans", "Net after gift aid", "Remaining gap", "Status"].map(
              (header) => (
                <th
                  key={header}
                  style={{
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9AA4B2",
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ offer, calculation }) => (
            <tr
              key={offer.id}
              style={{ borderBottom: "1px solid #EAEEF3", cursor: onSelect ? "pointer" : "default" }}
              onClick={onSelect ? () => onSelect(offer) : undefined}
            >
              <td style={{ padding: "12px", fontSize: 14, fontWeight: 700, color: "#15212E" }}>{offer.school_name}</td>
              <td style={{ padding: "12px", fontSize: 14, color: "#374151" }}>{money(offer.cost_of_attendance)}</td>
              <td style={{ padding: "12px", fontSize: 14, color: "#15885A", fontWeight: 600 }}>
                {money(calculation.giftAid)}
              </td>
              <td style={{ padding: "12px", fontSize: 14, color: "#374151" }}>{money(calculation.workStudy)}</td>
              <td style={{ padding: "12px", fontSize: 14, color: "#B7791F", fontWeight: 600 }}>
                {money(calculation.loanTotal)}
              </td>
              <td style={{ padding: "12px", fontSize: 14, fontWeight: 700, color: "#15212E" }}>
                {money(calculation.netCostAfterGiftAid)}
              </td>
              <td style={{ padding: "12px", fontSize: 14, fontWeight: 700, color: "#C04E57" }}>
                {money(calculation.remainingGapAfterAllAid)}
              </td>
              <td style={{ padding: "12px" }}>
                <PillBadge tone={offer.offer_status === "reviewed" ? "green" : "blue"}>
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
