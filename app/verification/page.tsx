import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { VerificationHelper } from "@/components/app/screens/VerificationHelper";

export const metadata: Metadata = {
  title: "Selected for verification | AidPilot",
  description: "Got selected for FAFSA verification? Get a tailored, sourced checklist of exactly what to submit — and a note to your aid office.",
};

export default function VerificationPage() {
  return (
    <AppChrome>
      <VerificationHelper />
    </AppChrome>
  );
}
