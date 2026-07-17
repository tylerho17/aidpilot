import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { HomeScreen } from "@/components/app/screens/HomeScreen";
import { getAidDeadlines } from "@/lib/deadlines/queries";

export const metadata: Metadata = {
  title: "Dashboard | AidPilot",
  description: "Your financial aid command center.",
};

export default async function DashboardPage() {
  const aidDeadlines = await getAidDeadlines();
  return (
    <AppChrome>
      <HomeScreen aidDeadlines={aidDeadlines} />
    </AppChrome>
  );
}
