/* AidPilot app UI kit — centered top bar (Claymorphism × Material). */
const DStop = window.AidPilotDesignSystem_59a3d7;

const APP_TABS = [
  { key: "home",  label: "Home",         icon: "grid" },
  { key: "fafsa", label: "FAFSA",        icon: "clipboard" },
  { key: "money", label: "Aid & Money",  icon: "star" },
  { key: "tasks", label: "Docs & Dates", icon: "calendar" },
];

function AppTopBar({ active, onNavigate }) {
  const { Logo, TabBar, Avatar, IconButton } = DStop;
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,.9)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 6px 20px -12px rgba(11,92,173,.28)",
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
        gap: 16, padding: "14px 28px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <Logo size={30} />
      </div>
      <TabBar tabs={APP_TABS} active={active} onChange={onNavigate} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
        <IconButton icon="shield" variant="soft" aria-label="Help" />
        <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 4, whiteSpace: "nowrap" }}>
          <Avatar initials="MG" size={36} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink-800)" }}>Maya G.</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--gray-400)" }}>UC Irvine</div>
          </div>
        </div>
      </div>
    </header>
  );
}

window.AppTopBar = AppTopBar;
