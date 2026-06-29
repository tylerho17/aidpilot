import { getScholarshipUrgency } from "@/lib/scholarships/getScholarshipUrgency";
import type { UserScholarshipStatus } from "@/lib/types";

const URGENCY_TONES = {
  urgent: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  high: { bg: "#FFF7ED", color: "#B7791F", border: "#FDE68A" },
  medium: { bg: "#EAF3FF", color: "#0B5CAD", border: "#D7E7FB" },
  low: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
} as const;

export default function ScholarshipDeadlineBadge({
  deadline,
  status,
}: {
  deadline: string | null;
  status?: UserScholarshipStatus;
}) {
  const urgency = getScholarshipUrgency(deadline, status);
  const tone = URGENCY_TONES[urgency.level];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 999,
        background: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
      }}
    >
      {urgency.label}
    </span>
  );
}
