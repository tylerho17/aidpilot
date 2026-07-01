"use client";

import Link from "next/link";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/app/AppChrome";
import { PageContentSkeleton } from "@/components/ProductUI";
import { Card, Avatar, TextField, Button, IconTile, SegmentedControl } from "@/components/ui";
import { getInitials } from "@/lib/data-helpers";
import { useLanguage, type Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import {
  isAuthSessionError,
  isSchemaColumnError,
  toFriendlyError,
} from "@/lib/friendly-errors";

type ProfileSummary = {
  name: string;
  email: string;
  school: string;
  educationLevel: string;
  state: string;
};

/** Settings copy - English + Spanish. Data values stay canonical; only labels localize. */
const SETTINGS_STRINGS: Record<Language, {
  title: string;
  subtitle: string;
  profileHeading: string;
  profileSub: string;
  name: string;
  school: string;
  year: string;
  state: string;
  notSet: string;
  languageHeading: string;
  languageSub: string;
  accountHeading: string;
  signedInAs: string;
  yourAccount: string;
  logOut: string;
  backToDashboard: string;
  privacy: string;
  disclaimer: string;
}> = {
  en: {
    title: "Settings",
    subtitle: "Manage your AidPilot account and profile.",
    profileHeading: "Profile",
    profileSub: "Your basic profile info from onboarding.",
    name: "Name",
    school: "School",
    year: "Year",
    state: "State",
    notSet: "Not set yet",
    languageHeading: "Language",
    languageSub: "Choose the language AidPilot uses.",
    accountHeading: "Account",
    signedInAs: "Signed in as",
    yourAccount: "your account",
    logOut: "Log out",
    backToDashboard: "Back to dashboard",
    privacy: "Privacy",
    disclaimer: "Disclaimer",
  },
  es: {
    title: "Configuración",
    subtitle: "Administra tu cuenta y perfil de AidPilot.",
    profileHeading: "Perfil",
    profileSub: "La información básica de tu perfil de la configuración inicial.",
    name: "Nombre",
    school: "Escuela",
    year: "Año",
    state: "Estado",
    notSet: "Aún sin configurar",
    languageHeading: "Idioma",
    languageSub: "Elige el idioma que usa AidPilot.",
    accountHeading: "Cuenta",
    signedInAs: "Sesión iniciada como",
    yourAccount: "tu cuenta",
    logOut: "Cerrar sesión",
    backToDashboard: "Volver al panel",
    privacy: "Privacidad",
    disclaimer: "Aviso legal",
  },
};

type SettingsProfileRow = {
  first_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  school?: string | null;
  school_name?: string | null;
  year?: string | null;
  education_level?: string | null;
  state?: string | null;
};

const SETTINGS_PROFILE_SELECT =
  "first_name, full_name, email, school, school_name, year, education_level, state" as const;

function defaultSummary(email = ""): ProfileSummary {
  return {
    name: email ? email.split("@")[0] : "Student",
    email,
    school: "Not set yet",
    educationLevel: "Not set yet",
    state: "Not set yet",
  };
}

function buildSummaryFromRow(row: SettingsProfileRow | null, email: string): ProfileSummary {
  const fallback = defaultSummary(email);

  if (!row) {
    return fallback;
  }

  return {
    name: row.full_name?.trim() || row.first_name?.trim() || fallback.name,
    email: row.email?.trim() || email || fallback.email,
    school: row.school_name?.trim() || row.school?.trim() || "Not set yet",
    educationLevel: row.education_level?.trim() || row.year?.trim() || "Not set yet",
    state: row.state?.trim() || "Not set yet",
  };
}

function SettingsContent({
  summary,
  pageError,
  onLogout,
}: {
  summary: ProfileSummary;
  pageError: string | null;
  onLogout: () => Promise<void>;
}) {
  const { lang, setLang, t } = useLanguage();
  const S = t(SETTINGS_STRINGS);
  // "Not set yet" is the canonical sentinel from buildSummaryFromRow - localize at render.
  const show = (value: string) => (value === "Not set yet" ? S.notSet : value);

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

      {/* Profile summary */}
      <Card
        variant="clay"
        padding={28}
        style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}
      >
        <Avatar initials={getInitials(summary.name)} size={64} />
        <div style={{ minWidth: 0 }}>
          <h2
            className="font-display"
            style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.4px", margin: 0, color: "var(--ink-900)" }}
          >
            {summary.name}
          </h2>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--gray-500)", margin: "6px 0 0" }}>
            {summary.school}
            {summary.educationLevel && summary.educationLevel !== "Not set yet"
              ? ` · ${summary.educationLevel}`
              : ""}
          </p>
        </div>
      </Card>

      {/* Profile fields */}
      <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "var(--ink-900)" }}>
          {S.profileHeading}
        </h2>
        <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "0 0 20px", lineHeight: 1.6 }}>
          {S.profileSub}
        </p>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <TextField label={S.name} value={show(summary.name)} readOnly icon="gear" />
          <TextField label={S.school} value={show(summary.school)} readOnly icon="clipboard" />
          <TextField label={S.year} value={show(summary.educationLevel)} readOnly icon="calendar" />
          <TextField label={S.state} value={show(summary.state)} readOnly icon="shield" />
        </div>
      </Card>

      {/* Language */}
      <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "var(--ink-900)" }}>
          {S.languageHeading}
        </h2>
        <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "0 0 18px", lineHeight: 1.6 }}>
          {S.languageSub}
        </p>
        <SegmentedControl
          options={[
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
          ]}
          value={lang}
          onChange={(v) => setLang(v === "es" ? "es" : "en")}
        />
      </Card>

      {/* Account */}
      <Card variant="clay" padding={28} style={{ marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "var(--ink-900)" }}>
          {S.accountHeading}
        </h2>
        <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "0 0 18px", lineHeight: 1.6 }}>
          {S.signedInAs}{" "}
          <span style={{ fontWeight: 700, color: "var(--ink-800)" }}>{summary.email || S.yourAccount}</span>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <Button variant="secondary" iconLeft="arrow-right" onClick={() => void onLogout()}>
            {S.logOut}
          </Button>
        </div>

      </Card>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="clay" iconLeft="grid">
            {S.backToDashboard}
          </Button>
        </Link>
      </div>

      <p style={{ fontSize: 12, color: "var(--gray-400)", lineHeight: 1.6, marginTop: 24 }}>
        <Link href="/privacy" style={{ color: "var(--blue-700)" }}>
          {S.privacy}
        </Link>{" "}
        ·{" "}
        <Link href="/disclaimer" style={{ color: "var(--blue-700)" }}>
          {S.disclaimer}
        </Link>
      </p>
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
          <SettingsContent
            summary={defaultSummary()}
            pageError="We couldn't load all settings details. You can still use AidPilot."
            onLogout={async () => {
              window.location.href = "/login";
            }}
          />
        </AppChrome>
      );
    }

    return this.props.children;
  }
}

