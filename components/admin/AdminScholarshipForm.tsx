"use client";

import { useState, type FormEvent } from "react";
import { ProductCard } from "@/components/ProductUI";
import type { ScholarshipSourceFormValues } from "@/lib/scholarship-form-helpers";

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

const labelStyle = { fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" };

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
      setError(err instanceof Error ? err.message : "Could not save scholarship.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ProductCard style={{ padding: 26, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <label><span style={labelStyle}>Name *</span><input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span style={labelStyle}>Provider</span><input style={inputStyle} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></label>
          <label><span style={labelStyle}>Amount ($)</span><input type="number" min={0} style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
          <label><span style={labelStyle}>Deadline</span><input type="date" style={inputStyle} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
          <label><span style={labelStyle}>Verified date</span><input type="date" style={inputStyle} value={form.verified_date} onChange={(e) => setForm({ ...form, verified_date: e.target.value })} /></label>
          <label><span style={labelStyle}>Effort level</span>
            <select style={inputStyle} value={form.effort_level} onChange={(e) => setForm({ ...form, effort_level: e.target.value })}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}><span style={labelStyle}>Eligibility</span><textarea style={{ ...inputStyle, minHeight: 80 }} value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} /></label>
          <label><span style={labelStyle}>Eligible states (comma-separated)</span><input style={inputStyle} value={form.eligible_states} onChange={(e) => setForm({ ...form, eligible_states: e.target.value })} placeholder="CA, TX" /></label>
          <label><span style={labelStyle}>Education levels</span><input style={inputStyle} value={form.education_levels} onChange={(e) => setForm({ ...form, education_levels: e.target.value })} placeholder="undergraduate, graduate" /></label>
          <label><span style={labelStyle}>Student types</span><input style={inputStyle} value={form.student_types} onChange={(e) => setForm({ ...form, student_types: e.target.value })} placeholder="College student" /></label>
          <label><span style={labelStyle}>Major keywords</span><input style={inputStyle} value={form.major_keywords} onChange={(e) => setForm({ ...form, major_keywords: e.target.value })} /></label>
          <label><span style={labelStyle}>Interest tags</span><input style={inputStyle} value={form.interest_tags} onChange={(e) => setForm({ ...form, interest_tags: e.target.value })} /></label>
          <label><span style={labelStyle}>Tags</span><input style={inputStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label>
          <label><span style={labelStyle}>Application URL</span><input style={inputStyle} value={form.application_url} onChange={(e) => setForm({ ...form, application_url: e.target.value })} /></label>
          <label><span style={labelStyle}>Source URL</span><input style={inputStyle} value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} /></label>
          <label><span style={labelStyle}>Source</span><input style={inputStyle} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.essay_required} onChange={(e) => setForm({ ...form, essay_required: e.target.checked })} />Essay required</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.need_based} onChange={(e) => setForm({ ...form, need_based: e.target.checked })} />Need-based</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.merit_based} onChange={(e) => setForm({ ...form, merit_based: e.target.checked })} />Merit-based</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Active</label>
        </div>
        {error && <p style={{ color: "#C04E57", fontSize: 14, marginTop: 14 }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ marginTop: 18, fontSize: 15, fontWeight: 700, color: "#fff", background: saving ? "#9AA4B2" : "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? "Saving..." : submitLabel}
        </button>
      </ProductCard>
    </form>
  );
}
