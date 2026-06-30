import type { Metadata } from "next";
import AidHealthReportClient from "@/components/aid-letter/AidHealthReportClient";

type PageProps = {
  params: Promise<{ offerId: string }>;
};

export const metadata: Metadata = {
  title: "Aid Health Report | AidPilot",
  description: "Understand your real cost, gift aid, loans, remaining gap, and next steps for a school aid offer.",
};

export default async function AidHealthReportPage({ params }: PageProps) {
  const { offerId } = await params;
  return <AidHealthReportClient offerId={offerId} />;
}