function SettingsClientInner() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProfileSummary>(defaultSummary());
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Settings auth error:", authError);
          if (!cancelled) {
            setPageError("We couldn't verify your account. You can still return to the dashboard.");
          }
          return;
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const email = user.email?.trim() ?? "";
        if (!cancelled) {
          setSummary(defaultSummary(email));
        }

        const { data: profile, error: profileError } = await supabase
          .from("student_profiles")
          .select(SETTINGS_PROFILE_SELECT)
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Settings profile query failed:", profileError);
          if (!cancelled) {
            if (isAuthSessionError(profileError)) {
              router.replace("/login");
              return;
            }
            if (isSchemaColumnError(profileError)) {
              setPageError("Some profile details are not available yet. More settings are coming soon.");
            } else {
              setPageError(toFriendlyError(profileError, "We couldn't load your profile details. Please try again."));
            }
          }
          return;
        }

        if (!cancelled) {
          setSummary(buildSummaryFromRow(profile as SettingsProfileRow | null, email));
        }
      } catch (error) {
        console.error("Settings load failed:", error);
        if (!cancelled) {
          setPageError("We couldn't load all settings details. You can still use AidPilot.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

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

  return (
    <AppChrome>
      {loading ? (
        <PageContentSkeleton message="Loading settings..." />
      ) : (
        <SettingsContent summary={summary} pageError={pageError} onLogout={handleLogout} />
      )}
    </AppChrome>
  );
}

export default function SettingsClient() {
  return (
    <SettingsErrorBoundary>
      <SettingsClientInner />
    </SettingsErrorBoundary>
  );
}
