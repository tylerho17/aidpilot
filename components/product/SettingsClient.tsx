"use client";

import Link from "next/link";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProductCard, PageContentSkeleton } from "@/components/ProductUI";
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
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1
          className="font-display"
          style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Manage your AidPilot account and profile.
        </p>
      </div>

      {pageError ? (
        <ProductCard style={{ padding: 20, marginBottom: 22, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            {pageError}
          </p>
        </ProductCard>
      ) : null}

      <ProductCard style={{ padding: 28, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
          Account
        </h2>
        <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 14px" }}>
          Signed in as <span style={{ fontWeight: 700, color: "#15212E" }}>{summary.email || "your account"}</span>
        </p>
        <button
          type="button"
          onClick={() => void onLogout()}
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0B5CAD",
            background: "#fff",
            border: "1.5px solid #DCE7F5",
            padding: "12px 22px",
            borderRadius: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Log out
        </button>
      </ProductCard>

      <ProductCard style={{ padding: 28, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
          Profile
        </h2>
        <p style={{ fontSize: 13, color: "#9AA4B2", margin: "0 0 18px", lineHeight: 1.6 }}>
          Your basic profile info from onboarding.
        </p>
        <dl style={{ display: "grid", gap: 12, margin: 0 }}>
          <div>
            <dt style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>Name</dt>
            <dd style={{ fontSize: 15, fontWeight: 600, color: "#15212E", margin: 0 }}>{summary.name}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>School</dt>
            <dd style={{ fontSize: 15, fontWeight: 600, color: "#15212E", margin: 0 }}>{summary.school}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>Year</dt>
            <dd style={{ fontSize: 15, fontWeight: 600, color: "#15212E", margin: 0 }}>{summary.educationLevel}</dd>
          </div>
          <div>
            <dt style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>State</dt>
            <dd style={{ fontSize: 15, fontWeight: 600, color: "#15212E", margin: 0 }}>{summary.state}</dd>
          </div>
        </dl>
      </ProductCard>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            background: "#0B5CAD",
            padding: "12px 22px",
            borderRadius: 13,
            textDecoration: "none",
          }}
        >
          Back to dashboard
        </Link>
        <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>More settings coming soon.</p>
      </div>

      <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6, marginTop: 24 }}>
        <Link href="/privacy" style={{ color: "#0B5CAD" }}>
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD" }}>
          Disclaimer
        </Link>
      </p>
    </>
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
        <SettingsContent
          summary={defaultSummary()}
          pageError="We couldn't load all settings details. You can still use AidPilot."
          onLogout={async () => {
            window.location.href = "/login";
          }}
        />
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
    <AppShell>
      {loading ? (
        <PageContentSkeleton message="Loading settings..." />
      ) : (
        <SettingsContent summary={summary} pageError={pageError} onLogout={handleLogout} />
      )}
    </AppShell>
  );
}

export default function SettingsClient() {
  return (
    <SettingsErrorBoundary>
      <SettingsClientInner />
    </SettingsErrorBoundary>
  );
}
