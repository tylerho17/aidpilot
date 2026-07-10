"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChecklistItem, Icon } from "@/components/ui";
import { useSession } from "@/components/v1/session";
import { reviewKey, type WalkField, type WalkPath } from "@/lib/v1/walkthrough";

/**
 * v1-flow 4 — one walkthrough field: a ChecklistItem the student checks off as
 * reviewed, plus a collapsible helper with the three placeholder explanation
 * slots (what it means / document needed / common mistake). The reviewed flag
 * lives in client session state only (Rule 1) — nothing typed, nothing sent.
 */
export function FieldReviewRow({
  path,
  sectionKey,
  field,
  divider = false,
}: {
  path: WalkPath;
  sectionKey: string;
  field: WalkField;
  divider?: boolean;
}) {
  const t = useTranslations("walkthrough");
  const { reviewed, toggleReviewed } = useSession();
  const [open, setOpen] = useState(false);
  const [popping, setPopping] = useState(false);

  const key = reviewKey(path, sectionKey, field.fieldKey);
  const done = Boolean(reviewed[key]);

  const helpRows = [
    { icon: "shield-check", label: t("helper.whatItMeans"), text: t(field.whatItMeansKey) },
    { icon: "file", label: t("helper.documentNeeded"), text: t(field.documentNeededKey) },
    { icon: "letter", label: t("helper.commonError"), text: t(field.commonErrorKey) },
  ];

  return (
    <div style={{ borderBottom: divider ? "1px solid var(--border-card)" : "none" }}>
      <ChecklistItem
        done={done}
        popping={popping}
        title={t(field.labelKey)}
        onToggle={() => {
          if (!done) {
            setPopping(true);
            setTimeout(() => setPopping(false), 450);
          }
          toggleReviewed(key);
        }}
      />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          margin: "0 0 10px 44px",
          padding: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--blue-700)",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <Icon
          name="chevron-down"
          size={15}
          strokeWidth={2.4}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}
        />
        {open ? t("hideHelp") : t("showHelp")}
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "0 12px 14px 44px" }}>
          {helpRows.map((r) => (
            <div key={r.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Icon name={r.icon} size={16} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-700)" }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gray-500)", lineHeight: 1.5 }}>
                  {r.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
