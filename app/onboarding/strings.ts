import type { Language } from "@/lib/i18n";

/**
 * Onboarding copy in English and Spanish.
 *
 * IMPORTANT: option maps translate DISPLAY LABELS only - the canonical English
 * values are what gets saved to student_profiles, in both languages, so
 * matching/intelligence logic keeps working regardless of UI language.
 */

type OnboardingStrings = {
  headings: { title: string; subtitle: string }[];
  fields: {
    firstName: string;
    email: string;
    school: string;
    schoolName: string;
    schoolNamePlaceholder: string;
    year: string;
    state: string;
    studentType: string;
    fafsaQuestion: string;
    aidQuestion: string;
    goalsQuestion: string;
    scholarshipInterests: string;
    essayPreference: string;
    effortPreference: string;
    majors: string;
    majorsPlaceholder: string;
    interests: string;
    interestsPlaceholder: string;
    gpa: string;
    firstGeneration: string;
    transferStudent: string;
    pellEligible: string;
    calGrantEligible: string;
  };
  ui: {
    step: string;
    of: string;
    continue: string;
    back: string;
    settingUp: string;
    continueToDashboard: string;
    loadingSchools: string;
    schoolListUnavailable: string;
    trustCopy: string;
    languageEnglish: string;
    languageEnglishSub: string;
    languageSpanish: string;
    languageSpanishSub: string;
  };
  summary: {
    panelTitleFiled: string;
    panelTitleNotFiled: string;
    panelBody: string;
    yourGoals: string;
    nextSteps: string;
    stepFafsaStart: string;
    stepFafsaTrack: string;
    stepProtect: string;
    stepScholarships: string;
    stepOffer: string;
    goToDashboard: string;
  };
  errors: {
    schoolRequired: string;
    goalRequired: string;
    verifyFailed: string;
    loginAgain: string;
    generic: string;
  };
  labels: {
    year: Record<string, string>;
    studentType: Record<string, string>;
    fafsa: Record<string, string>;
    aid: Record<string, string>;
    goal: Record<string, string>;
    category: Record<string, string>;
    essayPref: Record<string, string>;
    effortPref: Record<string, string>;
    profileEssay: Record<string, string>;
    other: string;
  };
};

