import type { Metadata } from "next";
import AdminScholarshipNewClient from "@/components/admin/AdminScholarshipNewClient";

export const metadata: Metadata = {
  title: "New Scholarship | AidPilot Admin",
};

export default function AdminScholarshipNewPage() {
  return <AdminScholarshipNewClient />;
}
