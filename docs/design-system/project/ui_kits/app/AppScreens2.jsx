/* AidPilot app UI kit — Aid & Money (offers + scholarships) and Docs & Dates. */
const DSs2 = window.AidPilotDesignSystem_59a3d7;
const { Greeting, SectionTitle, money } = window.AppShared;

/* ── AID & MONEY ── */
function OfferBar({ segments }) {
  return (
    <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(11,92,173,.14)" }}>
      {segments.map((s, i) => <div key={i} style={{ width: s.pct + "%", background: s.color }} />)}
    </div>
  );
}
function OfferRow({ dot, label, value, note, valueColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0" }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-800)" }}>{label}</span>
        {note && <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-400)", marginLeft: 8 }}>{note}</span>}
      </div>
      <span style={{ ...money, fontSize: 17, color: valueColor || "var(--ink-900)" }}>{value}</span>
    </div>
  );
}

function ScholarshipCard({ name, org, amount, match, deadline, tags }) {
  const { Card, Badge, IconButton, Button, ProgressBar } = DSs2;
  return (
    <Card variant="clay" padding={18} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink-900)", lineHeight: 1.25 }}>{name}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-500)", marginTop: 3 }}>{org}</div>
        </div>
        <IconButton icon="bookmark" size="sm" aria-label="Save" />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ ...money, fontSize: 28, color: "var(--green-600)" }}>{amount}</span>
        <Badge tone="green">{match}% match</Badge>
      </div>
      <ProgressBar pct={match} height={7} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tags.map((t) => <Badge key={t} tone="gray">{t}</Badge>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--amber-600)" }}>Due {deadline}</span>
        <Button variant="clay" size="sm" iconRight="arrow-right">Apply</Button>
      </div>
    </Card>
  );
}

function MoneyScreen() {
  const { Card, Button, Badge } = DSs2;
  return (
    <div>
      <Greeting title="Aid & Money" subtitle="Your aid offer, decoded — plus scholarships matched to you." />

      <SectionTitle action={<Button variant="ghost" size="sm">Compare offers</Button>}>Your aid offer</SectionTitle>
      <Card variant="clay" padding={24} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-900)" }}>Stanford University</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)", marginTop: 2 }}>Cost of attendance · <span style={money}>$82,000</span>/yr</div>
          </div>
          <div style={{ textAlign: "right", background: "var(--gradient-safe)", borderRadius: 18, padding: "12px 18px", boxShadow: "var(--shadow-clay-sm)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)" }}>Your out-of-pocket</div>
            <div style={{ ...money, fontSize: 30, color: "var(--green-600)" }}>$16,300</div>
          </div>
        </div>
        <OfferBar segments={[
          { pct: 66, color: "var(--green-600)" },
          { pct: 4, color: "var(--blue-500)" },
          { pct: 10, color: "var(--amber-600)" },
          { pct: 20, color: "var(--coral-600)" },
        ]} />
        <div style={{ marginTop: 10 }}>
          <OfferRow dot="var(--green-600)" label="Grants & scholarships" note="free money" value="$54,000" valueColor="var(--green-600)" />
          <OfferRow dot="var(--blue-500)" label="Work-study" note="you earn it" value="$3,200" />
          <OfferRow dot="var(--amber-600)" label="Loans offered" note="optional — you can decline" value="$8,500" valueColor="var(--amber-600)" />
          <OfferRow dot="var(--coral-600)" label="Out-of-pocket" value="$16,300" valueColor="var(--coral-600)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-card)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)" }}>Grants cover most of your cost — loans are optional.</span>
          <Button variant="clay" size="sm" iconRight="arrow-right">Full breakdown</Button>
        </div>
      </Card>

      <SectionTitle action={<Button variant="ghost" size="sm" iconLeft="star">Refresh</Button>}>Scholarship matches · <span style={{ color: "var(--blue-700)" }}>$24,500</span></SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ScholarshipCard name="First-Gen Scholars Fund" org="UC Irvine Foundation" amount="$5,000" match={96} deadline="Apr 15" tags={["First-gen", "No essay"]} />
        <ScholarshipCard name="Latina Leaders Grant" org="Hispanic Scholarship Fund" amount="$8,000" match={92} deadline="Mar 30" tags={["Heritage", "Leadership"]} />
        <ScholarshipCard name="STEM Futures Award" org="San Diego Foundation" amount="$3,500" match={88} deadline="May 1" tags={["STEM", "Sophomore"]} />
        <ScholarshipCard name="Community Impact" org="Cal Grant Partners" amount="$2,000" match={84} deadline="Apr 22" tags={["Service"]} />
      </div>
    </div>
  );
}

/* ── DOCS & DATES ── */
function DateRow({ label, sub, date, days, tone }) {
  const { Card, Badge, IconTile } = DSs2;
  return (
    <Card variant="clay" padding={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <IconTile icon="calendar" tone={tone} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ ...money, fontSize: 15, color: "var(--ink-700)" }}>{date}</div>
        <Badge tone={tone} dot>{days}</Badge>
      </div>
    </Card>
  );
}
function DocRow({ name, sub, status, tone }) {
  const { Card, Badge, IconTile, Button } = DSs2;
  return (
    <Card variant="clay" padding={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <IconTile icon="file" tone={tone} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", marginTop: 2 }}>{sub}</div>
      </div>
      <Badge tone={tone}>{status}</Badge>
      {tone === "coral"
        ? <Button variant="clay" size="sm">Upload</Button>
        : <Button variant="ghost" size="sm" iconRight="arrow-right">View</Button>}
    </Card>
  );
}

function TasksScreen() {
  const { Button } = DSs2;
  return (
    <div>
      <Greeting title="Docs & Dates" subtitle="Every deadline and document in one place — caught early."
        action={<Button variant="clay" size="sm" iconLeft="plus">Add</Button>} />

      <SectionTitle>Upcoming deadlines</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        <DateRow label="Cal Grant renewal" sub="California Student Aid Commission" date="Mar 12" days="8 days" tone="amber" />
        <DateRow label="Verify tax documents" sub="UC Irvine financial aid office" date="Mar 20" days="16 days" tone="blue" />
        <DateRow label="CSS Profile — Stanford" sub="Institutional aid form" date="Apr 1" days="28 days" tone="blue" />
      </div>

      <SectionTitle>Your documents</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DocRow name="2024 tax return" sub="Requested by UC Irvine · for verification" status="Needs upload" tone="coral" />
        <DocRow name="Photo ID" sub="Verified Feb 28" status="Verified" tone="green" />
        <DocRow name="Proof of enrollment" sub="In review since Mar 1" status="In review" tone="amber" />
        <DocRow name="FAFSA Submission Summary" sub="Uploaded Feb 20" status="Verified" tone="green" />
      </div>
    </div>
  );
}

Object.assign(window, { MoneyScreen, TasksScreen });
