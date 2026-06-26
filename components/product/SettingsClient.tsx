"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import {
  EFFORT_PREFERENCE_OPTIONS,
  ESSAY_PREFERENCE_OPTIONS,
  SCHOLARSHIP_CATEGORY_OPTIONS,
  parseScholarshipPreferences,
  type ScholarshipPreferences,
} from "@/lib/scholarship-preferences";
import { joinCommaSeparated, parseCommaSeparated } from "@/lib/data-helpers";
import type { StudentProfile } from "@/lib/types";

const FAFSA_OPTIONS = ["Yes", "Not yet", "I am not sure"];
const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Transfer", "Graduate"];
const STUDENT_TYPES = ["High school student", "College student", "Parent", "Counselor"];
const AID_OPTIONS = ["Cal Grant", "Pell Grant", "Work-study", "Loans", "I am not sure"];
const GOAL_OPTIONS = ["Protect my aid", "Catch deadlines", "Upload documents", "Understand my offer", "Find scholarships"];
const PROFILE_ESSAY_OPTIONS = [
  { value: "any", label: "Any (essays okay)" },
  { value: "prefer_no_essay", label: "Prefer no essay" },
  { value: "okay_with_essay", label: "Okay with essays" },
];

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

function profileToForm(profile: StudentProfile) {
  const prefs = parseScholarshipPreferences(profile.scholarship_preferences);
  return {
    first_name: profile.first_name ?? "",
    school: profile.school ?? "",
    year: profile.year ?? "",
    state: profile.state ?? "",
    student_type: profile.student_type ?? "",
    fafsa_status: profile.fafsa_status ?? "",
    aid_types: profile.aid_types ?? [],
    main_goals: profile.main_goals ?? [],
    interested_categories: prefs.interested_categories ?? [],
    essay_preference: prefs.essay_preference ?? "no_preference",
    effort_preference: prefs.effort_preference ?? "any",
    major_interests: prefs.major_interests ?? "",
    majors: joinCommaSeparated(profile.majors),
    interests: joinCommaSeparated(profile.interests),
    first_gen: profile.first_gen ?? false,
    transfer_student: profile.transfer_student ?? false,
    pell_eligible: profile.pell_eligible ?? false,
    cal_grant_eligible: profile.cal_grant_eligible ?? false,
    gpa: profile.gpa != null ? String(profile.gpa) : "",
    profile_essay_preference: profile.essay_preference ?? "any",
  };
}

function buildScholarshipPreferences(form: ReturnType<typeof profileToForm>): ScholarshipPreferences {
  return {
    interested_categories: form.interested_categories,
    essay_preference: form.essay_preference as ScholarshipPreferences["essay_preference"],
    effort_preference: form.effort_preference as ScholarshipPreferences["effort_preference"],
    state_preference: form.state,
    major_interests: form.major_interests,
  };
}

