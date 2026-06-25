import Link from "next/link";

export function DemoNotice({ message }: { message?: string }) {
  return (
    <div
      style={{
        marginBottom: 24,
        padding: "16px 18px",
        borderRadius: 16,
        background: "#EAF3FF",
        border: "1px solid #D7E7FB",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: "#0B5CAD", margin: "0 0 6px" }}>
        Demo mode
      </p>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: "#5B6573", margin: "0 0 12px", lineHeight: 1.6 }}>
        {message ??
          "You are viewing Maya Chen's sample aid plan. Create a free account to save your own dashboard."}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/signup"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            background: "#0B5CAD",
            padding: "9px 16px",
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          Create account
        </Link>
        <Link
          href="/login"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0B5CAD",
            background: "#fff",
            border: "1.5px solid #DCE7F5",
            padding: "9px 16px",
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
