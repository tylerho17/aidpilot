import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { KeyDates } from "@/components/app/screens/KeyDates";
import { getAidDeadlines } from "@/lib/deadlines/queries";

export const metadata: Metadata = {
  title: "California aid deadlines | AidPilot",
  description: "Every California and federal financial-aid deadline, counted down from today and sourced from CSAC and studentaid.gov.",
};

export default async function KeyDatesPage() {
  const deadlines = await getAidDeadlines();
  return (
    <AppChrome>
      <KeyDates deadlines={deadlines} />
    </AppChrome>
  );
}
