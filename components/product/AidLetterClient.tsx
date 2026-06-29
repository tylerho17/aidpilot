"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, StatCard } from "@/components/ProductUI";
import { AidLetterLocalBanner } from "@/components/product/AidLetterLocalBanner";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import {
  decodeAidOffer,
  formatAidAmountInput,
  LOAN_TYPE_EXPLANATIONS,
  parseAidAmount,
  type AidOfferInput,
} from "@/lib/aid-letter-decode";
import { getProfileSchoolName } from "@/lib/profile-fields";
import type { AidLetter, StudentProfile } from "@/lib/types";

type AidLetterFormState = {
  school_name: string;
  aid_year: string;
  cost_of_attendance: string;
  grants: string;
  scholarships: string;
  work_study: string;
  subsidized_loans: string;
  unsubsidized_loans: string;
  parent_plus_loans: string;
  private_loans: string;
};

function buildFormFromLetter(aidLetter: AidLetter | null, profile: StudentProfile | null): AidLetterFormState {
  const hasLoanBreakdown =
    (aidLetter?.subsidized_loans_amount ?? 0) > 0 ||
    (aidLetter?.unsubsidized_loans_amount ?? 0) > 0 ||
    (aidLetter?.parent_plus_loans_amount ?? 0) > 0 ||
    (aidLetter?.private_loans_amount ?? 0) > 0;

  const legacyLoans = aidLetter?.loans_amount ?? 0;

  return {
    school_name: aidLetter?.school_name ?? getProfileSchoolName(profile) ?? "",
    aid_year: aidLetter?.aid_year ?? "2026-27",
    cost_of_attendance: formatAidAmountInput(aidLetter?.cost_of_attendance ?? 0),
    grants: formatAidAmountInput(aidLetter?.grants_amount ?? 0),
    scholarships: formatAidAmountInput(aidLetter?.scholarships_amount ?? 0),
    work_study: formatAidAmountInput(aidLetter?.work_study_amount ?? 0),
    subsidized_loans: formatAidAmountInput(
      hasLoanBreakdown ? (aidLetter?.subsidized_loans_amount ?? 0) : legacyLoans
    ),
    unsubsidized_loans: formatAidAmountInput(aidLetter?.unsubsidized_loans_amount ?? 0),
    parent_plus_loans: formatAidAmountInput(aidLetter?.parent_plus_loans_amount ?? 0),
    private_loans: formatAidAmountInput(aidLetter?.private_loans_amount ?? 0),
  };
}

function formToOfferInput(form: AidLetterFormState): AidOfferInput {
  return {
    school_name: form.school_name.trim(),
    cost_of_attendance: parseAidAmount(form.cost_of_attendance),
    grants: parseAidAmount(form.grants),
    scholarships: parseAidAmount(form.scholarships),
    work_study: parseAidAmount(form.work_study),
    subsidized_loans: parseAidAmount(form.subsidized_loans),
    unsubsidized_loans: parseAidAmount(form.unsubsidized_loans),
    parent_plus_loans: parseAidAmount(form.parent_plus_loans),
    private_loans: parseAidAmount(form.private_loans),
  };
}

function DecoderCard({
  label,
  sub,
  amount,
  color,
}: {
  label: string;
  sub: string;
  amount: number;
  color: string;
}) {
  return (
    <div style={{ padding: 18, borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#9AA4B2", marginBottom: 10, lineHeight: 1.45 }}>{sub}</div>
      <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color }}>
        ${amount.toLocaleString()}
      </div>
    </div>
  );
}

