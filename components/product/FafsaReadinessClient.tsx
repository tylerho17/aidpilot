"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Badge, Button, Card, ProgressBar, Select } from "@/components/ui";
import { money } from "@/components/app/screens/shared";
import { useUserData } from "@/hooks/useUserData";
import { FAFSA_DEMO_GUEST_USER_ID } from "@/lib/fafsa-demo-fallback";
import { isRecoverableWithLocalFallback, toFriendlyError } from "@/lib/friendly-errors";
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

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--ink-800)",
  marginBottom: 10,
};

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} style={labelStyle}>
      {children}
    </label>
  );
}

function PrivacyNote() {
  return (
    <p style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 20px", lineHeight: 1.6 }}>
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
      console.error("FAFSA readiness submit failed:", err);
      if (isRecoverableWithLocalFallback(err)) {
        routed = applyFafsaDemoFallback(form, userId);
      } else {
        setError(toFriendlyError(err, "We couldn't save your FAFSA plan. Please try again."));
      }
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
      <AppChrome>
        <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 500 }}>Loading FAFSA readiness wizard...</p>
      </AppChrome>
    );
  }

  return (
    <AppChrome>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Badge tone="blue">FAFSA Readiness</Badge>
          <h1
            className="font-display"
            style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.8px", margin: "14px 0 8px", color: "var(--ink-900)" }}
          >
            Build your FAFSA plan
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
            Answer a few questions so AidPilot can build a step-by-step plan. About 3 minutes.
          </p>
        </div>

        <Card variant="clay" padding={28}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-500)" }}>
                Step {step + 1} of {totalSteps}
              </span>
              <span style={{ ...money, fontSize: 20, color: "var(--blue-700)" }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} height={12} />
          </div>

          <PrivacyNote />

          {step === 0 && (
            <div>
              <FieldLabel htmlFor="q-aid-year">1. What aid year are you applying for?</FieldLabel>
              <Select
                id="q-aid-year"
                value={form.aid_year}
                onChange={(e) => updateField("aid_year", e.target.value)}
                options={AID_YEARS}
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <FieldLabel htmlFor="q-situation">2. What best describes you?</FieldLabel>
              <Select
                id="q-situation"
                value={form.student_situation}
                onChange={(e) => updateField("student_situation", e.target.value)}
                options={SITUATIONS}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <FieldLabel htmlFor="q-state">3. What state is your permanent home address in?</FieldLabel>
              <Select
                id="q-state"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                options={US_STATES}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <FieldLabel htmlFor="q-schools">4. What schools are you applying to or attending?</FieldLabel>
              <textarea
                id="q-schools"
                value={form.schools}
                onChange={(e) => updateField("schools", e.target.value)}
                rows={4}
                placeholder="e.g. UC Irvine, Cal State Long Beach"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border-default)",
                  padding: "13px 16px",
                  fontSize: 15,
                  fontFamily: "var(--font-body)",
                  color: "var(--ink-800)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <FieldLabel htmlFor="q-progress">5. Where are you with FAFSA?</FieldLabel>
              <Select
                id="q-progress"
                value={form.fafsa_progress}
                onChange={(e) => updateField("fafsa_progress", e.target.value)}
                options={FAFSA_PROGRESS}
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <FieldLabel htmlFor="q-saccount">6. Do you have a StudentAid.gov account?</FieldLabel>
              <Select
                id="q-saccount"
                value={form.has_student_aid_account}
                onChange={(e) => updateField("has_student_aid_account", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <FieldLabel htmlFor="q-contributor">7. Do you think FAFSA needs parent or contributor information?</FieldLabel>
              <Select
                id="q-contributor"
                value={form.contributor_required}
                onChange={(e) => updateField("contributor_required", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {step === 7 && (
            <div>
              <FieldLabel htmlFor="q-parent-account">
                8. Does your parent or contributor have their own StudentAid.gov account?
              </FieldLabel>
              <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "-4px 0 12px" }}>
                {needsParent
                  ? "Many students need a contributor to finish FAFSA."
                  : "You indicated contributor info may not be required - you can still answer for planning."}
              </p>
              <Select
                id="q-parent-account"
                value={form.parent_has_student_aid_account}
                onChange={(e) => updateField("parent_has_student_aid_account", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {step === 8 && (
            <div>
              <FieldLabel htmlFor="q-tax">9. Do you have access to tax or financial info if FAFSA asks for it?</FieldLabel>
              <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "-4px 0 12px" }}>
                AidPilot only tracks whether you can access this information - not the actual numbers.
              </p>
              <Select
                id="q-tax"
                value={form.has_tax_info}
                onChange={(e) => updateField("has_tax_info", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {step === 9 && (
            <div>
              <FieldLabel htmlFor="q-offer">10. Have you received a financial aid offer yet?</FieldLabel>
              <Select
                id="q-offer"
                value={form.has_aid_offer}
                onChange={(e) => updateField("has_aid_offer", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {step === 10 && (
            <div>
              <FieldLabel htmlFor="q-verification">11. Has your school asked for verification documents?</FieldLabel>
              <Select
                id="q-verification"
                value={form.has_verification_request}
                onChange={(e) => updateField("has_verification_request", e.target.value)}
                options={YES_NO_NOT_SURE}
              />
            </div>
          )}

          {error && (
            <p style={{ color: "var(--coral-600)", fontSize: 14, fontWeight: 600, marginTop: 16 }}>{error}</p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 28 }}>
            <Button
              variant="secondary"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
            >
              Back
            </Button>
            {step < totalSteps - 1 ? (
              <Button variant="clay" iconRight="arrow-right" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button variant="clay" onClick={() => void handleSubmit()} disabled={submitting} loading={submitting}>
                {submitting ? "Building plan..." : "Build my FAFSA plan"}
              </Button>
            )}
          </div>
        </Card>

        <p style={{ marginTop: 20, fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", textAlign: "center" }}>
          <Link href="/fafsa" style={{ color: "var(--blue-700)", textDecoration: "none", fontWeight: 700 }}>
            Back to FAFSA plan
          </Link>
        </p>
      </div>
    </AppChrome>
  );
}
