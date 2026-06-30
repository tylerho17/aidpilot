"use client";

import Link from "next/link";
import type { WeeklyAidCheckIn } from "@/lib/weekly-aid-checkin";

const pageFont = 'Arial, Helvetica, "Segoe UI", sans-serif';
const navy = "#0F2744";
const muted = "#5B6B7F";
const border = "#E3EBF3";

function riskColors(status: WeeklyAidCheckIn["riskStatus"]) {
  switch (status) {
    case "Protected":
      return { bg: "#ECFDF5", fg: "#15885A", border: "#BBF7D0" };
    case "Needs attention":
      return { bg: "#FFFBEB", fg: "#B7791F", border: "#FDE68A" };
    case "At risk":
      return { bg: "#FEF2F2", fg: "#C04E57", border: "#FECACA" };
  }
}

type WeeklyAidCheckInSectionProps = {
  checkIn: WeeklyAidCheckIn;
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: "10px 12px", border: `1px solid ${border}`, borderRadius: 6, background: "#fff" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 4, fontFamily: pageFont }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: navy, fontFamily: pageFont }}>{value}</div>
    </div>
  );
}

export default function WeeklyAidCheckInSection({ checkIn }: WeeklyAidCheckInSectionProps) {
  const risk = riskColors(checkIn.riskStatus);

  if (checkIn.isEmpty) {
    return (
      <section
        style={{
          marginBottom: 20,
          padding: 20,
          border: `1px solid ${border}`,
          borderRadius: 8,
          background: "#fff",
          fontFamily: pageFont,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: navy }}>This Week in Your Aid</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: muted, marginBottom: 14 }}>
          {checkIn.recommendedNextAction}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link
            href="/aid-letter"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: "#0B5CAD",
              padding: "8px 14px",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Add aid offer
          </Link>
          <Link
            href="/fafsa"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0B5CAD",
              background: "#fff",
              padding: "8px 14px",
              borderRadius: 6,
              border: `1px solid ${border}`,
              textDecoration: "none",
            }}
          >
            Start FAFSA plan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        marginBottom: 20,
        padding: 20,
        border: `1px solid ${border}`,
        borderRadius: 8,
        background: "#fff",
        fontFamily: pageFont,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: navy }}>This Week in Your Aid</h2>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "5px 10px",
            borderRadius: 4,
            background: risk.bg,
            color: risk.fg,
            border: `1px solid ${risk.border}`,
          }}
        >
          {checkIn.riskStatus}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <Stat label="Urgent tasks" value={checkIn.urgentTaskCount} />
        <Stat label="Upcoming deadlines" value={checkIn.upcomingDeadlineCount} />
        <Stat label="Missing documents" value={checkIn.missingDocumentCount} />
        <Stat label="Offers to review" value={checkIn.aidOffersNeedingReviewCount} />
      </div>

      <div style={{ padding: "12px 14px", border: `1px solid ${border}`, borderRadius: 6, background: "#F7FAFD", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: muted, marginBottom: 6 }}>Recommended next action</div>
        {checkIn.recommendedNextActionHref ? (
          <Link
            href={checkIn.recommendedNextActionHref}
            style={{ fontSize: 14, fontWeight: 600, color: "#0B5CAD", textDecoration: "none", lineHeight: 1.55 }}
          >
            {checkIn.recommendedNextAction}
          </Link>
        ) : (
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: navy, lineHeight: 1.55 }}>{checkIn.recommendedNextAction}</p>
        )}
      </div>

      {checkIn.recommendedThisWeek.length > 0 ? (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: navy }}>Recommended this week</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checkIn.recommendedThisWeek.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0B5CAD",
                    textDecoration: "none",
                    lineHeight: 1.5,
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.id}
                  style={{
                    padding: "10px 12px",
                    border: `1px solid ${border}`,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: navy,
                    lineHeight: 1.5,
                  }}
                >
                  {item.label}
                </div>
              )
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
