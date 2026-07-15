"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton, AuthInput, AuthShell } from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

const STRINGS = {
  en: {
    title: "Welcome back",
    subtitle: "Log in to your weekly aid check-in.",
    email: "Email",
    password: "Password",
    submit: "Log in",
    genericError: "Could not sign in. Please try again.",
    footerLead: "New to AidPilot?",
    footerLink: "Create an account",
  },
  es: {
    title: "Bienvenido de nuevo",
    subtitle: "Inicia sesión para revisar tu ayuda semanal.",
    email: "Correo electrónico",
    password: "Contraseña",
    submit: "Iniciar sesión",
    genericError: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    footerLead: "¿Nuevo en AidPilot?",
    footerLink: "Crear una cuenta",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t(STRINGS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError(s.genericError);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("is_onboarded")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.is_onboarded) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
    router.refresh();
  }

  return (
    <AuthShell
      title={s.title}
      subtitle={s.subtitle}
      footer={
        <>
          {s.footerLead}{" "}
          <Link href="/signup" style={{ color: "var(--color-link)", fontWeight: 700, textDecoration: "none" }}>
            {s.footerLink}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AuthInput
          required
          type="email"
          placeholder={s.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          required
          type="password"
          placeholder={s.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--coral-600)", margin: 0 }}>
            {error}
          </p>
        )}
        <AuthButton loading={loading}>{s.submit}</AuthButton>
      </form>
    </AuthShell>
  );
}
