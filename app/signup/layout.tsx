import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | AidPilot",
  description: "Create your AidPilot account.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
