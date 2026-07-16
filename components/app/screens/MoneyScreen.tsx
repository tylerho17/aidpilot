"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Card, Button, Badge, IconButton, Icon } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";
import { Greeting, SectionTitle, money } from "@/components/app/screens/shared";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useUserData } from "@/hooks/useUserData";
import { demoFallback, makeDemoOffers, makeDemoScholarships, useDemoMutations } from "@/lib/demo";
import type { ScholarshipMatch, UserAidOffer } from "@/lib/types";

/* ── AID & MONEY - real-data port of the app UI kit (AppScreens2.jsx) ── */

/** Format an ISO/date string as "Mon D" (e.g. "Apr 15"). Falls back gracefully. */
/** Deadline chip copy + urgency tone. Date-only strings parse at local noon
 * so "2026-08-03" never renders as Aug 2 in US timezones. */
function deadlineMeta(deadline: string | null): { text: string; tone: "coral" | "amber" | "blue" | "gray" } {
  if (!deadline) return { text: "No deadline", tone: "gray" };
  const parsed = new Date(`${deadline.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return { text: "No deadline", tone: "gray" };

  const now = new Date();
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(parsed) - startOfDay(now)) / 86_400_000);
  const dateText = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (days < 0) return { text: `Was due ${dateText}`, tone: "coral" };
  if (days === 0) return { text: "Due today", tone: "coral" };
  const tone = days <= 7 ? "coral" : days <= 14 ? "amber" : "blue";
  return { text: `Due ${dateText} · in ${days} ${days === 1 ? "day" : "days"}`, tone };
}

/** Compact donut gauge - the match % reads at a glance, labeled so it can't
 * be mistaken for a loading bar. Tone tracks match strength. */
function MatchRing({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const tone = clamped >= 90 ? "var(--green-600)" : clamped >= 75 ? "var(--blue-500)" : "var(--amber-600)";
  const size = 54;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - clamped / 100)}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-metric)",
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--ink-900)",
          }}
        >
          {clamped}%
        </span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)" }}>
        match
      </span>
    </div>
  );
}

/** Whole-dollar money string, e.g. 54000 → "$54,000". */
function usd(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function OfferBar({ segments }: { segments: { pct: number; color: string }[] }) {
  return (
    <div style={{ display: "flex", height: 16, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(11,92,173,.14)" }}>
      {segments.map((s, i) => (
        <div key={i} style={{ width: s.pct + "%", background: s.color }} />
      ))}
    </div>
  );
}

function OfferRow({
  dot,
  label,
  value,
  note,
  valueColor,
}: {
  dot: string;
  label: string;
  value: string;
  note?: string;
  valueColor?: string;
}) {
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

function ScholarshipCard({
  name,
  org,
  amount,
  match,
  deadline,
  saved,
  onSave,
}: {
  name: string;
  org: string;
  amount: string;
  match: number;
  deadline: string | null;
  saved: boolean;
  onSave: () => void;
}) {
  const due = deadlineMeta(deadline);
  return (
    <Card variant="clay" padding={18} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink-900)", lineHeight: 1.25 }}>{name}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--gray-500)", marginTop: 3 }}>{org}</div>
        </div>
        <IconButton icon="bookmark" size="sm" active={saved} onClick={onSave} aria-label={saved ? "Saved" : "Save"} />
      </div>

      {/* The two numbers that matter, side by side: award and match strength. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...money, fontSize: 28, color: "var(--green-600)", display: "block", lineHeight: 1.1 }}>{amount}</span>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)" }}>
            award
          </span>
        </div>
        <MatchRing pct={match} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 2 }}>
        <Badge tone={due.tone} dot>{due.text}</Badge>
        <Link href="/scholarships" style={{ textDecoration: "none" }}>
          <Button variant="clay" size="sm" iconRight="arrow-right">Apply</Button>
        </Link>
      </div>
    </Card>
  );
}

/** On-brand skeleton shown while auth/data resolves. */
function LoadingSkeleton() {
  const block = (height: number, width: string | number = "100%"): ReactNode => (
    <div
      style={{
        height,
        width,
        borderRadius: "var(--radius-lg)",
        background: "var(--track)",
        boxShadow: "inset 0 2px 4px rgba(11,92,173,.06)",
      }}
    />
  );
  return (
    <div>
      <Greeting title="Aid & Money" subtitle="Your aid offer, decoded - plus scholarships matched to you." />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {block(180)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {block(200)}
          {block(200)}
        </div>
      </div>
    </div>
  );
}

/** AI plain-language readout of the decoded offer. Sends amounts only to the
 * grounded /api/aid-letter/explain route and reveals the answer with a
 * typewriter. Self-contained; degrades gracefully without a key. */
function AiExplainBlock({ offer }: { offer: UserAidOffer }) {
  const { lang, t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [text, setText] = useState("");
  const [shown, setShown] = useState(0);
  const [err, setErr] = useState("");
  const typer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (typer.current) clearInterval(typer.current); }, []);

  const s = t({
    en: { cta: "Explain this offer with AI", again: "Explain again", thinking: "AidPilot is reading your offer…", warming: "The AI copilot isn't set up on this deployment yet.", note: "AI summary from your numbers - not official financial-aid advice." },
    es: { cta: "Explica esta oferta con IA", again: "Explicar de nuevo", thinking: "AidPilot está leyendo tu oferta…", warming: "El copiloto de IA aún no está configurado en este despliegue.", note: "Resumen de IA a partir de tus cifras - no es asesoría oficial de ayuda financiera." },
  });

  async function explain() {
    if (status === "loading") return;
    setStatus("loading");
    setText("");
    setShown(0);
    setErr("");
    if (typer.current) clearInterval(typer.current);
    try {
      const res = await fetch("/api/aid-letter/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: offer.school_name,
          costOfAttendance: offer.cost_of_attendance,
          grants: offer.grants_and_scholarships,
          workStudy: offer.work_study,
          loans: offer.federal_student_loans + offer.parent_plus_loans + offer.private_loans,
          lang,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { explanation?: string; error?: string };
      if (!res.ok || !body.explanation) {
        setStatus("error");
        setErr(res.status === 503 ? s.warming : body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
      const full = body.explanation;
      setText(full);
      const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) setShown(full.length);
      else typer.current = setInterval(() => {
        setShown((n) => {
          if (n >= full.length) { if (typer.current) clearInterval(typer.current); return n; }
          return Math.min(full.length, n + 2);
        });
      }, 14);
    } catch {
      setStatus("error");
      setErr("Something went wrong. Please try again.");
    }
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-card)" }}>
      <Button variant="secondary" size="sm" iconLeft="plane" onClick={() => void explain()} loading={status === "loading"}>
        {status === "done" ? s.again : s.cta}
      </Button>
      {status !== "idle" && (
        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "50%", background: "var(--blue-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="plane" size={16} color="#fff" strokeWidth={2} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {status === "loading" && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-400)" }}>{s.thinking}</span>}
            {status === "error" && <span style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)" }}>{err}</span>}
            {status === "done" && (
              <>
                <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-800)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                  {text.slice(0, shown)}
                  {shown < text.length && <span style={{ opacity: 0.5 }}>▍</span>}
                </p>
                <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 8, lineHeight: 1.5 }}>{s.note}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Plain-language meaning of each aid category - shown inline (no navigation)
 * so the decode story is self-contained on this screen, demo included. */
const CATEGORY_MEANINGS: { dot: string; label: string; body: string }[] = [
  { dot: "var(--green-600)", label: "Grants & scholarships", body: "Free money - you never pay it back. The more of your cost this covers, the better the offer." },
  { dot: "var(--blue-500)", label: "Work-study", body: "Money you earn from a part-time job the school helps arrange. It is not handed to you up front." },
  { dot: "var(--amber-600)", label: "Loans offered", body: "Borrowed money you repay with interest. Loans are optional - you can accept part, all, or none." },
  { dot: "var(--coral-600)", label: "Out-of-pocket", body: "What is left after grants, work-study, and any loans you accept. This is the real number to plan around." },
];

function OfferSection({
  offer,
  isDemo,
  offerCount,
}: {
  offer: UserAidOffer | null;
  isDemo: boolean;
  offerCount: number;
}) {
  const [showExplainer, setShowExplainer] = useState(false);

  if (!offer) {
    return (
      <>
        <SectionTitle>Your aid offer</SectionTitle>
        <Card variant="clay" padding={24} style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-900)" }}>
            No offer decoded yet
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.5 }}>
            Add your aid offer to see it decoded in plain language.
          </p>
          <div>
            <Link href="/aid-letter" style={{ textDecoration: "none" }}>
              <Button variant="clay" size="sm" iconRight="arrow-right">Add your aid offer</Button>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  const coa = offer.cost_of_attendance;
  const grants = offer.grants_and_scholarships;
  const work = offer.work_study;
  const loans = offer.federal_student_loans + offer.parent_plus_loans + offer.private_loans;
  const outOfPocket = Math.max(0, coa - grants - work - loans);

  const pct = (value: number): number => (coa > 0 ? (value / coa) * 100 : 0);

  return (
    <>
      <SectionTitle
        action={
          // Compare only makes sense with more than one real offer.
          !isDemo && offerCount >= 2 ? (
            <Link href="/aid-letter/compare" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="sm">Compare offers</Button>
            </Link>
          ) : undefined
        }
      >
        Your aid offer
      </SectionTitle>
      <Card variant="clay" padding={24} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "var(--ink-900)" }}>{offer.school_name || "Your school"}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)", marginTop: 2 }}>Cost of attendance · <span style={money}>{usd(coa)}</span>/yr</div>
          </div>
          <div style={{ textAlign: "right", background: "var(--gradient-safe)", borderRadius: 18, padding: "12px 18px", boxShadow: "var(--shadow-clay-sm)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)" }}>Your out-of-pocket</div>
            <div style={{ ...money, fontSize: 30, color: "var(--green-600)" }}>{usd(outOfPocket)}</div>
          </div>
        </div>
        <OfferBar segments={[
          { pct: pct(grants), color: "var(--green-600)" },
          { pct: pct(work), color: "var(--blue-500)" },
          { pct: pct(loans), color: "var(--amber-600)" },
          { pct: pct(outOfPocket), color: "var(--coral-600)" },
        ]} />
        <div style={{ marginTop: 10 }}>
          <OfferRow dot="var(--green-600)" label="Grants & scholarships" note="free money" value={usd(grants)} valueColor="var(--green-600)" />
          <OfferRow dot="var(--blue-500)" label="Work-study" note="you earn it" value={usd(work)} />
          <OfferRow dot="var(--amber-600)" label="Loans offered" note="optional - you can decline" value={usd(loans)} valueColor="var(--amber-600)" />
          <OfferRow dot="var(--coral-600)" label="Out-of-pocket" value={usd(outOfPocket)} valueColor="var(--coral-600)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-card)", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gray-500)" }}>Grants cover most of your cost - loans are optional.</span>
          {isDemo ? (
            <Button
              variant="clay"
              size="sm"
              iconRight={showExplainer ? undefined : "chevron-down"}
              onClick={() => setShowExplainer((v) => !v)}
            >
              {showExplainer ? "Hide breakdown" : "What each part means"}
            </Button>
          ) : (
            <Link href="/aid-letter" style={{ textDecoration: "none" }}>
              <Button variant="clay" size="sm" iconRight="arrow-right">Full breakdown</Button>
            </Link>
          )}
        </div>

        {isDemo && showExplainer && (
          <div className="animate-slide-in" style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {CATEGORY_MEANINGS.map((m) => (
              <div key={m.label} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: m.dot, flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{m.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.55, marginTop: 1 }}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AiExplainBlock offer={offer} />
      </Card>
    </>
  );
}

function ScholarshipSection({
  matches,
  onSave,
}: {
  matches: ScholarshipMatch[];
  onSave: (id: string) => void;
}) {
  const total = matches.reduce((sum, m) => sum + (m.amount ?? 0), 0);

  return (
    <>
      <SectionTitle action={<Badge tone="blue" dot>Coming soon</Badge>}>
        Scholarship matches · <span style={{ color: "var(--blue-700)" }}>{usd(total)}</span>
      </SectionTitle>
      {matches.length === 0 ? (
        <Card variant="clay" padding={24} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-900)" }}>
            No matches yet
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.5 }}>
            Scholarship matching is coming soon - here&apos;s a preview of how your matches will look.
          </p>
        </Card>
      ) : (
        <div className="stagger-children" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {matches.map((m) => (
            <ScholarshipCard
              key={m.id}
              name={m.name}
              org={m.category ?? "Scholarship"}
              amount={usd(m.amount ?? 0)}
              match={m.match_percent ?? 0}
              deadline={m.deadline}
              saved={m.is_saved}
              onSave={() => onSave(m.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function MoneyScreen() {
  const { authReady: offersReady, loading: offersLoading, offers } = useAidOffers();
  const { authReady: dataReady, loading: dataLoading, scholarships, saveScholarship } = useUserData();
  const { isDemo, toggle, has } = useDemoMutations();
  const [savingError, setSavingError] = useState(false);

  const effectiveOffers = useMemo(() => demoFallback(offers, makeDemoOffers), [offers]);
  const effectiveScholarships = useMemo(
    () => demoFallback(scholarships, makeDemoScholarships),
    [scholarships],
  );
  const matches = useMemo(
    () =>
      effectiveScholarships
        .filter((m) => !m.ignored)
        .map((m) => (isDemo(m.id) && has(m.id) ? { ...m, is_saved: !m.is_saved } : m)),
    [effectiveScholarships, isDemo, has],
  );

  const ready = offersReady && dataReady && !offersLoading && !dataLoading;
  if (!ready) {
    return <LoadingSkeleton />;
  }

  const offer = effectiveOffers[0] ?? null;
  const offerIsDemo = offer ? isDemo(offer.id) : false;

  const handleSave = (id: string) => {
    if (isDemo(id)) {
      toggle(id);
      return;
    }
    void saveScholarship(id).catch(() => setSavingError(true));
  };

  return (
    <div>
      <Greeting title="Aid & Money" subtitle="Your aid offer, decoded - plus scholarships matched to you." />
      <OfferSection offer={offer} isDemo={offerIsDemo} offerCount={effectiveOffers.length} />
      <ScholarshipSection matches={matches} onSave={handleSave} />
      {savingError && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-500)", marginTop: 16 }}>
          We couldn&apos;t save that just now - try again in a moment.
        </p>
      )}
    </div>
  );
}
