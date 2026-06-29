"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { PageErrorBanner, PageLoading, friendlyActionError } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import { getProfileSchoolName } from "@/lib/profile-fields";
import type { AidLetter, StudentProfile } from "@/lib/types";

function getSuggestedNextStep({
  gap,
  loans,
  freeMoney,
  coa,
}: {
  gap: number;
  loans: number;
  freeMoney: number;
  coa: number;
}) {
  if (coa <= 0) {
    return "Enter your cost of attendance and aid amounts to see personalized next steps.";
  }
  if (gap > 0 && freeMoney < coa * 0.3) {
    return "Free money covers less than 30% of cost. Consider appealing your aid package and applying to scholarships on AidPilot.";
  }
  if (gap > 0) {
    return `Estimated gap of $${gap.toLocaleString()}. Compare outside scholarships and discuss payment options with your financial aid office.`;
  }
  if (loans > freeMoney) {
    return "Loans make up a large share of your package. Review borrowing limits and repayment estimates with your aid office.";
  }
  return "Your listed aid appears to cover costs. Confirm all numbers with your financial aid office before accepting.";
}

function MoneyRow({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>{label}</span>
      <span className="font-display" style={{ fontSize: 22, fontWeight: 900, color }}>${amount.toLocaleString()}</span>
    </div>
  );
}

function parseAmount(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatFafsaInput(value: number) {
  return value > 0 ? String(value) : "";
}

function buildFormFromData(aidLetter: AidLetter | null, profile: StudentProfile | null) {
  try {
    return {
      school_name: aidLetter?.school_name ?? getProfileSchoolName(profile),
      aid_year: aidLetter?.aid_year ?? "2026-2027",
      cost_of_attendance: formatFafsaInput(aidLetter?.cost_of_attendance ?? 0),
      grants_amount: formatFafsaInput(aidLetter?.grants_amount ?? 0),
      scholarships_amount: formatFafsaInput(aidLetter?.scholarships_amount ?? 0),
      loans_amount: formatFafsaInput(aidLetter?.loans_amount ?? 0),
      work_study_amount: formatFafsaInput(aidLetter?.work_study_amount ?? 0),
    };
  } catch (error) {
    console.error("AidLetter: could not build form", error);
    return {
      school_name: "",
      aid_year: "2026-2027",
      cost_of_attendance: "",
      grants_amount: "",
      scholarships_amount: "",
      loans_amount: "",
      work_study_amount: "",
    };
  }
}

function AidLetterSummary({
  schoolName,
  aidYear,
  status,
  coa,
  grants,
  scholarships,
  loans,
  workStudy,
  freeMoney,
  gap,
  estimatedNet,
  notes,
  suggestedNextStep,
}: {
  schoolName: string;
  aidYear: string;
  status: string;
  coa: number;
  grants: number;
  scholarships: number;
  loans: number;
  workStudy: number;
  freeMoney: number;
  gap: number;
  estimatedNet: number;
  notes?: string | null;
  suggestedNextStep: string;
}) {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22, alignItems: "center" }}>
        <StatCard label="School" value={schoolName} color="#0B5CAD" style={{ flex: "1 1 180px" }} />
        <StatCard label="Aid year" value={aidYear} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <PillBadge tone="green">{status}</PillBadge>
      </div>

      <ProductCard style={{ padding: 26, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
          Aid decoder
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
          <DecoderCard label="Free money" sub="Grants + scholarships" amount={freeMoney} color="#15885A" />
          <DecoderCard label="Borrowed money" sub="Loans you repay" amount={loans} color="#B7791F" />
          <DecoderCard label="Work-based aid" sub="Work-study earnings" amount={workStudy} color="#0B5CAD" />
          <DecoderCard label="Estimated gap" sub="COA minus aid listed above" amount={gap} color="#C04E57" />
        </div>

        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 14px", color: "#15212E" }}>Line items</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <MoneyRow label="Cost of attendance" amount={coa} color="#15212E" />
          <MoneyRow label="Grants" amount={grants} color="#15885A" />
          <MoneyRow label="Scholarships" amount={scholarships} color="#15885A" />
          <MoneyRow label="Work-study" amount={workStudy} color="#0B5CAD" />
          <MoneyRow label="Loans" amount={loans} color="#B7791F" />
        </div>

        <div style={{ padding: "18px 20px", borderRadius: 14, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Estimated net cost</div>
          <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: "#15212E" }}>
            ${estimatedNet.toLocaleString()}
          </div>
        </div>
        {notes && <p style={{ fontSize: 14, color: "#6B7280", margin: "18px 0 0", lineHeight: 1.6 }}>{notes}</p>}

        <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 14, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#15885A", marginBottom: 6 }}>Suggested next step</div>
          <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{suggestedNextStep}</p>
        </div>

        <p style={{ fontSize: 13, color: "#9AA4B2", margin: "16px 0 0", lineHeight: 1.6 }}>
          Confirm final numbers, eligibility, and deadlines with your school financial aid office. AidPilot does not submit aid decisions for you.
        </p>
      </ProductCard>
    </>
  );
}

function DecoderCard({ label, sub, amount, color }: { label: string; sub: string; amount: number; color: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#9AA4B2", marginBottom: 8 }}>{sub}</div>
      <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color }}>${amount.toLocaleString()}</div>
    </div>
  );
}

