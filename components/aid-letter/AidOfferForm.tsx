"use client";

import { useState, type FormEvent } from "react";
import { Button, Select, TextField } from "@/components/ui";
import { AID_OFFER_STATUS_LABELS, formatDollarInput, parseDollarInput } from "@/lib/aid-letter/calculateAidOffer";
import type { AidOfferInput } from "@/hooks/useAidOffers";
import type { AidOfferRecordStatus, UserAidOffer } from "@/lib/types";
import { AID_OFFER_RECORD_STATUSES } from "@/lib/types";

const sectionHeading = {
  fontSize: 14,
  fontWeight: 800,
  color: "var(--ink-900)",
  margin: "4px 0 0",
  fontFamily: "var(--font-display)",
} as const;

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border-default)",
  padding: "13px 16px",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  color: "var(--ink-800)",
  outline: "none",
  resize: "vertical" as const,
};

const textareaLabelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink-700)",
  marginBottom: 6,
  display: "block",
} as const;

type FormState = {
  school_name: string;
  offer_status: AidOfferRecordStatus;
  academic_year: string;
  cost_of_attendance: string;
  tuition_and_fees: string;
  housing_and_food: string;
  books_and_supplies: string;
  transportation: string;
  personal_expenses: string;
  grants_and_scholarships: string;
  work_study: string;
  federal_student_loans: string;
  parent_plus_loans: string;
  private_loans: string;
  other_aid: string;
  renewal_notes: string;
  notes: string;
};

function offerToForm(offer?: UserAidOffer | null): FormState {
  if (!offer) {
    return {
      school_name: "",
      offer_status: "draft",
      academic_year: "2026-27",
      cost_of_attendance: "",
      tuition_and_fees: "",
      housing_and_food: "",
      books_and_supplies: "",
      transportation: "",
      personal_expenses: "",
      grants_and_scholarships: "",
      work_study: "",
      federal_student_loans: "",
      parent_plus_loans: "",
      private_loans: "",
      other_aid: "",
      renewal_notes: "",
      notes: "",
    };
  }

  return {
    school_name: offer.school_name,
    offer_status: offer.offer_status,
    academic_year: offer.academic_year ?? "2026-27",
    cost_of_attendance: formatDollarInput(offer.cost_of_attendance),
    tuition_and_fees: formatDollarInput(offer.tuition_and_fees),
    housing_and_food: formatDollarInput(offer.housing_and_food),
    books_and_supplies: formatDollarInput(offer.books_and_supplies),
    transportation: formatDollarInput(offer.transportation),
    personal_expenses: formatDollarInput(offer.personal_expenses),
    grants_and_scholarships: formatDollarInput(offer.grants_and_scholarships),
    work_study: formatDollarInput(offer.work_study),
    federal_student_loans: formatDollarInput(offer.federal_student_loans),
    parent_plus_loans: formatDollarInput(offer.parent_plus_loans),
    private_loans: formatDollarInput(offer.private_loans),
    other_aid: formatDollarInput(offer.other_aid),
    renewal_notes: offer.renewal_notes ?? "",
    notes: offer.notes ?? "",
  };
}

function formToInput(form: FormState): AidOfferInput {
  return {
    school_name: form.school_name.trim(),
    offer_status: form.offer_status,
    academic_year: form.academic_year.trim() || undefined,
    cost_of_attendance: parseDollarInput(form.cost_of_attendance),
    tuition_and_fees: parseDollarInput(form.tuition_and_fees),
    housing_and_food: parseDollarInput(form.housing_and_food),
    books_and_supplies: parseDollarInput(form.books_and_supplies),
    transportation: parseDollarInput(form.transportation),
    personal_expenses: parseDollarInput(form.personal_expenses),
    grants_and_scholarships: parseDollarInput(form.grants_and_scholarships),
    work_study: parseDollarInput(form.work_study),
    federal_student_loans: parseDollarInput(form.federal_student_loans),
    parent_plus_loans: parseDollarInput(form.parent_plus_loans),
    private_loans: parseDollarInput(form.private_loans),
    other_aid: parseDollarInput(form.other_aid),
    renewal_notes: form.renewal_notes.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

type AidOfferFormProps = {
  initialOffer?: UserAidOffer | null;
  saving?: boolean;
  onSubmit: (input: AidOfferInput, offerId?: string) => Promise<unknown>;
  onCancel?: () => void;
};

function DollarField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      id={id}
      label={label}
      inputMode="decimal"
      min={0}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="0"
    />
  );
}

