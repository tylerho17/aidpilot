"use client";

import Link from "next/link";
import type { WeeklyAidCheckIn } from "@/lib/weekly-aid-checkin";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { InsightRow } from "@/components/ui/InsightRow";
import { PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui";
import { H3, Body, Label } from "@/components/ui/Typography";
import { buttons, colors, layout, text, type BadgeTone } from "@/lib/design-tokens";

function riskTone(status: WeeklyAidCheckIn["riskStatus"]): BadgeTone {
  switch (status) {
    case "Protected":
      return "green";
    case "Needs attention":
      return "amber";
    case "At risk":
      return "coral";
  }
}

type WeeklyAidCheckInSectionProps = {
  checkIn: WeeklyAidCheckIn;
};

export default function WeeklyAidCheckInSection({ checkIn }: WeeklyAidCheckInSectionProps) {
  if (checkIn.isEmpty) {
    return (
      <SectionCard style={{ marginBottom: layout.sectionGap }}>
        <H3 style={{ marginBottom: layout.stackGapSm }}>This Week in Your Aid</H3>
        <Body style={{ marginBottom: layout.stackGap }}>{checkIn.recommendedNextAction}</Body>
        <div style={{ display: "flex", flexWrap: "wrap", gap: buttons.gap }}>
          <PrimaryButtonLink href="/aid-letter">Add aid offer</PrimaryButtonLink>
          <SecondaryButtonLink href="/fafsa">Start FAFSA plan</SecondaryButtonLink>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard style={{ marginBottom: layout.sectionGap }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: layout.stackGapSm,
          marginBottom: layout.stackGap,
        }}
      >
        <H3>This Week in Your Aid</H3>
        <StatusBadge tone={riskTone(checkIn.riskStatus)}>{checkIn.riskStatus}</StatusBadge>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: layout.stackGapSm,
          marginBottom: layout.stackGap,
        }}
      >
        <MetricCard label="Urgent tasks" value={String(checkIn.urgentTaskCount)} />
        <MetricCard label="Upcoming deadlines" value={String(checkIn.upcomingDeadlineCount)} />
        <MetricCard label="Missing documents" value={String(checkIn.missingDocumentCount)} />
        <MetricCard label="Offers to review" value={String(checkIn.aidOffersNeedingReviewCount)} />
      </div>

      <div style={{ marginBottom: checkIn.recommendedThisWeek.length > 0 ? layout.stackGap : 0 }}>
        <Label style={{ display: "block", marginBottom: 8 }}>Recommended next action</Label>
        {checkIn.recommendedNextActionHref ? (
          <Link
            href={checkIn.recommendedNextActionHref}
            style={{ ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}
          >
            {checkIn.recommendedNextAction}
          </Link>
        ) : (
          <p style={text.bodyStrong}>{checkIn.recommendedNextAction}</p>
        )}
      </div>

      {checkIn.recommendedThisWeek.length > 0 ? (
        <div>
          <Label style={{ display: "block", marginBottom: layout.stackGapSm }}>Recommended this week</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapXs }}>
            {checkIn.recommendedThisWeek.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{ ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}
                >
                  <InsightRow>{item.label}</InsightRow>
                </Link>
              ) : (
                <InsightRow key={item.id}>{item.label}</InsightRow>
              )
            )}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
