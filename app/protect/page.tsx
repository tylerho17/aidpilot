import type { Metadata } from "next";
import ProtectHubClient from "@/components/protect/ProtectHubClient";

export const metadata: Metadata = {
  title: "Protect Your Aid | AidPilot",
  description: "Track FAFSA, school portals, verification, and aid offers in one place.",
};

export default function ProtectPage() {
  return <ProtectHubClient />;
}
