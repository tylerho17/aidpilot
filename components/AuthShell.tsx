import Link from "next/link";
import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { PlaneSVG } from "@/components/ProductUI";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#F4F8FE 0%,#EAFBF1 100%)",
        fontFamily: "var(--font-hanken), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "18px 40px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span
            style={{
              display: "flex",
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "#0B5CAD",
              boxShadow: "0 4px 12px rgba(11,92,173,.22)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlaneSVG size={18} color="#fff" />
          </span>
          <span style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-.3px" }}>
            <span style={{ color: "#1F2937" }}>Aid</span>
            <span style={{ color: "#0B5CAD" }}>Pilot</span>
          </span>
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "#EAF3FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 8px 20px rgba(11,92,173,.14)",
              }}
            >
              <PlaneSVG size={24} color="#0B5CAD" />
            </div>
            <h1 className="font-display" style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.8px", margin: "0 0 8px", color: "#15212E" }}>
              {title}
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>{subtitle}</p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #E9EDF2",
              borderRadius: 24,
              boxShadow: "0 24px 48px -20px rgba(11,92,173,.18)",
              padding: "28px 24px",
            }}
          >
            {children}
          </div>

          <div style={{ marginTop: 18, textAlign: "center", fontSize: 14, color: "#6B7280" }}>{footer}</div>

          <p style={{ marginTop: 20, fontSize: 11.5, lineHeight: 1.6, color: "#9AA4B2", textAlign: "center" }}>
            AidPilot does not collect FAFSA login credentials, Social Security numbers, or tax documents.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1.5px solid #E5E7EB",
  padding: "13px 16px",
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export function AuthInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function AuthButton({
  children,
  loading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      style={{
        width: "100%",
        padding: "14px 24px",
        borderRadius: 14,
        background: loading ? "#E5E7EB" : "#0B5CAD",
        color: loading ? "#9AA4B2" : "#fff",
        fontSize: 16,
        fontWeight: 700,
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        boxShadow: loading ? "none" : "0 10px 24px rgba(11,92,173,.26)",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
