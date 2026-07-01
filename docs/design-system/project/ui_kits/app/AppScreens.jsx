/* AidPilot app UI kit — screens (Claymorphism × Material, Rubik metrics).
   Home · FAFSA · Aid & Money (offers + scholarships) · Docs & Dates. */
const DSs = window.AidPilotDesignSystem_59a3d7;

/* ── shared bits ── */
function Greeting({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.7px", color: "var(--ink-900)", margin: 0, whiteSpace: "nowrap" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "7px 0 0" }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "4px 2px 14px" }}>
      <h2 className="font-display" style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-.4px", color: "var(--ink-900)", margin: 0, whiteSpace: "nowrap" }}>{children}</h2>
      {action}
    </div>
  );
}
const money = { fontFamily: "var(--font-metric)", fontWeight: 700, letterSpacing: "-.5px" };

/* ── HOME ── */
function HomeScreen() {
  const { Card, StatusPanel, StatCard, ChecklistItem, Button, Badge, IconTile } = DSs;
  const [tasks, setTasks] = React.useState({ verify: false, tax: false, cal: true });
  const toggle = (k) => setTasks((t) => ({ ...t, [k]: !t[k] }));
  return (
    <div>
      <Greeting title="Good afternoon, Maya" subtitle="Monday, March 4 · here's your weekly check-in."
        action={<Button variant="clay" size="sm" iconLeft="shield">Weekly report</Button>} />

      <StatusPanel tone="green" icon="shield-check" eyebrow="Protected"
        title="Your aid is protected this week."
        trailing={<Badge tone="green" dot>On track</Badge>}
        style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 20 }}>
        We're watching your eligibility, enrollment, and requirements. Nothing needs urgent attention.
      </StatusPanel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Aid secured this year" value="$18,400" sub="+$2,100 since last check" icon="shield-check" tone="green" valueColor="var(--green-600)" />
        <StatCard label="Next deadline" value="8 days" sub="Cal Grant renewal" icon="calendar" tone="amber" valueColor="var(--amber-600)" />
        <StatCard label="New scholarships" value="12" sub="$24,500 in potential" icon="star" tone="blue" valueColor="var(--blue-700)" />
      </div>

      <SectionTitle action={<span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-400)" }}>{Object.values(tasks).filter(Boolean).length} of 3 done</span>}>This week's to-dos</SectionTitle>
      <Card variant="clay" padding={8}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 15, backgroundImage: "var(--gradient-info)", marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--blue-700)" }}>Aid check-in</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--blue-700)" }}>Mar 4 – 10</span>
        </div>
        <ChecklistItem divider title="Verify your identity" sub="Quick photo of your ID" badge="To do" badgeTone="blue" done={tasks.verify} onToggle={() => toggle("verify")} />
        <ChecklistItem divider title="Upload your 2024 tax return" sub="Needed for verification" badge="Needs upload" badgeTone="coral" done={tasks.tax} onToggle={() => toggle("tax")} />
        <ChecklistItem title="Accept your Cal Grant award" sub="One tap to lock it in" badge="To do" badgeTone="amber" done={tasks.cal} onToggle={() => toggle("cal")} />
      </Card>
    </div>
  );
}

/* ── FAFSA ── */
function FafsaScreen() {
  const { Card, StatusPanel, ProgressBar, ChecklistItem, Button } = DSs;
  const [steps, setSteps] = React.useState({ fsaid: true, invite: true, tax: false, sign: false, submit: false });
  const toggle = (k) => setSteps((s) => ({ ...s, [k]: !s[k] }));
  const done = Object.values(steps).filter(Boolean).length;
  const pct = Math.round((done / 5) * 100);
  return (
    <div>
      <Greeting title="FAFSA Plan" subtitle="Your step-by-step path to a submitted FAFSA — no jargon."
        action={<Button variant="secondary" size="sm">Follow-up questions</Button>} />

      <Card variant="clay" padding={24} style={{ marginBottom: 20, backgroundImage: "linear-gradient(150deg, #fff 55%, var(--blue-50) 150%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ fontSize: 21, fontWeight: 900, color: "var(--ink-900)" }}>You're {pct}% ready</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-500)", marginTop: 3 }}>{done} of 5 steps done · about 25 minutes left</div>
          </div>
          <span style={{ ...money, fontSize: 46, color: "var(--blue-700)" }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} height={12} />
      </Card>

      <SectionTitle>Your steps</SectionTitle>
      <Card variant="clay" padding={8} style={{ marginBottom: 20 }}>
        <ChecklistItem divider title="Create your FSA ID" sub="Both you and a parent need one" done={steps.fsaid} onToggle={() => toggle("fsaid")} />
        <ChecklistItem divider title="Invite your parent contributor" sub="They confirm their part online" done={steps.invite} onToggle={() => toggle("invite")} />
        <ChecklistItem divider title="Gather your 2024 tax info" sub="We point to the exact lines" badge="Next" badgeTone="amber" done={steps.tax} onToggle={() => toggle("tax")} />
        <ChecklistItem divider title="Review and sign" sub="Check every school is listed" done={steps.sign} onToggle={() => toggle("sign")} />
        <ChecklistItem title="Submit your FAFSA" sub="We'll confirm it went through" done={steps.submit} onToggle={() => toggle("submit")} />
      </Card>

      <StatusPanel tone="amber" icon="clipboard" eyebrow="Do this next" title="Gather your 2024 tax info"
        trailing={<Button variant="clay" size="sm" iconRight="arrow-right">Start</Button>}
        style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)" }}>
        Have last year's tax return handy. We never ask for your login or documents.
      </StatusPanel>
    </div>
  );
}

window.HomeScreen = HomeScreen;
window.FafsaScreen = FafsaScreen;
window.AppShared = { Greeting, SectionTitle, money };
