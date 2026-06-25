"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton, AuthInput, AuthShell } from "@/components/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
      setError("Could not sign in. Please try again.");
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
      title="Welcome back"
      subtitle="Log in to your weekly aid check-in."
      footer={
        <>
          New to AidPilot?{" "}
          <Link href="/signup" style={{ color: "#0B5CAD", fontWeight: 700, textDecoration: "none" }}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ fontSize: 14, color: "#C04E57", margin: 0 }}>{error}</p>}
        <AuthButton loading={loading}>Log in</AuthButton>
      </form>
    </AuthShell>
  );
}
