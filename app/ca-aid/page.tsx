import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { CaAid } from "@/components/app/screens/CaAid";

export const metadata: Metadata = {
  title: "California aid & scholarships | AidPilot",
  description: "The major California aid programs — Cal Grant, Chafee, Middle Class Scholarship, Dream Act aid — with who qualifies, the award, and deadlines. Sourced from CSAC.",
};

export default function CaAidPage() {
  return (
    <AppChrome>
      <CaAid />
    </AppChrome>
  );
}
