import type { Language } from "@/lib/i18n";

/**
 * Proactive California aid deadline engine.
 *
 * A static, human-sourced set of the CA + federal financial-aid deadlines every
 * California student needs, plus a computation layer that turns them into "what
 * to do next, and when" relative to today. Unlike a chatbot that answers only
 * when asked, this surfaces the single most-urgent deadline proactively and
 * counts every date down. No PII, no database - just dates and math.
 *
 * Sourced 2026-07-17 from the California Student Aid Commission (csac.ca.gov -
 * Cal Grant, Chafee, apply/important-dates) and StudentAid.gov FAFSA deadlines.
 * Recorded in docs/content-source.md. Dates are fixed calendar deadlines; the
 * verification deadline is set each year by the Federal Register and is
 * approximate here. Re-source and bump when the award year rolls (see
 * lib/fafsa-guide/currency.ts).
 */

export type DeadlineStatus = "past" | "today" | "urgent" | "soon" | "upcoming";
export type DeadlineTone = "coral" | "amber" | "blue" | "gray";

export interface AidDeadline {
  id: string;
  /** Date-only ISO key "YYYY-MM-DD". */
  date: string;
  /** True when the exact date is set later (e.g. by the Federal Register). */
  approx?: boolean;
  awardYear: string;
  title: Record<Language, string>;
  /** Compact name for chips/pills (e.g. the dashboard "next date" pill). */
  short: Record<Language, string>;
  who: Record<Language, string>;
  action: Record<Language, string>;
  href: string;
}

/** Canonical CA + federal aid deadlines. Keep sorted-agnostic; the engine sorts. */
export const CA_DEADLINES: AidDeadline[] = [
  {
    id: "ccc-cal-grant-sep2",
    date: "2026-09-02",
    awardYear: "2026–27",
    title: {
      en: "Cal Grant community college deadline",
      es: "Fecha límite de Cal Grant para colegio comunitario",
    },
    short: { en: "Cal Grant (community college)", es: "Cal Grant (colegio comunitario)" },
    who: {
      en: "California Community College students who missed the March 2 deadline",
      es: "Estudiantes de colegios comunitarios de California que no cumplieron la fecha del 2 de marzo",
    },
    action: {
      en: "Submit your FAFSA or CA Dream Act Application and make sure your GPA is on file by Sept 2.",
      es: "Envía tu FAFSA o Solicitud de la Ley Dream de California y asegúrate de que tu GPA esté registrado antes del 2 de septiembre.",
    },
    href: "https://www.csac.ca.gov/cal-grant",
  },
  {
    id: "fafsa-cadaa-open-2728",
    date: "2026-10-01",
    awardYear: "2027–28",
    title: {
      en: "2027–28 FAFSA & CA Dream Act Application open",
      es: "Se abren la FAFSA y la Solicitud de la Ley Dream 2027–28",
    },
    short: { en: "2027–28 FAFSA opens", es: "Se abre la FAFSA 2027–28" },
    who: {
      en: "Everyone applying for aid for the 2027–28 school year",
      es: "Todos los que solicitan ayuda para el año escolar 2027–28",
    },
    action: {
      en: "File as early as you can — much state aid is first-come, first-served.",
      es: "Presenta lo antes posible — mucha ayuda estatal se otorga por orden de llegada.",
    },
    href: "https://www.csac.ca.gov/apply",
  },
  {
    id: "cal-grant-priority-march2",
    date: "2027-03-02",
    awardYear: "2027–28",
    title: {
      en: "March 2 Cal Grant deadline (priority + final)",
      es: "Fecha límite de Cal Grant del 2 de marzo (prioritaria y final)",
    },
    short: { en: "March 2 Cal Grant deadline", es: "Fecha límite Cal Grant 2 de marzo" },
    who: {
      en: "Every California student applying for a Cal Grant for 2027–28",
      es: "Todo estudiante de California que solicita un Cal Grant para 2027–28",
    },
    action: {
      en: "Submit your FAFSA or CA Dream Act Application AND confirm your school sent your GPA by March 2.",
      es: "Envía tu FAFSA o Solicitud de la Ley Dream Y confirma que tu escuela envió tu GPA antes del 2 de marzo.",
    },
    href: "https://www.csac.ca.gov/cal-grant",
  },
  {
    id: "fafsa-federal-jun30",
    date: "2027-06-30",
    awardYear: "2026–27",
    title: {
      en: "Federal FAFSA deadline (2026–27)",
      es: "Fecha límite federal de la FAFSA (2026–27)",
    },
    short: { en: "2026–27 FAFSA closes", es: "Cierra la FAFSA 2026–27" },
    who: {
      en: "Anyone who still needs to file the 2026–27 FAFSA for federal aid",
      es: "Cualquiera que aún necesite presentar la FAFSA 2026–27 para ayuda federal",
    },
    action: {
      en: "This is the last day to submit the 2026–27 FAFSA — you can still qualify for a Pell Grant up to this date.",
      es: "Este es el último día para enviar la FAFSA 2026–27 — aún puedes calificar para una Beca Pell hasta esta fecha.",
    },
    href: "https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines",
  },
  {
    id: "chafee-jul31",
    date: "2027-07-31",
    awardYear: "2026–27",
    title: {
      en: "Chafee Grant deadline for foster youth",
      es: "Fecha límite de la Beca Chafee para jóvenes de crianza",
    },
    short: { en: "Chafee Grant", es: "Beca Chafee" },
    who: {
      en: "Current or former foster youth (up to $5,000/year)",
      es: "Jóvenes de crianza actuales o anteriores (hasta $5,000 por año)",
    },
    action: {
      en: "Apply for the California Chafee Grant and complete your FAFSA or CA Dream Act Application.",
      es: "Solicita la Beca Chafee de California y completa tu FAFSA o Solicitud de la Ley Dream.",
    },
    href: "https://www.csac.ca.gov/chafee",
  },
  {
    id: "verification-sep",
    date: "2027-09-15",
    approx: true,
    awardYear: "2026–27",
    title: {
      en: "FAFSA verification deadline",
      es: "Fecha límite de verificación de la FAFSA",
    },
    short: { en: "FAFSA verification", es: "Verificación de FAFSA" },
    who: {
      en: "Students selected for verification for 2026–27",
      es: "Estudiantes seleccionados para verificación para 2026–27",
    },
    action: {
      en: "If you were selected, submit every requested document. The exact federal date lands around mid-September — confirm your school's deadline.",
      es: "Si te seleccionaron, entrega todos los documentos solicitados. La fecha federal exacta llega a mediados de septiembre — confirma la fecha límite de tu escuela.",
    },
    href: "https://studentaid.gov/apply-for-aid/fafsa/review-and-correct",
  },
];

