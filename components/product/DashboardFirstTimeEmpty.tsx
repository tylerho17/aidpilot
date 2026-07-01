"use client";

import { SAMPLE_AID_REPORT_HREF } from "@/lib/aid-letter/sampleAidOffer";
import { dashboardHintForAidStage, type AidStage } from "@/lib/onboarding-aid-stage";
import { SectionCard } from "@/components/ui/SectionCard";
import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui";
import { H2, BodyMuted } from "@/components/ui/Typography";
import { buttons, layout } from "@/lib/design-tokens";

type DashboardFirstTimeEmptyProps = {
  aidStage?: AidStage | null;
};

export default function DashboardFirstTimeEmpty({ aidStage }: DashboardFirstTimeEmptyProps) {
  return (
    <SectionCard style={{ marginBottom: layout.sectionGap }}>
      <H2 style={{ marginBottom: layout.stackGapSm }}>Start with your first aid offer.</H2>
      <BodyMuted style={{ marginBottom: layout.stackGap }}>{dashboardHintForAidStage(aidStage)}</BodyMuted>
      <div style={{ display: "flex", flexWrap: "wrap", gap: buttons.gap }}>
        <PrimaryButtonLink href="/aid-letter">Add aid offer</PrimaryButtonLink>
        <SecondaryButtonLink href={SAMPLE_AID_REPORT_HREF}>View sample report</SecondaryButtonLink>
      </div>
    </SectionCard>
  );
}
