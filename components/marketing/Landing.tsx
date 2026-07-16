"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo, Button, Icon } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  Sticky,
  Stamp,
  Pencil,
  Notebook,
  PaperPlane,
  Highlight,
  paperShadow,
  linedPaper,
} from "./skeuo";
import { LandingAsk } from "./LandingAsk";

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ── Nav ── */
function MarketingNav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        padding: "16px 40px",
        background: "rgba(255,255,255,.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <Logo size={30} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link href="/login" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", whiteSpace: "nowrap" }}>
          Sign in
        </Link>
        <Button shape="pill" onClick={scrollToWaitlist}>Get early access</Button>
      </div>
    </nav>
  );
}

/* ── Hero (skeuomorphic desk) ── */
function Hero() {
  const [items, setItems] = useState([
    { t: "Submit FAFSA", d: true },
    { t: "Verify identity", d: true },
    { t: "Upload 2024 taxes", d: false },
    { t: "Accept Cal Grant", d: false },
  ]);
  const [pop, setPop] = useState(-1);
  const toggle = (i: number) => {
    setItems((a) => a.map((x, j) => (j === i ? { ...x, d: !x.d } : x)));
    setPop(i);
    setTimeout(() => setPop(-1), 460);
  };
  const allDone = items.every((x) => x.d);

  return (
    <header style={{ position: "relative", background: "radial-gradient(120% 90% at 15% 0%, #FCFBF8 0%, #F4F1EA 100%)", padding: "84px 44px 108px", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.06fr", gap: 56, alignItems: "center" }} className="hero-grid">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", padding: "7px 14px 7px 8px", borderRadius: 4, boxShadow: paperShadow, transform: "rotate(-1.5deg)", marginBottom: 28 }}>
            <Logo variant="mark" size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)", whiteSpace: "nowrap" }}>Early access is open</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(46px, 6vw, 72px)", lineHeight: 1.0, fontWeight: 900, letterSpacing: "-2px", margin: "0 0 22px", color: "var(--ink-900)" }}>
            Financial aid,<br />minus the <Highlight tone="amber">mess.</Highlight>
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, color: "var(--ink-600)", margin: "0 0 32px", maxWidth: 430, lineHeight: 1.5 }}>
            The forms, deadlines, and fine print - handled in one simple weekly check.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Button size="lg" shape="pill" onClick={scrollToWaitlist} iconRight="arrow-right">Get early access</Button>
            <Link href="/demo" style={{ textDecoration: "none" }}>
              <Button size="lg" shape="pill" variant="secondary">See the demo</Button>
            </Link>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-500)" }}>Free · 2-min setup</span>
          </div>
        </div>

        <div style={{ position: "relative", height: 470 }} className="hero-desk">
          {/* The desk: manila folder underneath, the checklist paper on top. */}
          <div style={{ position: "absolute", left: "50%", top: 122, width: 410, height: 286, marginLeft: -205, background: "linear-gradient(#F3D48A,#EFC96E)", borderRadius: "18px 18px 14px 14px", boxShadow: "0 26px 50px -22px rgba(31,41,55,.4)", transform: "rotate(2deg)" }}>
            <div style={{ position: "absolute", top: -22, left: 26, width: 150, height: 30, background: "#EFC96E", borderRadius: "12px 12px 0 0" }} />
            <div style={{ position: "absolute", top: -13, left: 46, fontSize: 12, fontWeight: 800, color: "#8A6A22", letterSpacing: ".5px" }}>FINANCIAL AID</div>
          </div>

          <div style={{ position: "absolute", left: "50%", top: 22, width: 300, marginLeft: -150, zIndex: 4 }}>
            <div style={{ position: "relative", background: linedPaper, borderRadius: 8, boxShadow: paperShadow, transform: "rotate(-2deg)", padding: "26px 22px 22px" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", marginLeft: -26, width: 52, height: 22, background: "linear-gradient(#D7DBE2,#B4BAC6)", borderRadius: 7, boxShadow: "0 2px 4px rgba(31,41,55,.25)" }} />
              <div style={{ position: "absolute", top: -7, left: "50%", marginLeft: -16, width: 32, height: 10, background: "#EDF0F5", borderRadius: 5 }} />
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><Logo variant="full" size={22} /></div>
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--gray-400)", marginBottom: 12 }}>My aid checklist</div>
              {items.map((it, i) => (
                <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "6px 2px", cursor: "pointer" }}>
                  <span className={pop === i ? "animate-pop" : ""} style={{ width: 21, height: 21, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: it.d ? "none" : "2px solid #C0CDDE", background: it.d ? "var(--green-600)" : "#fff", transition: "background .15s ease" }}>
                    {it.d && <Icon name="check" size={12} color="#fff" strokeWidth={3.6} />}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: it.d ? "var(--gray-400)" : "var(--ink-800)", textDecoration: it.d ? "line-through" : "none", whiteSpace: "nowrap" }}>{it.t}</span>
                </div>
              ))}
              {allDone && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                  <Stamp tone="blue" rotate={-7}>All done!</Stamp>
                </div>
              )}
            </div>
          </div>

          {/* The paper plane swoops in on load and parks top-right. */}
          <div className="animate-plane-in" style={{ position: "absolute", right: -12, top: -8, zIndex: 5 }}>
            <div className="animate-drift" style={{ position: "relative" }}>
              <PaperPlane size={148} style={{ transform: "rotate(9deg)" }} />
            </div>
          </div>

          <div className="animate-drift2" style={{ position: "absolute", right: 26, bottom: -4, zIndex: 5 }}>
            <Sticky tone="green" rotate={-6} style={{ width: 150, minHeight: 116 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-600)", marginBottom: 4 }}>found for you</div>
              <div style={{ fontFamily: "var(--font-metric)", fontWeight: 700, fontSize: 30, color: "var(--green-600)", letterSpacing: "-.5px" }}>$24,500</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginTop: 2 }}>in scholarships</div>
            </Sticky>
          </div>

          {/* Notebook and pencil resting on the desk edge. */}
          <div style={{ position: "absolute", left: -14, bottom: -12, zIndex: 3 }}>
            <Notebook style={{ position: "relative", transform: "rotate(-4deg)" }} />
          </div>
          <div className="animate-drift" style={{ position: "absolute", left: 118, bottom: 4, zIndex: 6 }}>
            <Pencil style={{ position: "relative", transform: "rotate(-15deg)" }} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── How it works ── */
