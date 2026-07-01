"use client";

import { Button, Card, Select, TextField } from "@/components/ui";
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
    <Select
      id={id}
      label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      options={options.map((option) => ({ value: option, label: labels[option] }))}
    />
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
    <Card variant="clay" padding={22} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
        <h3 className="font-display" style={{ fontSize: 19, fontWeight: 900, margin: 0, color: "var(--ink-900)", letterSpacing: "-.3px" }}>
          {status.school_name}
        </h3>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)" }}>
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
        <TextField
          id={`portal-url-${status.id}`}
          type="url"
          label="Portal URL"
          defaultValue={status.portal_url ?? ""}
          placeholder="https://portal.yourschool.edu"
          disabled={saving}
          onBlur={(event) => {
            const next = event.target.value.trim();
            if (next !== (status.portal_url ?? "")) {
              onUpdate(status.id, { portal_url: next || null });
            }
          }}
        />
        <TextField
          id={`school-email-${status.id}`}
          type="email"
          label="Financial aid email"
          defaultValue={status.school_email ?? ""}
          placeholder="financialaid@school.edu"
          disabled={saving}
          onBlur={(event) => {
            const next = event.target.value.trim();
            if (next !== (status.school_email ?? "")) {
              onUpdate(status.id, { school_email: next || null });
            }
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor={`notes-${status.id}`} style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink-700)", marginBottom: 6 }}>
          Notes
        </label>
        <textarea
          id={`notes-${status.id}`}
          defaultValue={status.notes ?? ""}
          rows={3}
          disabled={saving}
          placeholder="Reminder: check portal every two weeks, call aid office if no update by March 1..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--border-default)",
            padding: "13px 16px",
            fontSize: 15,
            fontFamily: "var(--font-body)",
            color: "var(--ink-800)",
            outline: "none",
            resize: "vertical",
          }}
          onBlur={(event) => {
            const next = event.target.value.trim();
            if (next !== (status.notes ?? "")) {
              onUpdate(status.id, { notes: next || null });
            }
          }}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <Button variant="secondary" size="sm" shape="pill" iconLeft="calendar-check" disabled={saving} onClick={() => onMarkPortalChecked(status.id)}>
          I checked this portal today
        </Button>
        {status.portal_url ? (
          <a href={status.portal_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" shape="pill" iconRight="arrow-right">
              Open portal
            </Button>
          </a>
        ) : null}
      </div>

      <div style={{ marginBottom: 16 }}>
        <SchoolAidNextAction status={status} />
      </div>

      <div>
        <h4 className="font-display" style={{ fontSize: 15, fontWeight: 900, color: "var(--ink-900)", margin: "0 0 10px", letterSpacing: "-.2px" }}>
          Follow-up tasks
        </h4>
        <SchoolAidTaskList tasks={tasks} savingId={savingTaskId} onUpdateStatus={onUpdateTaskStatus} />
      </div>
    </Card>
  );
}
