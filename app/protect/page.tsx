import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { ProtectScreen } from "@/components/app/screens/ProtectScreen";

export const metadata: Metadata = {
  title: "Protect Your Aid | AidPilot",
  description: "Track FAFSA, school portals, verification, and aid offers in one place.",
};

export default function ProtectPage() {
  return (
    <AppChrome>
      <ProtectScreen />
    </AppChrome>
  );
}
