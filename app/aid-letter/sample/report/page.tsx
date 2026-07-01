import type { Metadata } from "next";
import SampleAidHealthReportClient from "@/components/aid-letter/SampleAidHealthReportClient";

export const metadata: Metadata = {
  title: "Sample Aid Health Report | AidPilot",
  description: "Preview an Aid Health Report with sample UCI aid offer data.",
};

export default function SampleAidHealthReportPage() {
  return <SampleAidHealthReportClient />;
}
