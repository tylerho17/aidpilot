/* AidPilot marketing UI kit — SKEUOMORPHIC landing (paper, pencil, sticky notes,
   school props). The message: we take the messy paper world of college aid and
   simplify it. Interactive checklist + very subtle motion on the desk objects. */
const DShero = window.AidPilotDesignSystem_59a3d7;

/* ── reusable skeuomorphic pieces ── */
const paperShadow = "0 1px 1px rgba(31,41,55,.05), 0 14px 26px -12px rgba(31,41,55,.28)";
const linedPaper = "repeating-linear-gradient(#fff 0, #fff 26px, #E4ECF7 27px, #fff 28px)";

function Tape({ style }) {
  return <div style={{ position: "absolute", width: 76, height: 26, background: "rgba(255,247,230,.72)", boxShadow: "0 1px 2px rgba(31,41,55,.12)", borderLeft: "1px dashed rgba(183,121,31,.25)", borderRight: "1px dashed rgba(183,121,31,.25)", ...style }} />;
}

function Sticky({ tone = "amber", rotate = -3, children, style }) {
  const c = { amber: "#FFF3D6", green: "#DFF6E8", blue: "#E4EFFF", coral: "#FFE0E3" }[tone];
  return (
    <div style={{ position: "relative", width: 150, minHeight: 150, background: c, padding: "20px 16px 16px", transform: `rotate(${rotate}deg)`, boxShadow: "0 10px 20px -8px rgba(31,41,55,.28)", ...style }}>
      <Tape style={{ top: -12, left: "50%", marginLeft: -38, transform: "rotate(-2deg)" }} />
      {children}
    </div>
  );
}

