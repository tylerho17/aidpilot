import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | AidPilot",
  description: "Log in to your AidPilot account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
