import type { ProtectCategoryStatus, ProtectOverallStatus } from "@/lib/protect/getProtectStatus";

type BadgeStatus = ProtectCategoryStatus | ProtectOverallStatus;

const BADGE_STYLES: Record<BadgeStatus, { bg: string; color: string; border: string; label: string }> = {
  protected: { bg: "#ECFDF5", color: "#047857", border: "#BBF7D0", label: "Protected" },
  in_progress: { bg: "#EAF3FF", color: "#0B5CAD", border: "#D7E7FB", label: "In progress" },
  needs_attention: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA", label: "Needs attention" },
  needs_setup: { bg: "#FFF7ED", color: "#B7791F", border: "#FDE68A", label: "Needs setup" },
  waiting: { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB", label: "Waiting" },
};

export default function ProtectRiskBadge({ status }: { status: BadgeStatus }) {
  const tone = BADGE_STYLES[status];
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
      {tone.label}
    </span>
  );
}
