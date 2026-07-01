import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { HomeScreen } from "@/components/app/screens/HomeScreen";

export const metadata: Metadata = {
  title: "Dashboard | AidPilot",
  description: "Your financial aid command center.",
};

export default function DashboardPage() {
  return (
    <AppChrome>
      <HomeScreen />
    </AppChrome>
  );
}
