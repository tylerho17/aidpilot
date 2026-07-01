"use client";

import Link from "next/link";
import { fontFamily } from "@/lib/design-tokens";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import AidActionPlanSection from "@/components/aid-letter/AidActionPlanSection";
import AidHealthReportLayout from "@/components/aid-letter/AidHealthReportLayout";
import TrustDisclaimer from "@/components/product/TrustDisclaimer";
import { buildAidOfficeDraft } from "@/lib/aid-letter/buildAidOfficeDraft";
import { buildAidHealthReport } from "@/lib/aid-letter/buildAidHealthReport";
import { buildScholarshipGapPlan } from "@/lib/aid-letter/buildScholarshipGapPlan";
import { SAMPLE_OFFER } from "@/lib/aid-letter/sampleAidOffer";
import type { AidTask } from "@/lib/types";

const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

function sampleTasks(offerId: string): AidTask[] {
  const now = new Date().toISOString();
  return [
    {
      id: "sample-task-1",
      user_id: "sample",
      title: "Ask the aid office about your remaining gap",
      description: "Sample action step",
      status: "Due Soon",
      priority: "High",
      category: "Aid offer",
      task_source: "aid_offer",
      plan_key: `aid_offer:${offerId}:remaining_gap`,
      created_at: now,
      updated_at: now,
      due_date: null,
      action_url: null,
    },
    {
      id: "sample-task-2",
      user_id: "sample",
      title: "Review your loan amount before accepting",
      description: "Sample action step",
      status: "Needs Review",
      priority: "High",
      category: "Aid offer",
      task_source: "aid_offer",
      plan_key: `aid_offer:${offerId}:review_loans`,
      created_at: now,
      updated_at: now,
      due_date: null,
      action_url: null,
    },
  ];
}

export default function SampleAidHealthReportClient() {
  const offer = SAMPLE_OFFER;

  const report = useMemo(() => buildAidHealthReport(offer), [offer]);
  const officeDraft = useMemo(() => buildAidOfficeDraft(offer, report.calculation), [offer, report]);
  const scholarshipGapPlan = useMemo(() => buildScholarshipGapPlan(offer, report.calculation, null, null), [offer, report]);
  const actionPlanTasks = useMemo(() => sampleTasks(offer.id), [offer.id]);

  return (
    <AppShell>
      <AidHealthReportLayout
        offer={offer}
        report={report}
        officeDraft={officeDraft}
        scholarshipGapPlan={scholarshipGapPlan}
        banner={
          <div
            style={{
              padding: "12px 14px",
              marginBottom: 16,
              border: "1px solid #BFDBFE",
              borderRadius: 8,
              background: "#F7FAFD",
              fontSize: 13,
              color: muted,
              lineHeight: 1.55,
              fontFamily: fontFamily,
            }}
          >
            <strong style={{ color: navy }}>Sample report.</strong> This uses illustrative UCI numbers so you can
            preview AidPilot before entering your own aid offer. Nothing here is saved to your account.
          </div>
        }
        belowGrid={
          <>
            <AidActionPlanSection tasks={actionPlanTasks} />
            <TrustDisclaimer />
          </>
        }
        footer={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
            <Link
              href="/aid-letter"
              style={{
                display: "inline-flex",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                background: "#0B5CAD",
                padding: "10px 16px",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: fontFamily,
              }}
            >
              Add your own aid offer
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                fontSize: 14,
                fontWeight: 700,
                color: "#0B5CAD",
                background: "#fff",
                padding: "10px 16px",
                borderRadius: 8,
                border: `1px solid ${border}`,
                textDecoration: "none",
                fontFamily: fontFamily,
              }}
            >
              Back to dashboard
            </Link>
          </div>
        }
      />
    </AppShell>
  );
}
