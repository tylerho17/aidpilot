"use client";

import { useState, type FormEvent } from "react";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #EAEEF3",
  fontSize: 14,
  fontWeight: 500,
  color: "#15212E",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 13,
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

type AddSchoolAidStatusFormProps = {
  onSubmit: (input: { school_name: string; portal_url?: string; school_email?: string }) => Promise<unknown>;
  saving?: boolean;
};

export default function AddSchoolAidStatusForm({ onSubmit, saving }: AddSchoolAidStatusFormProps) {
  const [schoolName, setSchoolName] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = schoolName.trim();
    if (!trimmed) return;

    const result = await onSubmit({
      school_name: trimmed,
      portal_url: portalUrl.trim() || undefined,
      school_email: schoolEmail.trim() || undefined,
    });

    if (result) {
      setSchoolName("");
      setPortalUrl("");
      setSchoolEmail("");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label htmlFor="school-name" style={labelStyle}>
          School name
        </label>
        <input
          id="school-name"
          value={schoolName}
          onChange={(event) => setSchoolName(event.target.value)}
          placeholder="e.g. State University"
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="portal-url" style={labelStyle}>
          Portal URL (optional)
        </label>
        <input
          id="portal-url"
          type="url"
          value={portalUrl}
          onChange={(event) => setPortalUrl(event.target.value)}
          placeholder="https://portal.yourschool.edu"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="school-email" style={labelStyle}>
          Financial aid email (optional)
        </label>
        <input
          id="school-email"
          type="email"
          value={schoolEmail}
          onChange={(event) => setSchoolEmail(event.target.value)}
          placeholder="financialaid@school.edu"
          style={inputStyle}
        />
      </div>

      <button type="submit" disabled={saving || !schoolName.trim()} style={submitBtn}>
        {saving ? "Adding..." : "Add a school"}
      </button>
    </form>
  );
}
