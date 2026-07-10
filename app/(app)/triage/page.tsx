"use client";

import { useTranslations } from "next-intl";
import { Card, SectionHeading, Badge } from "@/components/ui";

// F1 placeholder — the triage wizard is built in F3.
export default function TriagePage() {
  const t = useTranslations("triage");
  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Card variant="clay" padding="clamp(20px, 5vw, 32px)">
        <Badge tone="gray">F3 — coming next</Badge>
      </Card>
    </>
  );
}
