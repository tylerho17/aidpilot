"use client";

import Link from "next/link";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/app/AppChrome";
import { PageContentSkeleton } from "@/components/ProductUI";
import {
  Card,
  Avatar,
  TextField,
  Select,
  Button,
  IconTile,
  OptionCard,
  SegmentedControl,
} from "@/components/ui";
import { getInitials } from "@/lib/data-helpers";
import { useLanguage, type Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { ONBOARDING_STRINGS, optionLabel } from "@/app/onboarding/strings";
import {
  isAuthSessionError,
  isSchemaColumnError,
  toFriendlyError,
} from "@/lib/friendly-errors";
import type { School } from "@/lib/types";

/**
 * Settings - specific, editable sections on the clay kit:
 * Profile (name/school/year/state) · Aid profile (FAFSA status, aid types,
 * goals) · Language · Account · Privacy & data (legal links + delete account).
 * Saves tolerate schema drift the same way onboarding does: guaranteed
 * columns in one update, canonical mirror columns individually.
 */

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Transfer", "Graduate"];
const FAFSA_OPTIONS = ["Yes", "Not yet", "I am not sure"];
const AID_OPTIONS = ["Cal Grant", "Pell Grant", "Work-study", "Loans", "I am not sure"];
const GOAL_OPTIONS = ["Protect my aid", "Catch deadlines", "Upload documents", "Understand my offer", "Find scholarships"];

const SCHOOL_FALLBACK = ["UC Irvine", "UCLA", "UC Berkeley", "Cal State Long Beach", "Santa Monica College"];

/** Settings copy - English + Spanish. Data values stay canonical; only labels localize. */
const SETTINGS_STRINGS: Record<Language, {
  title: string;
  subtitle: string;
  profileHeading: string;
  profileSub: string;
  name: string;
  school: string;
  schoolOther: string;
  schoolOtherLabel: string;
  year: string;
  state: string;
  aidHeading: string;
  aidSub: string;
  fafsaQuestion: string;
  aidTypesQuestion: string;
  goalsQuestion: string;
  saveProfile: string;
  saving: string;
  saved: string;
  languageHeading: string;
  languageSub: string;
  accountHeading: string;
  signedInAs: string;
  yourAccount: string;
  logOut: string;
  privacyHeading: string;
  privacySub: string;
  privacy: string;
  disclaimer: string;
  deleteAccount: string;
  deleteConfirmTitle: string;
  deleteConfirmBody: string;
  deleteConfirm: string;
  deleteCancel: string;
  deleting: string;
  backToDashboard: string;
  notSet: string;
}> = {
  en: {
    title: "Settings",
    subtitle: "Manage your AidPilot account and profile.",
    profileHeading: "Profile",
    profileSub: "Who you are and where you study - this shapes your dashboard.",
    name: "Name",
    school: "School",
    schoolOther: "Other",
    schoolOtherLabel: "School name",
    year: "Year",
    state: "State",
    aidHeading: "Aid profile",
    aidSub: "Your FAFSA status and goals decide what AidPilot watches first.",
    fafsaQuestion: "Have you filed your FAFSA?",
    aidTypesQuestion: "Aid you currently receive",
    goalsQuestion: "What you want help with most",
    saveProfile: "Save changes",
    saving: "Saving...",
    saved: "Profile saved.",
    languageHeading: "Language",
    languageSub: "Choose the language AidPilot uses.",
    accountHeading: "Account",
    signedInAs: "Signed in as",
    yourAccount: "your account",
    logOut: "Log out",
    privacyHeading: "Privacy & data",
    privacySub: "Your data stays yours. We never collect FAFSA logins, SSNs, or tax documents.",
    privacy: "Privacy policy",
    disclaimer: "Disclaimer",
    deleteAccount: "Delete my account",
    deleteConfirmTitle: "Delete your account?",
    deleteConfirmBody:
      "This permanently removes your profile, tasks, offers, and scholarship matches. It can't be undone.",
    deleteConfirm: "Yes, delete everything",
    deleteCancel: "Keep my account",
    deleting: "Deleting...",
    backToDashboard: "Back to dashboard",
    notSet: "Not set yet",
  },
  es: {
    title: "Configuración",
    subtitle: "Administra tu cuenta y perfil de AidPilot.",
    profileHeading: "Perfil",
    profileSub: "Quién eres y dónde estudias - esto da forma a tu panel.",
    name: "Nombre",
    school: "Escuela",
    schoolOther: "Otra",
    schoolOtherLabel: "Nombre de la escuela",
    year: "Año",
    state: "Estado",
    aidHeading: "Perfil de ayuda",
    aidSub: "Tu estado de FAFSA y tus metas deciden qué vigila AidPilot primero.",
    fafsaQuestion: "¿Ya enviaste tu FAFSA?",
    aidTypesQuestion: "Ayuda que recibes actualmente",
    goalsQuestion: "Con qué quieres más ayuda",
    saveProfile: "Guardar cambios",
    saving: "Guardando...",
    saved: "Perfil guardado.",
    languageHeading: "Idioma",
    languageSub: "Elige el idioma que usa AidPilot.",
    accountHeading: "Cuenta",
    signedInAs: "Sesión iniciada como",
    yourAccount: "tu cuenta",
    logOut: "Cerrar sesión",
    privacyHeading: "Privacidad y datos",
    privacySub: "Tus datos son tuyos. Nunca recopilamos credenciales de FAFSA, SSN ni documentos de impuestos.",
    privacy: "Política de privacidad",
    disclaimer: "Aviso legal",
    deleteAccount: "Eliminar mi cuenta",
    deleteConfirmTitle: "¿Eliminar tu cuenta?",
    deleteConfirmBody:
      "Esto elimina permanentemente tu perfil, tareas, ofertas y becas compatibles. No se puede deshacer.",
    deleteConfirm: "Sí, eliminar todo",
    deleteCancel: "Conservar mi cuenta",
    deleting: "Eliminando...",
    backToDashboard: "Volver al panel",
    notSet: "Aún sin configurar",
  },
};

type SettingsForm = {
  name: string;
  school: string;
  manualSchool: string;
  year: string;
  state: string;
  fafsa_status: string;
  aid_types: string[];
  main_goals: string[];
};

type ProfileRow = Record<string, unknown> & {
  first_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  school?: string | null;
  school_name?: string | null;
  year?: string | null;
  education_level?: string | null;
  state?: string | null;
  fafsa_status?: string | null;
  aid_types?: string[] | null;
  main_goals?: string[] | null;
};

function emptyForm(): SettingsForm {
  return {
    name: "",
    school: "",
    manualSchool: "",
    year: "Sophomore",
    state: "",
    fafsa_status: "Yes",
    aid_types: [],
    main_goals: [],
  };
}

function SectionCard({ heading, sub, children }: { heading: string; sub: string; children: ReactNode }) {
  return (
    <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "var(--ink-900)" }}>
        {heading}
      </h2>
      <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "0 0 20px", lineHeight: 1.6 }}>{sub}</p>
      {children}
    </Card>
  );
}

function SettingsInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { lang, setLang, t } = useLanguage();
  const S = t(SETTINGS_STRINGS);
  const L = t(ONBOARDING_STRINGS);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<SettingsForm>(emptyForm());
  const [schools, setSchools] = useState<School[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteState, setDeleteState] = useState<"idle" | "deleting" | "error">("idle");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Settings auth error:", authError);
          if (!cancelled) setPageError("We couldn't verify your account. You can still return to the dashboard.");
          return;
        }
        if (!user) {
          router.replace("/login");
          return;
        }
        if (cancelled) return;

        setUserId(user.id);
        setEmail(user.email?.trim() ?? "");

        const [{ data: profile, error: profileError }, { data: schoolRows }] = await Promise.all([
          supabase.from("student_profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("schools").select("*").order("name"),
        ]);

        if (cancelled) return;
        if (schoolRows?.length) setSchools(schoolRows as School[]);

        if (profileError) {
          console.error("Settings profile query failed:", profileError);
          if (isAuthSessionError(profileError)) {
            router.replace("/login");
            return;
          }
          setPageError(toFriendlyError(profileError, "We couldn't load your profile details. Please try again."));
          return;
        }

        const row = (profile ?? null) as ProfileRow | null;
        if (row) {
          const school = row.school_name?.trim() || row.school?.trim() || "";
          const knownSchool =
            !school ||
            SCHOOL_FALLBACK.includes(school) ||
            (schoolRows ?? []).some((s) => (s as School).name === school);
          setForm({
            name: row.full_name?.trim() || row.first_name?.trim() || "",
            school: school && !knownSchool ? "Other" : school,
            manualSchool: school && !knownSchool ? school : "",
            year: row.education_level?.trim() || row.year?.trim() || "Sophomore",
            state: row.state?.trim() || "",
            fafsa_status: row.fafsa_status?.trim() || "Yes",
            aid_types: Array.isArray(row.aid_types) ? row.aid_types : [],
            main_goals: Array.isArray(row.main_goals) ? row.main_goals : [],
          });
        }
      } catch (error) {
        console.error("Settings load failed:", error);
        if (!cancelled) setPageError("We couldn't load all settings details. You can still use AidPilot.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const schoolOptions = useMemo(() => {
    const names = schools.length > 0 ? schools.map((s) => s.name) : [...SCHOOL_FALLBACK];
    const current = form.school;
    if (current && current !== "Other" && !names.includes(current)) names.unshift(current);
    return [...names.map((name) => ({ label: name, value: name })), { label: S.schoolOther, value: "Other" }];
  }, [schools, form.school, S.schoolOther]);

  const resolvedSchool = form.school === "Other" ? form.manualSchool.trim() : form.school;

  function toggleArray(field: "aid_types" | "main_goals", value: string) {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSave() {
    if (!userId) return;
    setSaveState("saving");
    setSaveError("");

    const now = new Date().toISOString();
    // Guaranteed-by-schema columns first, in one update.
    const required: Record<string, unknown> = {
      first_name: form.name.trim(),
      school: resolvedSchool,
      year: form.year,
      state: form.state.trim(),
      fafsa_status: form.fafsa_status,
      aid_types: form.aid_types,
      main_goals: form.main_goals,
      updated_at: now,
    };

    const { error: requiredError } = await supabase.from("student_profiles").update(required).eq("id", userId);
    if (requiredError) {
      console.error("Settings save failed:", requiredError);
      setSaveState("error");
      setSaveError(toFriendlyError(requiredError, "We couldn't save your changes. Please try again."));
      return;
    }

    // Canonical mirror columns (migrations 015-016) one at a time - a missing
    // column is skipped silently, matching lib/onboarding-profile.ts.
    const matched = schools.find((s) => s.name === resolvedSchool);
    const optional: Record<string, unknown> = {
      full_name: form.name.trim(),
      school_name: resolvedSchool,
      education_level: form.year,
      ...(matched ? { school_id: matched.id } : {}),
    };
    for (const [column, value] of Object.entries(optional)) {
      const { error } = await supabase
        .from("student_profiles")
        .update({ [column]: value, updated_at: now })
        .eq("id", userId);
      if (error && !isSchemaColumnError(error)) {
        console.error(`Settings optional field "${column}" failed:`, error);
      }
    }

    setSaveState("saved");
    window.setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2600);
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Settings logout failed:", error);
        return;
      }
      router.replace("/login");
    } catch (error) {
      console.error("Settings logout failed:", error);
    }
  }

  async function handleDelete() {
    setDeleteState("deleting");
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        // 503 requestOnly and other failures both surface the API's message.
        setDeleteState("error");
        setDeleteError(body.error ?? "Could not delete account. Please contact support.");
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account failed:", error);
      setDeleteState("error");
      setDeleteError("Could not delete account. Please contact support.");
    }
  }

  if (loading) {
    return <PageContentSkeleton message="Loading settings..." />;
  }

  const displayName = form.name || (email ? email.split("@")[0] : "Student");

  return (
    <div className="stagger-children">
      <div style={{ marginBottom: 28 }}>
        <h1
          className="font-display"
          style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "var(--ink-900)" }}
        >
          {S.title}
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
          {S.subtitle}
        </p>
      </div>

      {pageError ? (
        <Card
          variant="clay"
          padding={20}
          style={{ marginBottom: 22, background: "var(--amber-100)", display: "flex", gap: 12, alignItems: "flex-start" }}
        >
          <IconTile icon="shield" tone="amber" size={40} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--amber-700)", margin: 0, lineHeight: 1.6 }}>
            {pageError}
          </p>
        </Card>
      ) : null}

      {/* Identity summary */}
      <Card
        variant="clay"
        padding={28}
        style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}
      >
        <Avatar initials={getInitials(displayName)} size={64} />
        <div style={{ minWidth: 0 }}>
          <h2
            className="font-display"
            style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.4px", margin: 0, color: "var(--ink-900)" }}
          >
            {displayName}
          </h2>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)", margin: "6px 0 0" }}>
            {resolvedSchool || S.notSet}
            {form.year ? ` · ${optionLabel(L.labels.year, form.year)}` : ""}
          </p>
        </div>
      </Card>

      {/* Profile - editable */}
      <SectionCard heading={S.profileHeading} sub={S.profileSub}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <TextField
            label={S.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label={S.school}
            value={form.school || (schoolOptions[0]?.value ?? "")}
            onChange={(e) => setForm({ ...form, school: e.target.value })}
            options={schoolOptions}
          />
          <Select
            label={S.year}
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            options={YEAR_OPTIONS.map((v) => ({ value: v, label: optionLabel(L.labels.year, v) }))}
          />
          <TextField
            label={S.state}
            value={form.state}
            placeholder="California"
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          {form.school === "Other" && (
            <TextField
              label={S.schoolOtherLabel}
              value={form.manualSchool}
              onChange={(e) => setForm({ ...form, manualSchool: e.target.value })}
            />
          )}
        </div>
      </SectionCard>

      {/* Aid profile - editable */}
      <SectionCard heading={S.aidHeading} sub={S.aidSub}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>{S.fafsaQuestion}</span>
            <SegmentedControl
              options={FAFSA_OPTIONS.map((v) => ({ value: v, label: optionLabel(L.labels.fafsa, v) }))}
              value={form.fafsa_status}
              onChange={(value) => setForm({ ...form, fafsa_status: value })}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>{S.aidTypesQuestion}</span>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
              {AID_OPTIONS.map((o) => (
                <OptionCard
                  key={o}
                  title={optionLabel(L.labels.aid, o)}
                  selected={form.aid_types.includes(o)}
                  onClick={() => toggleArray("aid_types", o)}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>{S.goalsQuestion}</span>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
              {GOAL_OPTIONS.map((o) => (
                <OptionCard
                  key={o}
                  title={optionLabel(L.labels.goal, o)}
                  selected={form.main_goals.includes(o)}
                  onClick={() => toggleArray("main_goals", o)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Button variant="clay" onClick={() => void handleSave()} loading={saveState === "saving"}>
              {saveState === "saving" ? S.saving : S.saveProfile}
            </Button>
            {saveState === "saved" && (
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--green-600)" }}>{S.saved}</span>
            )}
            {saveState === "error" && (
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--coral-600)" }}>{saveError}</span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard heading={S.languageHeading} sub={S.languageSub}>
        <SegmentedControl
          options={[
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
          ]}
          value={lang}
          onChange={(v) => setLang(v === "es" ? "es" : "en")}
        />
      </SectionCard>

      {/* Account */}
      <SectionCard
        heading={S.accountHeading}
        sub={`${S.signedInAs} ${email || S.yourAccount}`}
      >
        <Button variant="secondary" iconLeft="arrow-right" onClick={() => void handleLogout()}>
          {S.logOut}
        </Button>
      </SectionCard>

      {/* Privacy & data */}
      <SectionCard heading={S.privacyHeading} sub={S.privacySub}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
          <Link href="/privacy" style={{ fontSize: 14, fontWeight: 700, color: "var(--blue-700)" }}>
            {S.privacy}
          </Link>
          <Link href="/disclaimer" style={{ fontSize: 14, fontWeight: 700, color: "var(--blue-700)" }}>
            {S.disclaimer}
          </Link>
        </div>

        {confirmingDelete ? (
          <div
            style={{
              background: "var(--coral-100)",
              borderRadius: "var(--radius-lg)",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--coral-700)" }}>
              {S.deleteConfirmTitle}
            </span>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--coral-700)", margin: 0, lineHeight: 1.6 }}>
              {S.deleteConfirmBody}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleDelete()}
                loading={deleteState === "deleting"}
                style={{ color: "var(--coral-600)", borderColor: "var(--coral-200)" }}
              >
                {deleteState === "deleting" ? S.deleting : S.deleteConfirm}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                {S.deleteCancel}
              </Button>
            </div>
            {deleteState === "error" && (
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--coral-700)", margin: 0, lineHeight: 1.6 }}>
                {deleteError}
              </p>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            style={{ color: "var(--coral-600)" }}
          >
            {S.deleteAccount}
          </Button>
        )}
      </SectionCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="clay" iconLeft="grid">
            {S.backToDashboard}
          </Button>
        </Link>
      </div>
    </div>
  );
}

class SettingsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Settings render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppChrome>
          <Card variant="clay" padding={28} style={{ maxWidth: 560 }}>
            <h1 className="font-display" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", color: "var(--ink-900)" }}>
              Settings
            </h1>
            <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.65, margin: "0 0 18px" }}>
              We couldn&apos;t load all settings details. You can still use AidPilot.
            </p>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="clay" iconLeft="grid">
                Back to dashboard
              </Button>
            </Link>
          </Card>
        </AppChrome>
      );
    }

    return this.props.children;
  }
}

export default function SettingsClient() {
  return (
    <SettingsErrorBoundary>
      <AppChrome>
        <SettingsInner />
      </AppChrome>
    </SettingsErrorBoundary>
  );
}
