"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card, Button, Icon, IconTile, StatusPanel, SectionHeading } from "@/components/ui";
import { SectionTitle } from "@/components/app/screens/shared";
import { useLanguage } from "@/lib/i18n";
import { useDocuments } from "@/hooks/useDocuments";
import { signedUrl, formatBytes, ALLOWED_LABEL, type StoredDoc } from "@/lib/documents/vault";

/**
 * The document vault - a private, auth-gated place for a student to upload the
 * paperwork their aid office asks for (verification docs, appeal evidence).
 * Files live in a private per-user bucket (migration 029) and are opened only
 * via short-lived signed URLs. Unlike the stateless tools, this deliberately
 * stores files, so it lives behind sign-in and says so plainly.
 */
export function DocumentVault() {
  const { t } = useLanguage();
  const { signedIn, authReady, docs, loading, busy, upload, remove } = useDocuments();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);

  const s = t({
    en: {
      eyebrow: "Documents",
      heading: "Your document vault",
      sub: "Keep the paperwork your aid office asks for in one private place — verification documents, appeal evidence, award letters. Only you can see these.",
      privacyEyebrow: "Private to you",
      privacyTitle: "These files are stored privately.",
      privacyBody: "Uploaded to your own encrypted folder and opened only through short-lived private links — never public. Delete anything anytime.",
      signInTitle: "Sign in to use your vault",
      signInBody: "The vault stores real files, so it's kept behind your account. Create a free account or sign in to upload.",
      signIn: "Sign in",
      createAccount: "Create account",
      upload: "Upload a document",
      uploading: "Uploading…",
      allowed: ALLOWED_LABEL,
      yourDocs: "Your documents",
      empty: "No documents yet. Upload the ones your school asked for.",
      view: "View",
      remove: "Delete",
      tooBig: "That file is over 10 MB. Try a smaller file.",
      badType: "That file type isn't allowed. Use a PDF, PNG, JPG, or HEIC.",
      failed: "Upload failed. If this keeps happening, your vault may not be set up yet.",
      note: "Educational tool, not official submission — upload documents to your school through its own portal too.",
    },
    es: {
      eyebrow: "Documentos",
      heading: "Tu bóveda de documentos",
      sub: "Guarda en un solo lugar privado los papeles que pide tu oficina de ayuda — documentos de verificación, pruebas para apelaciones, cartas de adjudicación. Solo tú puedes verlos.",
      privacyEyebrow: "Privado para ti",
      privacyTitle: "Estos archivos se guardan de forma privada.",
      privacyBody: "Se suben a tu propia carpeta cifrada y se abren solo mediante enlaces privados de corta duración — nunca públicos. Borra lo que quieras cuando quieras.",
      signInTitle: "Inicia sesión para usar tu bóveda",
      signInBody: "La bóveda guarda archivos reales, así que está protegida con tu cuenta. Crea una cuenta gratis o inicia sesión para subir.",
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      upload: "Subir un documento",
      uploading: "Subiendo…",
      allowed: ALLOWED_LABEL,
      yourDocs: "Tus documentos",
      empty: "Aún no hay documentos. Sube los que pidió tu escuela.",
      view: "Ver",
      remove: "Borrar",
      tooBig: "Ese archivo supera los 10 MB. Prueba con uno más pequeño.",
      badType: "Ese tipo de archivo no se permite. Usa PDF, PNG, JPG o HEIC.",
      failed: "La subida falló. Si sigue pasando, tu bóveda puede no estar configurada aún.",
      note: "Herramienta educativa, no un envío oficial — sube los documentos a tu escuela también por su propio portal.",
    },
  });

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError("");
    const res = await upload(file);
    if (!res.ok) setError(res.reason === "too_big" ? s.tooBig : res.reason === "bad_type" ? s.badType : s.failed);
  }

  async function openDoc(doc: StoredDoc) {
    setOpening(doc.path);
    const url = await signedUrl(doc.path);
    setOpening(null);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <SectionHeading eyebrow={s.eyebrow} title={s.heading} subtitle={s.sub} style={{ marginBottom: 22 }} />

      {authReady && !signedIn ? (
        <StatusPanel
          tone="blue"
          icon="shield-check"
          eyebrow={s.privacyEyebrow}
          title={s.signInTitle}
          style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)" }}
          trailing={
            <span style={{ display: "flex", gap: 8 }}>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="sm">{s.signIn}</Button>
              </Link>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <Button variant="clay" size="sm">{s.createAccount}</Button>
              </Link>
            </span>
          }
        >
          {s.signInBody}
        </StatusPanel>
      ) : (
        <>
          <StatusPanel
            tone="blue"
            icon="shield-check"
            eyebrow={s.privacyEyebrow}
            title={s.privacyTitle}
            style={{ borderRadius: "var(--radius-clay)", border: "none", boxShadow: "var(--shadow-clay)", marginBottom: 22 }}
          >
            {s.privacyBody}
          </StatusPanel>

          <Card variant="clay" padding={22} style={{ marginBottom: 22 }}>
            <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.heic" onChange={onPick} style={{ display: "none" }} />
            <Button variant="clay" iconLeft="plus" loading={busy} onClick={() => inputRef.current?.click()}>
              {busy ? s.uploading : s.upload}
            </Button>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--gray-400)", marginTop: 10 }}>{s.allowed}</div>
            {error && <p style={{ fontSize: 14, fontWeight: 600, color: "var(--coral-600)", marginTop: 12 }}>{error}</p>}
          </Card>

          <SectionTitle>{s.yourDocs}</SectionTitle>
          {loading ? (
            <Card variant="clay" padding={24} style={{ color: "var(--gray-400)", fontWeight: 600 }}>…</Card>
          ) : docs.length === 0 ? (
            <Card variant="clay" padding={28} style={{ textAlign: "center", color: "var(--gray-500)", fontWeight: 600 }}>{s.empty}</Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {docs.map((doc) => (
                <Card key={doc.path} variant="clay" padding={14}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <IconTile icon="file" tone="blue" size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-display" style={{ fontSize: 14.5, fontWeight: 800, color: "var(--ink-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {doc.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--gray-400)" }}>{formatBytes(doc.size)}</div>
                    </div>
                    <Button variant="ghost" size="sm" iconLeft="arrow-right" loading={opening === doc.path} onClick={() => void openDoc(doc)}>
                      {s.view}
                    </Button>
                    <button
                      type="button"
                      onClick={() => void remove(doc.path)}
                      aria-label={s.remove}
                      title={s.remove}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: "1.5px solid var(--border-default)", background: "#fff", cursor: "pointer", flexShrink: 0 }}
                    >
                      <Icon name="x" size={15} color="var(--coral-600)" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <p style={{ fontSize: 11.5, fontWeight: 500, color: "var(--gray-400)", lineHeight: 1.5, margin: "16px 2px 0" }}>{s.note}</p>
        </>
      )}
    </div>
  );
}
