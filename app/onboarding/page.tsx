"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaneSVG, ProgressBar } from "@/components/ProductUI";
import { createClient } from "@/lib/supabase/client";
import {
  ACADEMIC_YEAR_OPTIONS,
  AID_STAGE_OPTIONS,
  HOUSING_STATUS_OPTIONS,
  type AidStage,
} from "@/lib/onboarding-aid-stage";
import { saveOnboardingProfile } from "@/lib/onboarding-profile";
import { parseScholarshipPreferences } from "@/lib/scholarship-preferences";
import { getProfileFullName, getProfileSchoolName, getProfileEducationLevel } from "@/lib/profile-fields";
import { SectionCard } from "@/components/ui/SectionCard";
import { PrimaryButton, PrimaryButtonLink, SecondaryButtonLink } from "@/components/ui";
import { H1, Body } from "@/components/ui/Typography";
import { cardBase, colors, formFieldStyle, formLabelStyle, layout, radius, text } from "@/lib/design-tokens";
import type { OnboardingFormData, School, StudentProfile } from "@/lib/types";

const SCHOOL_FALLBACK = [
  { label: "UC Irvine", value: "UC Irvine" },
  { label: "UCLA", value: "UCLA" },
  { label: "UC Berkeley", value: "UC Berkeley" },
  { label: "Cal State Long Beach", value: "Cal State Long Beach" },
  { label: "Santa Monica College", value: "Santa Monica College" },
  { label: "Other", value: "Other" },
];

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Transfer", "Graduate"];

