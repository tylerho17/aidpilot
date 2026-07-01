/* AidPilot marketing UI kit — minimal sticky nav. */
const DSnav = window.AidPilotDesignSystem_59a3d7;

function MarketingNav({ onCTA }) {
  const { Logo, Button } = DSnav;
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200, display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 24, padding: "16px 40px",
      background: "rgba(255,255,255,.78)", backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
    }}>
      <Logo size={30} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <a href="#" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)", textDecoration: "none", whiteSpace: "nowrap" }}>See demo</a>
        <Button shape="pill" onClick={onCTA}>Get early access</Button>
      </div>
    </nav>
  );
}

window.MarketingNav = MarketingNav;
