import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { SapAppeal } from "@/components/app/screens/SapAppeal";

export const metadata: Metadata = {
  title: "Appeal a SAP aid loss | AidPilot",
  description: "Lost your financial aid for not meeting Satisfactory Academic Progress? Draft a professional appeal letter to your school — grounded in your situation and plan.",
};

export default function SapAppealPage() {
  return (
    <AppChrome>
      <SapAppeal />
    </AppChrome>
  );
}
