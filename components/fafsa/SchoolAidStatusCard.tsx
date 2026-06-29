"use client";

import { ProductCard } from "@/components/ProductUI";
import SchoolAidNextAction from "@/components/fafsa/SchoolAidNextAction";
import SchoolAidTaskList from "@/components/fafsa/SchoolAidTaskList";
import {
  AID_OFFER_LABELS,
  DOCUMENTS_REQUESTED_LABELS,
  FAFSA_RECEIVED_LABELS,
  formatLastCheckedAt,
  PORTAL_CHECKED_LABELS,
  VERIFICATION_LABELS,
} from "@/lib/fafsa/school-aid-tracker";
import type { UpdateSchoolInput } from "@/hooks/useSchoolAidTracker";
import type { UserSchoolAidStatus, UserSchoolAidTask } from "@/lib/types";
import {
  AID_OFFER_STATUSES,
  DOCUMENTS_REQUESTED_STATUSES,
  FAFSA_RECEIVED_STATUSES,
  PORTAL_CHECKED_STATUSES,
  VERIFICATION_STATUSES,
} from "@/lib/types";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #EAEEF3",
  fontSize: 14,
  fontWeight: 500,
  color: "#15212E",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#5B6573",
  marginBottom: 6,
};

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 13,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  textDecoration: "none",
} as const;

type SchoolAidStatusCardProps = {
  status: UserSchoolAidStatus;
  tasks: UserSchoolAidTask[];
  saving?: boolean;
  onUpdate: (statusId: string, updates: UpdateSchoolInput) => void;
  onMarkPortalChecked: (statusId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: UserSchoolAidTask["status"]) => void;
  savingTaskId?: string | null;
};

function StatusSelect<T extends string>({
  id,
  label,
  value,
  options,
  labels,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        style={inputStyle}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SchoolAidStatusCard({
  status,
  tasks,
  saving,
  onUpdate,
  onMarkPortalChecked,
  onUpdateTaskStatus,
  savingTaskId,
}: SchoolAidStatusCardProps) {
  return (
    <ProductCard style={{ padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <h3 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#15212E" }}>
          {status.school_name}
        </h3>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
          Last checked: {formatLastCheckedAt(status.last_checked_at)}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <StatusSelect
          id={`fafsa-${status.id}`}
          label="FAFSA received"
          value={status.fafsa_received_status}
          options={FAFSA_RECEIVED_STATUSES}
          labels={FAFSA_RECEIVED_LABELS}
          disabled={saving}
          onChange={(value) => onUpdate(status.id, { fafsa_received_status: value })}
        />
        <StatusSelect
          id={`portal-${status.id}`}
          label="Portal checked"
          value={status.portal_checked_status}
          options={PORTAL_CHECKED_STATUSES}
          labels={PORTAL_CHECKED_LABELS}
          disabled={saving}
          onChange={(value) => onUpdate(status.id, { portal_checked_status: value })}
        />
        <StatusSelect
          id={`docs-${status.id}`}
          label="Documents requested"
          value={status.documents_requested_status}
          options={DOCUMENTS_REQUESTED_STATUSES}
          labels={DOCUMENTS_REQUESTED_LABELS}
          disabled={saving}
          onChange={(value) => onUpdate(status.id, { documents_requested_status: value })}
        />
        <StatusSelect
          id={`verification-${status.id}`}
          label="Verification"
          value={status.verification_status}
          options={VERIFICATION_STATUSES}
          labels={VERIFICATION_LABELS}
          disabled={saving}
          onChange={(value) => onUpdate(status.id, { verification_status: value })}
        />
        <StatusSelect
          id={`offer-${status.id}`}
          label="Aid offer"
          value={status.aid_offer_status}
          options={AID_OFFER_STATUSES}
          labels={AID_OFFER_LABELS}
          disabled={saving}
          onChange={(value) => onUpdate(status.id, { aid_offer_status: value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label htmlFor={`portal-url-${status.id}`} style={labelStyle}>
            Portal URL
          </label>
          <input
            id={`portal-url-${status.id}`}
            type="url"
            defaultValue={status.portal_url ?? ""}
            placeholder="https://portal.yourschool.edu"
            disabled={saving}
            style={inputStyle}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (next !== (status.portal_url ?? "")) {
                onUpdate(status.id, { portal_url: next || null });
              }
            }}
          />
        </div>
        <div>
          <label htmlFor={`school-email-${status.id}`} style={labelStyle}>
            Financial aid email
          </label>
          <input
            id={`school-email-${status.id}`}
            type="email"
            defaultValue={status.school_email ?? ""}
            placeholder="financialaid@school.edu"
            disabled={saving}
            style={inputStyle}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (next !== (status.school_email ?? "")) {
                onUpdate(status.id, { school_email: next || null });
              }
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`notes-${status.id}`} style={labelStyle}>
          Notes
        </label>
        <textarea
          id={`notes-${status.id}`}
          defaultValue={status.notes ?? ""}
          rows={3}
          disabled={saving}
          placeholder="Reminder: check portal every two weeks, call aid office if no update by March 1..."
          style={{ ...inputStyle, resize: "vertical" as const }}
          onBlur={(event) => {
            const next = event.target.value.trim();
            if (next !== (status.notes ?? "")) {
              onUpdate(status.id, { notes: next || null });
            }
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <button type="button" style={secondaryBtn} disabled={saving} onClick={() => onMarkPortalChecked(status.id)}>
          I checked this portal today
        </button>
        {status.portal_url ? (
          <a href={status.portal_url} target="_blank" rel="noopener noreferrer" style={secondaryBtn}>
            Open portal ↗
          </a>
        ) : null}
      </div>

      <div style={{ marginBottom: 16 }}>
        <SchoolAidNextAction status={status} />
      </div>

      <div>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#15212E", margin: "0 0 10px" }}>Follow-up tasks</h4>
        <SchoolAidTaskList tasks={tasks} savingId={savingTaskId} onUpdateStatus={onUpdateTaskStatus} />
      </div>
    </ProductCard>
  );
}
