import Link from "next/link";
import AidActionCard from "@/components/aid-actions/AidActionCard";
import { ProductCard } from "@/components/ProductUI";
import type { AidAction } from "@/lib/aid-actions/types";

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "10px 16px",
  borderRadius: 999,
  textDecoration: "none",
} as const;

export default function ProtectNextActionCard({ action }: { action: AidAction | null }) {
  return (
    <ProductCard style={{ padding: 24, marginBottom: 20 }}>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
        Most important action
      </h2>
      {action ? (
        <>
          <AidActionCard action={action} compact />
          <div style={{ marginTop: 14 }}>
            <Link href="/actions" style={secondaryBtn}>
              View all actions
            </Link>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>
          No urgent protection action right now. Keep checking your school portals and aid offers.
        </p>
      )}
    </ProductCard>
  );
}
