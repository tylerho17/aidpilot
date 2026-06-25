"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaneSVG, ProgressBar } from "@/components/ProductUI";
import { createClient } from "@/lib/supabase/client";
import { seedUserData } from "@/lib/seed";
import type { OnboardingFormData, School } from "@/lib/types";

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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
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
  });

  const totalSteps = 4;
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
        setForm((prev) => ({
          ...prev,
          first_name: profile.first_name ?? prev.first_name,
          email: profile.email ?? prev.email,
          school: profile.school ?? prev.school,
          year: profile.year ?? prev.year,
          state: profile.state ?? prev.state,
          student_type: profile.student_type ?? prev.student_type,
          fafsa_status: profile.fafsa_status ?? prev.fafsa_status,
          aid_types: profile.aid_types ?? prev.aid_types,
          main_goals: profile.main_goals ?? prev.main_goals,
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
      ? [...schools.map((s) => ({ label: s.name, value: s.name })), { label: "Other", value: "Other" }]
      : SCHOOL_FALLBACK;

  const resolvedSchool =
    form.school === "Other" ? manualSchool.trim() : form.school;

  function toggleArray(field: "aid_types" | "main_goals", value: string) {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!resolvedSchool) {
      setError("Please select or enter your school.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: profileError } = await supabase.from("student_profiles").upsert({
      id: userId,
      first_name: form.first_name,
      email: form.email,
      school: resolvedSchool,
      year: form.year,
      state: form.state,
      student_type: form.student_type,
      fafsa_status: form.fafsa_status,
      aid_types: form.aid_types,
      main_goals: form.main_goals,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      setError(profileError.message);
      setSubmitting(false);
      return;
    }

    try {
      await seedUserData(supabase, userId, { schoolName: resolvedSchool });
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "Could not set up your aid plan.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkingAuth) {
    return <div style={{ minHeight: "100vh", background: "#F4F8FE" }} />;
  }

  if (!userId) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F4F8FE 0%,#EAFBF1 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, textAlign: "center", background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #E9EDF2", boxShadow: "0 24px 48px -20px rgba(11,92,173,.18)" }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>Let&apos;s build your aid check-in</h1>
          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6, margin: "0 0 24px" }}>
            Create a free account to save your aid plan, checklist, and scholarship matches.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none" }}>Create account</Link>
            <Link href="/login" style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "12px 22px", borderRadius: 13, textDecoration: "none" }}>Log in</Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 13 }}>
            <Link href="/dashboard" style={{ color: "#9AA4B2", textDecoration: "underline" }}>Or view the demo dashboard</Link>
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = { width: "100%", borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F4F8FE 0%,#EAFBF1 100%)", fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
      <div style={{ padding: "18px 40px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "#0B5CAD", alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={18} color="#fff" />
          </span>
          <span className="font-display" style={{ fontSize: 20, fontWeight: 900 }}>
            <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "0 auto", padding: "24px 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 16, background: "#EAF3FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <PlaneSVG size={24} color="#0B5CAD" />
          </div>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>
            Let&apos;s build your aid check-in.
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Answer a few quick questions so AidPilot can protect your aid and find scholarships that fit you.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#9AA4B2" }}>
            <span>Step {step + 1} of {totalSteps}</span>
            <span style={{ color: "#0B5CAD" }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #E9EDF2", borderRadius: 24, padding: "28px 24px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {step === 0 && (
            <>
              <input required style={inputStyle} placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <input required type="email" style={inputStyle} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <select required style={inputStyle} value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}>
                {schoolOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {form.school === "Other" && (
                <input
                  required
                  style={inputStyle}
                  placeholder="Enter your school name"
                  value={manualSchool}
                  onChange={(e) => setManualSchool(e.target.value)}
                />
              )}
              {!schoolsLoaded && (
                <p style={{ fontSize: 12, color: "#9AA4B2", margin: 0 }}>Loading schools...</p>
              )}
              {schoolsLoaded && schools.length === 0 && (
                <p style={{ fontSize: 12, color: "#9AA4B2", margin: 0 }}>
                  School list unavailable. Choose Other and enter your school.
                </p>
              )}
              <select required style={inputStyle} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}

          {step === 1 && (
            <>
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
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#15212E", margin: 0 }}>Do you currently receive financial aid?</p>
              {AID_OPTIONS.map((o) => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "#374151" }}>
                  <input type="checkbox" checked={form.aid_types.includes(o)} onChange={() => toggleArray("aid_types", o)} />
                  {o}
                </label>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#15212E", margin: 0 }}>What do you want help with most?</p>
              {GOAL_OPTIONS.map((o) => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "#374151" }}>
                  <input type="checkbox" checked={form.main_goals.includes(o)} onChange={() => toggleArray("main_goals", o)} />
                  {o}
                </label>
              ))}
              <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6, margin: "8px 0 0" }}>
                AidPilot is an organizational and educational tool, not official financial aid advice. We never collect FAFSA logins, SSNs, or tax documents.
              </p>
            </>
          )}
        </div>

        {error && <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 12 }}>{error}</p>}

        {step < totalSteps - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} style={{ width: "100%", padding: "15px 24px", borderRadius: 14, background: "#0B5CAD", color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Continue
          </button>
        ) : (
          <button type="submit" disabled={submitting} style={{ width: "100%", padding: "15px 24px", borderRadius: 14, background: submitting ? "#E5E7EB" : "#0B5CAD", color: submitting ? "#9AA4B2" : "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {submitting ? "Setting up your plan..." : "Continue to dashboard"}
          </button>
        )}

        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9AA4B2", cursor: "pointer", fontFamily: "inherit" }}>
            Back
          </button>
        )}
      </form>
    </div>
  );
}
