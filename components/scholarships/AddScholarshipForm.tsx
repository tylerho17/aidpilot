"use client";

import { useState, type FormEvent } from "react";
import { SCHOLARSHIP_PRIORITY_LABELS } from "@/lib/scholarships/getScholarshipUrgency";
import type { AddCustomScholarshipInput } from "@/hooks/useScholarshipTracker";
import { SCHOLARSHIP_PRIORITIES, type ScholarshipPriority, type UserScholarshipMatch } from "@/lib/types";

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #EAEEF3",
  fontSize: 14,
  fontWeight: 500,
  color: "#15212E",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#5B6573",
  marginBottom: 6,
};

const submitBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

type FormState = {
  name: string;
  provider: string;
  amount: string;
  deadline: string;
  application_url: string;
  match_reason: string;
  priority: ScholarshipPriority;
  notes: string;
};

function matchToForm(match?: UserScholarshipMatch | null): FormState {
  if (!match) {
    return {
      name: "",
      provider: "",
      amount: "",
      deadline: "",
      application_url: "",
      match_reason: "",
      priority: "medium",
      notes: "",
    };
  }

  return {
    name: match.custom_name ?? match.scholarship?.name ?? "",
    provider: match.custom_provider ?? match.scholarship?.provider ?? "",
    amount: match.custom_amount ? String(match.custom_amount) : "",
    deadline: match.custom_deadline ?? match.scholarship?.deadline ?? "",
    application_url: match.custom_application_url ?? match.scholarship?.application_url ?? "",
    match_reason: match.match_reason ?? "",
    priority: match.priority,
    notes: match.notes ?? "",
  };
}

type AddScholarshipFormProps = {
  initialMatch?: UserScholarshipMatch | null;
  saving?: boolean;
  onSubmit: (input: AddCustomScholarshipInput, matchId?: string) => Promise<unknown>;
  onCancel?: () => void;
};

export default function AddScholarshipForm({ initialMatch, saving, onSubmit, onCancel }: AddScholarshipFormProps) {
  const [form, setForm] = useState<FormState>(() => matchToForm(initialMatch));
  const isEdit = Boolean(initialMatch);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;

    const amount = form.amount.trim() ? Math.max(0, Number(form.amount.replace(/,/g, ""))) : undefined;

    const input: AddCustomScholarshipInput = {
      name: form.name.trim(),
      provider: form.provider.trim() || undefined,
      amount: Number.isFinite(amount) ? amount : undefined,
      deadline: form.deadline.trim() || undefined,
      application_url: form.application_url.trim() || undefined,
      match_reason: form.match_reason.trim() || undefined,
      priority: form.priority,
      notes: form.notes.trim() || undefined,
    };

    await onSubmit(input, initialMatch?.id);
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div>
          <label htmlFor="scholarship-name" style={labelStyle}>
            Scholarship name *
          </label>
          <input
            id="scholarship-name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="scholarship-provider" style={labelStyle}>
            Provider
          </label>
          <input
            id="scholarship-provider"
            value={form.provider}
            onChange={(event) => setForm((prev) => ({ ...prev, provider: event.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="scholarship-amount" style={labelStyle}>
            Amount
          </label>
          <input
            id="scholarship-amount"
            inputMode="decimal"
            min={0}
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="0"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="scholarship-deadline" style={labelStyle}>
            Deadline
          </label>
          <input
            id="scholarship-deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="scholarship-priority" style={labelStyle}>
            Priority
          </label>
          <select
            id="scholarship-priority"
            value={form.priority}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, priority: event.target.value as ScholarshipPriority }))
            }
            style={inputStyle}
          >
            {SCHOLARSHIP_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {SCHOLARSHIP_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="scholarship-url" style={labelStyle}>
          Application URL
        </label>
        <input
          id="scholarship-url"
          type="url"
          value={form.application_url}
          onChange={(event) => setForm((prev) => ({ ...prev, application_url: event.target.value }))}
          placeholder="https://"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="scholarship-reason" style={labelStyle}>
          Why it might fit
        </label>
        <textarea
          id="scholarship-reason"
          value={form.match_reason}
          onChange={(event) => setForm((prev) => ({ ...prev, match_reason: event.target.value }))}
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div>
        <label htmlFor="scholarship-notes" style={labelStyle}>
          Notes
        </label>
        <textarea
          id="scholarship-notes"
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="submit" disabled={saving} style={{ ...submitBtn, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add scholarship"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...submitBtn,
              background: "#EAF3FF",
              color: "#0B5CAD",
            }}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
