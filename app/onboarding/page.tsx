"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  Card,
  Checkbox,
  IconTile,
  Logo,
  OptionCard,
  ProgressBar,
  Select,
  SegmentedControl,
  TextField,
} from "@/components/ui";
import {
  EFFORT_PREFERENCE_OPTIONS,
  ESSAY_PREFERENCE_OPTIONS,
  SCHOLARSHIP_CATEGORY_OPTIONS,
  parseScholarshipPreferences,
} from "@/lib/scholarship-preferences";
import { joinCommaSeparated, parseCommaSeparated } from "@/lib/data-helpers";
import {
  PROFILE_OPTIONAL_SAVE_NOTICE_KEY,
  PROFILE_OPTIONAL_SAVE_NOTICE_MESSAGE,
  saveOnboardingProfile,
} from "@/lib/onboarding-profile";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { useLanguage } from "@/lib/i18n";
import { ONBOARDING_STRINGS, optionLabel } from "./strings";
import type { OnboardingFormData, School } from "@/lib/types";

const PROFILE_ESSAY_OPTIONS = [
  { value: "any", label: "Any (essays okay)" },
  { value: "prefer_no_essay", label: "Prefer no essay" },
  { value: "okay_with_essay", label: "Okay with essays" },
];

const SCHOOL_FALLBACK = [
  { label: "UC Irvine", value: "UC Irvine" },
  { label: "UCLA", value: "UCLA" },
  { label: "UC Berkeley", value: "UC Berkeley" },
  { label: "Cal State Long Beach", value: "Cal State Long Beach" },
  { label: "Santa Monica College", value: "Santa Monica College" },
  { label: "Other", value: "Other" },
];

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Transfer", "Graduate"];
const STUDENT_TYPES = ["High school student", "College student", "Parent", "Counselor"];
const FAFSA_OPTIONS = ["Yes", "Not yet", "I am not sure"];
const AID_OPTIONS = ["Cal Grant", "Pell Grant", "Work-study", "Loans", "I am not sure"];
const GOAL_OPTIONS = ["Protect my aid", "Catch deadlines", "Upload documents", "Understand my offer", "Find scholarships"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { lang, setLang, t } = useLanguage();
  const L = t(ONBOARDING_STRINGS);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [manualSchool, setManualSchool] = useState("");
  const [form, setForm] = useState<OnboardingFormData>({
    first_name: "",
    email: "",
    school: "UC Irvine",
    year: "Sophomore",
    state: "",
    student_type: "College student",
    fafsa_status: "Yes",
    aid_types: [],
    main_goals: [],
    interested_categories: [],
    essay_preference: "no_preference",
    effort_preference: "any",
    major_interests: "",
    school_id: null,
    majors: [],
    interests: [],
    first_generation: false,
    transfer_student: false,
    pell_grant_eligible: false,
    cal_grant_eligible: false,
    gpa: "",
    profile_essay_preference: "any",
  });

  const totalSteps = 7; // language first, then the six profile steps
  const pct = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckingAuth(false);
        return;
      }

      setUserId(user.id);
      setForm((prev) => ({
        ...prev,
        first_name: (user.user_metadata?.first_name as string) ?? prev.first_name,
        email: user.email ?? prev.email,
      }));

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_onboarded) {
        router.replace("/dashboard");
        return;
      }

      if (profile) {
        const prefs = parseScholarshipPreferences(profile.scholarship_preferences);
        setForm((prev) => ({
          ...prev,
          first_name: getProfileFullName(profile) || prev.first_name,
          email: profile.email ?? prev.email,
          school: getProfileSchoolName(profile) || prev.school,
          year: getProfileEducationLevel(profile) ?? prev.year,
          state: profile.state ?? prev.state,
          student_type: profile.student_type ?? prev.student_type,
          fafsa_status: profile.fafsa_status ?? prev.fafsa_status,
          aid_types: profile.aid_types ?? prev.aid_types,
          main_goals: profile.main_goals ?? prev.main_goals,
          interested_categories: prefs.interested_categories ?? prev.interested_categories,
          essay_preference: prefs.essay_preference ?? prev.essay_preference,
          effort_preference: prefs.effort_preference ?? prev.effort_preference,
          major_interests: prefs.major_interests ?? prev.major_interests,
          school_id: profile.school_id ?? prev.school_id,
          majors: profile.majors ?? prev.majors,
          interests: profile.interests ?? prev.interests,
          first_generation: profile.first_generation ?? prev.first_generation,
          transfer_student: profile.transfer_student ?? prev.transfer_student,
          pell_grant_eligible: profile.pell_grant_eligible ?? prev.pell_grant_eligible,
          cal_grant_eligible: profile.cal_grant_eligible ?? prev.cal_grant_eligible,
          gpa: profile.gpa != null ? String(profile.gpa) : prev.gpa,
          profile_essay_preference: profile.essay_preference ?? prev.profile_essay_preference,
        }));
      }

      setCheckingAuth(false);
    }
    init();
  }, [router, supabase]);

  useEffect(() => {
    async function loadSchools() {
      const { data } = await supabase.from("schools").select("*").order("name");
      if (data?.length) {
        setSchools(data as School[]);
      }
      setSchoolsLoaded(true);
    }
    loadSchools();
  }, [supabase]);

  const schoolOptions =
    schools.length > 0
      ? [...schools.map((s) => ({ label: s.name, value: s.name })), { label: L.labels.other, value: "Other" }]
      : SCHOOL_FALLBACK.map((o) => (o.value === "Other" ? { ...o, label: L.labels.other } : o));

  const resolvedSchool =
    form.school === "Other" ? manualSchool.trim() : form.school;

  function toggleArray(field: "aid_types" | "main_goals" | "interested_categories", value: string) {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!resolvedSchool) {
      setError(L.errors.schoolRequired);
      return;
    }

    if (form.main_goals.length === 0) {
      setError(L.errors.goalRequired);
      return;
    }

    setIsSubmitting(true);
    setError("");

    let redirected = false;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(L.errors.verifyFailed);
      }

      if (!user) {
        setError(L.errors.loginAgain);
        router.replace("/login");
        return;
      }

      const matchedSchool = schools.find((s) => s.name === resolvedSchool);
      const { optionalFieldsSkipped } = await saveOnboardingProfile(supabase, {
        userId: user.id,
        form,
        resolvedSchool,
        matchedSchool,
      });

      if (optionalFieldsSkipped) {
        sessionStorage.setItem(PROFILE_OPTIONAL_SAVE_NOTICE_KEY, PROFILE_OPTIONAL_SAVE_NOTICE_MESSAGE);
      }

      redirected = true;
      router.replace("/dashboard");
    } catch (err) {
      console.error("Onboarding submit failed:", err);
      setError(err instanceof Error ? err.message : L.errors.generic);
    } finally {
      if (!redirected) {
        setIsSubmitting(false);
      }
    }
  }

  if (checkingAuth) {
    return <div style={{ minHeight: "100vh", background: "var(--surface-app)" }} />;
  }

  if (!userId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--gradient-auth)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "var(--font-body)",
        }}
      >
        <Card
          variant="clay"
          padding="36px 32px"
          style={{ maxWidth: 480, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
        >
          <IconTile icon="shield-check" tone="blue" size={56} />
          <div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: "var(--ink-800)" }}>
              Let&apos;s build your aid check-in
            </h1>
            <p style={{ fontSize: 16, color: "var(--gray-500)", lineHeight: 1.6, margin: 0 }}>
              Create a free account to save your aid plan, checklist, and scholarship matches.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <Button variant="clay">Create account</Button>
            </Link>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Log in</Button>
            </Link>
          </div>
          <Link href="/" style={{ fontSize: 13, color: "var(--gray-400)", textDecoration: "underline" }}>
            Back to home
          </Link>
        </Card>
      </div>
    );
  }

  const heading = L.headings[step];

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        background: "var(--gradient-auth)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ padding: "18px 40px" }}>
        <Link href="/" aria-label="AidPilot home" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          <Logo variant="full" size={30} />
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 640, margin: "0 auto", padding: "12px 24px 120px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <IconTile icon="plane" tone="blue" size={54} style={{ marginBottom: 16 }} />
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", color: "var(--ink-800)" }}>
            {heading.title}
          </h1>
          <p style={{ fontSize: 15, color: "var(--gray-500)", margin: "0 auto", maxWidth: 520, lineHeight: 1.6 }}>
            {heading.subtitle}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--gray-400)" }}>
            <span>{L.ui.step} {step + 1} {L.ui.of} {totalSteps}</span>
            <span style={{ color: "var(--blue-700)", fontWeight: 700 }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
        </div>

        <Card
          key={step}
          className="page-enter"
          variant="clay"
          padding="28px 24px"
          style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 16 }}
        >
          {step === 0 && (
            <>
              <OptionCard
                title={L.ui.languageEnglish}
                description={L.ui.languageEnglishSub}
                selected={lang === "en"}
                onClick={() => setLang("en")}
              />
              <OptionCard
                title={L.ui.languageSpanish}
                description={L.ui.languageSpanishSub}
                selected={lang === "es"}
                onClick={() => setLang("es")}
              />
            </>
          )}

          {step === 1 && (
            <>
              <TextField
                required
                label={L.fields.firstName}
                placeholder={L.fields.firstName}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
              <TextField
                required
                type="email"
                label={L.fields.email}
                placeholder={L.fields.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Select
                required
                label={L.fields.school}
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
                options={schoolOptions}
              />
              {form.school === "Other" && (
                <TextField
                  required
                  label={L.fields.schoolName}
                  placeholder={L.fields.schoolNamePlaceholder}
                  value={manualSchool}
                  onChange={(e) => setManualSchool(e.target.value)}
                />
              )}
              {!schoolsLoaded && (
                <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>{L.ui.loadingSchools}</p>
              )}
              {schoolsLoaded && schools.length === 0 && (
                <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>
                  {L.ui.schoolListUnavailable}
                </p>
              )}
              <Select
                required
                label={L.fields.year}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                options={YEAR_OPTIONS.map((v) => ({ value: v, label: optionLabel(L.labels.year, v) }))}
              />
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                required
                label={L.fields.state}
                placeholder={L.fields.state}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Select
                required
                label={L.fields.studentType}
                value={form.student_type}
                onChange={(e) => setForm({ ...form, student_type: e.target.value })}
                options={STUDENT_TYPES.map((v) => ({ value: v, label: optionLabel(L.labels.studentType, v) }))}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>{L.fields.fafsaQuestion}</span>
                <SegmentedControl
                  options={FAFSA_OPTIONS.map((v) => ({ value: v, label: optionLabel(L.labels.fafsa, v) }))}
                  value={form.fafsa_status}
                  onChange={(value) => setForm({ ...form, fafsa_status: value })}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{L.fields.aidQuestion}</span>
              {AID_OPTIONS.map((o) => (
                <OptionCard
                  key={o}
                  title={optionLabel(L.labels.aid, o)}
                  selected={form.aid_types.includes(o)}
                  onClick={() => toggleArray("aid_types", o)}
                />
              ))}
            </>
          )}

          {step === 4 && (
            <>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{L.fields.goalsQuestion}</span>
              {GOAL_OPTIONS.map((o) => (
                <OptionCard
                  key={o}
                  title={optionLabel(L.labels.goal, o)}
                  selected={form.main_goals.includes(o)}
                  onClick={() => toggleArray("main_goals", o)}
                />
              ))}
              <p style={{ fontSize: 12, color: "var(--gray-400)", lineHeight: 1.6, margin: "4px 0 0" }}>
                {L.ui.trustCopy}
              </p>
            </>
          )}

          {step === 5 && (
            <>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{L.fields.scholarshipInterests}</span>
              {SCHOLARSHIP_CATEGORY_OPTIONS.map((o) => (
                <OptionCard
                  key={o}
                  title={optionLabel(L.labels.category, o)}
                  selected={form.interested_categories.includes(o)}
                  onClick={() => toggleArray("interested_categories", o)}
                />
              ))}
              <Select
                label={L.fields.essayPreference}
                value={form.essay_preference}
                onChange={(e) => setForm({ ...form, essay_preference: e.target.value })}
                options={ESSAY_PREFERENCE_OPTIONS.map((o) => ({ value: o.value, label: L.labels.essayPref[o.value] ?? o.label }))}
              />
              <Select
                label={L.fields.effortPreference}
                value={form.effort_preference}
                onChange={(e) => setForm({ ...form, effort_preference: e.target.value })}
                options={EFFORT_PREFERENCE_OPTIONS.map((o) => ({ value: o.value, label: L.labels.effortPref[o.value] ?? o.label }))}
              />
            </>
          )}

          {step === 6 && (
            <>
              <TextField
                label={L.fields.majors}
                placeholder={L.fields.majorsPlaceholder}
                value={joinCommaSeparated(form.majors)}
                onChange={(e) => setForm({ ...form, majors: parseCommaSeparated(e.target.value) })}
              />
              <TextField
                label={L.fields.interests}
                placeholder={L.fields.interestsPlaceholder}
                value={joinCommaSeparated(form.interests)}
                onChange={(e) => setForm({ ...form, interests: parseCommaSeparated(e.target.value) })}
              />
              <TextField
                label={L.fields.gpa}
                type="number"
                min={0}
                max={4}
                step={0.01}
                placeholder="3.50"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
              />
              <Select
                label={L.fields.essayPreference}
                value={form.profile_essay_preference}
                onChange={(e) => setForm({ ...form, profile_essay_preference: e.target.value })}
                options={PROFILE_ESSAY_OPTIONS.map((o) => ({ value: o.value, label: L.labels.profileEssay[o.value] ?? o.label }))}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 2 }}>
                <Checkbox
                  label={L.fields.firstGeneration}
                  checked={form.first_generation}
                  onChange={(e) => setForm({ ...form, first_generation: e.target.checked })}
                />
                <Checkbox
                  label={L.fields.transferStudent}
                  checked={form.transfer_student}
                  onChange={(e) => setForm({ ...form, transfer_student: e.target.checked })}
                />
                <Checkbox
                  label={L.fields.pellEligible}
                  checked={form.pell_grant_eligible}
                  onChange={(e) => setForm({ ...form, pell_grant_eligible: e.target.checked })}
                />
                <Checkbox
                  label={L.fields.calGrantEligible}
                  checked={form.cal_grant_eligible}
                  onChange={(e) => setForm({ ...form, cal_grant_eligible: e.target.checked })}
                />
              </div>
            </>
          )}
        </Card>

        {error && (
          <p style={{ color: "var(--coral-600)", fontSize: 14, marginBottom: 12, lineHeight: 1.5, fontWeight: 600 }}>
            {error}
          </p>
        )}

        {step < totalSteps - 1 ? (
          <Button type="button" variant="clay" fullWidth size="lg" onClick={() => setStep((s) => s + 1)}>
            {L.ui.continue}
          </Button>
        ) : (
          <Button type="submit" variant="clay" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? L.ui.settingUp : L.ui.continueToDashboard}
          </Button>
        )}

        {step > 0 && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Button type="button" variant="ghost" iconLeft="chevron-left" onClick={() => setStep((s) => s - 1)}>
              {L.ui.back}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