function emptyForm(email = ""): OnboardingFormData {
  return {
    first_name: "",
    email,
    school: "UC Irvine",
    school_id: null,
    year: "Sophomore",
    state: "",
    student_type: "College student",
    fafsa_status: "Not yet",
    aid_types: [],
    main_goals: [],
    interested_categories: [],
    essay_preference: "no_preference",
    effort_preference: "any",
    major_interests: "",
    majors: [],
    interests: [],
    first_generation: false,
    transfer_student: false,
    pell_grant_eligible: false,
    cal_grant_eligible: false,
    gpa: "",
    profile_essay_preference: "any",
    academic_year: "2026-2027",
    aid_stage: "waiting_for_offer",
    housing_status: "not_sure",
    aid_goal: "",
    first_aid_offer_school: "",
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [manualSchool, setManualSchool] = useState("");
  const [form, setForm] = useState<OnboardingFormData>(() => emptyForm());

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Onboarding auth check failed:", authError);
        }

        if (!user) {
          if (!cancelled) setCheckingAuth(false);
          return;
        }

        if (!cancelled) {
          setUserId(user.id);
          setForm((prev) => ({
            ...prev,
            first_name: (user.user_metadata?.first_name as string) ?? prev.first_name,
            email: user.email ?? prev.email,
          }));
        }

        const { data: profile, error: profileError } = await supabase
          .from("student_profiles")
          .select("first_name, email, school, year, state, student_type, fafsa_status, aid_types, main_goals, is_onboarded, scholarship_preferences")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Onboarding profile load failed:", profileError);
        }

        if (profile?.is_onboarded) {
          router.replace("/dashboard");
          return;
        }

        if (profile && !cancelled) {
          const row = profile as Partial<StudentProfile>;
          const prefs = parseScholarshipPreferences(row.scholarship_preferences);
          setForm((prev) => ({
            ...prev,
            first_name: getProfileFullName(row) || row.first_name?.trim() || prev.first_name,
            email: row.email ?? prev.email,
            school: getProfileSchoolName(row) || prev.school,
            year: getProfileEducationLevel(row) ?? prev.year,
            state: row.state ?? prev.state,
            student_type: row.student_type ?? prev.student_type,
            fafsa_status: row.fafsa_status ?? prev.fafsa_status,
            aid_types: row.aid_types ?? prev.aid_types,
            main_goals: row.main_goals ?? prev.main_goals,
            academic_year: prefs.academic_year ?? prev.academic_year,
            aid_stage: prefs.aid_stage ?? prev.aid_stage,
            housing_status: prefs.housing_status ?? prev.housing_status,
            aid_goal: prefs.aid_goal ?? prev.aid_goal,
          }));
        }
      } catch (err) {
        console.error("Onboarding init failed:", err);
        if (!cancelled) {
          setError("We couldn't load your account. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    async function loadSchools() {
      try {
        const { data, error: schoolsError } = await supabase.from("schools").select("*").order("name");
        if (schoolsError) {
          console.error("School list load failed:", schoolsError);
          return;
        }
        if (data?.length) setSchools(data as School[]);
      } catch (err) {
        console.error("School list load failed:", err);
      }
    }
    void loadSchools();
  }, [supabase]);

  const schoolOptions =
    schools.length > 0
      ? [...schools.map((s) => ({ label: s.name, value: s.name })), { label: "Other", value: "Other" }]
      : SCHOOL_FALLBACK;

  const resolvedSchool = form.school === "Other" ? manualSchool.trim() : form.school;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const fullName = form.first_name.trim();
    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!resolvedSchool) {
      setError("Please select or enter your school.");
      return;
    }
    if (!form.academic_year) {
      setError("Please select your academic year.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error("We couldn't verify your account. Please log in again.");
      }
      if (!user) {
        setError("Please log in again to finish onboarding.");
        router.replace("/login");
        return;
      }

      const matchedSchool = schools.find((s) => s.name === resolvedSchool);
      const aidStage = (form.aid_stage || "waiting_for_offer") as AidStage;
      const formPayload: OnboardingFormData = {
        ...form,
        first_name: fullName,
        aid_stage: aidStage,
        main_goals: form.aid_goal.trim() ? [form.aid_goal.trim()] : [],
      };

      await saveOnboardingProfile(supabase, {
        userId: user.id,
        form: formPayload,
        resolvedSchool,
        matchedSchool,
      });

      router.replace("/dashboard");
    } catch (err) {
      console.error("Onboarding submit failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (checkingAuth) {
    return <div style={{ minHeight: "100vh", background: colors.background }} />;
  }

  if (!userId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.softGreen} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            ...cardBase,
            padding: layout.cardPaddingLarge,
          }}
        >
          <H1 style={{ marginBottom: layout.stackGapSm }}>Let&apos;s build your aid check-in</H1>
          <Body style={{ marginBottom: layout.sectionGap }}>
            Create a free account to save your aid plan, checklist, and scholarship matches.
          </Body>
          <div style={{ display: "flex", gap: layout.stackGapSm, justifyContent: "center", flexWrap: "wrap" }}>
            <PrimaryButtonLink href="/signup">Create account</PrimaryButtonLink>
            <SecondaryButtonLink href="/login">Log in</SecondaryButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.softGreen} 100%)` }}>
      <div style={{ padding: `${layout.pagePaddingMobile}px ${layout.pagePaddingDesktop}px` }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: layout.stackGapSm, textDecoration: "none" }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: radius.button, background: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={18} color="#fff" />
          </span>
          <span style={{ ...text.h3 }}>AidPilot</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
      <div className="app-page-container" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: layout.sectionGap }}>
          <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: radius.card, background: colors.softBlue, alignItems: "center", justifyContent: "center", marginBottom: layout.stackGap }}>
            <PlaneSVG size={24} color={colors.primary} />
          </div>
          <H1 style={{ marginBottom: layout.stackGapSm }}>Set up your aid plan</H1>
          <Body>A few quick answers so AidPilot knows what to show first.</Body>
        </div>

        <div style={{ marginBottom: layout.sectionGap }}>
          <ProgressBar pct={100} />
        </div>

        <SectionCard style={{ marginBottom: layout.stackGap }}>
          <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGap }}>
          <label>
            <span style={formLabelStyle}>Full name</span>
            <input
              required
              style={formFieldStyle}
              placeholder="Maya Chen"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </label>

          <label>
            <span style={formLabelStyle}>School</span>
            <select required style={formFieldStyle} value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}>
              {schoolOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {form.school === "Other" ? (
            <label>
              <span style={formLabelStyle}>School name</span>
              <input
                required
                style={formFieldStyle}
                placeholder="Enter your school"
                value={manualSchool}
                onChange={(e) => setManualSchool(e.target.value)}
              />
            </label>
          ) : null}

          <label>
            <span style={formLabelStyle}>Class year</span>
            <select required style={formFieldStyle} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={formLabelStyle}>Academic year</span>
            <select required style={formFieldStyle} value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}>
              {ACADEMIC_YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={formLabelStyle}>State</span>
            <input style={formFieldStyle} placeholder="California" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>

          <label>
            <span style={formLabelStyle}>Housing status</span>
            <select required style={formFieldStyle} value={form.housing_status} onChange={(e) => setForm({ ...form, housing_status: e.target.value })}>
              {HOUSING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={formLabelStyle}>Where are you in your aid process?</span>
            <select required style={formFieldStyle} value={form.aid_stage} onChange={(e) => setForm({ ...form, aid_stage: e.target.value })}>
              {AID_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={formLabelStyle}>Aid goal (optional)</span>
            <input
              style={formFieldStyle}
              placeholder="e.g. Compare offers and close my gap"
              value={form.aid_goal}
              onChange={(e) => setForm({ ...form, aid_goal: e.target.value })}
            />
          </label>
          </div>
        </SectionCard>

        {error ? (
          <Body style={{ color: colors.coral, marginBottom: layout.stackGapSm }}>{error}</Body>
        ) : null}

        <PrimaryButton
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Saving your profile..." : "Continue to dashboard"}
        </PrimaryButton>
      </div>
    </form>
    </div>
  );
}
