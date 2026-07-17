import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { AppealBuilder } from "@/components/app/screens/AppealBuilder";

export const metadata: Metadata = {
  title: "Appeal your aid | AidPilot",
  description: "Circumstances changed? Draft a professional appeal letter to your school's financial aid office.",
};

export default function AppealPage() {
  return (
    <AppChrome>
      <AppealBuilder />
    </AppChrome>
  );
}
