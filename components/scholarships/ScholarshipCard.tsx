"use client";

import ScholarshipDeadlineBadge from "@/components/scholarships/ScholarshipDeadlineBadge";
import ScholarshipStatusBadge from "@/components/scholarships/ScholarshipStatusBadge";
import { SCHOLARSHIP_PRIORITY_LABELS } from "@/lib/scholarships/getScholarshipUrgency";
import type { ScholarshipTrackerItem } from "@/lib/scholarships/tracker-helpers";
import { ProductCard } from "@/components/ProductUI";

const actionBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  textDecoration: "none",
} as const;

type ScholarshipCardProps = {
  item: ScholarshipTrackerItem;
  saving?: boolean;
  onSaveToTracker?: () => void;
  onMarkApplying?: () => void;
  onMarkSubmitted?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onPriorityChange?: (priority: string) => void;
};

export default function ScholarshipCard({
  item,
  saving,
  onSaveToTracker,
  onMarkApplying,
  onMarkSubmitted,
  onEdit,
  onRemove,
}: ScholarshipCardProps) {
  return (
    <ProductCard style={{ padding: 20, height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 900, margin: "0 0 4px", color: "#15212E", lineHeight: 1.3 }}>
            {item.name}
          </h3>
          {item.provider ? (
            <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0 }}>{item.provider}</p>
          ) : null}
        </div>
        {item.isSample ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#6B7280",
              background: "#F3F4F6",
              padding: "4px 8px",
              borderRadius: 999,
            }}
          >
            Sample
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#0B5CAD" }}>{item.amountLabel}</span>
        <ScholarshipDeadlineBadge deadline={item.deadline} status={item.status} />
        {item.status ? <ScholarshipStatusBadge status={item.status} /> : null}
        {item.priority ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#5B6573" }}>
            Priority: {SCHOLARSHIP_PRIORITY_LABELS[item.priority]}
          </span>
        ) : null}
      </div>

      {item.matchReason ? (
        <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", margin: 0, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "#5B6573" }}>Why it might fit: </span>
          {item.matchReason}
        </p>
      ) : null}

      {item.notes ? (
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#6B7280",
            margin: 0,
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.notes}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
        {item.applicationUrl ? (
          <a
            href={item.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...actionBtn, background: "#EAF3FF", color: "#0B5CAD" }}
          >
            Application link
          </a>
        ) : null}

        {!item.isTracked && onSaveToTracker ? (
          <button
            type="button"
            disabled={saving}
            onClick={onSaveToTracker}
            style={{ ...actionBtn, background: "#0B5CAD", color: "#fff", opacity: saving ? 0.7 : 1 }}
          >
            Save to tracker
          </button>
        ) : null}

        {item.isTracked && item.status !== "applying" && item.status !== "submitted" && onMarkApplying ? (
          <button
            type="button"
            disabled={saving}
            onClick={onMarkApplying}
            style={{ ...actionBtn, background: "#FFF7ED", color: "#B7791F", opacity: saving ? 0.7 : 1 }}
          >
            Mark applying
          </button>
        ) : null}

        {item.isTracked && item.status !== "submitted" && onMarkSubmitted ? (
          <button
            type="button"
            disabled={saving}
            onClick={onMarkSubmitted}
            style={{ ...actionBtn, background: "#ECFDF5", color: "#15885A", opacity: saving ? 0.7 : 1 }}
          >
            Mark submitted
          </button>
        ) : null}

        {item.isTracked && onEdit ? (
          <button
            type="button"
            disabled={saving}
            onClick={onEdit}
            style={{ ...actionBtn, background: "#F3F4F6", color: "#374151", opacity: saving ? 0.7 : 1 }}
          >
            Edit
          </button>
        ) : null}

        {item.isTracked && onRemove ? (
          <button
            type="button"
            disabled={saving}
            onClick={onRemove}
            style={{ ...actionBtn, background: "#FEF2F2", color: "#B91C1C", opacity: saving ? 0.7 : 1 }}
          >
            Remove
          </button>
        ) : null}
      </div>
    </ProductCard>
  );
}
