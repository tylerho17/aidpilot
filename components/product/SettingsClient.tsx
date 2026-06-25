"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import type { StudentProfile } from "@/lib/types";

const FAFSA_OPTIONS = ["Yes", "Not yet", "I am not sure"];
const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Transfer", "Graduate"];
const STUDENT_TYPES = ["High school student", "College student", "Parent", "Counselor"];

function profileToForm(profile: StudentProfile) {
  return {
    first_name: profile.first_name ?? "",
    school: profile.school ?? "",
    year: profile.year ?? "",
    state: profile.state ?? "",
    student_type: profile.student_type ?? "",
    fafsa_status: profile.fafsa_status ?? "",
  };
}

function ProfileSettingsForm({
  profile,
  updateProfile,
  logout,
}: {
  profile: StudentProfile;
  updateProfile: ReturnType<typeof useUserData>["updateProfile"];
  logout: ReturnType<typeof useUserData>["logout"];
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => profileToForm(profile));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile(form);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%",
    borderRadius: 14,
    border: "1.5px solid #E5E7EB",
    padding: "13px 16px",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  return (
    <>
      <ProductCard style={{ padding: 28, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 18px", color: "#15212E" }}>
          Profile
        </h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input required style={inputStyle} placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input required style={inputStyle} placeholder="School" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          <select required style={inputStyle} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
            <option value="">Year</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <input required style={inputStyle} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <select required style={inputStyle} value={form.student_type} onChange={(e) => setForm({ ...form, student_type: e.target.value })}>
            <option value="">Student type</option>
            {STUDENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select required style={inputStyle} value={form.fafsa_status} onChange={(e) => setForm({ ...form, fafsa_status: e.target.value })}>
            <option value="">FAFSA status</option>
            {FAFSA_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {message && <p style={{ fontSize: 14, fontWeight: 600, color: "#15885A", margin: 0 }}>{message}</p>}
          {error && <p style={{ fontSize: 14, fontWeight: 600, color: "#C04E57", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ alignSelf: "flex-start", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </ProductCard>

      <ProductCard style={{ padding: 24 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
          Account
        </h2>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
          Log out of AidPilot on this device.
        </p>
        <button type="button" onClick={() => logout()} style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 22px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Log out
        </button>
      </ProductCard>
    </>
  );
}

export default function SettingsClient() {
  const { loading, profile, updateProfile, logout } = useUserData();

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading settings...</p>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Profile not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Settings
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Update your AidPilot profile and account.
        </p>
      </div>

      <ProfileSettingsForm
        key={profile.updated_at}
        profile={profile}
        updateProfile={updateProfile}
        logout={logout}
      />
    </AppShell>
  );
}
