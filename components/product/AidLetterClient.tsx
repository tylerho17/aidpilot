"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, IconTile, StatusPanel, TextField } from "@/components/ui";
import { Greeting, money as moneyStyle } from "@/components/app/screens/shared";
import { AidLetterLocalBanner } from "@/components/product/AidLetterLocalBanner";
import { friendlyActionError } from "@/components/product/PageSafety";
import { toFriendlyError } from "@/lib/friendly-errors";
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
    <div
      style={{
        padding: 18,
        borderRadius: "var(--radius-lg)",
        background: "var(--blue-50)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-700)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", marginBottom: 10, lineHeight: 1.45 }}>{sub}</div>
      <div style={{ ...moneyStyle, fontSize: 28, color }}>${amount.toLocaleString()}</div>
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
  const panelTone = tone === "red" ? "coral" : tone;
  return (
    <StatusPanel tone={panelTone} icon="star" title={title} style={{ marginBottom: 16 }}>
      {message}
    </StatusPanel>
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
    <div
      style={{
        padding: 14,
        borderRadius: "var(--radius-md)",
        background: "var(--blue-50)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)", marginBottom: 4 }}>{label}</div>
      <div style={{ ...moneyStyle, fontSize: 22, color, marginBottom: 8 }}>${amount.toLocaleString()}</div>
      <p style={{ fontSize: 11, fontWeight: 500, color: "var(--gray-400)", margin: 0, lineHeight: 1.5 }}>{hint}</p>
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
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-700)" }}>{label}</span>
        <span style={{ ...moneyStyle, fontSize: 16, color }}>${amount.toLocaleString()}</span>
      </div>
      {hint && (
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)", margin: "8px 0 0", lineHeight: 1.55 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function AidLetterAmountField({
  label,
  value,
  onChange,
  required,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <TextField
      label={label}
      hint={hint}
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
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
    <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.4px", margin: "0 0 8px", color: "var(--ink-900)" }}>
        Your aid decoder
      </h2>
      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Free money is yours to keep. Loans must be repaid. Work-study is a job on campus - not cash upfront.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <DecoderCard label="Free money" sub="Grants + scholarships" amount={decoded.totalFreeMoney} color="var(--green-600)" />
        <DecoderCard
          label="Borrowed money"
          sub="All loans combined - must be repaid"
          amount={decoded.totalLoans}
          color="var(--amber-600)"
        />
        <DecoderCard label="Work-study" sub="Earn through a campus job" amount={workStudy} color="var(--blue-700)" />
        <DecoderCard
          label="Estimated gap"
          sub="Still uncovered after all aid listed"
          amount={decoded.estimatedGapAfterAllAid}
          color="var(--coral-600)"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 22 }}>
        <div style={{ padding: 18, borderRadius: "var(--radius-lg)", background: "var(--gradient-safe)", border: "1px solid var(--green-200)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-600)", marginBottom: 6 }}>Net cost after free money</div>
          <div style={{ ...moneyStyle, fontSize: 30, color: "var(--ink-900)" }}>
            ${decoded.netCostAfterFreeMoney.toLocaleString()}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", margin: "8px 0 0", lineHeight: 1.5 }}>
            Cost of attendance minus grants and scholarships.
          </p>
        </div>
        <div style={{ padding: 18, borderRadius: "var(--radius-lg)", background: "var(--gradient-info)", border: "1px solid var(--blue-200)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue-700)", marginBottom: 6 }}>Cost of attendance</div>
          <div style={{ ...moneyStyle, fontSize: 30, color: "var(--ink-900)" }}>${coa.toLocaleString()}</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", margin: "8px 0 0", lineHeight: 1.5 }}>
            Sticker price before aid - confirm with your school.
          </p>
        </div>
      </div>

      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: "var(--ink-900)" }}>
        Line items
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        <MoneyRow label="Cost of attendance" amount={coa} color="var(--ink-900)" />
        <MoneyRow label="Grants" amount={grants} color="var(--green-600)" />
        <MoneyRow label="Scholarships" amount={scholarships} color="var(--green-600)" />
        <MoneyRow label="Work-study" amount={workStudy} color="var(--blue-700)" />
        <MoneyRow
          label="Subsidized loans"
          amount={decoded.loanBreakdown.subsidized}
          color="var(--amber-600)"
          hint={LOAN_TYPE_EXPLANATIONS.subsidized}
        />
        <MoneyRow
          label="Unsubsidized loans"
          amount={decoded.loanBreakdown.unsubsidized}
          color="var(--amber-600)"
          hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
        />
        <MoneyRow
          label="Parent PLUS loans"
          amount={decoded.loanBreakdown.parentPlus}
          color="var(--coral-600)"
          hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
        />
        <MoneyRow
          label="Private loans"
          amount={decoded.loanBreakdown.private}
          color="var(--coral-600)"
          hint={LOAN_TYPE_EXPLANATIONS.private}
        />
        <MoneyRow label="Total borrowed" amount={decoded.totalLoans} color="var(--amber-600)" />
      </div>

      <h3 className="font-display" style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", color: "var(--ink-900)" }}>
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
          color="var(--amber-600)"
        />
        <LoanTypeCard
          label="Unsubsidized"
          amount={decoded.loanBreakdown.unsubsidized}
          hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
          color="var(--amber-600)"
        />
        <LoanTypeCard
          label="Parent PLUS"
          amount={decoded.loanBreakdown.parentPlus}
          hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
          color="var(--coral-600)"
        />
        <LoanTypeCard
          label="Private"
          amount={decoded.loanBreakdown.private}
          hint={LOAN_TYPE_EXPLANATIONS.private}
          color="var(--coral-600)"
        />
      </div>

      {decoded.warnings.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {decoded.warnings.map((warning) => (
            <WarningCard key={warning.id} title={warning.title} message={warning.message} tone={warning.tone} />
          ))}
        </div>
      )}
    </Card>
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

  const noticeIsPending = saveNotice.includes("device") || saveNotice.includes("sync");
  const noticeIsError = Boolean(saveNotice) && !noticeIsPending && saveNotice !== "Aid offer saved.";

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
        setSaveNotice("Saved on this device. Your decoder is up to date - cloud sync will retry later.");
      } else {
        setSaveNotice("Aid offer saved.");
      }
    } catch (err) {
      console.error("Aid letter save failed:", err);
      setSaveNotice(friendlyActionError(err, "Could not save your aid offer. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const noticeColor = noticeIsError
    ? "var(--coral-600)"
    : noticeIsPending
      ? "var(--amber-600)"
      : "var(--green-600)";

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.3px", margin: "0 0 8px", color: "var(--ink-900)" }}>
            Enter your aid offer
          </h2>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 18px", lineHeight: 1.6 }}>
            Copy numbers from your school&apos;s official aid letter or portal. Do not enter SSNs, passwords, or bank account numbers.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            <TextField
              label="School name"
              required
              value={form.school_name}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
              placeholder="e.g. UC Irvine"
            />
            <AidLetterAmountField
              label="Cost of attendance ($)"
              required
              value={form.cost_of_attendance}
              onChange={(value) => setForm({ ...form, cost_of_attendance: value })}
              placeholder="33100"
            />
            <AidLetterAmountField
              label="Grants ($)"
              value={form.grants}
              onChange={(value) => setForm({ ...form, grants: value })}
              placeholder="0"
            />
            <AidLetterAmountField
              label="Scholarships ($)"
              value={form.scholarships}
              onChange={(value) => setForm({ ...form, scholarships: value })}
              placeholder="0"
            />
            <AidLetterAmountField
              label="Work-study ($)"
              value={form.work_study}
              onChange={(value) => setForm({ ...form, work_study: value })}
              placeholder="0"
            />
          </div>

          <h3 className="font-display" style={{ fontSize: 16, fontWeight: 800, margin: "22px 0 12px", color: "var(--ink-900)" }}>
            Loans (enter each type separately)
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            <AidLetterAmountField
              label="Subsidized loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.subsidized}
              value={form.subsidized_loans}
              onChange={(value) => setForm({ ...form, subsidized_loans: value })}
            />
            <AidLetterAmountField
              label="Unsubsidized loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.unsubsidized}
              value={form.unsubsidized_loans}
              onChange={(value) => setForm({ ...form, unsubsidized_loans: value })}
            />
            <AidLetterAmountField
              label="Parent PLUS loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.parentPlus}
              value={form.parent_plus_loans}
              onChange={(value) => setForm({ ...form, parent_plus_loans: value })}
            />
            <AidLetterAmountField
              label="Private loans ($)"
              hint={LOAN_TYPE_EXPLANATIONS.private}
              value={form.private_loans}
              onChange={(value) => setForm({ ...form, private_loans: value })}
            />
          </div>

          {saveNotice && (
            <p
              style={{
                color: noticeColor,
                fontSize: 14,
                fontWeight: 600,
                margin: "14px 0 0",
                lineHeight: 1.5,
              }}
            >
              {saveNotice}
            </p>
          )}

          <Button type="submit" variant="clay" fullWidth disabled={saving} style={{ marginTop: 18 }}>
            {saving ? "Saving..." : "Save aid offer"}
          </Button>
        </Card>
      </form>

      <AidOfferDecoder form={form} decoded={decoded} />

      {(aidLetterLocalMode || aidLetter?.id?.startsWith("local-aid-letter-")) && <AidLetterLocalBanner />}
    </>
  );
}

function LoadingState() {
  return (
    <AppChrome>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Greeting title="Aid Offer Decoder" subtitle="Loading aid offer decoder..." />
        <Card variant="clay" padding={28} style={{ minHeight: 220 }} />
      </div>
    </AppChrome>
  );
}

export default function AidLetterClient() {
  const { loading, authReady, loadError, aidLetter, aidLetterLocalMode, profile, saveAidLetter } = useUserData();

  if (!authReady && loading) {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AppChrome>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {loadError ? (
          <StatusPanel tone="amber" icon="star" title="Some information could not be loaded" style={{ marginBottom: 22 }}>
            {toFriendlyError(loadError, "Other parts of this page should still work.")}
          </StatusPanel>
        ) : null}

        <Greeting
          title="Aid Offer Decoder"
          subtitle="Type in your aid letter numbers and see what is free money, what is borrowed, and what you may still need to cover."
        />

        {(aidLetter?.school_name || aidLetter?.status) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
            {aidLetter?.school_name && (
              <Card variant="clay" padding={16} style={{ flex: "1 1 180px", display: "flex", alignItems: "center", gap: 12 }}>
                <IconTile icon="letter" tone="blue" size={40} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-400)" }}>School</div>
                  <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-900)" }}>
                    {aidLetter.school_name}
                  </div>
                </div>
              </Card>
            )}
            {aidLetter?.status && <Badge tone="green">{aidLetter.status}</Badge>}
          </div>
        )}

        <StatusPanel tone="amber" icon="shield" title="AidPilot helps you understand your offer" style={{ marginBottom: 20 }}>
          It does not replace your financial aid office. Never enter SSNs, passwords, bank account numbers, or tax return values here.
        </StatusPanel>

        <AidLetterForm
          key={`${aidLetter?.id ?? "new"}-${aidLetter?.updated_at ?? ""}`}
          aidLetter={aidLetter}
          profile={profile}
          aidLetterLocalMode={aidLetterLocalMode}
          saveAidLetter={saveAidLetter}
        />

        <p style={{ marginTop: 28, fontSize: 12, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.6 }}>
          AidPilot is an educational and organizational tool, not official financial aid advice.{" "}
          <Link href="/disclaimer" style={{ color: "var(--blue-700)", textDecoration: "underline" }}>
            Read disclaimer
          </Link>
        </p>
      </div>
    </AppChrome>
  );
}
