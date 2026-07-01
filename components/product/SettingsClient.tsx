"use client";

import Link from "next/link";
import { Component, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageContentSkeleton } from "@/components/ProductUI";
import { SectionCard } from "@/components/ui/SectionCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton, SecondaryButton, SecondaryButtonLink } from "@/components/ui";
import { H2, Body, BodyStrong, Label } from "@/components/ui/Typography";
import { useUserData } from "@/hooks/useUserData";
import { parseScholarshipPreferences } from "@/lib/scholarship-preferences";
import {
  ACADEMIC_YEAR_OPTIONS,
  AID_STAGE_OPTIONS,
  HOUSING_STATUS_OPTIONS,
} from "@/lib/onboarding-aid-stage";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { buttons, colors, formFieldStyle, formLabelStyle, layout, text } from "@/lib/design-tokens";
import type { StudentProfile } from "@/lib/types";

type ProfileForm = {
  first_name: string;
  school: string;
  year: string;
  state: string;
  academic_year: string;
  housing_status: string;
  aid_stage: string;
  aid_goal: string;
};

function profileToForm(profile: StudentProfile | null, email: string): ProfileForm {
  const prefs = parseScholarshipPreferences(profile?.scholarship_preferences);
  return {
    first_name: getProfileFullName(profile) || email.split("@")[0] || "",
    school: getProfileSchoolName(profile) || "",
    year: getProfileEducationLevel(profile) || "Sophomore",
    state: profile?.state?.trim() || "",
    academic_year: prefs.academic_year || "2026-2027",
    housing_status: prefs.housing_status || "not_sure",
    aid_stage: prefs.aid_stage || "waiting_for_offer",
    aid_goal: prefs.aid_goal || profile?.main_goals?.[0] || "",
  };
}

function SettingsContent({
  email,
  form,
  setForm,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onLogout,
}: {
  email: string;
  form: ProfileForm;
  setForm: (next: ProfileForm) => void;
  saving: boolean;
  saveError: string;
  saveSuccess: boolean;
  onSave: (e: FormEvent) => void;
  onLogout: () => Promise<void>;
}) {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your AidPilot account and profile." />

      {saveError ? (
        <SectionCard style={{ marginBottom: layout.sectionGap, background: colors.softCoral }}>
          <Body style={{ color: colors.coral }}>{saveError}</Body>
        </SectionCard>
      ) : null}

      {saveSuccess ? (
        <SectionCard style={{ marginBottom: layout.sectionGap, background: colors.softGreen }}>
          <Body style={{ color: colors.green }}>Profile saved.</Body>
        </SectionCard>
      ) : null}

      <SectionCard style={{ marginBottom: layout.sectionGap }}>
        <H2 style={{ marginBottom: layout.stackGapXs }}>Account</H2>
        <Label style={{ display: "block", marginBottom: 4 }}>Signed in as</Label>
        <BodyStrong style={{ marginBottom: layout.stackGap }}>{email || "your account"}</BodyStrong>
        <SecondaryButton onClick={() => void onLogout()}>Log out</SecondaryButton>
      </SectionCard>

      <SectionCard style={{ marginBottom: layout.sectionGap }}>
        <H2 style={{ marginBottom: layout.stackGap }}>Profile</H2>
        <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: layout.stackGap }}>
          <label>
            <span style={formLabelStyle}>Full name</span>
            <input
              required
              style={formFieldStyle}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </label>
          <label>
            <span style={formLabelStyle}>School</span>
            <input
              required
              style={formFieldStyle}
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
            />
          </label>
          <label>
            <span style={formLabelStyle}>Class year</span>
            <input style={formFieldStyle} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </label>
          <label>
            <span style={formLabelStyle}>Academic year</span>
            <select style={formFieldStyle} value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}>
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span style={formLabelStyle}>State</span>
            <input style={formFieldStyle} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>
          <label>
            <span style={formLabelStyle}>Housing status</span>
            <select style={formFieldStyle} value={form.housing_status} onChange={(e) => setForm({ ...form, housing_status: e.target.value })}>
              {HOUSING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span style={formLabelStyle}>Aid process stage</span>
            <select style={formFieldStyle} value={form.aid_stage} onChange={(e) => setForm({ ...form, aid_stage: e.target.value })}>
              {AID_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span style={formLabelStyle}>Aid goal (optional)</span>
            <input style={formFieldStyle} value={form.aid_goal} onChange={(e) => setForm({ ...form, aid_goal: e.target.value })} />
          </label>
          <PrimaryButton type="submit" disabled={saving} style={{ alignSelf: "flex-start", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save profile"}
          </PrimaryButton>
        </form>
      </SectionCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: buttons.gap, alignItems: "center" }}>
        <SecondaryButtonLink href="/dashboard">Back to dashboard</SecondaryButtonLink>
        <Link href="/privacy" style={{ ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}>
          Privacy
        </Link>
        <Link href="/disclaimer" style={{ ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}>
          Disclaimer
        </Link>
      </div>
    </>
  );
}

class SettingsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Settings render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppShell>
          <SectionCard>
            <H2 style={{ marginBottom: layout.stackGapXs }}>Settings</H2>
            <Body style={{ marginBottom: layout.stackGap }}>
              Something went wrong loading settings. You can still use the dashboard.
            </Body>
            <SecondaryButtonLink href="/dashboard">Back to dashboard</SecondaryButtonLink>
          </SectionCard>
        </AppShell>
      );
    }
    return this.props.children;
  }
}