/** Whole days from `today` until a date-only ISO string (negative if past). */
export function daysUntil(dateKey: string, today: Date): number {
  const parsed = new Date(`${dateKey.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return Number.NaN;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function statusFor(days: number): DeadlineStatus {
  if (Number.isNaN(days) || days < 0) return "past";
  if (days === 0) return "today";
  if (days <= 14) return "urgent";
  if (days <= 45) return "soon";
  return "upcoming";
}

export function toneFor(status: DeadlineStatus): DeadlineTone {
  switch (status) {
    case "past":
      return "gray";
    case "today":
    case "urgent":
      return "coral";
    case "soon":
      return "amber";
    default:
      return "blue";
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sep 2, 2026" from a date-only key, parsed at local noon (timezone-safe). */
export function formatDeadlineDate(dateKey: string): string {
  const d = new Date(`${dateKey.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function countdownLabel(days: number, lang: Language): string {
  if (Number.isNaN(days)) return "–";
  if (days < 0) {
    const n = Math.abs(days);
    return lang === "es" ? `hace ${n} ${n === 1 ? "día" : "días"}` : `${n} ${n === 1 ? "day" : "days"} ago`;
  }
  if (days === 0) return lang === "es" ? "hoy" : "today";
  if (days < 45) return lang === "es" ? `en ${days} días` : `in ${days} days`;
  const weeks = Math.round(days / 7);
  if (days < 120) return lang === "es" ? `en ~${weeks} semanas` : `in ~${weeks} weeks`;
  const months = Math.round(days / 30);
  return lang === "es" ? `en ~${months} meses` : `in ~${months} months`;
}

export interface ComputedDeadline extends AidDeadline {
  days: number;
  status: DeadlineStatus;
  tone: DeadlineTone;
}

/**
 * The engine: annotate every deadline with days/status/tone and sort so the
 * soonest still-upcoming deadline comes first and past ones sink to the bottom.
 */
export function computeDeadlines(today: Date = new Date()): ComputedDeadline[] {
  return CA_DEADLINES.map((d) => {
    const days = daysUntil(d.date, today);
    const status = statusFor(days);
    return { ...d, days, status, tone: toneFor(status) };
  }).sort((a, b) => {
    const aPast = a.status === "past";
    const bPast = b.status === "past";
    if (aPast !== bPast) return aPast ? 1 : -1; // past to the bottom
    return a.date.localeCompare(b.date);
  });
}

/** The single most-urgent upcoming deadline (what to surface proactively). */
export function nextDeadline(today: Date = new Date()): ComputedDeadline | null {
  return computeDeadlines(today).find((d) => d.status !== "past") ?? null;
}
