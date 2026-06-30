import type { Metadata } from "next";
import AidOfferDecoderClient from "@/components/aid-letter/AidOfferDecoderClient";

export const metadata: Metadata = {
  title: "Aid Offers | AidPilot",
};

export default function AidLetterPage() {
  return <AidOfferDecoderClient />;
}
