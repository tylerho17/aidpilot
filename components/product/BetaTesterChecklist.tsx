"use client";

import Link from "next/link";
import { fontFamily } from "@/lib/design-tokens";
import { SAMPLE_AID_REPORT_HREF } from "@/lib/aid-letter/sampleAidOffer";

const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

const ITEMS = [
  { id: "add-offer", label: "Add one aid offer", href: "/aid-letter" },
  { id: "read-report", label: "Read your Aid Health Report", href: SAMPLE_AID_REPORT_HREF },
  { id: "copy-question", label: "Copy one question for your aid office", href: `${SAMPLE_AID_REPORT_HREF}#aid-office` },
  { id: "gap-plan", label: "Check your Scholarship Gap Plan", href: `${SAMPLE_AID_REPORT_HREF}#gap-plan` },
  { id: "feedback", label: "Leave feedback", href: "#feedback" },
] as const;

export default function BetaTesterChecklist() {
  return (
    <section
      style={{
        marginBottom: 20,
        padding: 18,
        border: `1px solid ${border}`,
        borderRadius: 8,
        background: "#fff",
        fontFamily: fontFamily,
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: navy }}>Try AidPilot in 3 minutes</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              style={{
                display: "block",
                padding: "10px 12px",
                border: `1px solid ${border}`,
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "#0B5CAD",
                textDecoration: "none",
                lineHeight: 1.5,
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <p style={{ margin: "12px 0 0", fontSize: 13, color: muted, lineHeight: 1.55 }}>
        Use the sample report if you do not have your own aid offer yet.
      </p>
    </section>
  );
}
