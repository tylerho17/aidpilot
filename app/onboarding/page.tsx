"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

// metadata can't be used from "use client", but we export it for build compat
// (Next.js 16 allows this pattern in client pages via a separate metadata file)

const PlaneSVG = ({ size = 22, color = "#0B5CAD" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

const CheckSVG = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

// ── step data ──────────────────────────────────────────────────────────────────

interface Step {
  question: string;
  sub: string;
  options: { label: string; value: string }[];
  multi?: boolean;
}

const STEPS: Step[] = [
  {
    question: "What school do you attend?",
    sub: "We use this to match aid and scholarships to your campus.",
    options: [
      { label: "UC Irvine",        value: "uci" },
      { label: "UCLA",             value: "ucla" },
      { label: "Cal State Long Beach", value: "csulb" },
      { label: "Other",            value: "other" },
    ],
  },
  {
    question: "What year are you?",
    sub: "Your year helps us know which aid steps apply to you right now.",
    options: [
      { label: "High school senior", value: "hs" },
      { label: "Freshman",           value: "freshman" },
      { label: "Sophomore",          value: "sophomore" },
      { label: "Junior or Senior",   value: "upper" },
    ],
  },
  {
    question: "Have you completed your FAFSA this year?",
    sub: "This tells us where you are in the aid timeline.",
    options: [
      { label: "Yes, submitted",             value: "yes" },
      { label: "Yes, submitted and verified", value: "verified" },
      { label: "Not yet",                    value: "no" },
      { label: "I am not sure",              value: "unsure" },
    ],
  },
  {
    question: "Do you currently receive financial aid?",
    sub: "Select everything that applies.",
    multi: true,
    options: [
      { label: "Cal Grant",    value: "cal" },
      { label: "Pell Grant",   value: "pell" },
      { label: "Work-study",   value: "ws" },
      { label: "Loans",        value: "loans" },
      { label: "I am not sure", value: "unsure" },
    ],
  },
  {
    question: "What do you want help with most?",
    sub: "We will personalize your weekly check-in around your priorities.",
    multi: true,
    options: [
      { label: "Protect my aid",         value: "protect" },
      { label: "Catch deadlines",        value: "deadlines" },
      { label: "Upload documents",       value: "docs" },
      { label: "Understand my offer",    value: "offers" },
      { label: "Find scholarships",      value: "scholarships" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  const current = STEPS[step];
  const selected = answers[step] ?? [];
  const total = STEPS.length;
  const pct = Math.round(((step) / total) * 100);

  function toggle(value: string) {
    const prev = answers[step] ?? [];
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

      {/* top bar */}
      <div style={{ padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: "#0B5CAD", boxShadow: "0 4px 12px rgba(11,92,173,.22)", alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={18} color="#fff" />
          </span>
          <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-.3px" }}>
            <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Skip for now</Link>
      </div>

      {/* content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px 64px" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 16, background: "#EAF3FF", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 20px rgba(11,92,173,.14)" }}>
              <PlaneSVG size={24} />
            </div>
            <h1 style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 10px", color: "#15212E", lineHeight: 1.1 }}>
              {step === 0 ? "Let's build your aid check-in." : current.question}
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
              {step === 0 ? "Answer a few quick questions so AidPilot can protect your aid and find scholarships that fit you." : current.sub}
            </p>
          </div>

          {/* progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9AA4B2" }}>Step {step + 1} of {total}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0B5CAD" }}>{pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "#E9EEF3", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#0B5CAD,#3E86D6)", width: `${pct}%`, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
            </div>
          </div>

          {/* card */}
          <div style={{ background: "#fff", border: "1px solid #E9EDF2", borderRadius: 24, boxShadow: "0 24px 48px -20px rgba(11,92,173,.18)", padding: "32px 28px", marginBottom: 20 }}>
            {step === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "🛡️", text: "Protect your financial aid automatically" },
                  { icon: "📅", text: "Catch every deadline before it's too late" },
                  { icon: "⭐", text: "Find scholarships matched to you every week" },
                  { icon: "✅", text: "One calm check-in, five minutes a week" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#15212E" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#15212E", margin: "0 0 6px" }}>{current.question}</p>
                {current.options.map((opt) => {
                  const on = selected.includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => toggle(opt.value)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 14, border: "1.5px solid " + (on ? "#0B5CAD" : "#E5E7EB"), background: on ? "#EAF3FF" : "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s ease" }}>
                      <span style={{ display: "flex", width: 22, height: 22, borderRadius: current.multi ? 7 : "50%", border: "1.5px solid " + (on ? "#0B5CAD" : "#D1D5DB"), background: on ? "#0B5CAD" : "#fff", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s ease" }}>
                        {on && <CheckSVG />}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: on ? "#0B5CAD" : "#374151" }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
          <button onClick={next} disabled={step > 0 && !canContinue} style={{ width: "100%", padding: "15px 24px", borderRadius: 14, background: step > 0 && !canContinue ? "#E5E7EB" : "#0B5CAD", color: step > 0 && !canContinue ? "#9AA4B2" : "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: step > 0 && !canContinue ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: step > 0 && !canContinue ? "none" : "0 10px 24px rgba(11,92,173,.26)", transition: "all .2s ease" }}>
            {step === 0 ? "Let's get started" : step === total - 1 ? "Continue to dashboard" : "Continue"}
          </button>

          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", fontSize: 14, fontWeight: 600, color: "#9AA4B2", cursor: "pointer", fontFamily: "inherit" }}>
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
