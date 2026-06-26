import type { Metadata } from "next";
import ScholarshipReportClient from "@/components/product/ScholarshipReportClient";

export const metadata: Metadata = {
  title: "Weekly Scholarship Report | AidPilot",
  description: "Your top 7 scholarship matches for this week.",
};

export default function ScholarshipReportPage() {
  return <ScholarshipReportClient />;
}
