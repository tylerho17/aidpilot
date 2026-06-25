"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlaneSVG, ProgressBar } from "@/components/ProductUI";

const CheckSVG = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

interface Step {
  question: string;
  sub: string;
  options: { label: string; value: string }[];
  multi?: boolean;
  defaultValue?: string;
}

const STEPS: Step[] = [
  {
    question: "What school do you attend?",
    sub: "We use this to match aid and scholarships to your campus.",
    defaultValue: "uci",
    options: [
      { label: "UC Irvine", value: "uci" },
      { label: "UCLA", value: "ucla" },
      { label: "Cal State Long Beach", value: "csulb" },
      { label: "Other", value: "other" },
    ],
  },
  {
    question: "What year are you?",
    sub: "Your year helps us know which aid steps apply to you right now.",
    defaultValue: "sophomore",
    options: [
      { label: "Freshman", value: "freshman" },
      { label: "Sophomore", value: "sophomore" },
      { label: "Junior", value: "junior" },
      { label: "Senior", value: "senior" },
      { label: "Transfer", value: "transfer" },
      { label: "Graduate", value: "graduate" },
    ],
  },
  {
    question: "Have you completed FAFSA this year?",
    sub: "This tells us where you are in the aid timeline.",
    options: [
      { label: "Yes", value: "yes" },
      { label: "Not yet", value: "no" },
      { label: "I am not sure", value: "unsure" },
    ],
  },
  {
    question: "Do you currently receive financial aid?",
    sub: "Select everything that applies.",
    multi: true,
    options: [
      { label: "Cal Grant", value: "cal" },
      { label: "Pell Grant", value: "pell" },
      { label: "Work-study", value: "ws" },
      { label: "Loans", value: "loans" },
      { label: "I am not sure", value: "unsure" },
    ],
  },
  {
    question: "What do you want help with most?",
    sub: "We will personalize your weekly check-in around your priorities.",
    multi: true,
    options: [
      { label: "Protect my aid", value: "protect" },
      { label: "Catch deadlines", value: "deadlines" },
      { label: "Upload documents", value: "docs" },
      { label: "Understand my offer", value: "offers" },
      { label: "Find scholarships", value: "scholarships" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>(() => {
    const initial: Record<number, string[]> = {};
    STEPS.forEach((s, i) => {
      if (s.defaultValue) initial[i] = [s.defaultValue];
    });
    return initial;
  });

  const current = STEPS[step];
  const selected = answers[step] ?? (current.defaultValue ? [current.defaultValue] : []);
  const total = STEPS.length;
  const pct = Math.round((step / total) * 100);

  function toggle(value: string) {
    const prev = answers[step] ?? (current.defaultValue ? [current.defaultValue] : []);
    if (current.multi) {
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      setAnswers((a) => ({ ...a, [step]: next }));
    } else {
      setAnswers((a) => ({ ...a, [step]: [value] }));
    }
  }

  function next() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      router.push("/dashboard");
    }
  }

  const canContinue = selected.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F4F8FE 0%,#EAFBF1 100%)", fontFamily: "var(--font-hanken), system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "#0B5CAD", boxShadow: "0 4px 12px rgba(11,92,173,.22)", alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={18} color="#fff" />
          </span>
          <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-.3px" }}>
            <span style={{ color: "#1F2937" }}>Aid</span>
            <span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </Link>
        <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>
          Skip for now
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 16, background: "#EAF3FF", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 20px rgba(11,92,173,.14)" }}>
              <PlaneSVG size={24} color="#0B5CAD" />
            </div>
            <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
              {step === 0 ? "Let's build your aid check-in." : current.question}
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
              {step === 0
                ? "Answer a few quick questions so AidPilot can protect your aid and find scholarships that fit you."
                : current.sub}
            </p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9AA4B2" }}>
                Step {step + 1} of {total}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0B5CAD" }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>

          <div style={{ background: "#fff", border: "1px solid #E9EDF2", borderRadius: 24, boxShadow: "0 24px 48px -20px rgba(11,92,173,.18)", padding: "32px 28px", marginBottom: 20 }}>
            {step === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#15212E", margin: "0 0 4px" }}>{STEPS[0].question}</p>
                {STEPS[0].options.map((opt) => {
                  const on = (answers[0] ?? ["uci"]).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        borderRadius: 14,
                        border: "1.5px solid " + (on ? "#0B5CAD" : "#E5E7EB"),
                        background: on ? "#EAF3FF" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        transition: "all .15s ease",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "1.5px solid " + (on ? "#0B5CAD" : "#D1D5DB"),
                          background: on ? "#0B5CAD" : "#fff",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {on && <CheckSVG />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: on ? "#0B5CAD" : "#374151" }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#15212E", margin: "0 0 6px" }}>{current.question}</p>
                {current.options.map((opt) => {
                  const on = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        borderRadius: 14,
                        border: "1.5px solid " + (on ? "#0B5CAD" : "#E5E7EB"),
                        background: on ? "#EAF3FF" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                        transition: "all .15s ease",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          width: 22,
                          height: 22,
                          borderRadius: current.multi ? 7 : "50%",
                          border: "1.5px solid " + (on ? "#0B5CAD" : "#D1D5DB"),
                          background: on ? "#0B5CAD" : "#fff",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {on && <CheckSVG />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: on ? "#0B5CAD" : "#374151" }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            style={{
              width: "100%",
              padding: "15px 24px",
              borderRadius: 14,
              background: !canContinue ? "#E5E7EB" : "#0B5CAD",
              color: !canContinue ? "#9AA4B2" : "#fff",
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: !canContinue ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: !canContinue ? "none" : "0 10px 24px rgba(11,92,173,.26)",
            }}
          >
            {step === total - 1 ? "Continue to dashboard" : "Continue"}
          </button>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9AA4B2", cursor: "pointer", fontFamily: "inherit" }}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
