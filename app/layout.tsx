import type { Metadata } from "next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { appFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AidPilot -- Protect your aid. Find more college money every week.",
  description:
    "AidPilot helps students protect financial aid, avoid FAFSA mistakes, track deadlines, and find scholarships every week.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${appFont.variable}`}>
      <body className={`min-h-full flex flex-col ${appFont.className}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
