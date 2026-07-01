"use client";

import { useState, type FormEvent } from "react";
import { Card, TextField, Select, Checkbox, Button, StatusPanel } from "@/components/ui";
import { toFriendlyError } from "@/lib/friendly-errors";
import type { ScholarshipSourceFormValues } from "@/lib/scholarship-form-helpers";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
} as const;

const textareaLabelStyle = { fontSize: 13, fontWeight: 700, color: "var(--ink-700)", marginBottom: 6, display: "block" };

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
  minHeight: 84,
  resize: "vertical" as const,
};

export function AdminScholarshipForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: ScholarshipSourceFormValues;
  submitLabel: string;
  onSubmit: (values: ScholarshipSourceFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      console.error("Admin scholarship save failed:", err);
      setError(toFriendlyError(err, "Could not save scholarship."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card variant="clay" padding={26} style={{ marginBottom: 20 }}>
        <div style={gridStyle}>
          <TextField
            label="Name *"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Provider"
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
          />
          <TextField
            label="Amount ($)"
            type="number"
            min={0}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <TextField
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
          <TextField
            label="Verified date"
            type="date"
            value={form.verified_date}
            onChange={(e) => setForm({ ...form, verified_date: e.target.value })}
          />
          <Select
            label="Effort level"
            value={form.effort_level}
            onChange={(e) => setForm({ ...form, effort_level: e.target.value })}
            options={["low", "medium", "high"]}
          />
          <label style={{ gridColumn: "1 / -1" }}>
            <span style={textareaLabelStyle}>Eligibility</span>
            <textarea
              style={textareaStyle}
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
            />
          </label>
          <TextField
            label="Eligible states (comma-separated)"
            placeholder="CA, TX"
            value={form.eligible_states}
            onChange={(e) => setForm({ ...form, eligible_states: e.target.value })}
          />
          <TextField
            label="Education levels"
            placeholder="undergraduate, graduate"
            value={form.education_levels}
            onChange={(e) => setForm({ ...form, education_levels: e.target.value })}
          />
          <TextField
            label="Student types"
            placeholder="College student"
            value={form.student_types}
            onChange={(e) => setForm({ ...form, student_types: e.target.value })}
          />
          <TextField
            label="Major keywords"
            value={form.major_keywords}
            onChange={(e) => setForm({ ...form, major_keywords: e.target.value })}
          />
          <TextField
            label="Interest tags"
            value={form.interest_tags}
            onChange={(e) => setForm({ ...form, interest_tags: e.target.value })}
          />
          <TextField
            label="Tags"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <TextField
            label="Application URL"
            value={form.application_url}
            onChange={(e) => setForm({ ...form, application_url: e.target.value })}
          />
          <TextField
            label="Source URL"
            value={form.source_url}
            onChange={(e) => setForm({ ...form, source_url: e.target.value })}
          />
          <TextField
            label="Source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 20 }}>
          <Checkbox
            label="Essay required"
            checked={form.essay_required}
            onChange={(e) => setForm({ ...form, essay_required: e.target.checked })}
          />
          <Checkbox
            label="Need-based"
            checked={form.need_based}
            onChange={(e) => setForm({ ...form, need_based: e.target.checked })}
          />
          <Checkbox
            label="Merit-based"
            checked={form.merit_based}
            onChange={(e) => setForm({ ...form, merit_based: e.target.checked })}
          />
          <Checkbox
            label="Active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
        </div>

        {error && (
          <StatusPanel tone="coral" icon="shield" title="Could not save" style={{ marginTop: 18 }}>
            {error}
          </StatusPanel>
        )}

        <div style={{ marginTop: 20 }}>
          <Button type="submit" variant="clay" loading={saving} disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  );
}
