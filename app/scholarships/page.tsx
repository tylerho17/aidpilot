import type { Metadata } from "next";
import ScholarshipsClient from "@/components/product/ScholarshipsClient";

export const metadata: Metadata = {
  title: "Scholarships | AidPilot",
  description: "Weekly scholarship report for your aid plan.",
};

export default function ScholarshipsPage() {
  return <ScholarshipsClient />;
}
