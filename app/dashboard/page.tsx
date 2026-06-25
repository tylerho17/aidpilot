import type { Metadata } from "next";
import DashboardClient from "@/components/product/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | AidPilot",
  description: "Your weekly aid check-in.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
