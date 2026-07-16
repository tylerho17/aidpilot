"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Card, Badge, IconTile, Button, SegmentedControl } from "@/components/ui";
import { Greeting, SectionTitle, money } from "@/components/app/screens/shared";
import { DeadlineCalendar, type CalendarEvent } from "@/components/app/screens/DeadlineCalendar";
import { useUserData } from "@/hooks/useUserData";
import { demoFallback, makeDemoDeadlines, makeDemoDocuments, useDemoMutations } from "@/lib/demo";
import type { Deadline, DocumentItem, DocumentStatus } from "@/lib/types";

/* Docs & Dates - Documents + Deadlines merged. Reproduces the app UI kit's
   TasksScreen / DateRow / DocRow, wired to real user data. */

type Tone = "green" | "amber" | "coral" | "blue";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse a date-only string at local noon so "2026-07-09" never renders as
 * July 8 in US timezones (raw new Date() treats it as UTC midnight). */
function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr.slice(0, 10)}T12:00:00`);
}

/** Format a date string as "Mon D" (e.g. "Mar 12"). */
function formatMonthDay(dateStr: string): string {
  const d = parseDateOnly(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Whole days from `now` until `dateStr` (negative if past). Pure given inputs. */
function daysUntil(dateStr: string, now: Date): number {
  const d = parseDateOnly(dateStr);
  if (Number.isNaN(d.getTime())) return 0;
  const startOfDay = (dt: Date) => Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate());
  return Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);
}

/** Calm countdown copy: "N days", "Today", or "N days ago". */
function formatCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days < 0) {
    const n = Math.abs(days);
    return n === 1 ? "1 day ago" : `${n} days ago`;
  }
  return days === 1 ? "1 day" : `${days} days`;
}

/** Derive a status tone for a deadline from its status + urgency. */
function deadlineTone(status: string, days: number): Tone {
  const s = status.toLowerCase();
  if (s === "completed") return "green";
  if (s === "needs attention" || days < 0) return "coral";
  if (s === "due soon" || days <= 10) return "amber";
  return "blue";
}

/** Map a document status to its badge label + tone. */
function documentBadge(status: string): { label: string; tone: Tone; needsUpload: boolean } {
  switch (status as DocumentStatus) {
    case "verified":
      return { label: "Verified", tone: "green", needsUpload: false };
    case "submitted":
      return { label: "In review", tone: "amber", needsUpload: false };
    case "needed":
    case "not_started":
    default:
      return { label: "Needs upload", tone: "coral", needsUpload: true };
  }
}

function DateRow({
  label,
  sub,
  date,
  days,
  tone,
}: {
  label: string;
  sub: string;
  date: string;
  days: string;
  tone: Tone;
}) {
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

function DocRow({
  name,
  sub,
  status,
  tone,
  needsUpload,
  onUpload,
  uploading,
}: {
  name: string;
  sub: string;
  status: string;
  tone: Tone;
  needsUpload: boolean;
  onUpload: () => void;
  uploading: boolean;
}) {
  return (
    <Card variant="clay" padding={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <IconTile icon="file" tone={tone} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)" }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-400)", marginTop: 2 }}>{sub}</div>
      </div>
      <Badge tone={tone}>{status}</Badge>
      {needsUpload && (
        <Button variant="clay" size="sm" onClick={onUpload} loading={uploading}>Upload</Button>
      )}
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card variant="clay" padding={20} style={{ textAlign: "center" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)" }}>{message}</span>
    </Card>
  );
}

const columnStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };

export function TasksScreen() {
  const { deadlines, documents, updateDocumentStatus, authReady, loading } = useUserData();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [datesView, setDatesView] = useState<"list" | "calendar">("list");
  const demo = useDemoMutations();

  const displayDeadlines = useMemo(() => demoFallback(deadlines, makeDemoDeadlines), [deadlines]);
  const displayDocuments = useMemo(() => demoFallback(documents, makeDemoDocuments), [documents]);

  // Calendar events: every deadline, plus documents that carry a due date.
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const now = new Date();
    const fromDeadlines = displayDeadlines.map((d): CalendarEvent => ({
      id: d.id,
      date: d.deadline_date,
      label: d.title,
      sub: d.source_name ?? d.category ?? undefined,
      tone: deadlineTone(d.status, daysUntil(d.deadline_date, now)),
      kind: "Deadline",
    }));
    const fromDocuments = displayDocuments
      .filter((doc): doc is DocumentItem & { due_date: string } => Boolean(doc.due_date))
      .map((doc): CalendarEvent => ({
        id: doc.id,
        date: doc.due_date,
        label: doc.title,
        sub: "Document due",
        tone: documentBadge(demo.has(doc.id) ? "submitted" : doc.status).tone,
        kind: "Document",
      }));
    return [...fromDeadlines, ...fromDocuments];
  }, [displayDeadlines, displayDocuments, demo]);

  if (!authReady || loading) {
    return (
      <div>
        <Greeting title="Docs & Dates" subtitle="Every deadline and document in one place - caught early." />
        <div style={columnStyle}>
          {[0, 1, 2].map((i) => (
            <Card key={i} variant="clay" padding={16} style={{ height: 78, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();
  const sortedDeadlines = [...displayDeadlines].sort(
    (a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
  );

  const handleUpload = async (doc: DocumentItem) => {
    if (demo.isDemo(doc.id)) {
      // Demo rows never hit Supabase - flip presentation locally to "In review".
      if (!demo.has(doc.id)) demo.toggle(doc.id);
      return;
    }
    setUploadingId(doc.id);
    try {
      await updateDocumentStatus(doc.id, "submitted");
    } catch {
      // Surface nothing raw; the hook already logs. Row simply stays put.
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <Greeting
        title="Docs & Dates"
        subtitle="Every deadline and document in one place - caught early."
        action={
          <SegmentedControl
            size="sm"
            options={[
              { value: "list", label: "List" },
              { value: "calendar", label: "Calendar" },
            ]}
            value={datesView}
            onChange={(v) => setDatesView(v === "calendar" ? "calendar" : "list")}
          />
        }
      />

      <SectionTitle>Upcoming deadlines</SectionTitle>
      {datesView === "calendar" ? (
        <div key="calendar" className="page-enter" style={{ marginBottom: 28 }}>
          <DeadlineCalendar events={calendarEvents} />
        </div>
      ) : (
        <div key="list" className="stagger-children" style={{ ...columnStyle, marginBottom: 28 }}>
          {sortedDeadlines.length === 0 ? (
            <EmptyState message="No deadlines yet - we'll catch them early." />
          ) : (
            sortedDeadlines.map((deadline: Deadline) => {
              const days = daysUntil(deadline.deadline_date, now);
              return (
                <DateRow
                  key={deadline.id}
                  label={deadline.title}
                  sub={deadline.source_name ?? deadline.description ?? deadline.category ?? "Deadline"}
                  date={formatMonthDay(deadline.deadline_date)}
                  days={formatCountdown(days)}
                  tone={deadlineTone(deadline.status, days)}
                />
              );
            })
          )}
        </div>
      )}

      <SectionTitle>Your documents</SectionTitle>
      <div className="stagger-children" style={columnStyle}>
        {displayDocuments.length === 0 ? (
          <EmptyState message="No documents requested yet." />
        ) : (
          displayDocuments.map((doc: DocumentItem) => {
            const badge = documentBadge(demo.has(doc.id) ? "submitted" : doc.status);
            return (
              <DocRow
                key={doc.id}
                name={doc.title}
                sub={doc.source ?? doc.note ?? "Requested document"}
                status={badge.label}
                tone={badge.tone}
                needsUpload={badge.needsUpload}
                onUpload={() => void handleUpload(doc)}
                uploading={uploadingId === doc.id}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
