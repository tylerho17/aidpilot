import type { Metadata } from "next";
import DashboardClient from "@/components/product/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | AidPilot",
  description: "Your financial aid command center.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
