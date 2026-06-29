import Link from "next/link";
import { PillBadge } from "@/components/ProductUI";
import type { AidAction, AidActionPriority, AidActionSource } from "@/lib/aid-actions/types";

const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 18px",
  borderRadius: 12,
  textDecoration: "none",
} as const;

function priorityTone(priority: AidActionPriority): "green" | "amber" | "coral" | "blue" | "gray" {
  if (priority === "urgent") return "coral";
  if (priority === "high") return "amber";
  if (priority === "medium") return "blue";
  return "gray";
}

function sourceLabel(source: AidActionSource): string {
  switch (source) {
    case "fafsa_step":
      return "FAFSA guide";
    case "school_follow_up":
      return "School follow-up";
    case "verification":
      return "Verification";
    case "aid_offer":
      return "Aid offer";
    case "deadline":
      return "Deadline";
    case "document":
      return "Document";
    default:
      return "Aid action";
  }
}

type AidActionCardProps = {
  action: AidAction;
  compact?: boolean;
};

export default function AidActionCard({ action, compact }: AidActionCardProps) {
  return (
    <article
      style={{
        padding: compact ? "14px 16px" : "18px 20px",
        borderRadius: 14,
        border: "1px solid #EAEEF3",
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
        <PillBadge tone={priorityTone(action.priority)}>{action.priority}</PillBadge>
        <PillBadge tone="gray">{sourceLabel(action.source)}</PillBadge>
      </div>
      <h3
        className="font-display"
        style={{
          fontSize: compact ? 16 : 17,
          fontWeight: 800,
          margin: "0 0 8px",
          color: "#15212E",
          lineHeight: 1.35,
        }}
      >
        {action.title}
      </h3>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
        {action.description}
      </p>
      <Link href={action.href} style={ctaStyle}>
        {action.ctaLabel}
      </Link>
    </article>
  );
}
