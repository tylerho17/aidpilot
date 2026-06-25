import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aid Checklist | AidPilot",
  description: "Track every step needed to protect your financial aid.",
};

export default function ChecklistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