function StepCard({ n, icon, tone, title, line, rot }: { n: string; icon: string; tone: "blue" | "amber" | "green"; title: string; line: string; rot: number }) {
  const chip = { blue: ["var(--blue-100)", "var(--blue-700)"], amber: ["var(--amber-100)", "var(--amber-600)"], green: ["var(--green-100)", "var(--green-600)"] }[tone];
  return (
    <div style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 8, boxShadow: paperShadow, padding: "26px 22px", transform: `rotate(${rot}deg)` }}>
      <div style={{ position: "absolute", top: -14, left: 22, width: 60, height: 24, background: "rgba(255,247,230,.8)", transform: "rotate(-3deg)", boxShadow: "0 1px 2px rgba(31,41,55,.1)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 16, background: chip[0], alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 3px rgba(255,255,255,.7), inset 0 -3px 6px rgba(11,92,173,.06)" }}>
          <Icon name={icon} size={26} color={chip[1]} strokeWidth={2} />
        </span>
        <span style={{ fontFamily: "var(--font-metric)", fontSize: 34, fontWeight: 700, color: "var(--gray-300)" }}>{n}</span>
      </div>
      <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "var(--ink-900)", letterSpacing: "-.4px", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--gray-500)", lineHeight: 1.45 }}>{line}</div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section style={{ background: "#fff", padding: "88px 44px", borderTop: "1px solid #ECE8DE" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(34px,4.5vw,48px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--ink-900)", margin: 0 }}>
            Three steps. <Highlight tone="blue">Off your desk.</Highlight>
          </h2>
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 34 }} className="steps-grid">
          <div style={{ position: "absolute", top: 60, left: "12%", right: "12%", borderTop: "2px dashed var(--blue-300)", zIndex: 0 }} />
          <StepCard n="1" icon="shield" tone="blue" title="Protect" line="We watch your aid, eligibility, and requirements - 24/7." rot={-1.5} />
          <StepCard n="2" icon="calendar" tone="amber" title="Track" line="Every FAFSA, grant, and document deadline, caught early." rot={1.5} />
          <StepCard n="3" icon="letter" tone="green" title="Decode" line="Know exactly what every aid offer really costs." rot={-1} />
        </div>
      </div>
    </section>
  );
}

