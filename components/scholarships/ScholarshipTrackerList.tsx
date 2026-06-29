"use client";

import ScholarshipCard from "@/components/scholarships/ScholarshipCard";
import type { ScholarshipTrackerItem } from "@/lib/scholarships/tracker-helpers";

type ScholarshipTrackerListProps = {
  items: ScholarshipTrackerItem[];
  savingId?: string | null;
  onSaveToTracker?: (scholarshipId: string) => void;
  onMarkApplying?: (matchId: string) => void;
  onMarkSubmitted?: (matchId: string) => void;
  onEdit?: (matchId: string) => void;
  onRemove?: (matchId: string) => void;
};

export default function ScholarshipTrackerList({
  items,
  savingId,
  onSaveToTracker,
  onMarkApplying,
  onMarkSubmitted,
  onEdit,
  onRemove,
}: ScholarshipTrackerListProps) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {items.map((item) => {
        const key = item.matchId ?? item.scholarshipId ?? item.name;
        const isSaving = savingId === item.matchId || savingId === item.scholarshipId;

        return (
          <ScholarshipCard
            key={key}
            item={item}
            saving={isSaving}
            onSaveToTracker={
              item.scholarshipId && onSaveToTracker ? () => onSaveToTracker(item.scholarshipId!) : undefined
            }
            onMarkApplying={item.matchId && onMarkApplying ? () => onMarkApplying(item.matchId!) : undefined}
            onMarkSubmitted={item.matchId && onMarkSubmitted ? () => onMarkSubmitted(item.matchId!) : undefined}
            onEdit={item.matchId && onEdit ? () => onEdit(item.matchId!) : undefined}
            onRemove={item.matchId && onRemove ? () => onRemove(item.matchId!) : undefined}
          />
        );
      })}
    </div>
  );
}
