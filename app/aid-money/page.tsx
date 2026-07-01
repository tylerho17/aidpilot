import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import MoneyScreen from "@/components/app/screens/MoneyScreen";

export const metadata: Metadata = {
  title: "Aid & Money | AidPilot",
  description: "Your aid offer, decoded - plus scholarships matched to you.",
};

export default function AidMoneyPage() {
  return (
    <AppChrome>
      <MoneyScreen />
    </AppChrome>
  );
}
