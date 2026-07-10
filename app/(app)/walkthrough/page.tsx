"use client";

import { useTranslations } from "next-intl";
import { Card, SectionHeading, Badge } from "@/components/ui";

// F1 placeholder — the walkthrough shell is built in F4.
export default function WalkthroughPage() {
  const t = useTranslations("walkthrough");
  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <Card variant="clay" padding="clamp(20px, 5vw, 32px)">
        <Badge tone="gray">F4 — coming next</Badge>
      </Card>
    </>
  );
}
