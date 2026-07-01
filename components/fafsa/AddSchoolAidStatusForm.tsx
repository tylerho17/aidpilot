"use client";

import { useState, type FormEvent } from "react";
import { Button, TextField } from "@/components/ui";

type AddSchoolAidStatusFormProps = {
  onSubmit: (input: { school_name: string; portal_url?: string; school_email?: string }) => Promise<unknown>;
  saving?: boolean;
};

export default function AddSchoolAidStatusForm({ onSubmit, saving }: AddSchoolAidStatusFormProps) {
  const [schoolName, setSchoolName] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = schoolName.trim();
    if (!trimmed) return;

    const result = await onSubmit({
      school_name: trimmed,
      portal_url: portalUrl.trim() || undefined,
      school_email: schoolEmail.trim() || undefined,
    });

    if (result) {
      setSchoolName("");
      setPortalUrl("");
      setSchoolEmail("");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TextField
        id="school-name"
        label="School name"
        value={schoolName}
        onChange={(event) => setSchoolName(event.target.value)}
        placeholder="e.g. State University"
        required
      />

      <TextField
        id="portal-url"
        type="url"
        label="Portal URL (optional)"
        value={portalUrl}
        onChange={(event) => setPortalUrl(event.target.value)}
        placeholder="https://portal.yourschool.edu"
      />

      <TextField
        id="school-email"
        type="email"
        label="Financial aid email (optional)"
        value={schoolEmail}
        onChange={(event) => setSchoolEmail(event.target.value)}
        placeholder="financialaid@school.edu"
      />

      <div>
        <Button type="submit" variant="clay" iconLeft="plus" disabled={saving || !schoolName.trim()}>
          {saving ? "Adding..." : "Add a school"}
        </Button>
      </div>
    </form>
  );
}