function SettingsForm({
  profile,
  updateProfile,
  logout,
}: {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<StudentProfile>;
  logout: () => Promise<void>;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => profileToForm(profile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function toggleArray(field: "aid_types" | "main_goals" | "interested_categories", value: string) {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile({
        first_name: form.first_name,
        school: form.school,
        year: form.year,
        state: form.state,
        student_type: form.student_type,
        fafsa_status: form.fafsa_status,
        aid_types: form.aid_types,
        main_goals: form.main_goals,
        majors: parseCommaSeparated(form.majors),
        interests: parseCommaSeparated(form.interests),
        first_gen: form.first_gen,
        transfer_student: form.transfer_student,
        pell_eligible: form.pell_eligible,
        cal_grant_eligible: form.cal_grant_eligible,
        gpa: form.gpa.trim() ? Number(form.gpa) : null,
        essay_preference: form.profile_essay_preference,
        scholarship_preferences: buildScholarshipPreferences(form),
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json()) as { error?: string; requestOnly?: boolean; success?: boolean };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not delete account.");
      }
      await logout();
      router.replace("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Settings
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Your AidPilot control panel. Update your profile, scholarship preferences, and account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <ProductCard style={{ padding: 28, marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>Profile</h2>
          <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 18px" }}>Used across your dashboard, matching, and reports. You can change this anytime.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              {STUDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select required style={inputStyle} value={form.fafsa_status} onChange={(e) => setForm({ ...form, fafsa_status: e.target.value })}>
              {FAFSA_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </ProductCard>

        <ProductCard style={{ padding: 28, marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>Aid & goals</h2>
          <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 14px" }}>Helps AidPilot prioritize deadlines and recommendations.</p>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Aid types</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {AID_OPTIONS.map((o) => (
              <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={form.aid_types.includes(o)} onChange={() => toggleArray("aid_types", o)} />
                {o}
              </label>
            ))}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Main goals</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GOAL_OPTIONS.map((o) => (
              <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
                <input type="checkbox" checked={form.main_goals.includes(o)} onChange={() => toggleArray("main_goals", o)} />
                {o}
              </label>
            ))}
          </div>
        </ProductCard>

        <ProductCard style={{ padding: 28, marginBottom: 22 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>Scholarship profile</h2>
          <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 14px", lineHeight: 1.6 }}>
            Profile details improve match quality and can be changed any time. Tell us only what helps matching. Never enter SSNs, bank info, or FAFSA passwords.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Majors</span>
              <input style={inputStyle} placeholder="e.g. computer science, biology" value={form.majors} onChange={(e) => setForm({ ...form, majors: e.target.value })} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Interests</span>
              <input style={inputStyle} placeholder="e.g. robotics, public health, entrepreneurship" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>GPA (optional)</span>
              <input style={inputStyle} type="number" min={0} max={4} step={0.01} placeholder="3.50" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Essay preference</span>
              <select style={inputStyle} value={form.profile_essay_preference} onChange={(e) => setForm({ ...form, profile_essay_preference: e.target.value })}>
                {PROFILE_ESSAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.first_gen} onChange={(e) => setForm({ ...form, first_gen: e.target.checked })} />
              First-generation college student
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.transfer_student} onChange={(e) => setForm({ ...form, transfer_student: e.target.checked })} />
              Transfer student
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.pell_eligible} onChange={(e) => setForm({ ...form, pell_eligible: e.target.checked })} />
              Pell Grant eligible
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={form.cal_grant_eligible} onChange={(e) => setForm({ ...form, cal_grant_eligible: e.target.checked })} />
              Cal Grant eligible
            </label>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Interested categories</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {SCHOLARSHIP_CATEGORY_OPTIONS.map((cat) => (
              <label key={cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: "#F9FAFB", padding: "6px 10px", borderRadius: 999 }}>
                <input type="checkbox" checked={form.interested_categories.includes(cat)} onChange={() => toggleArray("interested_categories", cat)} />
                {cat}
              </label>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Essay preference</span>
              <select style={inputStyle} value={form.essay_preference} onChange={(e) => setForm({ ...form, essay_preference: e.target.value as typeof form.essay_preference })}>
                {ESSAY_PREFERENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Effort preference</span>
              <select style={inputStyle} value={form.effort_preference} onChange={(e) => setForm({ ...form, effort_preference: e.target.value as typeof form.effort_preference })}>
                {EFFORT_PREFERENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Major / interests</span>
            <input style={inputStyle} placeholder="e.g. computer science, nursing, business" value={form.major_interests} onChange={(e) => setForm({ ...form, major_interests: e.target.value })} />
          </label>
        </ProductCard>

        {message && <p style={{ color: "#15885A", fontWeight: 600, marginBottom: 12 }}>{message}</p>}
        {error && <p style={{ color: "#C04E57", marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={saving} style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 13, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: 28 }}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>

      <ProductCard style={{ padding: 24, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>Account</h2>
        <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 16px" }}>Log out of AidPilot on this device.</p>
        <button type="button" onClick={() => logout()} style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 22px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Log out
        </button>
      </ProductCard>

      <ProductCard style={{ padding: 24, background: "#FFF5F5", border: "1px solid #FECACA" }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#991B1B" }}>Danger zone</h2>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
          Permanently delete your AidPilot account and user-owned data. This cannot be undone. AidPilot does not store SSNs or tax documents.
        </p>
        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)} style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", background: "#fff", border: "1.5px solid #FECACA", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>
            Request account deletion
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#991B1B", margin: "0 0 12px" }}>Are you sure? This deletes your profile, tasks, documents, scholarships, and reports.</p>
            {deleteError && <p style={{ color: "#C04E57", marginBottom: 12 }}>{deleteError}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => handleDeleteAccount()} disabled={deleting} style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#C04E57", border: "none", padding: "10px 18px", borderRadius: 12, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", background: "#fff", border: "1px solid #E5E7EB", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <p style={{ fontSize: 12, color: "#9AA4B2", margin: "14px 0 0" }}>
          You can also email <a href="mailto:privacy@aidpilot.app" style={{ color: "#0B5CAD" }}>privacy@aidpilot.app</a> to request deletion.
        </p>
      </ProductCard>

      <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        <Link href="/privacy" style={{ color: "#0B5CAD" }}>Privacy</Link> · <Link href="/disclaimer" style={{ color: "#0B5CAD" }}>Disclaimer</Link>
      </p>
    </AppShell>
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
        <ProductCard style={{ padding: 28, textAlign: "center" }}>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>Profile not found</h1>
          <p style={{ color: "#6B7280", margin: "0 0 16px" }}>Complete onboarding to set up your AidPilot profile.</p>
          <Link href="/onboarding" style={{ color: "#0B5CAD", fontWeight: 700 }}>Go to onboarding</Link>
        </ProductCard>
      </AppShell>
    );
  }

  return (
    <SettingsForm
      key={profile.updated_at ?? profile.id}
      profile={profile}
      updateProfile={updateProfile}
      logout={logout}
    />
  );
}
