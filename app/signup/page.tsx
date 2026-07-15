"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton, AuthInput, AuthShell } from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

const STRINGS = {
  en: {
    title: "Create your account",
    subtitle: "Start protecting your aid and finding scholarships matched to you.",
    firstName: "First name",
    email: "Email",
    password: "Password (6+ characters)",
    submit: "Create account",
    footerLead: "Already have an account?",
    footerLink: "Log in",
  },
  es: {
    title: "Crea tu cuenta",
    subtitle: "Empieza a proteger tu ayuda y a encontrar becas hechas para ti.",
    firstName: "Nombre",
    email: "Correo electrónico",
    password: "Contraseña (6+ caracteres)",
    submit: "Crear cuenta",
    footerLead: "¿Ya tienes una cuenta?",
    footerLink: "Iniciar sesión",
  },
};

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t(STRINGS);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <AuthShell
      title={s.title}
      subtitle={s.subtitle}
      footer={
        <>
          {s.footerLead}{" "}
          <Link href="/login" style={{ color: "var(--color-link)", fontWeight: 700, textDecoration: "none" }}>
            {s.footerLink}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AuthInput
          required
          type="text"
          placeholder={s.firstName}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
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
          minLength={6}
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
