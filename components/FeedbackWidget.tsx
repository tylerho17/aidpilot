"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ProductUI";

const RATINGS = ["Helpful", "Confusing", "Not useful"] as const;

export function FeedbackWidget({ page }: { page: string }) {
  const supabase = createClient();
  const [rating, setRating] = useState<string>("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, [supabase.auth]);

  async function handleSubmit() {
    if (!message.trim()) {
      setError("Please share a quick note so we know what to improve.");
      return;
    }

    setStatus("loading");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setError("Log in to send feedback.");
      return;
    }

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();

    const { error: insertError } = await supabase.from("feedback").insert({
      user_id: user.id,
      page,
      rating: rating || null,
      message: message.trim(),
      email: profile?.email ?? user.email ?? null,
    });

    if (insertError) {
      setStatus("error");
      setError("Could not send feedback. Try again.");
      return;
    }

    setStatus("success");
    setMessage("");
    setRating("");
  }

  if (status === "success") {
    return (
      <ProductCard style={{ padding: 20, marginTop: 28, background: "#F5FBF7", border: "1px solid #D5F0E2" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#15885A", margin: 0 }}>
          Thanks, this helps us improve AidPilot.
        </p>
      </ProductCard>
    );
  }

  return (
    <ProductCard style={{ padding: 22, marginTop: 28 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#15212E", margin: "0 0 12px" }}>Was this helpful?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {RATINGS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRating(option)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1.5px solid " + (rating === option ? "#0B5CAD" : "#E5E7EB"),
              background: rating === option ? "#EAF3FF" : "#fff",
              color: rating === option ? "#0B5CAD" : "#6B7280",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What should AidPilot improve?"
        style={{
          width: "100%",
          minHeight: 88,
          borderRadius: 12,
          border: "1.5px solid #E5E7EB",
          padding: "12px 14px",
          fontSize: 14,
          fontFamily: "inherit",
          resize: "vertical",
          boxSizing: "border-box",
          marginBottom: 12,
        }}
      />
      {error && <p style={{ fontSize: 13, color: "#C04E57", margin: "0 0 10px" }}>{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={status === "loading"}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            background: "#0B5CAD",
            border: "none",
            padding: "10px 18px",
            borderRadius: 12,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {status === "loading" ? "Sending..." : "Send feedback"}
        </button>
        {!isLoggedIn && (
          <Link href="/login" style={{ fontSize: 13, color: "#9AA4B2", textDecoration: "underline" }}>
            Log in to save feedback to your account
          </Link>
        )}
      </div>
    </ProductCard>
  );
}
