"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Button, Logo, TextField } from "@/components/ui";
import { useLanguage } from "@/lib/i18n";

const SHELL_STRINGS = {
  en: {
    disclaimer: "AidPilot does not collect FAFSA login credentials, Social Security numbers, or tax documents.",
  },
  es: {
    disclaimer: "AidPilot no recopila credenciales de FAFSA, números de Seguro Social ni documentos de impuestos.",
  },
};

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
  const { t } = useLanguage();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-auth)",
        fontFamily: "var(--font-body)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div className="page-enter" style={{ width: "100%", maxWidth: "var(--auth-max)" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-3xl)",
            boxShadow: "var(--shadow-modal)",
            padding: "32px 28px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Link href="/" aria-label="AidPilot home" style={{ display: "inline-flex" }}>
              <Logo variant="mark" size={52} style={{ marginBottom: 16 }} />
            </Link>
            <h1
              className="font-display"
              style={{
                fontSize: "var(--text-h1)",
                fontWeight: 900,
                letterSpacing: "var(--tracking-tight)",
                margin: "0 0 8px",
                color: "var(--text-heading)",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 500,
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
          }}
        >
          {footer}
        </div>

        <p
          style={{
            marginTop: 20,
            fontSize: "var(--text-3xs)",
            lineHeight: "var(--leading-relaxed)",
            color: "var(--text-subtle)",
            textAlign: "center",
          }}
        >
          {t(SHELL_STRINGS).disclaimer}
        </p>
      </div>
    </div>
  );
}

export function AuthInput({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <TextField {...props} style={style ?? undefined} />;
}

export function AuthButton({
  children,
  loading,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <Button type="submit" fullWidth size="lg" loading={loading} disabled={disabled} {...props}>
      {children}
    </Button>
  );
}
