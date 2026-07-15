"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Card, StatusPanel, StatCard, ChecklistItem, Button, Badge, IconTile, Icon } from "@/components/ui";
import { Greeting, SectionTitle } from "@/components/app/screens/shared";
import { ComingSoonCard } from "@/components/app/ComingSoonCard";
import { useUserData } from "@/hooks/useUserData";
import { useProtectHub } from "@/hooks/useProtectHub";
import { useAidOffers } from "@/hooks/useAidOffers";
import {
  demoFallback,
  makeDemoTasks,
  makeDemoDeadlines,
  makeDemoScholarships,
  makeDemoOffers,
  useDemoMutations,
  DEMO_PROTECT_PANEL,
} from "@/lib/demo";
import { getProfileFullName } from "@/lib/profile-fields";
import { isAidTaskComplete } from "@/lib/data-helpers";
import type { ProtectOverallStatus } from "@/lib/protect/getProtectStatus";
import type { AidTask, Deadline } from "@/lib/types";

type StatusTone = "green" | "amber" | "coral" | "blue";
type BadgeTone = "green" | "amber" | "coral" | "blue" | "gray";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function firstNameFrom(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "there";
}

function timeOfDay(hour: number): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** "Mon D" from a date-only string like "2026-03-04", parsed at local noon. */
function formatMonthDay(dateValue: string): string {
  const parsed = new Date(`${dateValue.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${MONTHS[parsed.getMonth()]} ${parsed.getDate()}`;
}

/** Whole days from today until a date-only string (can be 0 or negative). */
function daysUntil(dateValue: string, today: Date): number {
  const parsed = new Date(`${dateValue.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return Number.NaN;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownLabel(days: number): string {
  if (Number.isNaN(days)) return "–";
  if (days <= 0) return "Today";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function isDeadlineDone(status: string): boolean {
  return status.trim().toLowerCase() === "completed";
}

/** Map the Protect snapshot's overall status to a calm StatusPanel tone/icon. */
function protectPanel(status: ProtectOverallStatus): { tone: StatusTone; icon: string; eyebrow: string } {
  switch (status) {
    case "protected":
      return { tone: "green", icon: "shield-check", eyebrow: "Protected" };
    case "in_progress":
      return { tone: "amber", icon: "shield", eyebrow: "In progress" };
    case "needs_setup":
      return { tone: "amber", icon: "shield", eyebrow: "Set up" };
    case "needs_attention":
    default:
      return { tone: "coral", icon: "shield", eyebrow: "Needs attention" };
  }
}

/** Map an aid-task status to a to-do badge label + tone, keeping the kit's voice. */
function taskBadge(task: AidTask): { badge: string; badgeTone: BadgeTone } {
  const status = task.status.trim().toLowerCase();
  if (status === "missing" || status === "blocked") return { badge: "Needs upload", badgeTone: "coral" };
  if (status === "due soon" || status === "due_soon" || status === "in_progress")
    return { badge: "Due soon", badgeTone: "amber" };
  if (status === "needs review" || status === "needs_review") return { badge: "Review", badgeTone: "amber" };
  return { badge: "To do", badgeTone: "blue" };
}

function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/** Soonest not-yet-completed deadline by date. */
function nextDeadline(deadlines: Deadline[]): Deadline | null {
  return (
    [...deadlines]
      .filter((d) => !isDeadlineDone(d.status))
      .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date))[0] ?? null
  );
}

function HomeSkeleton() {
  const block: CSSProperties = {
    background: "var(--surface-card)",
    borderRadius: "var(--radius-clay)",
    boxShadow: "var(--shadow-clay)",
  };
  return (
    <div aria-hidden style={{ opacity: 0.7 }}>
      <div style={{ height: 40, width: 280, borderRadius: 12, background: "var(--blue-100)", marginBottom: 10 }} />
      <div style={{ height: 16, width: 340, borderRadius: 8, background: "var(--blue-50)", marginBottom: 24 }} />
      <div style={{ ...block, height: 96, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <div style={{ ...block, height: 128 }} />
        <div style={{ ...block, height: 128 }} />
        <div style={{ ...block, height: 128 }} />
      </div>
      <div style={{ ...block, height: 220 }} />
    </div>
  );
}

export function HomeScreen() {
  const {
    profile,
    tasks,
    deadlines,
    scholarships,
    authReady: userAuthReady,
    loading: userLoading,
    updateTaskStatus,
  } = useUserData();
  const { snapshot, loading: protectLoading } = useProtectHub();
  const { offers } = useAidOffers();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [poppingId, setPoppingId] = useState<string | null>(null);

  // Demo seam: fixtures fill in only when demo mode is on AND the real
  // collection is empty. Real rows always win (see lib/demo).
  const demo = useDemoMutations();
  const displayTasks = useMemo(() => demoFallback(tasks, makeDemoTasks), [tasks]);
  const displayDeadlines = useMemo(() => demoFallback(deadlines, makeDemoDeadlines), [deadlines]);
  const displayScholarships = useMemo(() => demoFallback(scholarships, makeDemoScholarships), [scholarships]);
  const displayOffers = useMemo(() => demoFallback(offers, makeDemoOffers), [offers]);

  const now = new Date();
  const greetingName = firstNameFrom(getProfileFullName(profile));
  const todayLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Loading: wait for auth + the first data + protect snapshot.
  if (!userAuthReady || userLoading || protectLoading) {
    return <HomeSkeleton />;
  }

  // Demo fixtures are on screen only when the real story is empty (tasks AND
  // offers) and demo mode filled them in - then the status panel tells the
  // coherent demo narrative instead of the real protect snapshot.
  const usingDemo = tasks.length === 0 && offers.length === 0 && displayTasks.length > 0;

  // ── StatCard 1: Aid secured this year (sum of grants + scholarships across offers) ──
  const aidSecured = displayOffers.reduce((sum, offer) => sum + offer.grants_and_scholarships, 0);
  const offerCount = displayOffers.length;

  // ── StatCard 2: Next deadline ──
  const soonest = nextDeadline(displayDeadlines);
  const nextDeadlineDays = soonest ? daysUntil(soonest.deadline_date, now) : Number.NaN;

  // ── StatCard 3: New scholarships (not ignored) ──
  const openScholarships = displayScholarships.filter((s) => !s.ignored && s.status !== "ignored");
  const scholarshipCount = openScholarships.length;
  const scholarshipPotential = openScholarships.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  // ── To-dos: up to 3 incomplete tasks. Demo rows toggle locally (they never
  // hit Supabase), so "done" flips off their base status; real rows persist. ──
  const isTaskDone = (task: AidTask): boolean => {
    const base = isAidTaskComplete(task.status);
    return demo.has(task.id) ? !base : base;
  };
  const openTasks = displayTasks.filter((t) => !isAidTaskComplete(t.status)).slice(0, 3);
  const doneThisWeek = displayTasks.filter((t) => isTaskDone(t)).length;
  const totalThisWeek = displayTasks.length;

  const isProtected = snapshot.overallStatus === "protected";
  const panel = usingDemo
    ? { tone: DEMO_PROTECT_PANEL.tone, icon: DEMO_PROTECT_PANEL.icon, eyebrow: DEMO_PROTECT_PANEL.eyebrow }
    : protectPanel(snapshot.overallStatus);
  const panelTitle = usingDemo
    ? DEMO_PROTECT_PANEL.title
    : isProtected
      ? "Your aid is protected this week."
      : snapshot.headline;
  const panelBody = usingDemo
    ? DEMO_PROTECT_PANEL.body
    : isProtected
      ? "We're watching your eligibility, enrollment, and requirements. Nothing needs urgent attention."
      : snapshot.description;
  const panelBadge = usingDemo ? DEMO_PROTECT_PANEL.badge : isProtected ? "On track" : "Review";

  const handleToggle = async (task: AidTask) => {
    if (busyId) return;
    setPoppingId(task.id);
    window.setTimeout(() => {
      setPoppingId((current) => (current === task.id ? null : current));
    }, 460);
    if (demo.isDemo(task.id)) {
      demo.toggle(task.id);
      return;
    }
    setBusyId(task.id);
    try {
      await updateTaskStatus(task.id, "Complete");
    } catch {
      // Never surface raw errors on the calm dashboard; the row simply stays.
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Greeting
        title={`Good ${timeOfDay(now.getHours())}, ${greetingName}`}
        subtitle={`${todayLabel} · here's your weekly check-in.`}
        action={
          <Button variant="clay" size="sm" iconLeft="shield">
            Weekly report
          </Button>
        }
      />

      <StatusPanel
        tone={panel.tone}
        icon={panel.icon}
        eyebrow={panel.eyebrow}
        title={panelTitle}
        trailing={
          <Badge tone={panel.tone} dot>
            {panelBadge}
          </Badge>
        }
        style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 20 }}
      >
        {panelBody}
      </StatusPanel>

      <div
        className="stagger-children"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}
      >
        <StatCard
          label="Aid secured this year"
          value={money(aidSecured)}
          sub={offerCount > 0 ? `across ${offerCount} offer${offerCount === 1 ? "" : "s"}` : "Add an offer to track it"}
          icon="shield-check"
          tone="green"
          valueColor="var(--green-600)"
        />
        <StatCard
          label="Next deadline"
          value={soonest ? countdownLabel(nextDeadlineDays) : "–"}
          sub={soonest ? soonest.title : "Nothing due soon"}
          icon="calendar"
          tone="amber"
          valueColor="var(--amber-600)"
        />
        <StatCard
          label="New scholarships"
          value={scholarshipCount}
          sub={`${money(scholarshipPotential)} in potential`}
          icon="star"
          tone="blue"
          valueColor="var(--blue-700)"
        />
      </div>

      <SectionTitle
        action={
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-400)" }}>
            {doneThisWeek} of {totalThisWeek} done
          </span>
        }
      >
        This week&apos;s to-dos
      </SectionTitle>
      <Card variant="clay" padding={8}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 14px",
            borderRadius: 15,
            backgroundImage: "var(--gradient-info)",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".7px",
              color: "var(--blue-700)",
            }}
          >
            Aid check-in
          </span>
          {soonest && (
            <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--blue-700)" }}>
              by {formatMonthDay(soonest.deadline_date)}
            </span>
          )}
        </div>

        {openTasks.length === 0 ? (
          <div style={{ padding: "22px 14px", textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink-800)" }}>
              You&apos;re all caught up this week. Nice work.
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 5 }}>
              We&apos;ll surface your next steps here as they come in.
            </div>
          </div>
        ) : (
          <div className="stagger-children">
            {openTasks.map((task, index) => {
              const { badge, badgeTone } = taskBadge(task);
              return (
                <ChecklistItem
                  key={task.id}
                  divider={index < openTasks.length - 1}
                  title={task.title}
                  sub={task.description ?? undefined}
                  badge={badge}
                  badgeTone={badgeTone}
                  done={isTaskDone(task)}
                  popping={poppingId === task.id}
                  onToggle={() => void handleToggle(task)}
                />
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 28 }}>
        <SectionTitle>More tools</SectionTitle>
        <div
          className="stagger-children"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}
        >
          <ToolLinkCard
            href="/aid-money"
            icon="star"
            tone="blue"
            title="Aid & Money"
            sub="Offers, scholarships, and your money picture"
          />
          <ToolLinkCard
            href="/docs-dates"
            icon="calendar"
            tone="amber"
            title="Docs & Dates"
            sub="Every document and deadline in one place"
          />
        </div>

        <SectionTitle>Coming soon</SectionTitle>
        <ComingSoonCard />
      </div>
    </div>
  );
}

function ToolLinkCard({
  href,
  icon,
  tone,
  title,
  sub,
}: {
  href: string;
  icon: string;
  tone: "blue" | "amber" | "green" | "coral";
  title: string;
  sub: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Card variant="clay" padding={18} lift style={{ display: "flex", alignItems: "center", gap: 14, height: "100%" }}>
        <IconTile icon={icon} tone={tone} size={44} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="font-display" style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "var(--ink-900)" }}>
            {title}
          </span>
          <span style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--gray-500)", marginTop: 2 }}>
            {sub}
          </span>
        </span>
        <Icon name="arrow-right" size={17} color="var(--gray-400)" />
      </Card>
    </Link>
  );
}
