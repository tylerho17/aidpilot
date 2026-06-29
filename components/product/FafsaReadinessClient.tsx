"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProductCard, ProgressBar } from "@/components/ProductUI";
import { useUserData } from "@/hooks/useUserData";
import { FAFSA_DEMO_GUEST_USER_ID } from "@/lib/fafsa-demo-fallback";
import type { FafsaIntakeFormData } from "@/lib/types";

const AID_YEARS = ["2025-26", "2026-27", "2027-28"];
const SITUATIONS = [
  "Applying to college",
  "Enrolled in college",
  "Transferring colleges",
  "Returning to college",
  "Graduate student",
  "Trade or vocational school",
];
const FAFSA_PROGRESS = [
  { value: "not_started", label: "Not started" },
  { value: "started", label: "Started but not submitted" },
  { value: "submitted", label: "Submitted" },
  { value: "processed", label: "Processed" },
  { value: "action_required", label: "Action required" },
  { value: "not_sure", label: "Not sure" },
];
const YES_NO_NOT_SURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
  "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 15,
  fontWeight: 500,
  borderRadius: 12,
  border: "1.5px solid #E5E7EB",
  padding: "12px 14px",
  fontFamily: "inherit",
  color: "#15212E",
  background: "#fff",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  color: "#15212E",
  marginBottom: 8,
};

function PrivacyNote() {
  return (
    <p style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
      AidPilot tracks readiness only. Do not enter SSNs, passwords, bank account numbers, or tax return values here.
    </p>
  );
}

export default function FafsaReadinessClient() {
  const router = useRouter();
  const { loading, profile, user, saveFafsaIntakeAndGeneratePlan, applyFafsaDemoFallback } = useUserData();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FafsaIntakeFormData>({
    aid_year: "2025-26",
    student_situation: "Applying to college",
    state: profile?.state ?? "CA",
    schools: profile?.school ?? "",
    fafsa_progress: "not_started",
    has_student_aid_account: "not_sure",
    contributor_required: "not_sure",
    parent_has_student_aid_account: "not_sure",
    has_tax_info: "not_sure",
    has_school_portal_access: "not_sure",
    has_aid_offer: "no",
    has_verification_request: "not_sure",
  });

  const totalSteps = 11;
  const pct = Math.round((step / totalSteps) * 100);
  const needsParent = form.contributor_required === "yes" || form.contributor_required === "not_sure";

  function updateField<K extends keyof FafsaIntakeFormData>(key: K, value: FafsaIntakeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const userId = user?.id ?? FAFSA_DEMO_GUEST_USER_ID;
    let routed = false;

    try {
      const result = await saveFafsaIntakeAndGeneratePlan(form);
      if (result.demoMode || result.planTasks.length > 0) {
        routed = true;
      } else {
        console.error("FAFSA save returned no plan tasks, applying client local fallback");
        routed = applyFafsaDemoFallback(form, userId);
      }
      if (result.demoMode) {
        console.error("FAFSA plan saved in demo mode (localStorage fallback)");
      } else if (result.planError) {
        console.error("FAFSA plan generation failed after intake saved:", result.planError);
      }
    } catch (err) {
      console.error("FAFSA readiness submit failed, applying client local fallback:", err);
      routed = applyFafsaDemoFallback(form, userId);
    }

    if (routed) {
      router.push("/fafsa");
    } else {
      setError(
        "This browser could not save your FAFSA plan locally. Try disabling private browsing or use a different browser."
      );
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <AppShell>
        <p style={{ color: "#9AA4B2" }}>Loading FAFSA readiness wizard...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <PillBadge tone="blue">FAFSA Readiness</PillBadge>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.8px", margin: "12px 0 8px", color: "#15212E" }}>
            Build your FAFSA plan
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Answer a few questions so AidPilot can build a step-by-step plan. About 3 minutes.
          </p>
        </div>

        <ProductCard style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>Step {step + 1} of {totalSteps}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD" }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>

          <PrivacyNote />

          {step === 0 && (
            <div>
              <label style={labelStyle}>1. What aid year are you applying for?</label>
              <select value={form.aid_year} onChange={(e) => updateField("aid_year", e.target.value)} style={inputStyle}>
                {AID_YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {step === 1 && (
            <div>
              <label style={labelStyle}>2. What best describes you?</label>
              <select value={form.student_situation} onChange={(e) => updateField("student_situation", e.target.value)} style={inputStyle}>
                {SITUATIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <label style={labelStyle}>3. What state is your permanent home address in?</label>
              <select value={form.state} onChange={(e) => updateField("state", e.target.value)} style={inputStyle}>
                {US_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          )}

          {step === 3 && (
            <div>
              <label style={labelStyle}>4. What schools are you applying to or attending?</label>
              <textarea
                value={form.schools}
                onChange={(e) => updateField("schools", e.target.value)}
                rows={4}
                placeholder="e.g. UC Irvine, Cal State Long Beach"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <label style={labelStyle}>5. Where are you with FAFSA?</label>
              <select value={form.fafsa_progress} onChange={(e) => updateField("fafsa_progress", e.target.value)} style={inputStyle}>
                {FAFSA_PROGRESS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 5 && (
            <div>
              <label style={labelStyle}>6. Do you have a StudentAid.gov account?</label>
              <select value={form.has_student_aid_account} onChange={(e) => updateField("has_student_aid_account", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 6 && (
            <div>
              <label style={labelStyle}>7. Do you think FAFSA needs parent or contributor information?</label>
              <select value={form.contributor_required} onChange={(e) => updateField("contributor_required", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 7 && (
            <div>
              <label style={labelStyle}>8. Does your parent or contributor have their own StudentAid.gov account?</label>
              <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 12px" }}>
                {needsParent ? "Many students need a contributor to finish FAFSA." : "You indicated contributor info may not be required — you can still answer for planning."}
              </p>
              <select value={form.parent_has_student_aid_account} onChange={(e) => updateField("parent_has_student_aid_account", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 8 && (
            <div>
              <label style={labelStyle}>9. Do you have access to tax or financial info if FAFSA asks for it?</label>
              <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 12px" }}>
                AidPilot only tracks whether you can access this information — not the actual numbers.
              </p>
              <select value={form.has_tax_info} onChange={(e) => updateField("has_tax_info", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 9 && (
            <div>
              <label style={labelStyle}>10. Have you received a financial aid offer yet?</label>
              <select value={form.has_aid_offer} onChange={(e) => updateField("has_aid_offer", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {step === 10 && (
            <div>
              <label style={labelStyle}>11. Has your school asked for verification documents?</label>
              <select value={form.has_verification_request} onChange={(e) => updateField("has_verification_request", e.target.value)} style={inputStyle}>
                {YES_NO_NOT_SURE.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p style={{ color: "#C04E57", fontSize: 14, marginTop: 16 }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", border: "none", padding: "12px 18px", borderRadius: 12, cursor: step === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: step === 0 ? 0.5 : 1 }}
            >
              Back
            </button>
            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: "#0B5CAD", border: "none", padding: "12px 22px", borderRadius: 12, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Building plan..." : "Build my FAFSA plan"}
              </button>
            )}
          </div>
        </ProductCard>

        <p style={{ marginTop: 20, fontSize: 12, color: "#9AA4B2", textAlign: "center" }}>
          <Link href="/fafsa" style={{ color: "#0B5CAD", textDecoration: "none" }}>Back to FAFSA plan</Link>
        </p>
      </div>
    </AppShell>
  );
}
