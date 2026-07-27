import type { Metadata } from "next";
import { AppChrome } from "@/components/app/AppChrome";
import { DocumentVault } from "@/components/app/screens/DocumentVault";

export const metadata: Metadata = {
  title: "Your document vault | AidPilot",
  description: "A private place to keep the paperwork your aid office asks for — verification documents, appeal evidence. Only you can see them.",
};

export default function VaultPage() {
  return (
    <AppChrome>
      <DocumentVault />
    </AppChrome>
  );
}
