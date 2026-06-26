import type { Metadata } from "next";
import AdminScholarshipsClient from "@/components/admin/AdminScholarshipsClient";

export const metadata: Metadata = {
  title: "Admin Scholarships | AidPilot",
};

export default function AdminScholarshipsPage() {
  return <AdminScholarshipsClient />;
}