function Stamp({ children, tone = "green", rotate = -12, style }) {
  const c = { green: "var(--green-600)", blue: "var(--blue-700)", coral: "var(--coral-600)" }[tone];
  return (
    <div style={{ display: "inline-block", color: c, border: `3px solid ${c}`, borderRadius: 8, padding: "5px 12px", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15, letterSpacing: "1px", textTransform: "uppercase", transform: `rotate(${rotate}deg)`, opacity: .82, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.4)", ...style }}>
      {children}
    </div>
  );
}

/* Realistic wooden pencil: dark lead point → tan wood cone → yellow hex body
   (top/bottom facet shading) → silver ferrule with bands → pink eraser. */
function Pencil({ style }) {
  const H = 22;
  return (
    <div style={{ position: "absolute", width: 236, height: H, display: "flex", alignItems: "stretch", filter: "drop-shadow(0 7px 7px rgba(31,41,55,.22))", ...style }}>
      {/* sharpened tip: wood cone with a small dark lead at the point */}
      <div style={{ position: "relative", width: 30, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, width: 0, height: 0, borderTop: `${H / 2}px solid transparent`, borderBottom: `${H / 2}px solid transparent`, borderRight: "30px solid #E7C79A" }} />
        <div style={{ position: "absolute", left: 0, top: H / 2 - 5, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "11px solid #3B3B3B" }} />
      </div>
      {/* body */}
      <div style={{ flex: 1, background: "linear-gradient(to bottom, #E19A00 0%, #FFCE3A 20%, #FFE488 48%, #FFCE3A 76%, #DC9200 100%)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: 1, background: "rgba(255,255,255,.45)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "28%", height: 1, background: "rgba(0,0,0,.09)" }} />
      </div>
      {/* ferrule */}
      <div style={{ width: 22, flexShrink: 0, background: "linear-gradient(to bottom, #C6C6CF, #F2F2F6 45%, #ADADB8)", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 5, height: 1.5, background: "rgba(0,0,0,.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 5, height: 1.5, background: "rgba(0,0,0,.16)" }} />
      </div>
      {/* eraser */}
      <div style={{ width: 20, flexShrink: 0, background: "linear-gradient(to bottom, #F6A9B7, #E97C90)", borderRadius: "0 10px 10px 0" }} />
    </div>
  );
}

/* Graduation cap — mortarboard with a gold button and a gentle-swaying tassel. */
function GradCap({ style }) {
  return (
    <div style={{ position: "absolute", width: 104, height: 84, ...style }}>
      <div style={{ position: "absolute", top: 34, left: 30, width: 44, height: 24, background: "linear-gradient(#31465C, #22333F)", borderRadius: "0 0 9px 9px" }} />
      <div style={{ position: "absolute", top: 12, left: 6, width: 92, height: 44, background: "linear-gradient(135deg, #24344A, #34495F)", transform: "rotate(45deg) scaleY(.52)", borderRadius: 6, boxShadow: "0 10px 16px -8px rgba(31,41,55,.45)" }} />
      <div style={{ position: "absolute", top: 24, left: 48, width: 9, height: 9, borderRadius: "50%", background: "#F4B70E", boxShadow: "0 1px 2px rgba(0,0,0,.2)" }} />
      <div className="animate-sway" style={{ position: "absolute", top: 28, left: 51 }}>
        <div style={{ width: 2.5, height: 30, background: "#F4B70E", margin: "0 auto" }} />
        <div style={{ width: 11, height: 17, background: "linear-gradient(#F4B70E,#E09A0C)", borderRadius: "0 0 5px 5px", marginTop: -1 }} />
      </div>
    </div>
  );
}

/* A small stack of textbooks in the brand tints. */
function Books({ style }) {
  const book = (grad, rot, mb, w) => (
    <div style={{ position: "relative", height: 20, width: w, background: grad, borderRadius: 4, transform: `rotate(${rot}deg)`, marginBottom: mb, boxShadow: "0 5px 11px -6px rgba(31,41,55,.4)" }}>
      <div style={{ position: "absolute", left: 9, top: 4, bottom: 4, width: 3, background: "rgba(255,255,255,.5)", borderRadius: 2 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", width: 128, ...style }}>
      {book("linear-gradient(#EFAF3A,#E0940F)", -3, 6, 128)}
      {book("linear-gradient(#15885A,#0F6E48)", 2, 6, 118)}
      {book("linear-gradient(#3E86D6,#2A6FBD)", -1, 0, 126)}
    </div>
  );
}

function Highlight({ children, tone = "amber" }) {
  const c = { amber: "rgba(255,199,60,.5)", blue: "rgba(62,134,214,.28)", green: "rgba(21,136,90,.24)" }[tone];
  return <span style={{ background: `linear-gradient(${c},${c})`, backgroundSize: "100% 42%", backgroundPosition: "0 78%", backgroundRepeat: "no-repeat", padding: "0 2px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>;
}

/* ── HERO ── */
function Hero({ onCTA }) {
  const { Logo, Button, Icon } = DShero;
  const [items, setItems] = React.useState([
    { t: "Submit FAFSA", d: true },
    { t: "Verify identity", d: true },
    { t: "Upload 2024 taxes", d: false },
    { t: "Accept Cal Grant", d: false },
  ]);
  const [pop, setPop] = React.useState(-1);
  const toggle = (i) => {
    setItems((a) => a.map((x, j) => (j === i ? { ...x, d: !x.d } : x)));
    setPop(i); setTimeout(() => setPop(-1), 460);
  };
  const allDone = items.every((x) => x.d);

  return (
    <header style={{ position: "relative", background: "radial-gradient(120% 90% at 15% 0%, #FBFAF6 0%, #F1EEE6 100%)", padding: "68px 44px 92px", overflow: "hidden" }}>
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.06fr", gap: 48, alignItems: "center" }}>
        {/* copy */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", padding: "7px 14px 7px 8px", borderRadius: 4, boxShadow: paperShadow, transform: "rotate(-1.5deg)", marginBottom: 26 }}>
            <Logo variant="mark" size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)", whiteSpace: "nowrap" }}>Early access is open</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(46px, 6vw, 72px)", lineHeight: 1.0, fontWeight: 900, letterSpacing: "-2px", margin: "0 0 22px", color: "var(--ink-900)" }}>
            Financial aid,<br />minus the <Highlight tone="amber">mess.</Highlight>
          </h1>
          <p style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-600)", margin: "0 0 30px", maxWidth: 440, lineHeight: 1.45 }}>
            We turn the forms, deadlines, and fine print into one simple weekly check.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button size="lg" shape="pill" onClick={onCTA} iconRight="arrow-right">Get early access</Button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-500)" }}>Free · 2-min setup</span>
          </div>
        </div>

        {/* the desk */}
        <div style={{ position: "relative", height: 470 }}>
          {/* manila folder (behind, centered) */}
          <div style={{ position: "absolute", left: "50%", top: 122, width: 410, height: 286, marginLeft: -205, background: "linear-gradient(#F3D48A,#EFC96E)", borderRadius: "18px 18px 14px 14px", boxShadow: "0 26px 50px -22px rgba(31,41,55,.45)", transform: "rotate(2deg)" }}>
            <div style={{ position: "absolute", top: -22, left: 26, width: 150, height: 30, background: "#EFC96E", borderRadius: "12px 12px 0 0" }} />
            <div style={{ position: "absolute", top: -13, left: 46, fontSize: 12, fontWeight: 800, color: "#8A6A22", letterSpacing: ".5px" }}>FINANCIAL AID</div>
          </div>

          {/* graduation cap — top left, gentle drift */}
          <div className="animate-drift" style={{ position: "absolute", left: -8, top: -18, zIndex: 3 }}><GradCap /></div>
          {/* books — bottom left, gentle drift */}
          <div className="animate-drift2" style={{ position: "absolute", left: -6, bottom: 8, zIndex: 3 }}><Books /></div>

          {/* clipboard — centered, AidPilot logo centered on top, interactive checklist */}
          <div style={{ position: "absolute", left: "50%", top: 22, width: 300, marginLeft: -150, zIndex: 4 }}>
            <div style={{ position: "relative", background: linedPaper, borderRadius: 8, boxShadow: paperShadow, transform: "rotate(-2deg)", padding: "26px 22px 22px" }}>
              {/* metal clip */}
              <div style={{ position: "absolute", top: -12, left: "50%", marginLeft: -26, width: 52, height: 22, background: "linear-gradient(#D7DBE2,#B4BAC6)", borderRadius: 7, boxShadow: "0 2px 4px rgba(31,41,55,.25)" }} />
              <div style={{ position: "absolute", top: -7, left: "50%", marginLeft: -16, width: 32, height: 10, background: "#EDF0F5", borderRadius: 5 }} />
              {/* centered logo */}
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
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <Stamp tone={allDone ? "blue" : "green"} rotate={-7}>{allDone ? "All done!" : "On track"}</Stamp>
              </div>
            </div>
          </div>

          {/* sticky notes */}
          <div className="animate-drift" style={{ position: "absolute", right: -4, top: -16, zIndex: 5 }}>
            <Sticky tone="amber" rotate={6} style={{ width: 130, minHeight: 128 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#8A6A22", lineHeight: 1.3 }}>Cal Grant<br />due in 8 days!</div>
            </Sticky>
          </div>
          <div className="animate-drift2" style={{ position: "absolute", right: 18, bottom: -8, zIndex: 5 }}>
            <Sticky tone="green" rotate={-6} style={{ width: 150, minHeight: 116 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-600)", marginBottom: 4 }}>found for you</div>
              <div style={{ fontFamily: "var(--font-metric)", fontWeight: 700, fontSize: 30, color: "var(--green-600)", letterSpacing: "-.5px" }}>$24,500</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-500)", marginTop: 2 }}>in scholarships</div>
            </Sticky>
          </div>

          {/* pencil — resting diagonally near the folder */}
          <div className="animate-drift" style={{ position: "absolute", left: 78, bottom: 0, zIndex: 6 }}>
            <Pencil style={{ position: "relative", transform: "rotate(-15deg)" }} />
          </div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Hero, Sticky, Tape, Stamp, Pencil, GradCap, Books, Highlight, paperShadow, linedPaper });
