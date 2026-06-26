"use client";

import { PillBadge } from "@/components/ProductUI";
import { formatScholarshipDeadline, isDeadlineUrgent } from "@/lib/data-helpers";
import type { ScholarshipMatch } from "@/lib/types";

const BookmarkSVG = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export function ScholarshipMatchCard({
  match,
  applyUrl,
  featured = false,
  onSave,
  onApply,
  onIgnore,
}: {
  match: ScholarshipMatch;
  applyUrl: string | null;
  featured?: boolean;
  onSave?: (id: string) => Promise<void>;
  onApply?: (id: string) => Promise<void>;
  onIgnore?: (id: string) => Promise<void>;
}) {
  const matchPercent = match.match_percent ?? 0;
  const amountLabel = match.amount ? `$${match.amount.toLocaleString()}` : "Amount TBD";
  const strong = matchPercent >= 88;
  const amountColor = strong ? "#15885A" : "#0B5CAD";
  const deadlineLabel = formatScholarshipDeadline(match.deadline);
  const urgent = isDeadlineUrgent(match.deadline);
  const deadlineColor = urgent ? "#B7791F" : "#15885A";
  const effort = match.effort_level ?? "medium";

  return (
    <div
      className="card-lift animate-slide-in"
      style={{
        background: "#fff",
        border: "1px solid #E6EDF6",
        borderRadius: featured ? 24 : 18,
        padding: featured ? 30 : 20,
        boxShadow: featured ? "0 26px 50px -26px rgba(11,92,173,.26)" : undefined,
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <PillBadge tone={strong ? "green" : "blue"}>{matchPercent}% match</PillBadge>
        {match.status === "new" && !match.applied && !match.ignored && <PillBadge tone="blue">New</PillBadge>}
        {match.is_saved && <PillBadge tone="amber">Saved</PillBadge>}
        {match.applied && <PillBadge tone="green">Applied</PillBadge>}
        {match.ignored && <PillBadge tone="gray">Ignored</PillBadge>}
        <PillBadge tone={effort === "low" ? "green" : effort === "high" ? "coral" : "amber"}>{effort} effort</PillBadge>
      </div>

      <h3 className="font-display" style={{ fontSize: featured ? 26 : 17, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
        {match.name}
      </h3>
      <div className="font-display" style={{ fontSize: featured ? 38 : 24, fontWeight: 900, color: amountColor, marginBottom: 10 }}>
        {amountLabel}
      </div>

      <p style={{ fontSize: featured ? 15.5 : 13, color: "#6B7280", lineHeight: 1.6, margin: "0 0 8px" }}>
        <strong style={{ color: "#15212E" }}>Why it fits:</strong> {match.why_it_fits ?? "Based on your profile."}
      </p>
      {match.essay_angle && (
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.55, margin: "0 0 8px" }}>
          <strong style={{ color: "#15212E" }}>Essay angle:</strong> {match.essay_angle}
        </p>
      )}
      <p style={{ fontSize: 13, fontWeight: 700, color: deadlineColor, margin: "10px 0 14px" }}>{deadlineLabel}</p>

      {applyUrl && (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", fontSize: 13, fontWeight: 700, color: "#0B5CAD", marginBottom: 14, textDecoration: "underline" }}
        >
          Apply on provider site
        </a>
      )}

      {(onSave || onApply || onIgnore) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {onApply && !match.applied && (
            <button
              type="button"
              onClick={() => onApply(match.id)}
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "10px 16px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Apply
            </button>
          )}
          {onSave && !match.is_saved && (
            <button
              type="button"
              onClick={() => onSave(match.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "10px 14px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit" }}
            >
              <BookmarkSVG />
              Save
            </button>
          )}
          {onIgnore && !match.ignored && (
            <button
              type="button"
              onClick={() => onIgnore(match.id)}
              style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", background: "#F9FAFB", border: "1.5px solid #E5E7EB", padding: "10px 14px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit" }}
            >
              Ignore
            </button>
          )}
        </div>
      )}
    </div>
  );
}