function AidLetterForm({
  aidLetter,
  profile,
  saveAidLetter,
}: {
  aidLetter: AidLetter | null;
  profile: StudentProfile | null;
  saveAidLetter: (input: {
    school_name: string;
    aid_year: string;
    cost_of_attendance: number;
    grants_amount: number;
    scholarships_amount: number;
    loans_amount: number;
    work_study_amount: number;
    estimated_net_cost: number;
  }) => Promise<AidLetter>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => buildFormFromData(aidLetter, profile));

  const coa = parseAmount(form.cost_of_attendance);
  const grants = parseAmount(form.grants_amount);
  const scholarships = parseAmount(form.scholarships_amount);
  const loans = parseAmount(form.loans_amount);
  const workStudy = parseAmount(form.work_study_amount);
  const freeMoney = grants + scholarships;
  const estimatedGap = Math.max(0, coa - grants - scholarships - loans - workStudy);

  const inputStyle = {
    width: "100%",
    borderRadius: 12,
    border: "1.5px solid #E5E7EB",
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.school_name.trim()) {
      setError("Please enter your school name.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveAidLetter({
        school_name: form.school_name.trim(),
        aid_year: form.aid_year.trim() || "2026-2027",
        cost_of_attendance: coa,
        grants_amount: grants,
        scholarships_amount: scholarships,
        loans_amount: loans,
        work_study_amount: workStudy,
        estimated_net_cost: estimatedGap,
      });
    } catch (err) {
      setError(friendlyActionError(err, "Could not save your aid letter. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <ProductCard style={{ padding: 26, marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
            Enter your aid offer
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>School name</span>
              <input required style={inputStyle} value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} placeholder="e.g. UC Irvine" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Aid year</span>
              <input required style={inputStyle} value={form.aid_year} onChange={(e) => setForm({ ...form, aid_year: e.target.value })} placeholder="2026-2027" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Cost of attendance ($)</span>
              <input required type="number" min={0} style={inputStyle} value={form.cost_of_attendance} onChange={(e) => setForm({ ...form, cost_of_attendance: e.target.value })} placeholder="33100" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Grants ($)</span>
              <input type="number" min={0} style={inputStyle} value={form.grants_amount} onChange={(e) => setForm({ ...form, grants_amount: e.target.value })} placeholder="0" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Scholarships ($)</span>
              <input type="number" min={0} style={inputStyle} value={form.scholarships_amount} onChange={(e) => setForm({ ...form, scholarships_amount: e.target.value })} placeholder="0" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Loans ($)</span>
              <input type="number" min={0} style={inputStyle} value={form.loans_amount} onChange={(e) => setForm({ ...form, loans_amount: e.target.value })} placeholder="0" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Work-study ($)</span>
              <input type="number" min={0} style={inputStyle} value={form.work_study_amount} onChange={(e) => setForm({ ...form, work_study_amount: e.target.value })} placeholder="0" />
            </label>
          </div>

          {error && <p style={{ color: "#C04E57", fontSize: 14, margin: "14px 0 0", lineHeight: 1.5 }}>{error}</p>}

          <button type="submit" disabled={saving} style={{ marginTop: 18, width: "100%", padding: "14px 24px", borderRadius: 13, background: saving ? "#E5E7EB" : "#0B5CAD", color: saving ? "#9AA4B2" : "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : aidLetter ? "Update aid letter" : "Save aid letter"}
          </button>
        </ProductCard>
      </form>

      {coa > 0 && (
        <AidLetterSummary
          schoolName={form.school_name || getProfileSchoolName(profile) || "Your school"}
          aidYear={form.aid_year}
          status={aidLetter?.status ?? "entered"}
          coa={coa}
          grants={grants}
          scholarships={scholarships}
          loans={loans}
          workStudy={workStudy}
          freeMoney={freeMoney}
          gap={estimatedGap}
          estimatedNet={estimatedGap}
          suggestedNextStep={getSuggestedNextStep({ gap: estimatedGap, loans, freeMoney, coa })}
        />
      )}
    </>
  );
}

export default function AidLetterClient() {
  const { loading, authReady, loadError, aidLetter, profile, saveAidLetter } = useUserData();

  if (!authReady && loading) {
    return <PageLoading message="Loading aid letter..." />;
  }

  if (loading) {
    return <PageLoading message="Loading aid letter..." />;
  }

  return (
    <AppShell>
      <PageErrorBanner message={loadError} />
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Aid Letter
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Enter your aid offer numbers manually. You can edit and save repeatedly. Aid letter scanning is coming later.
        </p>
      </div>

      <ProductCard style={{ padding: 22, marginBottom: 20, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
          AidPilot helps you organize and understand your aid offer. Confirm final numbers with your school financial aid office. We do not collect tax documents, FAFSA logins, or SSNs.
        </p>
      </ProductCard>

      <AidLetterForm
        key={`${aidLetter?.id ?? "new"}-${aidLetter?.updated_at ?? ""}`}
        aidLetter={aidLetter}
        profile={profile}
        saveAidLetter={saveAidLetter}
      />

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>
    </AppShell>
  );
}
