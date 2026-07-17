import type { Language } from "@/lib/i18n";

/**
 * FAFSA verification helper content + checklist logic.
 *
 * "I got selected for verification" is one of the most stressful, opaque moments
 * in the aid process - and a job a general chatbot can't own: it needs the
 * current federal rules, the student's tracking group, and produces a reusable,
 * printable checklist. The FACTS here are deterministic and sourced (never
 * AI-generated), so there is no hallucination surface; the optional AI layer
 * only drafts a short note to the aid office.
 *
 * Sourced 2026-07-17 from the 2026-2027 Federal Student Aid Handbook, Application
 * & Verification Guide, Ch. 4 (Verification, Updates, and Corrections) and the
 * Nov 26, 2025 Dear Colleague Letter (90 FR 54316), plus StudentAid.gov's
 * verification guidance. Recorded in docs/content-source.md. Spanish is authored
 * plain-language tool copy (like the appeal builder), not the ported guide
 * dataset. VERIFY against the current award-year Federal Register notice before
 * real-user launch.
 */

export type VerificationGroup = "V1" | "V4" | "V5" | "unsure";
export type FilerStatus = "filed" | "did_not_file" | "unsure";

export type ChecklistTone = "blue" | "amber" | "green";

export interface ChecklistItem {
  key: string;
  title: Record<Language, string>;
  detail: Record<Language, string>;
  tone: ChecklistTone;
}

/** What each tracking group must verify (FSA Handbook 2026-27, Ch. 4). */
export const GROUP_INFO: Record<
  Exclude<VerificationGroup, "unsure">,
  { code: string; name: Record<Language, string>; verifies: Record<Language, string> }
> = {
  V1: {
    code: "V1",
    name: { en: "Standard", es: "Estándar" },
    verifies: {
      en: "Your income and tax information and your family size.",
      es: "Tu información de ingresos e impuestos y el tamaño de tu familia.",
    },
  },
  V4: {
    code: "V4",
    name: { en: "Custom", es: "Personalizado" },
    verifies: {
      en: "Your identity.",
      es: "Tu identidad.",
    },
  },
  V5: {
    code: "V5",
    name: { en: "Aggregate", es: "Combinado" },
    verifies: {
      en: "Your income and tax information, your family size, and your identity.",
      es: "Tu información de ingresos e impuestos, el tamaño de tu familia y tu identidad.",
    },
  },
};

/** The individual, sourced checklist items keyed for assembly. */
const ITEM_INCOME_FILER: ChecklistItem = {
  key: "income_filer",
  tone: "blue",
  title: {
    en: "Your 2024 income & tax information",
    es: "Tu información de ingresos e impuestos de 2024",
  },
  detail: {
    en: "The easiest path: use the IRS data transfer (FA-DDX) inside your FAFSA — then no document is needed. Otherwise submit a free 2024 IRS Tax Return Transcript, or a signed copy of your 2024 federal tax return with all schedules.",
    es: "Lo más fácil: usa la transferencia de datos del IRS (FA-DDX) dentro de tu FAFSA — así no necesitas ningún documento. Si no, entrega una Transcripción de la Declaración de Impuestos del IRS de 2024 (gratis), o una copia firmada de tu declaración federal de 2024 con todos los anexos.",
  },
};

const ITEM_INCOME_NONFILER: ChecklistItem = {
  key: "income_nonfiler",
  tone: "blue",
  title: {
    en: "Proof you didn't file 2024 taxes",
    es: "Prueba de que no declaraste impuestos en 2024",
  },
  detail: {
    en: "A signed statement that you were not required to file a 2024 tax return, plus a copy of a W-2 for each job you (or your parent) had in 2024.",
    es: "Una declaración firmada de que no estabas obligado a presentar una declaración de 2024, más una copia del W-2 de cada trabajo que tú (o tu padre/madre) tuvieron en 2024.",
  },
};

const ITEM_FAMILY_SIZE: ChecklistItem = {
  key: "family_size",
  tone: "blue",
  title: {
    en: "Your family size",
    es: "El tamaño de tu familia",
  },
  detail: {
    en: "A signed statement confirming the number of people in your family. Your school usually gives you a verification worksheet to fill in and sign.",
    es: "Una declaración firmada que confirma el número de personas en tu familia. Tu escuela suele darte una hoja de verificación para completar y firmar.",
  },
};

const ITEM_IDENTITY: ChecklistItem = {
  key: "identity",
  tone: "amber",
  title: {
    en: "Proof of your identity",
    es: "Prueba de tu identidad",
  },
  detail: {
    en: "A valid government photo ID — a U.S. passport, driver's license, or state-issued ID. You show it in person, on a video call, or through a notarized copy. Good news: for 2026–27, a Statement of Educational Purpose is no longer required.",
    es: "Una identificación oficial con foto válida — pasaporte de EE. UU., licencia de conducir o identificación estatal. La muestras en persona, por videollamada o con una copia notariada. Buena noticia: para 2026–27, ya no se requiere una Declaración de Propósito Educativo.",
  },
};

const ITEM_SCHOOL_LIST: ChecklistItem = {
  key: "school_list",
  tone: "green",
  title: {
    en: "Your school's exact document request",
    es: "La lista exacta de documentos de tu escuela",
  },
  detail: {
    en: "Your school posts the exact forms it needs and its own deadline in your student portal or aid page. That list is the final word — check it and submit everything through the school, not to us.",
    es: "Tu escuela publica los formularios exactos que necesita y su propia fecha límite en tu portal estudiantil o página de ayuda. Esa lista es la definitiva — revísala y entrega todo a través de la escuela, no a nosotros.",
  },
};

/**
 * Build the tailored checklist. Facts are fixed; we only choose WHICH sourced
 * items apply to this student's group and tax-filing situation.
 */
export function buildChecklist(group: VerificationGroup, filer: FilerStatus): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const needsIncome = group === "V1" || group === "V5" || group === "unsure";
  const needsIdentity = group === "V4" || group === "V5" || group === "unsure";

  if (needsIncome) {
    if (filer === "did_not_file") items.push(ITEM_INCOME_NONFILER);
    else if (filer === "filed") items.push(ITEM_INCOME_FILER);
    else {
      items.push(ITEM_INCOME_FILER);
      items.push(ITEM_INCOME_NONFILER);
    }
    items.push(ITEM_FAMILY_SIZE);
  }
  if (needsIdentity) items.push(ITEM_IDENTITY);

  items.push(ITEM_SCHOOL_LIST);
  return items;
}

/** Plain-text render of the checklist — the copyable / printable artifact. */
export function checklistToText(
  items: ChecklistItem[],
  lang: Language,
  heading: string
): string {
  const lines = [heading, "=".repeat(heading.length), ""];
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.title[lang]}`);
    lines.push(`   ${item.detail[lang]}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}