export default function AidOfferForm({ initialOffer, saving, onSubmit, onCancel }: AidOfferFormProps) {
  const [form, setForm] = useState<FormState>(() => offerToForm(initialOffer));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.school_name.trim()) return;
    await onSubmit(formToInput(form), initialOffer?.id);
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <TextField
          id="school-name"
          label="School name"
          value={form.school_name}
          onChange={(event) => setForm((prev) => ({ ...prev, school_name: event.target.value }))}
          required
        />
        <TextField
          id="academic-year"
          label="Academic year"
          value={form.academic_year}
          onChange={(event) => setForm((prev) => ({ ...prev, academic_year: event.target.value }))}
        />
        <Select
          id="offer-status"
          label="Offer status"
          value={form.offer_status}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, offer_status: event.target.value as AidOfferRecordStatus }))
          }
          options={AID_OFFER_RECORD_STATUSES.map((status) => ({
            value: status,
            label: AID_OFFER_STATUS_LABELS[status],
          }))}
        />
      </div>

      <h3 style={sectionHeading}>Costs</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <DollarField id="coa" label="Cost of attendance" value={form.cost_of_attendance} onChange={(v) => setForm((p) => ({ ...p, cost_of_attendance: v }))} />
        <DollarField id="tuition" label="Tuition and fees" value={form.tuition_and_fees} onChange={(v) => setForm((p) => ({ ...p, tuition_and_fees: v }))} />
        <DollarField id="housing" label="Housing and food" value={form.housing_and_food} onChange={(v) => setForm((p) => ({ ...p, housing_and_food: v }))} />
        <DollarField id="books" label="Books and supplies" value={form.books_and_supplies} onChange={(v) => setForm((p) => ({ ...p, books_and_supplies: v }))} />
        <DollarField id="transport" label="Transportation" value={form.transportation} onChange={(v) => setForm((p) => ({ ...p, transportation: v }))} />
        <DollarField id="personal" label="Personal expenses" value={form.personal_expenses} onChange={(v) => setForm((p) => ({ ...p, personal_expenses: v }))} />
      </div>

      <h3 style={sectionHeading}>Aid shown</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <DollarField id="grants" label="Grants and scholarships" value={form.grants_and_scholarships} onChange={(v) => setForm((p) => ({ ...p, grants_and_scholarships: v }))} />
        <DollarField id="work-study" label="Work-study" value={form.work_study} onChange={(v) => setForm((p) => ({ ...p, work_study: v }))} />
        <DollarField id="fed-loans" label="Federal student loans" value={form.federal_student_loans} onChange={(v) => setForm((p) => ({ ...p, federal_student_loans: v }))} />
        <DollarField id="parent-plus" label="Parent PLUS loans" value={form.parent_plus_loans} onChange={(v) => setForm((p) => ({ ...p, parent_plus_loans: v }))} />
        <DollarField id="private-loans" label="Private loans" value={form.private_loans} onChange={(v) => setForm((p) => ({ ...p, private_loans: v }))} />
        <DollarField id="other-aid" label="Other aid" value={form.other_aid} onChange={(v) => setForm((p) => ({ ...p, other_aid: v }))} />
      </div>

      <div>
        <label htmlFor="renewal-notes" style={textareaLabelStyle}>
          Renewal notes
        </label>
        <textarea
          id="renewal-notes"
          rows={2}
          value={form.renewal_notes}
          onChange={(event) => setForm((prev) => ({ ...prev, renewal_notes: event.target.value }))}
          placeholder="Which scholarships renew? What GPA or hours are required?"
          style={textareaStyle}
        />
      </div>

      <div>
        <label htmlFor="notes" style={textareaLabelStyle}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Anything else to remember about this offer"
          style={textareaStyle}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Button type="submit" variant="clay" disabled={saving || !form.school_name.trim()}>
          {saving ? "Saving..." : initialOffer ? "Save changes" : "Save aid offer"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