/* ── Closer (real waitlist capture) ── */
function Closer() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const { error } = await supabase.from("waitlist").insert({ email });
    if (error) {
      // 23505 = unique violation → already on the list, treat as success.
      if (error.code === "23505") {
        setStatus("sent");
        return;
      }
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      return;
    }
    setStatus("sent");
  }

  return (
    <section id="waitlist" style={{ position: "relative", background: "radial-gradient(120% 100% at 50% 0%, #F1EEE6 0%, #E7E2D6 100%)", padding: "96px 44px", overflow: "hidden" }}>
      <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
        <div style={{ position: "relative", background: linedPaper, borderRadius: 8, boxShadow: "0 30px 60px -26px rgba(31,41,55,.45)", padding: "44px 40px 40px", transform: "rotate(-1deg)" }}>
          <div style={{ position: "absolute", top: -14, left: 46, width: 22, height: 54, border: "3px solid #9AA4B2", borderRadius: 12, borderBottom: "none", transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", top: 8, right: 30 }}><Stamp tone="blue" rotate={9}>Approved</Stamp></div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Logo variant="mark" size={40} style={{ marginBottom: 16 }} />
            <h2 className="font-display" style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--ink-900)", margin: "0 0 10px", lineHeight: 1.05 }}>
              Ready to clear your desk?
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-500)", margin: "0 0 26px" }}>Join early access - it&apos;s free.</p>
            {status === "sent" ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--green-600)", fontWeight: 800, fontSize: 17 }}>
                <Icon name="check" size={20} color="var(--green-600)" strokeWidth={3.2} /> You&apos;re on the list - see you soon.
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  style={{ flex: 1, minWidth: 210, boxSizing: "border-box", borderRadius: 12, border: "1.5px solid var(--border-default)", padding: "14px 18px", fontSize: 16, fontFamily: "var(--font-body)", fontWeight: 500, outline: "none", color: "var(--ink-800)", background: "rgba(255,255,255,.85)" }}
                />
                <Button type="submit" size="lg" shape="pill" iconRight="arrow-right" loading={status === "loading"}>Get access</Button>
              </form>
            )}
            {status === "error" && <div style={{ fontSize: 13, fontWeight: 600, color: "var(--coral-600)", marginTop: 12 }}>{message}</div>}
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)", marginTop: 18 }}>No FAFSA logins, SSNs, or tax docs - ever.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  const links: { label: string; href: string }[] = [
    { label: "Privacy", href: "/privacy" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Sign in", href: "/login" },
  ];
  return (
    <footer style={{ background: "#fff", padding: "30px 44px", borderTop: "1px solid #ECE8DE" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <Logo size={26} />
        <div style={{ display: "flex", gap: 22 }}>
          {links.map((l) => (
            <Link key={l.label} href={l.href} style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>© 2026 AidPilot</div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div style={{ background: "var(--surface-page)" }}>
      <MarketingNav />
      <Hero />
      <LandingAsk />
      <HowItWorks />
      <Closer />
      <MarketingFooter />
    </div>
  );
}