function SettingsClientInner() {
  const router = useRouter();
  const { user, profile, authReady, loading, updateProfile, logout } = useUserData();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  useEffect(() => {
    if (!authReady) return;
    if (!user) router.replace("/login");
  }, [authReady, user, router]);

  async function handleSave(e: FormEvent, form: ProfileForm) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const existingPrefs = parseScholarshipPreferences(profile?.scholarship_preferences);
      await updateProfile({
        first_name: form.first_name.trim(),
        school: form.school.trim(),
        year: form.year.trim(),
        state: form.state.trim() || null,
        main_goals: form.aid_goal.trim() ? [form.aid_goal.trim()] : profile?.main_goals ?? [],
        scholarship_preferences: {
          ...existingPrefs,
          academic_year: form.academic_year,
          housing_status: form.housing_status,
          aid_stage: form.aid_stage,
          aid_goal: form.aid_goal.trim() || undefined,
          state_preference: form.state.trim() || undefined,
        },
      });
      setSaveSuccess(true);
      setFormVersion((v) => v + 1);
    } catch (err) {
      console.error("Settings save failed:", err);
      setSaveError(err instanceof Error ? err.message : "We couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!authReady || loading) {
    return (
      <AppShell>
        <PageContentSkeleton message="Loading settings..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SettingsFormPanel
          key={`${profile?.updated_at ?? "new"}-${formVersion}`}
          email={user?.email ?? ""}
          profile={profile}
          saving={saving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onSave={handleSave}
          onLogout={logout}
        />
    </AppShell>
  );
}

function SettingsFormPanel({
  email,
  profile,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onLogout,
}: {
  email: string;
  profile: StudentProfile | null;
  saving: boolean;
  saveError: string;
  saveSuccess: boolean;
  onSave: (e: FormEvent, form: ProfileForm) => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [form, setForm] = useState(() => profileToForm(profile, email));

  return (
    <SettingsContent
      email={email}
      form={form}
      setForm={setForm}
      saving={saving}
      saveError={saveError}
      saveSuccess={saveSuccess}
      onSave={(e) => void onSave(e, form)}
      onLogout={onLogout}
    />
  );
}

export default function SettingsClient() {
  return (
    <SettingsErrorBoundary>
      <SettingsClientInner />
    </SettingsErrorBoundary>
  );
}