export const ONBOARDING_STRINGS: Record<Language, OnboardingStrings> = {
  en: {
    headings: [
      { title: "Choose your language", subtitle: "Pick the language you're most comfortable with. You can change it anytime in Settings." },
      { title: "Let's start with you", subtitle: "We use your name and school to personalize deadlines, documents, and scholarship matches." },
      { title: "A little more context", subtitle: "State and student type help us surface relevant aid programs. FAFSA status helps prioritize your checklist - we never access your FAFSA account." },
      { title: "Your current aid", subtitle: "Knowing your current aid types helps AidPilot tailor reminders and scholarship suggestions. Select all that apply." },
      { title: "What matters most", subtitle: "Your goals shape what AidPilot highlights first on your dashboard and weekly report." },
      { title: "Scholarship fit", subtitle: "Scholarship categories and effort preferences improve match quality. You can change these anytime in Settings." },
      { title: "A few optional details", subtitle: "Tell us only what helps matching. Never enter SSNs, bank info, or FAFSA passwords." },
      { title: "Your aid plan is ready", subtitle: "Here's what AidPilot will watch for you, based on your answers." },
    ],
    fields: {
      firstName: "First name",
      email: "Email",
      school: "School",
      schoolName: "School name",
      schoolNamePlaceholder: "Enter your school name",
      year: "Year",
      state: "State",
      studentType: "Student type",
      fafsaQuestion: "Have you filed your FAFSA?",
      aidQuestion: "Do you currently receive financial aid?",
      goalsQuestion: "What do you want help with most?",
      scholarshipInterests: "Scholarship interests",
      essayPreference: "Essay preference",
      effortPreference: "Effort preference",
      majors: "Majors",
      majorsPlaceholder: "e.g. computer science, nursing",
      interests: "Interests",
      interestsPlaceholder: "e.g. robotics, community service",
      gpa: "GPA (optional)",
      firstGeneration: "First-generation college student",
      transferStudent: "Transfer student",
      pellEligible: "Pell Grant eligible",
      calGrantEligible: "Cal Grant eligible",
    },
    ui: {
      step: "Step",
      of: "of",
      continue: "Continue",
      back: "Back",
      settingUp: "Setting up your plan...",
      continueToDashboard: "Continue to dashboard",
      loadingSchools: "Loading schools...",
      schoolListUnavailable: "School list unavailable. Choose Other and enter your school.",
      trustCopy: "AidPilot is an organizational and educational tool, not official financial aid advice. We never collect FAFSA logins, SSNs, or tax documents.",
      languageEnglish: "English",
      languageEnglishSub: "Continue in English",
      languageSpanish: "Español",
      languageSpanishSub: "Continuar en español",
    },
    summary: {
      panelTitleFiled: "Your FAFSA is in - we'll watch what happens next.",
      panelTitleNotFiled: "We'll walk you through your FAFSA, step by step.",
      panelBody: "Your dashboard updates weekly with what needs attention.",
      yourGoals: "Your goals",
      nextSteps: "Your first steps",
      stepFafsaStart: "Start your FAFSA plan - we break it into small steps.",
      stepFafsaTrack: "Track school follow-ups and verification in your FAFSA plan.",
      stepProtect: "Check your Protect tab - it watches for anything that could change your aid.",
      stepScholarships: "Scholarship matching is coming soon - we'll flag it on your dashboard.",
      stepOffer: "Add your aid offer so we can decode grants, loans, and the real cost.",
      goToDashboard: "Go to my dashboard",
    },
    errors: {
      schoolRequired: "Please select or enter your school.",
      goalRequired: "Select at least one goal.",
      verifyFailed: "We couldn't verify your account. Please log in again.",
      loginAgain: "Please log in again to finish onboarding.",
      generic: "Something went wrong. Please try again.",
    },
    labels: {
      year: {},
      studentType: {},
      fafsa: {},
      aid: {},
      goal: {},
      category: {},
      essayPref: {},
      effortPref: {},
      profileEssay: {},
      other: "Other",
    },
  },
  es: {
    headings: [
      { title: "Elige tu idioma", subtitle: "Elige el idioma con el que te sientas más a gusto. Puedes cambiarlo cuando quieras en Configuración." },
      { title: "Empecemos contigo", subtitle: "Usamos tu nombre y escuela para personalizar fechas límite, documentos y becas." },
      { title: "Un poco más de contexto", subtitle: "Tu estado y tipo de estudiante nos ayudan a mostrar programas de ayuda relevantes. Tu estatus de FAFSA prioriza tu lista - nunca accedemos a tu cuenta de FAFSA." },
      { title: "Tu ayuda actual", subtitle: "Saber qué ayuda recibes le permite a AidPilot ajustar recordatorios y sugerencias de becas. Marca todas las que apliquen." },
      { title: "Lo que más importa", subtitle: "Tus metas definen qué destaca AidPilot primero en tu panel y en tu reporte semanal." },
      { title: "Becas a tu medida", subtitle: "Las categorías de becas y tu preferencia de esfuerzo mejoran la calidad de las coincidencias. Puedes cambiarlas cuando quieras en Configuración." },
      { title: "Algunos detalles opcionales", subtitle: "Cuéntanos solo lo que ayude a encontrar becas. Nunca ingreses tu SSN, datos bancarios ni contraseñas de FAFSA." },
      { title: "Tu plan de ayuda está listo", subtitle: "Esto es lo que AidPilot vigilará por ti, según tus respuestas." },
    ],
    fields: {
      firstName: "Nombre",
      email: "Correo electrónico",
      school: "Escuela",
      schoolName: "Nombre de tu escuela",
      schoolNamePlaceholder: "Escribe el nombre de tu escuela",
      year: "Año",
      state: "Estado",
      studentType: "Tipo de estudiante",
      fafsaQuestion: "¿Ya enviaste tu FAFSA?",
      aidQuestion: "¿Recibes ayuda financiera actualmente?",
      goalsQuestion: "¿Con qué quieres más ayuda?",
      scholarshipInterests: "Intereses de becas",
      essayPreference: "Preferencia de ensayo",
      effortPreference: "Preferencia de esfuerzo",
      majors: "Carreras",
      majorsPlaceholder: "p. ej. informática, enfermería",
      interests: "Intereses",
      interestsPlaceholder: "p. ej. robótica, servicio comunitario",
      gpa: "GPA (opcional)",
      firstGeneration: "Estudiante universitario de primera generación",
      transferStudent: "Estudiante transferido",
      pellEligible: "Elegible para la Beca Pell",
      calGrantEligible: "Elegible para Cal Grant",
    },
    ui: {
      step: "Paso",
      of: "de",
      continue: "Continuar",
      back: "Atrás",
      settingUp: "Preparando tu plan...",
      continueToDashboard: "Continuar al panel",
      loadingSchools: "Cargando escuelas...",
      schoolListUnavailable: "La lista de escuelas no está disponible. Elige «Otra» y escribe tu escuela.",
      trustCopy: "AidPilot es una herramienta organizativa y educativa, no asesoría oficial de ayuda financiera. Nunca pedimos contraseñas de FAFSA, SSN ni documentos de impuestos.",
      languageEnglish: "English",
      languageEnglishSub: "Continue in English",
      languageSpanish: "Español",
      languageSpanishSub: "Continuar en español",
    },
    summary: {
      panelTitleFiled: "Tu FAFSA ya está enviada - vigilaremos lo que sigue.",
      panelTitleNotFiled: "Te guiaremos por tu FAFSA, paso a paso.",
      panelBody: "Tu panel se actualiza cada semana con lo que necesita atención.",
      yourGoals: "Tus metas",
      nextSteps: "Tus primeros pasos",
      stepFafsaStart: "Comienza tu plan FAFSA - lo dividimos en pasos pequeños.",
      stepFafsaTrack: "Sigue las verificaciones y respuestas de tus escuelas en tu plan FAFSA.",
      stepProtect: "Revisa tu pestaña Proteger - vigila cualquier cosa que pueda cambiar tu ayuda.",
      stepScholarships: "La búsqueda de becas llega pronto - la marcaremos en tu panel.",
      stepOffer: "Agrega tu oferta de ayuda para descifrar becas, préstamos y el costo real.",
      goToDashboard: "Ir a mi panel",
    },
    errors: {
      schoolRequired: "Selecciona o escribe tu escuela.",
      goalRequired: "Selecciona al menos una meta.",
      verifyFailed: "No pudimos verificar tu cuenta. Inicia sesión de nuevo.",
      loginAgain: "Inicia sesión de nuevo para terminar la configuración.",
      generic: "Algo salió mal. Inténtalo de nuevo.",
    },
    labels: {
      year: {
        Freshman: "Primer año",
        Sophomore: "Segundo año",
        Junior: "Tercer año",
        Senior: "Cuarto año",
        Transfer: "Transferencia",
        Graduate: "Posgrado",
      },
      studentType: {
        "High school student": "Estudiante de preparatoria",
        "College student": "Estudiante universitario",
        Parent: "Padre o madre",
        Counselor: "Consejero(a)",
      },
      fafsa: {
        Yes: "Sí",
        "Not yet": "Todavía no",
        "I am not sure": "No estoy seguro(a)",
      },
      aid: {
        "Cal Grant": "Cal Grant",
        "Pell Grant": "Beca Pell",
        "Work-study": "Trabajo-estudio",
        Loans: "Préstamos",
        "I am not sure": "No estoy seguro(a)",
      },
      goal: {
        "Protect my aid": "Proteger mi ayuda",
        "Catch deadlines": "Detectar fechas límite",
        "Upload documents": "Subir documentos",
        "Understand my offer": "Entender mi oferta",
        "Find scholarships": "Encontrar becas",
      },
      category: {
        STEM: "STEM",
        Business: "Negocios",
        Health: "Salud",
        Arts: "Artes",
        "Community service": "Servicio comunitario",
        "First-generation": "Primera generación",
        "Need-based": "Por necesidad económica",
        Transfer: "Transferencia",
        General: "General",
      },
      essayPref: {
        no_preference: "Sin preferencia",
        prefer_no_essay: "Prefiero sin ensayo",
        okay_with_essay: "Los ensayos están bien",
      },
      effortPref: {
        any: "Cualquier nivel de esfuerzo",
        low: "Solo bajo esfuerzo",
        medium: "Hasta esfuerzo medio",
        high: "Dispuesto(a) a alto esfuerzo",
      },
      profileEssay: {
        any: "Cualquiera (ensayos están bien)",
        prefer_no_essay: "Prefiero sin ensayo",
        okay_with_essay: "Los ensayos están bien",
      },
      other: "Otra",
    },
  },
};

/** Localized display label for a canonical option value (falls back to the value itself). */
export function optionLabel(map: Record<string, string>, value: string): string {
  return map[value] || value;
}
