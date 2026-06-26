import type { Metadata } from "next";
import AdminScholarshipEditClient from "@/components/admin/AdminScholarshipEditClient";

export const metadata: Metadata = {
  title: "Edit Scholarship | AidPilot Admin",
};

export default async function AdminScholarshipEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminScholarshipEditClient id={id} />;
}
