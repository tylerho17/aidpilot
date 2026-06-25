import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | AidPilot",
  description: "Build your personalized aid check-in with AidPilot.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
