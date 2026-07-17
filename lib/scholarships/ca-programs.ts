import type { Language } from "@/lib/i18n";

/**
 * Curated California student-aid programs — STATIC reference content only.
 *
 * Per the v1 scope guardrail there is NO scholarship engine, NO matching, and
 * NO student database here: this is a hand-curated, sourced list (like the FAFSA
 * guide) of the major California aid programs a student should know about, with
 * who it's for, the award, the deadline, and a link to the official page. A key
 * value for California's mixed-status students: which programs are open to CA
 * Dream Act (CADAA) applicants, not only FAFSA filers.
 *
 * Sourced 2026-07-17 from the California Student Aid Commission (csac.ca.gov):
 * Cal Grant, Chafee, Middle Class Scholarship, California College Promise Grant,
 * and CADAA pages. Recorded in docs/content-source.md. Award amounts change each
 * year — figures are the most recent sourced values and link to the official
 * page for the current number. Spanish is authored plain-language tool copy.
 */

export type Eligibility = "fafsa_and_cadaa" | "fafsa_only" | "cadaa_note";

export interface CaProgram {
  id: string;
  name: Record<Language, string>;
  amount: Record<Language, string>;
  who: Record<Language, string>;
  deadline: Record<Language, string>;
  /** Whether CA Dream Act applicants (not only FAFSA filers) can receive it. */
  eligibility: Eligibility;
  href: string;
}

export const CA_PROGRAMS: CaProgram[] = [
  {
    id: "cal-grant-a",
    name: { en: "Cal Grant A", es: "Cal Grant A" },
    amount: {
      en: "Covers systemwide tuition & fees at UC and CSU (thousands per year)",
      es: "Cubre la matrícula y las cuotas del sistema en UC y CSU (miles por año)",
    },
    who: {
      en: "Students with financial need and a qualifying GPA at a 4-year school",
      es: "Estudiantes con necesidad económica y un GPA que califique en una universidad de 4 años",
    },
    deadline: {
      en: "March 2 (Sept 2 for community college students)",
      es: "2 de marzo (2 de septiembre para estudiantes de colegio comunitario)",
    },
    eligibility: "fafsa_and_cadaa",
    href: "https://www.csac.ca.gov/cal-grant",
  },
  {
    id: "cal-grant-b",
    name: { en: "Cal Grant B", es: "Cal Grant B" },
    amount: {
      en: "An access award for living costs, books & supplies — plus tuition help after year one",
      es: "Un subsidio de acceso para gastos de vida, libros y materiales — más ayuda con la matrícula después del primer año",
    },
    who: {
      en: "Students from lower-income families with financial need",
      es: "Estudiantes de familias de bajos ingresos con necesidad económica",
    },
    deadline: {
      en: "March 2 (Sept 2 for community college students)",
      es: "2 de marzo (2 de septiembre para estudiantes de colegio comunitario)",
    },
    eligibility: "fafsa_and_cadaa",
    href: "https://www.csac.ca.gov/cal-grant",
  },
  {
    id: "chafee-grant",
    name: { en: "California Chafee Grant", es: "Beca Chafee de California" },
    amount: {
      en: "Up to $5,000 per year (does not need to be repaid)",
      es: "Hasta $5,000 por año (no se debe reembolsar)",
    },
    who: {
      en: "Current or former foster youth (foster care at any point from age 16–18)",
      es: "Jóvenes de crianza actuales o anteriores (crianza en algún momento entre los 16 y 18 años)",
    },
    deadline: {
      en: "Apply early; accepted through July 31 of the school year",
      es: "Solicita temprano; se acepta hasta el 31 de julio del año escolar",
    },
    eligibility: "fafsa_and_cadaa",
    href: "https://www.csac.ca.gov/chafee",
  },
  {
    id: "middle-class-scholarship",
    name: { en: "Middle Class Scholarship", es: "Beca de Clase Media" },
    amount: {
      en: "Varies by your costs and other aid — helps low-to-middle-income students at UC, CSU & CCC bachelor's programs",
      es: "Varía según tus costos y otra ayuda — ayuda a estudiantes de ingresos bajos a medios en programas de licenciatura de UC, CSU y CCC",
    },
    who: {
      en: "Undergraduates (including teaching-credential students) at UC, CSU, or a CCC bachelor's program",
      es: "Estudiantes de licenciatura (incluidos los de credencial docente) en UC, CSU o un programa de licenciatura de CCC",
    },
    deadline: {
      en: "Tied to your FAFSA/CADAA — file by March 2",
      es: "Ligada a tu FAFSA/CADAA — presenta antes del 2 de marzo",
    },
    eligibility: "fafsa_and_cadaa",
    href: "https://www.csac.ca.gov/middle-class-scholarship",
  },
  {
    id: "promise-grant",
    name: { en: "California College Promise Grant", es: "Beca California College Promise" },
    amount: {
      en: "Waives community college enrollment fees (per-unit fees)",
      es: "Exime las cuotas de inscripción del colegio comunitario (cuotas por unidad)",
    },
    who: {
      en: "California Community College students with financial need",
      es: "Estudiantes de colegios comunitarios de California con necesidad económica",
    },
    deadline: {
      en: "Apply anytime through your community college or FAFSA/CADAA",
      es: "Solicita en cualquier momento a través de tu colegio comunitario o FAFSA/CADAA",
    },
    eligibility: "fafsa_and_cadaa",
    href: "https://www.csac.ca.gov/apply",
  },
  {
    id: "ca-dream-act",
    name: { en: "California Dream Act aid (CADAA)", es: "Ayuda de la Ley Dream de California (CADAA)" },
    amount: {
      en: "Opens the door to Cal Grant, Middle Class Scholarship, Chafee, the Promise Grant & more state aid",
      es: "Abre la puerta al Cal Grant, la Beca de Clase Media, Chafee, la Beca Promise y más ayuda estatal",
    },
    who: {
      en: "Undocumented and other eligible students who can't file the FAFSA (often AB 540 students)",
      es: "Estudiantes indocumentados y otros elegibles que no pueden presentar la FAFSA (a menudo estudiantes AB 540)",
    },
    deadline: {
      en: "Opens Oct 1; March 2 for Cal Grant",
      es: "Se abre el 1 de octubre; 2 de marzo para el Cal Grant",
    },
    eligibility: "cadaa_note",
    href: "https://dream.csac.ca.gov/",
  },
];

/** Short label + tone for the FAFSA/CADAA eligibility chip. */
export const ELIGIBILITY_META: Record<
  Eligibility,
  { label: Record<Language, string>; tone: "green" | "blue" | "amber" }
> = {
  fafsa_and_cadaa: {
    label: { en: "FAFSA or Dream Act", es: "FAFSA o Ley Dream" },
    tone: "green",
  },
  fafsa_only: {
    label: { en: "FAFSA only", es: "Solo FAFSA" },
    tone: "blue",
  },
  cadaa_note: {
    label: { en: "Dream Act pathway", es: "Vía Ley Dream" },
    tone: "amber",
  },
};
