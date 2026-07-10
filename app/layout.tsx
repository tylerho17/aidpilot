import type { Metadata } from "next";
import { Nunito, Hanken_Grotesk, Rubik } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Rubik - the metric face: money, day-counts, percentages in the big stat boxes.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AidPilot — Finish your FAFSA or CADAA worksheet",
  description:
    "A free, no-login bilingual guide (EN/ES/VI) that walks you through FAFSA or CADAA and prepares a worksheet you submit yourself. Nothing about you is stored.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${nunito.variable} ${hanken.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
