"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── icons (inline SVG helpers) ───────────────────────────────────────────────

const PlaneSVG = ({ size = 20, color = "#fff", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11.5 21 3l-7 18-3.2-7.3L3 11.5Z" />
  </svg>
);

const CheckSVG = ({ size = 13, color = "#fff", strokeWidth = 3.2 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 13 10 18 19 6" />
  </svg>
);

const ShieldSVG = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#15885A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.4-3 6.8-7 8-4-1.2-7-3.6-7-8V6l7-3Z" />
    <polyline points="9 12 11 14 15 9.5" />
  </svg>
);

const CalendarSVG = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 9h18M8 3v4M16 3v4" />
    <path d="M9 14l2 2 4-4" />
  </svg>
);

const StarSVG = ({ size = 26, color = "#0B5CAD" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.4 5.3L20 9l-4 4 1 6-5-2.8L7 19l1-6-4-4 5.6-.7L12 3Z" />
  </svg>
);

const ArrowSVG = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// ─── marquee chips data ────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  { label: "Stanford", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="2" fill="#8B0000"/><text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff" fontFamily="system-ui">S</text></svg> },
  { label: "UCLA", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#2E5090"/><text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="system-ui">UCLA</text></svg> },
  { label: "Ohio State", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#C60C30"/><text x="16" y="20" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#fff" fontFamily="system-ui">OSU</text></svg> },
  { label: "University of Miami", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="3" fill="#F77F00"/><text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff" fontFamily="system-ui">UM</text></svg> },
  { label: "UT Austin", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="2" fill="#BF5700"/><text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="system-ui">UT</text></svg> },
  { label: "NYU", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="2" fill="#57068C"/><text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff" fontFamily="system-ui">NYU</text></svg> },
  { label: "UC Irvine", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#0066CC"/><text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff" fontFamily="system-ui">UCI</text></svg> },
  { label: "FAFSA", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="4" y="6" width="24" height="20" rx="1" fill="#0066CC"/><text x="16" y="19" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff" fontFamily="system-ui">FAFSA</text></svg> },
  { label: "Pell Grant", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><path d="M16 4 L22 10 L16 16 L10 10 Z" fill="#28A745"/></svg> },
  { label: "Cal Grant", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="#CE1126"/><text x="16" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff" fontFamily="system-ui">CAL</text></svg> },
  { label: "CSS Profile", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="5" y="7" width="22" height="16" rx="1" fill="#1E90FF"/></svg> },
  { label: "CA Dream Act", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><path d="M16 3 L24 7 L24 18 Q16 25 16 25 Q8 18 8 7 Z" fill="#FFA500"/></svg> },
  { label: "All colleges", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><path d="M4 20 L16 8 L28 20" stroke="#555" strokeWidth="2" fill="none"/><rect x="10" y="18" width="4" height="6" fill="#555"/><rect x="18" y="18" width="4" height="6" fill="#555"/></svg> },
  { label: "Financial aid offices", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><rect x="6" y="6" width="20" height="20" rx="2" fill="#696969"/></svg> },
  { label: "Scholarship databases", icon: <svg width={32} height={32} viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" fill="none" stroke="#0B5CAD" strokeWidth="2"/></svg> },
];

// ─── demo switcher data ────────────────────────────────────────────────────────

type DemoKey = "protect" | "deadlines" | "docs" | "scholarships" | "offers";
type Tone = "green" | "amber" | "coral" | "blue";

interface DemoEntry {
  label: string;
  status: string;
  tone: Tone;
  headline: string;
  sub: string;
  metric: string;
  metricSub: string;
}

const DEMO_ORDER: DemoKey[] = ["protect", "deadlines", "docs", "scholarships", "offers"];

const DEMO_DATA: Record<DemoKey, DemoEntry> = {
  protect:      { label: "Protect aid",       status: "Protected",    tone: "green", headline: "Your aid is protected this week.",            sub: "AidPilot watches your eligibility, enrollment, and aid requirements so surprises do not cost you money.", metric: "$18,400", metricSub: "aid secured this year" },
  deadlines:    { label: "Catch deadlines",   status: "On track",     tone: "amber", headline: "Every deadline is caught early.",              sub: "AidPilot catches FAFSA, Cal Grant, school, and document deadlines before they become problems.", metric: "8 days",   metricSub: "until Cal Grant renewal" },
  docs:         { label: "Upload docs",       status: "1 to upload",  tone: "coral", headline: "Documents become simple next steps.",          sub: "AidPilot turns document requests into a simple upload checklist with clear due dates.", metric: "1 doc",    metricSub: "left to verify" },
  scholarships: { label: "Find scholarships", status: "12 new",       tone: "blue",  headline: "We found money for you this week.",            sub: "AidPilot finds scholarships that match your background, school, interests, and deadlines.", metric: "$24,500",  metricSub: "in potential awards" },
  offers:       { label: "Understand offers", status: "Explained",    tone: "blue",  headline: "Understand your aid offer in plain language.", sub: "AidPilot explains grants, loans, work-study, and net cost so you know what you are actually paying.", metric: "$4,200",   metricSub: "your real out-of-pocket" },
};

const TONE_PAL: Record<Tone, { bg: string; fg: string; panel: string; border: string }> = {
  green: { bg: "#EAFBF1", fg: "#15885A", panel: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "#D5F0E2" },
  amber: { bg: "#FFF7E6", fg: "#B7791F", panel: "linear-gradient(135deg,#FFF7E6,#FFFBF0)", border: "#F2E6C8" },
  coral: { bg: "#FFE4E6", fg: "#C04E57", panel: "linear-gradient(135deg,#FFE4E6,#FFF1F2)", border: "#F4D2D6" },
  blue:  { bg: "#EAF3FF", fg: "#0B5CAD", panel: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "#D7E7FB" },
};

// ─── checklist task data ───────────────────────────────────────────────────────

type TaskTone = "blue" | "amber" | "coral";

interface Task {
  id: string;
  title: string;
  sub: string;
  done: boolean;
  pendingBadge: string;
  tone: TaskTone;
}

const INITIAL_TASKS: Task[] = [
  { id: "fafsa", title: "Submit your FAFSA",          sub: "Federal aid application",       done: true,  pendingBadge: "To do",         tone: "blue" },
  { id: "id",    title: "Verify your identity",        sub: "Quick photo of your ID",        done: true,  pendingBadge: "To do",         tone: "blue" },
  { id: "tax",   title: "Upload your 2024 tax return", sub: "Needed for verification",       done: false, pendingBadge: "Needs upload",  tone: "coral" },
  { id: "cal",   title: "Accept your Cal Grant award", sub: "One tap to lock it in",         done: false, pendingBadge: "To do",         tone: "amber" },
];

const BADGE_PAL: Record<"done" | TaskTone, { bg: string; fg: string }> = {
  done:  { bg: "#EAFBF1", fg: "#15885A" },
  blue:  { bg: "#EAF3FF", fg: "#0B5CAD" },
  amber: { bg: "#FFF7E6", fg: "#B7791F" },
  coral: { bg: "#FFE4E6", fg: "#C04E57" },
};

// ─── main component ────────────────────────────────────────────────────────────

export default function Home() {
  // waitlist form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentType, setStudentType] = useState("");
  const [state, setState] = useState("");
  const [biggestPain, setBiggestPain] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // demo switcher state
  const [activeDemo, setActiveDemo] = useState<DemoKey>("protect");

  // checklist state
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("loading");
    setMessage("");

    const { error } = await supabase.from("waitlist").insert({
      email,
      first_name: firstName,
      student_type: studentType,
      state,
      biggest_pain: biggestPain,
    });

    if (error) {
      console.error(error);
      if (error.code === "23505") {
        setMessage("You are already on the waitlist.");
      } else {
        setMessage("Something went wrong. Try again.");
      }
      setFormStatus("error");
      return;
    }

    setFormStatus("success");
    setMessage("You are on the waitlist. We will reach out with early access.");
    setEmail(""); setFirstName(""); setStudentType(""); setState(""); setBiggestPain("");
  }

  function toggleTask(id: string) {
    setTasks((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, done: !t.done } : t);
      const nowDone = next.find((t) => t.id === id)!.done;
      if (nowDone) {
        setJustCompleted(id);
        setTimeout(() => setJustCompleted(null), 2600);
      } else {
        setJustCompleted(null);
      }
      return next;
    });
  }

  // checklist derived values
  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const allDone = done === tasks.length;
  let coachMsg: string;
  let coachColor: string;
  if (allDone) { coachMsg = "Every task done. You're fully protected, Maya."; coachColor = "#15885A"; }
  else if (justCompleted) { coachMsg = "Nice work, Maya. One less thing to worry about."; coachColor = "#15885A"; }
  else if (done === 0) { coachMsg = "Tap a task to check it off."; coachColor = "#9AA4B2"; }
  else { coachMsg = `You're doing great, ${tasks.length - done} to go.`; coachColor = "#0B5CAD"; }

  // demo derived values
  const d = DEMO_DATA[activeDemo];
  const dp = TONE_PAL[d.tone];

  return (
    <div style={{ overflowX: "hidden", fontFamily: "var(--font-hanken), system-ui, sans-serif", background: "#F9FAFB", color: "#1F2937" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 200, display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "16px 40px", background: "rgba(255,255,255,.86)", backdropFilter: "blur(14px)", borderBottom: "1px solid #EAECEF" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 12, background: "#0B5CAD", boxShadow: "0 6px 16px rgba(11,92,173,.26)" }}>
            <PlaneSVG size={20} />
          </span>
          <span className="font-display" style={{ fontSize: 23, fontWeight: 900, letterSpacing: "-.5px" }}>
            <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexShrink: 0, whiteSpace: "nowrap" }}>
          <a href="#protect" style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>How it works</a>
          <a href="#checkin" style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Your week</a>
          <a href="#scholarships" style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Scholarships</a>
          <Link href="/dashboard" style={{ fontSize: 15, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Demo</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, whiteSpace: "nowrap" }}>
          <Link href="/dashboard" style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", textDecoration: "none" }}>View demo</Link>
          <a href="#waitlist" style={{ whiteSpace: "nowrap", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "11px 20px", borderRadius: 999, boxShadow: "0 8px 18px rgba(11,92,173,.24)", textDecoration: "none" }}>Get started free</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{ position: "relative", background: "linear-gradient(180deg,#FFFFFF 0%,#F4F8FE 100%)", padding: "96px 48px 110px" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.04fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 24 }}>
              <span style={{ display: "inline-flex", width: 24, height: 24, borderRadius: 8, background: "#EAF3FF", alignItems: "center", justifyContent: "center" }}>
                <PlaneSVG size={14} color="#0B5CAD" strokeWidth={2.2} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", letterSpacing: ".2px" }}>AidPilot for students</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 60, lineHeight: 1.03, fontWeight: 900, letterSpacing: "-1.8px", margin: "0 0 22px", color: "#15212E" }}>
              <span style={{ whiteSpace: "nowrap" }}>Financial aid,</span><br />
              <span style={{ whiteSpace: "nowrap" }}>finally <span style={{ color: "#0B5CAD" }}>on your side.</span></span>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: "#5B6573", fontWeight: 500, margin: "0 0 34px", maxWidth: 430 }}>
              Your calm coach for college money. AidPilot protects your aid, catches every deadline, and finds scholarships for you with one quiet check-in a week.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
              <a href="#waitlist" style={{ fontSize: 17, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "16px 30px", borderRadius: 14, boxShadow: "0 14px 28px rgba(11,92,173,.28)", textDecoration: "none" }}>Get started free</a>
              <a href="#checkin" style={{ fontSize: 17, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "16px 26px", borderRadius: 14, textDecoration: "none" }}>See a check-in</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap", fontSize: 14, fontWeight: 600, color: "#9AA4B2" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckSVG size={14} color="#15885A" strokeWidth={3} />Free for students</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
              <span>No credit card</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#CBD2DA" }} />
              <span>Two-minute setup</span>
            </div>
          </div>

          {/* hero graphic */}
          <div style={{ position: "relative", width: 480, maxWidth: "100%", height: 600, margin: "0 auto" }}>
            <div className="animate-floaty-slow" style={{ position: "absolute", top: 30, right: -20, width: 300, height: 300, borderRadius: "56% 44% 50% 50%/50% 52% 48% 50%", background: "#EAF3FF", zIndex: 0 }} />
            <div className="animate-floaty2-slow" style={{ position: "absolute", bottom: 40, left: -24, width: 220, height: 220, borderRadius: "48% 52% 56% 44%/52% 46% 54% 48%", background: "#EAFBF1", zIndex: 0 }} />

            <svg viewBox="0 0 480 600" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} fill="none">
              <path d="M62 64 C 150 120, 250 70, 300 150 C 350 230, 120 250, 150 350 C 175 432, 360 380, 300 470" stroke="#A9C7EE" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 11" style={{ animation: "dash 1.6s linear infinite" }} />
            </svg>

            {/* plane */}
            <div className="animate-floaty" style={{ position: "absolute", top: 34, left: 30, zIndex: 6, display: "flex", width: 50, height: 50, borderRadius: 15, background: "#0B5CAD", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 30px rgba(11,92,173,.34)" }}>
              <PlaneSVG size={25} />
            </div>

            {/* deadline caught */}
            <div className="animate-floaty2" style={{ position: "absolute", top: 54, right: 6, zIndex: 5, display: "flex", alignItems: "center", gap: 9, background: "#fff", border: "1px solid #F0E6CC", borderRadius: 14, boxShadow: "0 14px 28px -12px rgba(183,121,31,.22)", padding: "10px 14px" }}>
              <span style={{ display: "flex", width: 28, height: 28, borderRadius: 9, background: "#FFF7E6", alignItems: "center", justifyContent: "center" }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#15212E" }}>Deadline caught</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Cal Grant · 8 days</div>
              </div>
            </div>

            {/* protected card */}
            <div style={{ position: "absolute", top: 150, left: 26, width: 278, zIndex: 4, background: "#fff", border: "1px solid #EAEEF3", borderRadius: 22, boxShadow: "0 34px 64px -22px rgba(11,92,173,.30)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ display: "flex", width: 32, height: 32, borderRadius: "50%", background: "#EAF3FF", color: "#0B5CAD", fontWeight: 800, fontSize: 12, alignItems: "center", justifyContent: "center" }}>MC</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15212E", lineHeight: 1 }}>Maya Chen</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "#9AA4B2", marginTop: 2 }}>Sophomore · UC Irvine</div>
                  </div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#9AA4B2" }}>Mon, Jul 7</span>
              </div>
              <div style={{ background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                  <span style={{ display: "flex", width: 22, height: 22, borderRadius: "50%", background: "#15885A", alignItems: "center", justifyContent: "center" }}>
                    <CheckSVG size={13} strokeWidth={2.4} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#15885A", textTransform: "uppercase", letterSpacing: ".5px" }}>Protected this week</span>
                </div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E", lineHeight: 1.25 }}>Good morning, Maya. Your aid is protected.</div>
              </div>
            </div>

            {/* document alert */}
            <div className="animate-floaty" style={{ position: "absolute", top: 338, left: 0, zIndex: 5, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #F4D2D6", borderRadius: 14, boxShadow: "0 16px 30px -12px rgba(192,78,87,.22)", padding: "11px 14px" }}>
              <span style={{ display: "flex", width: 30, height: 30, borderRadius: 9, background: "#FFE4E6", alignItems: "center", justifyContent: "center" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C04E57" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M12 15V4M8 8l4-4 4 4"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#15212E" }}>1 document to upload</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#C58088" }}>Avoids an aid delay</div>
              </div>
            </div>

            {/* checklist progress */}
            <div className="animate-floaty2" style={{ position: "absolute", top: 300, right: 0, width: 182, zIndex: 4, background: "#fff", border: "1px solid #EAEEF3", borderRadius: 18, boxShadow: "0 22px 40px -18px rgba(11,92,173,.24)", padding: 15 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#15212E" }}>Aid checklist</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD" }}>70%</span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: "#E9EEF3", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#0B5CAD,#3E86D6)", width: "70%" }} />
              </div>
            </div>

            {/* scholarship match */}
            <div style={{ position: "absolute", top: 444, left: 54, width: 300, zIndex: 5, background: "#fff", border: "1px solid #EAEEF3", borderRadius: 20, boxShadow: "0 30px 56px -22px rgba(11,92,173,.30)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", width: 40, height: 40, borderRadius: 12, background: "#EAF3FF", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <StarSVG size={21} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#15212E" }}>12 scholarships found</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>this week, matched to you</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0F2F5" }}>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15885A" }}>$24,500</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", padding: "6px 12px", borderRadius: 999 }}>in potential</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <section style={{ background: "#fff", padding: "66px 0 60px", borderBottom: "1px solid #EAECEF", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto 32px", padding: "0 48px", textAlign: "center" }}>
          <h2 className="font-display" style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.7px", color: "#15212E", margin: "0 0 10px" }}>Built for students across campuses and aid systems.</h2>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0 }}>AidPilot works across the messy financial aid world, so you don&apos;t have to.</p>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 110, zIndex: 2, background: "linear-gradient(90deg,#fff,rgba(255,255,255,0))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 110, zIndex: 2, background: "linear-gradient(270deg,#fff,rgba(255,255,255,0))", pointerEvents: "none" }} />
          <div className="animate-marquee" style={{ display: "flex", width: "max-content", gap: 12 }}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "8px 12px", gap: 8, fontSize: 13, fontWeight: 600, color: "#6B7280", boxShadow: "0 2px 6px rgba(31,41,55,.04)" }}>
                {item.icon}<span>{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROTECT : 3-up ── */}
      <section id="protect" style={{ background: "#fff", padding: "104px 48px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 640, margin: "0 0 60px" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#15885A", textTransform: "uppercase", letterSpacing: "1.2px" }}>What AidPilot watches over</span>
            <h2 className="font-display" style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1px", margin: "14px 0 0", color: "#15212E", lineHeight: 1.1 }}>Three things AidPilot watches so you don&apos;t have to.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 44 }}>
            <div>
              <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#EAFBF1", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><ShieldSVG /></span>
              <h3 className="font-display" style={{ fontSize: 21, fontWeight: 800, margin: "0 0 8px", color: "#15212E" }}>Your aid, protected</h3>
              <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>We quietly watch for anything that could put your aid at risk, and tell you early, gently, in plain language.</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, fontSize: 12.5, fontWeight: 800, padding: "7px 13px", borderRadius: 999, background: "#EAFBF1", color: "#15885A" }}>Protected this week</span>
            </div>
            <div>
              <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#FFF7E6", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><CalendarSVG /></span>
              <h3 className="font-display" style={{ fontSize: 21, fontWeight: 800, margin: "0 0 8px", color: "#15212E" }}>Every deadline, caught</h3>
              <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>Friendly reminders arrive before deadlines, never after. AidPilot does the worrying so you don&apos;t have to.</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, fontSize: 12.5, fontWeight: 800, padding: "7px 13px", borderRadius: 999, background: "#FFF7E6", color: "#B7791F" }}>Deadline caught, 8 days left</span>
            </div>
            <div>
              <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#EAF3FF", alignItems: "center", justifyContent: "center", marginBottom: 20 }}><StarSVG /></span>
              <h3 className="font-display" style={{ fontSize: 21, fontWeight: 800, margin: "0 0 8px", color: "#15212E" }}>New money, found weekly</h3>
              <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>Fresh scholarships matched to who you actually are, delivered every week, with why each one fits.</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, fontSize: 12.5, fontWeight: 800, padding: "7px 13px", borderRadius: 999, background: "#EAF3FF", color: "#0B5CAD" }}>12 scholarships found</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO SWITCHER ── */}
      <section id="explore" style={{ background: "#fff", padding: "28px 48px 56px", borderTop: "1px solid #EAECEF", borderBottom: "1px solid #EAECEF" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 36px" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD", textTransform: "uppercase", letterSpacing: "1.2px" }}>One copilot, every part of aid</span>
            <h2 className="font-display" style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", margin: "14px 0 12px", color: "#15212E" }}>See AidPilot work, Maya&apos;s way.</h2>
            <p style={{ fontSize: 17.5, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>Pick a moment from Maya&apos;s semester and watch how AidPilot quietly handles it.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 34 }}>
            {DEMO_ORDER.map((key) => {
              const on = key === activeDemo;
              return (
                <button key={key} onClick={() => setActiveDemo(key)} style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, padding: "11px 20px", borderRadius: 999, transition: "all .2s ease", border: "1.5px solid " + (on ? "#0B5CAD" : "#E5E7EB"), background: on ? "#0B5CAD" : "#fff", color: on ? "#fff" : "#6B7280", boxShadow: on ? "0 10px 20px rgba(11,92,173,.22)" : "none" }}>
                  {DEMO_DATA[key].label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#fff", border: "1px solid #EAECEF", borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 60px -32px rgba(31,41,55,.24)" }}>
            <div style={{ padding: 42 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, padding: "8px 14px", borderRadius: 999, background: dp.bg, color: dp.fg }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />
                {d.status}
              </span>
              <h3 className="font-display" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.6px", margin: "18px 0 12px", color: "#15212E", lineHeight: 1.18 }}>{d.headline}</h3>
              <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", lineHeight: 1.65, margin: "0 0 24px" }}>{d.sub}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#0B5CAD" }}>What do I do next? <ArrowSVG /></span>
            </div>
            <div style={{ padding: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB", borderLeft: "1px solid #EEF1F4" }}>
              <div style={{ width: "100%", background: dp.panel, border: "1px solid " + dp.border, borderRadius: 20, padding: 30, textAlign: "center" }}>
                <div className="font-display" style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1.2px", lineHeight: 1, color: dp.fg }}>{d.metric}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginTop: 8 }}>{d.metricSub}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WEEKLY CHECK-IN ── */}
      <section id="checkin" style={{ background: "#F4F8FE", padding: "104px 48px", borderTop: "1px solid #EAECEF", borderBottom: "1px solid #EAECEF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: ".92fr 1.08fr", gap: 64, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD", textTransform: "uppercase", letterSpacing: "1.2px" }}>Your weekly check-in</span>
            <h2 className="font-display" style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-1.2px", margin: "14px 0 18px", color: "#15212E", lineHeight: 1.06 }}>One glance.<br />You know what matters.</h2>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#5B6573", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 440 }}>AidPilot shows whether your aid is safe, what needs attention, and what money was found for you this week.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #DCE7F5", borderRadius: 14, padding: "14px 20px", boxShadow: "0 10px 24px -16px rgba(11,92,173,.3)" }}>
              <span style={{ display: "flex", width: 30, height: 30, borderRadius: 9, background: "#EAF3FF", alignItems: "center", justifyContent: "center" }}>
                <PlaneSVG size={16} color="#0B5CAD" />
              </span>
              <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Am I okay, and what&apos;s next?</span>
            </div>
          </div>

          {/* dashboard UI preview */}
          <div style={{ background: "#fff", border: "1px solid #E9EDF2", borderRadius: 24, boxShadow: "0 36px 70px -28px rgba(11,92,173,.30)", overflow: "hidden", display: "grid", gridTemplateColumns: "64px 1fr" }}>
            <div style={{ background: "#0B5CAD", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 22 }}>
              {[
                <PlaneSVG key="p" size={18} />,
                <svg key="g" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0B5CAD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>,
                <svg key="c" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 20 6"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>,
                <StarSVG key="s" color="rgba(255,255,255,.7)" />,
              ].map((icon, i) => (
                <span key={i} style={{ display: "flex", width: 36, height: 36, borderRadius: 11, background: i === 1 ? "#fff" : i === 0 ? "rgba(255,255,255,.16)" : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {icon}
                </span>
              ))}
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>Sophomore · UC Irvine</div>
                  <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Hi Maya</div>
                </div>
                <span style={{ display: "flex", width: 38, height: 38, borderRadius: "50%", background: "#EAF3FF", color: "#0B5CAD", fontWeight: 800, fontSize: 14, alignItems: "center", justifyContent: "center" }}>MC</span>
              </div>
              <div style={{ background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2", borderRadius: 18, padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <span style={{ display: "flex", width: 22, height: 22, borderRadius: "50%", background: "#15885A", alignItems: "center", justifyContent: "center" }}>
                    <CheckSVG strokeWidth={2.6} />
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#15885A", textTransform: "uppercase", letterSpacing: ".5px" }}>Protected this week</span>
                </div>
                <div className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#15212E", lineHeight: 1.3 }}>Your aid is safe. 2 tasks need attention before <span style={{ color: "#B7791F" }}>July 15</span>.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#F9FAFB", border: "1px solid #EEF1F4", borderRadius: 16, padding: 15 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>Checklist</div>
                  <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "#0B5CAD", lineHeight: 1 }}>70%</div>
                  <div style={{ height: 8, borderRadius: 999, background: "#E9EEF3", marginTop: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "70%", borderRadius: 999, background: "linear-gradient(90deg,#0B5CAD,#3E86D6)" }} />
                  </div>
                </div>
                <div style={{ background: "#FFF7E6", border: "1px solid #F2E6C8", borderRadius: 16, padding: 15 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9A7B3A", marginBottom: 8 }}>Needs you</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#B7791F", lineHeight: 1.3 }}>Upload 2024 tax return</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C2A05E", marginTop: 7 }}>Avoids an aid delay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CHECKLIST ── */}
      <section style={{ background: "#fff", padding: "104px 48px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 42 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#15885A", textTransform: "uppercase", letterSpacing: "1.2px" }}>Try a check-off</span>
            <h2 className="font-display" style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", margin: "14px 0 12px", color: "#15212E" }}>Check something off. Feel it.</h2>
            <p style={{ fontSize: 17.5, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>Maya&apos;s weekly aid checklist. Tap a task and watch AidPilot turn stress into progress.</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #EAECEF", borderRadius: 24, boxShadow: "0 28px 56px -26px rgba(31,41,55,.22)", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "#15212E" }}>Maya&apos;s aid checklist</div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#15885A" }}>{pct}% done</span>
            </div>
            <div style={{ height: 13, borderRadius: 999, background: "#EEF1F4", overflow: "hidden", marginBottom: 9 }}>
              <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#15885A,#37A877)", width: `${pct}%`, transition: "width .8s cubic-bezier(.2,.7,.2,1)" }} />
            </div>
            <div style={{ minHeight: 22, marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: coachColor, transition: "color .3s ease" }}>{coachMsg}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {tasks.map((task) => {
                const pal = task.done ? BADGE_PAL.done : BADGE_PAL[task.tone];
                const popping = justCompleted === task.id;
                return (
                  <div key={task.id} onClick={() => toggleTask(task.id)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", padding: "15px 16px", borderRadius: 16, background: task.done ? "#F5FBF7" : "#FFFFFF", border: "1.5px solid " + (task.done ? "#D8F0E2" : "#EAECEF"), transition: "background .25s ease,border-color .25s ease" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 9, flexShrink: 0, background: task.done ? "#15885A" : "#F1F4F7", border: "1.5px solid " + (task.done ? "#15885A" : "#DCE1E7"), transition: "background .25s ease,border-color .25s ease" }}>
                      {task.done && <CheckSVG strokeWidth={3.2} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 2, color: task.done ? "#7C9A89" : "#15212E", textDecoration: task.done ? "line-through" : "none", transition: "color .25s ease" }}>{task.title}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#9AA4B2" }}>{task.sub}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, background: pal.bg, color: pal.fg, animation: popping ? "pop .42s cubic-bezier(.2,.7,.2,1)" : "none" }}>
                      {task.done ? "Done" : task.pendingBadge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHOLARSHIP REPORT ── */}
      <section id="scholarships" style={{ background: "#F4F8FE", padding: "104px 48px", borderTop: "1px solid #EAECEF" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 680, margin: "0 0 48px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0B5CAD", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 999, letterSpacing: ".4px", marginBottom: 18 }}>This week&apos;s report</span>
            <h2 className="font-display" style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-1.2px", margin: "0 0 12px", color: "#15212E", lineHeight: 1.08 }}>We found money for you this week.</h2>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#5B6573", margin: 0, lineHeight: 1.6 }}><span style={{ color: "#15885A", fontWeight: 800 }}>$24,500</span> in new scholarships, matched to your story: first-gen, STEM, UC Irvine. Sorted best-fit first.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
            {[
              { val: "12",      label: "new scholarships",      color: "#0B5CAD" },
              { val: "$24,500", label: "potential awards",       color: "#15885A" },
              { val: "4",       label: "strong matches",         color: "#0B5CAD" },
              { val: "3",       label: "deadlines this month",   color: "#B7791F" },
            ].map((stat) => (
              <div key={stat.label} style={{ flex: 1, minWidth: 150, background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, padding: "18px 20px" }}>
                <div className="font-display" style={{ fontSize: 30, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.val}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 24, alignItems: "start" }}>
            {/* featured */}
            <div style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 24, boxShadow: "0 26px 50px -26px rgba(11,92,173,.26)", padding: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ display: "flex", width: 54, height: 54, borderRadius: 16, background: "#EAFBF1", alignItems: "center", justifyContent: "center" }}>
                  <svg width={27} height={27} viewBox="0 0 24 24" fill="none" stroke="#15885A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#EAFBF1", color: "#15885A", fontSize: 13, fontWeight: 800, padding: "7px 14px", borderRadius: 999 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#15885A" }} />96% match for you
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", color: "#15212E" }}>First-Gen Future Fund</h3>
              <div className="font-display" style={{ fontSize: 38, fontWeight: 900, color: "#15885A", marginBottom: 14, letterSpacing: -1 }}>$5,000</div>
              <p style={{ fontSize: 15.5, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}><strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> For first-generation students in California. Maya&apos;s background, UC Irvine profile, and aid status make this a strong fit.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#B7791F", background: "#FFF7E6", padding: "9px 14px", borderRadius: 12, marginBottom: 20, width: "fit-content" }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Closes in 21 days
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <a href="#waitlist" style={{ fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "13px 24px", borderRadius: 13, boxShadow: "0 10px 20px rgba(11,92,173,.22)", textDecoration: "none" }}>Start application</a>
                <a href="#waitlist" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #E2E8F0", padding: "13px 20px", borderRadius: 13, textDecoration: "none" }}>
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Save
                </a>
              </div>
            </div>

            {/* compact list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "Women in STEM Grant",      amount: "$3,500", match: "91%", deadline: "Plenty of time",     deadlineColor: "#15885A", why: "Maya's STEM interest and student profile make this a strong fit." },
                { name: "Anteater Community Award", amount: "$2,000", match: "88%", deadline: "Closes in 12 days", deadlineColor: "#B7791F", why: "UC Irvine students with community involvement are a strong match." },
              ].map((s) => (
                <div key={s.name} style={{ background: "#fff", border: "1px solid #E6EDF6", borderRadius: 18, boxShadow: "0 16px 34px -24px rgba(11,92,173,.22)", padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <h4 className="font-display" style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#15212E" }}>{s.name}</h4>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0B5CAD", background: "#EAF3FF", padding: "4px 9px", borderRadius: 999 }}>{s.match}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#0B5CAD" }}>{s.amount}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: s.deadlineColor }}>{s.deadline}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7280", marginTop: 9, lineHeight: 1.5 }}><strong style={{ color: "#15212E", fontWeight: 700 }}>Why it fits:</strong> {s.why}</div>
                </div>
              ))}
              <a href="#waitlist" style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: 15, borderRadius: 16, textDecoration: "none" }}>See all 12 matches</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ background: "#fff", padding: "104px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", background: "#0B5CAD", borderRadius: 28, padding: 52, textAlign: "center", boxShadow: "0 36px 70px -34px rgba(11,92,173,.6)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{ position: "absolute", bottom: -50, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#9FC6EE", textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: 20 }}>Sample student story</div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.42, letterSpacing: "-.3px", marginBottom: 28 }}>
              &ldquo;Financial aid used to feel like a maze. AidPilot turns it into <span style={{ color: "#BFE0FF" }}>one weekly check-in.</span>&rdquo;
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13 }}>
              <span style={{ display: "flex", width: 48, height: 48, borderRadius: "50%", background: "#EAF3FF", color: "#0B5CAD", fontWeight: 800, fontSize: 16, alignItems: "center", justifyContent: "center" }}>MC</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Maya Chen</div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "#9FC6EE" }}>Sample student persona · UC Irvine</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS ── */}
      <section id="schools" style={{ background: "#F9FAFB", padding: "20px 48px 96px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", background: "#fff", border: "1px solid #EAECEF", borderRadius: 24, padding: 44, display: "grid", gridTemplateColumns: "1fr auto", gap: 44, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "1.2px" }}>For financial aid offices</span>
            <h2 className="font-display" style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.7px", margin: "12px 0 12px", color: "#15212E" }}>Fewer missing documents. Calmer students.</h2>
            <p style={{ fontSize: 16.5, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6, maxWidth: 560 }}>AidPilot helps students arrive prepared, submit documents on time, and understand what to do next.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px" }}>
              {["Fewer missing documents", "Earlier deadline completion", "Students arrive prepared"].map((item) => (
                <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  <CheckSVG size={15} color="#15885A" strokeWidth={3} />{item}
                </span>
              ))}
            </div>
          </div>
          <a href="mailto:hello@aidpilot.app" style={{ whiteSpace: "nowrap", fontSize: 16, fontWeight: 700, color: "#fff", background: "#1F2937", padding: "15px 26px", borderRadius: 14, textDecoration: "none" }}>Partner with us</a>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "#F9FAFB", padding: "0 48px 96px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", background: "linear-gradient(135deg,#EAF3FF,#EAFBF1)", border: "1px solid #DCEAF7", borderRadius: 32, padding: "72px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div className="animate-floaty" style={{ position: "absolute", top: 34, left: "8%", width: 46, height: 46, borderRadius: 14, background: "#fff", boxShadow: "0 12px 24px rgba(11,92,173,.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlaneSVG size={22} color="#0B5CAD" />
          </div>
          <div style={{ position: "relative" }}>
            <h2 className="font-display" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-1.4px", margin: "0 0 16px", color: "#15212E", lineHeight: 1.08 }}>Let&apos;s protect your aid<br />and find your money.</h2>
            <p style={{ fontSize: 19, fontWeight: 500, color: "#5B6573", margin: "0 0 30px" }}>Free for students. Two minutes to set up. A calmer semester starts now.</p>
            <a href="#waitlist" style={{ display: "inline-block", fontSize: 18, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "17px 36px", borderRadius: 16, boxShadow: "0 16px 32px rgba(11,92,173,.32)", textDecoration: "none" }}>Get started free</a>
          </div>
        </div>
      </section>

      {/* ── WAITLIST FORM ── */}
      <section id="waitlist" style={{ background: "#fff", borderTop: "1px solid #EAECEF", padding: "96px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 16px", color: "#15212E" }}>Join the AidPilot waitlist.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.7, color: "#5B6573", fontWeight: 500, margin: "0 0 16px" }}>
              Be among the first students to get a weekly aid protection plan, deadline reminders, and scholarship matches -- without the stress of figuring it all out alone.
            </p>
            <p style={{ fontSize: 14, color: "#9AA4B2", fontWeight: 500, margin: 0 }}>Early access is free. We&apos;ll only email you about AidPilot launch updates.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #EAECEF", borderRadius: 24, padding: 28, boxShadow: "0 20px 40px -20px rgba(31,41,55,.16)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%", borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <select value={studentType} onChange={(e) => setStudentType(e.target.value)} style={{ width: "100%", borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
                <option value="">I am a...</option>
                <option value="high_school_student">High school student</option>
                <option value="college_student">College student</option>
                <option value="parent">Parent</option>
                <option value="counselor">Counselor</option>
              </select>
              <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ width: "100%", borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <textarea placeholder="What is the most stressful part of FAFSA, aid, or scholarships?" value={biggestPain} onChange={(e) => setBiggestPain(e.target.value)} style={{ width: "100%", minHeight: 110, borderRadius: 14, border: "1.5px solid #E5E7EB", padding: "13px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              <button type="submit" disabled={formStatus === "loading"} style={{ width: "100%", borderRadius: 999, background: "#0B5CAD", color: "#fff", fontSize: 16, fontWeight: 700, padding: "14px 24px", border: "none", cursor: "pointer", fontFamily: "inherit", opacity: formStatus === "loading" ? 0.6 : 1 }}>
                {formStatus === "loading" ? "Joining..." : "Join waitlist"}
              </button>
              {message && (
                <p style={{ fontSize: 14, fontWeight: 600, color: formStatus === "success" ? "#15885A" : "#C04E57", margin: 0 }}>{message}</p>
              )}
              <div style={{ borderRadius: 12, border: "1px solid #FDE68A", background: "#FFFBEB", padding: 14 }}>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#78350F", margin: 0 }}>
                  <strong>Important:</strong> AidPilot is an independent service and is not affiliated with FAFSA, Federal Student Aid, the U.S. Department of Education, or any college or university. We provide educational organization and guidance -- not legal, tax, or official financial aid advice. We do not collect Social Security numbers, tax documents, FAFSA login credentials, or sensitive financial documents.
                </p>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#9AA4B2", margin: 0 }}>
                By joining, you agree to our{" "}
                <Link href="/privacy" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Privacy Policy</Link>.{" "}
                See our{" "}
                <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Disclaimer</Link>{" "}
                for more.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #EAECEF", background: "#fff", padding: "40px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 11, background: "#0B5CAD" }}>
              <PlaneSVG size={18} />
            </span>
            <span className="font-display" style={{ fontSize: 18, fontWeight: 900 }}>
              <span style={{ color: "#1F2937" }}>Aid</span><span style={{ color: "#0B5CAD" }}>Pilot</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <a href="#protect" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Protect your aid</a>
            <a href="#scholarships" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Scholarships</a>
            <a href="#schools" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>For schools</a>
            <Link href="/privacy" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Privacy</Link>
            <Link href="/disclaimer" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Disclaimer</Link>
            <Link href="/dashboard" style={{ fontSize: 14.5, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>Demo</Link>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "#9AA4B2" }}>2026 AidPilot. Made with care for students.</div>
        </div>
      </footer>
    </div>
  );
}
