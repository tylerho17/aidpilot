import type { UserScholarshipStatus } from "@/lib/types";
import { SCHOLARSHIP_STATUS_LABELS } from "@/lib/scholarships/getScholarshipUrgency";

const STATUS_TONES: Record<UserScholarshipStatus, { bg: string; color: string; border: string }> = {
  saved: { bg: "#EAF3FF", color: "#0B5CAD", border: "#D7E7FB" },
  researching: { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
  applying: { bg: "#FFF7ED", color: "#B7791F", border: "#FDE68A" },
  submitted: { bg: "#ECFDF5", color: "#15885A", border: "#BBF7D0" },
  won: { bg: "#ECFDF5", color: "#047857", border: "#6EE7B7" },
  rejected: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  skipped: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" },
};

export default function ScholarshipStatusBadge({ status }: { status: UserScholarshipStatus }) {
  const tone = STATUS_TONES[status] ?? STATUS_TONES.saved;
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
      {SCHOLARSHIP_STATUS_LABELS[status]}
    </span>
  );
}
