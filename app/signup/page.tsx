"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton, AuthInput, AuthShell } from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
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
      title="Create your AidPilot account"
      subtitle="Start protecting your aid and finding scholarships matched to you."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-link)", fontWeight: 700, textDecoration: "none" }}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AuthInput
          required
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <AuthInput
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          required
          type="password"
          placeholder="Password (6+ characters)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--coral-600)", margin: 0 }}>
            {error}
          </p>
        )}
        <AuthButton loading={loading}>Create account</AuthButton>
      </form>
    </AuthShell>
  );
}
