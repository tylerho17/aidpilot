import type { Metadata } from "next";
import AidOfferCompareClient from "@/components/aid-letter/AidOfferCompareClient";

export const metadata: Metadata = {
  title: "Compare Aid Offers | AidPilot",
  description: "Compare cost of attendance, gift aid, loans, and remaining gap across your school aid offers.",
};

export default function AidOfferComparePage() {
  return <AidOfferCompareClient />;
}
