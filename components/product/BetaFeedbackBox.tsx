"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { fontFamily, colors, formFieldStyle } from "@/lib/design-tokens";

type BetaFeedbackBoxProps = {
  pageContext?: string;
};

export default function BetaFeedbackBox({ pageContext = "/dashboard" }: BetaFeedbackBoxProps) {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!message.trim()) {
      setError("Please share a quick note.");
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
      page: pageContext,
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
  }

  return (
    <section
      id="feedback"
      style={{
        marginBottom: 20,
        padding: 18,
        border: `1px solid ${colors.borderSoft}`,
        borderRadius: 8,
        background: colors.card,
      }}
    >
      <h2 className="text-h3" style={{ marginBottom: 6 }}>Help shape AidPilot</h2>
      <p className="text-body-muted" style={{ marginBottom: 12 }}>
        What confused you, what helped, or what would make this more useful?
      </p>

      {status === "success" ? (
        <p style={{ fontSize: 14, fontWeight: 600, color: "#15885A", margin: 0 }}>
          Thanks — your feedback was saved.
        </p>
      ) : (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your honest reaction as a beta tester..."
            style={{
              ...formFieldStyle,
              minHeight: 88,
              height: "auto",
              padding: "10px 12px",
              resize: "vertical",
              marginBottom: 10,
            }}
          />
          {error ? <p style={{ fontSize: 13, color: "#C04E57", margin: "0 0 10px" }}>{error}</p> : null}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={status === "loading"}
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
              background: colors.primary,
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: status === "loading" ? "not-allowed" : "pointer",
              fontFamily,
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? "Sending..." : "Send feedback"}
          </button>
        </>
      )}
    </section>
  );
}