function WarningCard({
  title,
  message,
  tone,
}: {
  title: string;
  message: string;
  tone: "amber" | "red" | "blue";
}) {
  const styles = {
    amber: { bg: "#FFFBEB", border: "#FDE68A", title: "#92400E", text: "#78350F" },
    red: { bg: "#FEF2F2", border: "#FECACA", title: "#991B1B", text: "#7F1D1D" },
    blue: { bg: "#EFF6FF", border: "#BFDBFE", title: "#1E40AF", text: "#1E3A8A" },
  }[tone];

  return (
    <ProductCard style={{ padding: 20, marginBottom: 16, background: styles.bg, border: `1px solid ${styles.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: styles.title, marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, fontWeight: 500, color: styles.text, margin: 0, lineHeight: 1.65 }}>{message}</p>
    </ProductCard>
  );
}

function LoanTypeCard({
  label,
  amount,
  hint,
  color,
}: {
  label: string;
  amount: number;
  hint: string;
  color: string;
}) {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 8 }}>
        ${amount.toLocaleString()}
      </div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "#9AA4B2", margin: 0, lineHeight: 1.5 }}>{hint}</p>
    </div>
  );
}

function MoneyRow({
  label,
  amount,
  color,
  hint,
}: {
  label: string;
  amount: number;
  color: string;
  hint?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #EAEEF3",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color }}>${amount.toLocaleString()}</span>
      </div>
      {hint && (
        <p style={{ fontSize: 12, fontWeight: 500, color: "#9AA4B2", margin: "8px 0 0", lineHeight: 1.55 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

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

const labelStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
};

const labelTextStyle = { fontSize: 13, fontWeight: 700, color: "#374151" };
const hintTextStyle = { fontSize: 12, fontWeight: 500, color: "#9AA4B2", lineHeight: 1.5 };

function LoanField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <span style={hintTextStyle}>{hint}</span>
      <input type="number" min={0} style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
    </label>
  );
}

function AidOfferDecoder({
  form,
  decoded,
}: {
  form: AidLetterFormState;
  decoded: ReturnType<typeof decodeAidOffer>;
}) {
  const coa = parseAidAmount(form.cost_of_attendance);
  const grants = parseAidAmount(form.grants);
  const scholarships = parseAidAmount(form.scholarships);
  const workStudy = parseAidAmount(form.work_study);

  if (coa <= 0) return null;

  return (
    <ProductCard style={{ padding: 26, marginBottom: 22 }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
        Your aid decoder
      </h2>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
        Free money is yours to keep. Loans must be repaid. Work-study is a job on campus — not cash upfront.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <DecoderCard label="Free money" sub="Grants + scholarships" amount={decoded.totalFreeMoney} color="#15885A" />
        <DecoderCard
          label="Borrowed money"
          sub="All loans combined — must be repaid"
          amount={decoded.totalLoans}
          color="#B7791F"
        />
        <DecoderCard label="Work-study" sub="Earn through a campus job" amount={workStudy} color="#0B5CAD" />
        <DecoderCard
          label="Estimated gap"
          sub="Still uncovered after all aid listed"
          amount={decoded.estimatedGapAfterAllAid}
          color="#C04E57"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 22 }}>
        <div style={{ padding: 18, borderRadius: 14, background: "linear-gradient(135deg,#ECFDF5,#F0FDF4)", border: "1px solid #BBF7D0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#15885A", marginBottom: 6 }}>Net cost after free money</div>
          <div className="font-display" style={{ fontSize: 30, fontWeight: 900, color: "#15212E" }}>
            ${decoded.netCostAfterFreeMoney.toLocaleString()}
          </div>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "8px 0 0", lineHeight: 1.5 }}>
            Cost of attendance minus grants and scholarships.
          </p>
        </div>
        <div style={{ padding: 18, borderRadius: 14, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", marginBottom: 6 }}>Cost of attendance</div>
          <div className="font-display" style={{ fontSize: 30, fontWeight: 900, color: "#15212E" }}>
            ${coa.toLocaleString()}
          </div>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "8px 0 0", lineHeight: 1.5 }}>
            Sticker price before aid — confirm with your school.
          </p>
        </div>
      </div>

      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: "#15212E" }}>
        Line items
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        <MoneyRow label="Cost of attendance" amount={coa} color="#15212E" />
        <MoneyRow label="Grants" amount={grants} color="#15885A" />
        <MoneyRow label="Scholarships" amount={scholarships} color="#15885A" />
        <MoneyRow label="Work-study" amount={workStudy} color="#0B5CAD" />
        <MoneyRow
          label="Subsidized loans"
          amount={decoded.loanBreakdown.subsidized}
          color="#B7791F"
          hint={LOAN_TYPE_EXPLANATIONS.subsidized}
        />
        <MoneyRow
          label="Unsubsidized loans"
          amount={decoded.loanBreakdown.unsubsidized}
          color="#B7791F"
          hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
        />
        <MoneyRow
          label="Parent PLUS loans"
          amount={decoded.loanBreakdown.parentPlus}
          color="#C04E57"
          hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
        />
        <MoneyRow
          label="Private loans"
          amount={decoded.loanBreakdown.private}
          color="#C04E57"
          hint={LOAN_TYPE_EXPLANATIONS.private}
        />
        <MoneyRow label="Total borrowed" amount={decoded.totalLoans} color="#B7791F" />
      </div>

      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: "#15212E" }}>
        Loan breakdown
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <LoanTypeCard
          label="Subsidized"
          amount={decoded.loanBreakdown.subsidized}
          hint={LOAN_TYPE_EXPLANATIONS.subsidized}
          color="#B7791F"
        />
        <LoanTypeCard
          label="Unsubsidized"
          amount={decoded.loanBreakdown.unsubsidized}
          hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
          color="#B7791F"
        />
        <LoanTypeCard
          label="Parent PLUS"
          amount={decoded.loanBreakdown.parentPlus}
          hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
          color="#C04E57"
        />
        <LoanTypeCard
          label="Private"
          amount={decoded.loanBreakdown.private}
          hint={LOAN_TYPE_EXPLANATIONS.private}
          color="#C04E57"
        />
      </div>

      {decoded.warnings.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {decoded.warnings.map((warning) => (
            <WarningCard key={warning.id} title={warning.title} message={warning.message} tone={warning.tone} />
          ))}
        </div>
      )}
    </ProductCard>
  );
}

function AidLetterForm({
  aidLetter,
  profile,
  aidLetterLocalMode,
  saveAidLetter,
}: {
  aidLetter: AidLetter | null;
  profile: StudentProfile | null;
  aidLetterLocalMode: boolean;
  saveAidLetter: ReturnType<typeof useUserData>["saveAidLetter"];
}) {
  const [form, setForm] = useState(() => buildFormFromLetter(aidLetter, profile));
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");

  const offerInput = useMemo(() => formToOfferInput(form), [form]);
  const decoded = useMemo(() => decodeAidOffer(offerInput), [offerInput]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.school_name.trim()) {
      setSaveNotice("Enter your school name to save.");
      return;
    }

    setSaving(true);
    setSaveNotice("");
    try {
      const result = await saveAidLetter({
        school_name: form.school_name.trim(),
        aid_year: form.aid_year.trim() || "2026-27",
        cost_of_attendance: offerInput.cost_of_attendance,
        grants_amount: offerInput.grants,
        scholarships_amount: offerInput.scholarships,
        work_study_amount: offerInput.work_study,
        subsidized_loans_amount: offerInput.subsidized_loans,
        unsubsidized_loans_amount: offerInput.unsubsidized_loans,
        parent_plus_loans_amount: offerInput.parent_plus_loans,
        private_loans_amount: offerInput.private_loans,
        loans_amount: decoded.totalLoans,
        estimated_net_cost: decoded.estimatedGapAfterAllAid,
      });
      if (result.savedLocally) {
        setSaveNotice("Saved on this device. Your decoder is up to date — cloud sync will retry later.");
      } else {
        setSaveNotice("Aid offer saved.");
      }
    } catch (err) {
      console.error("Aid letter save failed:", err);
      setSaveNotice("Could not sync to your account, but your numbers are still decoded below.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <ProductCard style={{ padding: 26, marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
            Enter your aid offer
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
            Copy numbers from your school&apos;s official aid letter or portal. Do not enter SSNs, passwords, or bank account numbers.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>School name</span>
              <input
                required
                style={inputStyle}
                value={form.school_name}
                onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                placeholder="e.g. UC Irvine"
              />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Cost of attendance ($)</span>
              <input
                required
                type="number"
                min={0}
                style={inputStyle}
                value={form.cost_of_attendance}
                onChange={(e) => setForm({ ...form, cost_of_attendance: e.target.value })}
                placeholder="33100"
              />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Grants ($)</span>
              <input
                type="number"
                min={0}
                style={inputStyle}
                value={form.grants}
                onChange={(e) => setForm({ ...form, grants: e.target.value })}
                placeholder="0"
              />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Scholarships ($)</span>
              <input
                type="number"
                min={0}
                style={inputStyle}
                value={form.scholarships}
                onChange={(e) => setForm({ ...form, scholarships: e.target.value })}
                placeholder="0"
              />
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Work-study ($)</span>
              <input
                type="number"
                min={0}
                style={inputStyle}
                value={form.work_study}
                onChange={(e) => setForm({ ...form, work_study: e.target.value })}
                placeholder="0"
              />
            </label>
          </div>

          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 800, margin: "22px 0 12px", color: "#15212E" }}>
            Loans (enter each type separately)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            <LoanField
              label="Subsidized loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.subsidized}
              value={form.subsidized_loans}
              onChange={(value) => setForm({ ...form, subsidized_loans: value })}
            />
            <LoanField
              label="Unsubsidized loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
              value={form.unsubsidized_loans}
              onChange={(value) => setForm({ ...form, unsubsidized_loans: value })}
            />
            <LoanField
              label="Parent PLUS loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
              value={form.parent_plus_loans}
              onChange={(value) => setForm({ ...form, parent_plus_loans: value })}
            />
            <LoanField
              label="Private loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.private}
              value={form.private_loans}
              onChange={(value) => setForm({ ...form, private_loans: value })}
            />
          </div>

          {saveNotice && (
            <p
              style={{
                color: saveNotice.includes("device") || saveNotice.includes("sync") ? "#B7791F" : "#15885A",
                fontSize: 14,
                margin: "14px 0 0",
                lineHeight: 1.5,
              }}
            >
              {saveNotice}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 18,
              width: "100%",
              padding: "14px 24px",
              borderRadius: 13,
              background: saving ? "#E5E7EB" : "#0B5CAD",
              color: saving ? "#9AA4B2" : "#fff",
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving..." : aidLetter ? "Save aid offer" : "Save aid offer"}
          </button>
        </ProductCard>
      </form>

      <AidOfferDecoder form={form} decoded={decoded} />

      {(aidLetterLocalMode || aidLetter?.id?.startsWith("local-aid-letter-")) && <AidLetterLocalBanner />}
    </>
  );
}

export default function AidLetterClient() {
  const { loading, authReady, loadError, aidLetter, aidLetterLocalMode, profile, saveAidLetter } = useUserData();

  if (!authReady && loading) {
    return <PageLoading message="Loading aid offer decoder..." />;
  }

  if (loading) {
    return <PageLoading message="Loading aid offer decoder..." />;
  }

  return (
    <AppShell>
      <PageErrorBanner message={loadError} />
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Aid Offer Decoder
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Type in your aid letter numbers and see what is free money, what is borrowed, and what you may still need to cover.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20, alignItems: "center" }}>
        {aidLetter?.school_name && (
          <StatCard label="School" value={aidLetter.school_name} color="#0B5CAD" style={{ flex: "1 1 180px" }} />
        )}
        {aidLetter?.status && <PillBadge tone="green">{aidLetter.status}</PillBadge>}
      </div>

      <ProductCard style={{ padding: 22, marginBottom: 20, background: "#FFF7E6", border: "1px solid #F2E6C8" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
          AidPilot helps you understand your offer — it does not replace your financial aid office. Never enter SSNs, passwords, bank account numbers, or tax return values here.
        </p>
      </ProductCard>

      <AidLetterForm
        key={`${aidLetter?.id ?? "new"}-${aidLetter?.updated_at ?? ""}`}
        aidLetter={aidLetter}
        profile={profile}
        aidLetterLocalMode={aidLetterLocalMode}
        saveAidLetter={saveAidLetter}
      />

      <p style={{ marginTop: 28, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>
          Read disclaimer
        </Link>
      </p>
    </AppShell>
  );
}
