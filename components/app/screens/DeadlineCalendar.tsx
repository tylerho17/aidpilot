"use client";

import { useMemo, useState } from "react";
import { Card, Badge, Icon, Button } from "@/components/ui";

/* Month calendar for Docs & Dates - deadlines and document due dates plotted
   on a clay-card grid. Pure presentation: events come in as plain data, so it
   renders demo fixtures and real Supabase rows identically. */

type Tone = "green" | "amber" | "coral" | "blue";

export type CalendarEvent = {
  id: string;
  /** Date-only key, "YYYY-MM-DD". */
  date: string;
  label: string;
  sub?: string;
  tone: Tone;
  kind: "Deadline" | "Document";
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TONE_FG: Record<Tone, string> = {
  green: "var(--green-600)",
  amber: "var(--amber-600)",
  coral: "var(--coral-600)",
  blue: "var(--blue-500)",
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function keyOf(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

/** "Mon D" from a date-only key, parsed at local noon (timezone-safe). */
function prettyDay(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function DeadlineCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const todayKey = keyOf(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [selected, setSelected] = useState<string>(todayKey);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const k = e.date.slice(0, 10);
      const bucket = map.get(k);
      if (bucket) bucket.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [events]);

  const onCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();

  const shiftMonth = (delta: number) => {
    setView(({ y, m }) => {
      const next = new Date(y, m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });
  };

  // Build the visible grid: leading + trailing spillover keeps full weeks.
  const cells = useMemo(() => {
    const firstWeekday = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const dayOffset = i - firstWeekday;
      const date = new Date(view.y, view.m, 1 + dayOffset);
      return {
        key: keyOf(date.getFullYear(), date.getMonth(), date.getDate()),
        day: date.getDate(),
        inMonth: date.getMonth() === view.m,
      };
    });
  }, [view]);

  const selectedEvents = eventsByDate.get(selected) ?? [];

  return (
    <Card variant="clay" padding={24}>
      {/* Header: month + navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-.4px", color: "var(--ink-900)" }}>
          {MONTH_NAMES[view.m]} {view.y}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!onCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setView({ y: today.getFullYear(), m: today.getMonth() });
                setSelected(todayKey);
              }}
            >
              Today
            </Button>
          )}
          <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} style={navBtn}>
            <Icon name="chevron-left" size={18} color="var(--gray-500)" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} style={navBtn}>
            <Icon name="chevron-left" size={18} color="var(--gray-500)" style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={{ textAlign: "center", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", padding: "4px 0" }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((cell) => {
          const dayEvents = eventsByDate.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selected;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelected(cell.key)}
              aria-label={`${prettyDay(cell.key)}${dayEvents.length ? `, ${dayEvents.length} due` : ""}`}
              aria-pressed={isSelected}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minHeight: 56,
                padding: "7px 2px 6px",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                background: isSelected ? "var(--blue-100)" : "transparent",
                boxShadow: isSelected ? "inset 0 0 0 1.5px var(--blue-200)" : "none",
                transition: "background .12s ease",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  fontSize: 13,
                  fontWeight: isToday ? 800 : 600,
                  fontFamily: "var(--font-body)",
                  color: isToday ? "#fff" : cell.inMonth ? "var(--ink-800)" : "var(--gray-300)",
                  background: isToday ? "var(--blue-700)" : "transparent",
                  boxShadow: isToday ? "var(--shadow-brand)" : "none",
                }}
              >
                {cell.day}
              </span>
              <span style={{ display: "flex", gap: 3, minHeight: 6 }}>
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} style={{ width: 6, height: 6, borderRadius: "50%", background: TONE_FG[e.tone], opacity: cell.inMonth ? 1 : 0.45 }} />
                ))}
                {dayEvents.length > 3 && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "var(--gray-400)", lineHeight: "6px" }}>+{dayEvents.length - 3}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected-day items */}
      <div style={{ borderTop: "1px solid var(--border-card)", marginTop: 14, paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".7px", color: "var(--gray-400)", marginBottom: 10 }}>
          {prettyDay(selected)}
        </div>
        {selectedEvents.length === 0 ? (
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--gray-400)" }}>
            Nothing due this day.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedEvents.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: TONE_FG[e.tone], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{e.label}</span>
                  {e.sub && (
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", marginLeft: 8 }}>{e.sub}</span>
                  )}
                </div>
                <Badge tone={e.tone}>{e.kind}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const navBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface-app)",
  cursor: "pointer",
};
