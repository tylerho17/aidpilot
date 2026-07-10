"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SectionHeading, StatusPanel, Button } from "@/components/ui";
import { useSession } from "@/components/v1/session";

// v1-flow 2 — counselor explainer screen. Reached from the triage result when
// the conservative router says "see your counselor". Content is intentionally
// placeholder-only (no invented specifics); the "why" slot is a TODO i18n key
// for human-sourced copy.
export default function CounselorPage() {
  const t = useTranslations("counselor");
  const router = useRouter();
  const { reset } = useSession();

  return (
    <>
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
      <StatusPanel tone="amber" icon="letter" title={t("title")}>
        {t("explainer")}
        <span style={{ display: "block", marginTop: 8 }}>{t("why")}</span>
      </StatusPanel>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button
          variant="secondary"
          iconLeft="chevron-left"
          onClick={() => {
            reset();
            router.push("/triage");
          }}
        >
          {t("toTriage")}
        </Button>
        <Button variant="ghost" onClick={() => router.push("/")}>
          {t("backHome")}
        </Button>
      </div>
    </>
  );
}
