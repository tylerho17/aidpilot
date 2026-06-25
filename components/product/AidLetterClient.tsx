"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DemoNotice } from "@/components/DemoNotice";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { DEMO_AID_LETTER } from "@/lib/demo-data";

function MoneyRow({ label, amount, color }: { label: string; amount: number | null; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>{label}</span>
      <span className="font-display" style={{ fontSize: 22, fontWeight: 900, color }}>${(amount ?? 0).toLocaleString()}</span>
    </div>
  );
}

export default function AidLetterClient() {
  const { loading, isDemo, aidLetter } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading aid letter...</p>
      </AppShell>
    );
  }

  const letter = isDemo ? DEMO_AID_LETTER : aidLetter;

  return (
    <AppShell>
      {isDemo && <DemoNotice />}

      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Aid Letter
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Understand grants, scholarships, loans, work-study, and estimated net cost in plain language.
        </p>
      </div>

      {!letter ? (
        <ProductCard style={{ padding: 28, textAlign: "center" }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
            No aid letter yet
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
            Complete onboarding to see a placeholder aid letter breakdown.
          </p>
          <Link href="/onboarding" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none" }}>
            Complete onboarding
          </Link>
        </ProductCard>
      ) : (
        <>
          <ProductCard style={{ padding: 22, marginBottom: 20, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
              This is a placeholder decoder preview, not official financial aid advice. AidPilot does not collect tax documents, FAFSA logins, or SSNs.
            </p>
          </ProductCard>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22, alignItems: "center" }}>
            <StatCard label="School" value={letter.school_name ?? "Your school"} color="#0B5CAD" style={{ flex: "1 1 180px" }} />
            <StatCard label="Aid year" value={letter.aid_year ?? "2026-2027"} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <PillBadge tone="amber">{letter.status}</PillBadge>
            </span>
          </div>

          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
              Your aid breakdown
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <MoneyRow label="Grants" amount={letter.grants_amount} color="#15885A" />
              <MoneyRow label="Scholarships" amount={letter.scholarships_amount} color="#15885A" />
              <MoneyRow label="Work-study" amount={letter.work_study_amount} color="#0B5CAD" />
              <MoneyRow label="Loans" amount={letter.loans_amount} color="#B7791F" />
            </div>
            <div style={{ padding: "18px 20px", borderRadius: 14, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Estimated net cost</div>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: "#15212E" }}>
                ${(letter.estimated_net_cost ?? 0).toLocaleString()}
              </div>
            </div>
            {letter.notes && (
              <p style={{ fontSize: 14, color: "#6B7280", margin: "18px 0 0", lineHeight: 1.6 }}>{letter.notes}</p>
            )}
          </ProductCard>
        </>
      )}

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppShell>
  );
}
