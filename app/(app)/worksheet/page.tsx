"use client";

import { useTranslations } from "next-intl";
import { Card, SectionHeading, Badge } from "@/components/ui";

// F1 placeholder — the worksheet generator is built in F5.
export default function WorksheetPage() {
  const t = useTranslations("worksheet");
  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Card variant="clay" padding="clamp(20px, 5vw, 32px)">
        <Badge tone="gray">F5 — coming next</Badge>
      </Card>
    </>
  );
}
