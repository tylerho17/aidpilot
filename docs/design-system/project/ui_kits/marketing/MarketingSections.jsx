/* AidPilot marketing UI kit — skeuomorphic "how it works" + closer + footer. */
const DSsec = window.AidPilotDesignSystem_59a3d7;
const { Stamp, Highlight, paperShadow, linedPaper } = window;

function StepCard({ n, icon, tone, title, line, rot }) {
  const { Icon } = DSsec;
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
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 34 }}>
          {/* dashed pencil trail */}
          <div style={{ position: "absolute", top: 60, left: "12%", right: "12%", borderTop: "2px dashed var(--blue-300)", zIndex: 0 }} />
          <StepCard n="1" icon="shield" tone="blue" title="Protect" line="We watch your aid, eligibility, and requirements — 24/7." rot={-1.5} />
          <StepCard n="2" icon="calendar" tone="amber" title="Track" line="Every FAFSA, grant, and document deadline, caught early." rot={1.5} />
          <StepCard n="3" icon="star" tone="green" title="Find" line="Fresh scholarships matched to you, every single week." rot={-1} />
        </div>
      </div>
    </section>
  );
}

function Closer() {
  const { Button, Logo, Icon } = DSsec;
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  return (
    <section style={{ position: "relative", background: "radial-gradient(120% 100% at 50% 0%, #F1EEE6 0%, #E7E2D6 100%)", padding: "96px 44px", overflow: "hidden" }}>
      <div style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
        {/* paper sheet */}
        <div style={{ position: "relative", background: linedPaper, borderRadius: 8, boxShadow: "0 30px 60px -26px rgba(31,41,55,.45)", padding: "44px 40px 40px", transform: "rotate(-1deg)" }}>
          {/* paperclip */}
          <div style={{ position: "absolute", top: -14, left: 46, width: 22, height: 54, border: "3px solid #9AA4B2", borderRadius: 12, borderBottom: "none", transform: "rotate(8deg)" }} />
          <div style={{ position: "absolute", top: 8, right: 30 }}><Stamp tone="blue" rotate={9}>Approved</Stamp></div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Logo variant="mark" size={40} style={{ marginBottom: 16 }} />
            <h2 className="font-display" style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 900, letterSpacing: "-1.2px", color: "var(--ink-900)", margin: "0 0 10px", lineHeight: 1.05 }}>
              Ready to clear your desk?
            </h2>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-500)", margin: "0 0 26px" }}>Join early access — it's free.</p>
            {sent ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--green-600)", fontWeight: 800, fontSize: 17 }}>
                <Icon name="check" size={20} color="var(--green-600)" strokeWidth={3.2} /> You're on the list — see you soon.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu"
                  style={{ flex: 1, minWidth: 210, boxSizing: "border-box", borderRadius: 12, border: "1.5px solid var(--border-default)", padding: "14px 18px", fontSize: 16, fontFamily: "var(--font-body)", fontWeight: 500, outline: "none", color: "var(--ink-800)", background: "rgba(255,255,255,.85)" }} />
                <Button type="submit" size="lg" shape="pill" iconRight="arrow-right">Get access</Button>
              </form>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)", marginTop: 18 }}>No FAFSA logins, SSNs, or tax docs — ever.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  const { Logo } = DSsec;
  const links = ["Demo", "Privacy", "Disclaimer", "Contact"];
  return (
    <footer style={{ background: "#fff", padding: "30px 44px", borderTop: "1px solid #ECE8DE" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <Logo size={26} />
        <div style={{ display: "flex", gap: 22 }}>
          {links.map((l) => <a key={l} href="#" style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)", textDecoration: "none" }}>{l}</a>)}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--gray-400)" }}>© 2026 AidPilot</div>
      </div>
    </footer>
  );
}

Object.assign(window, { HowItWorks, Closer, MarketingFooter });
