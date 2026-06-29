"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import AddSchoolAidStatusForm from "@/components/fafsa/AddSchoolAidStatusForm";
import SchoolAidStatusCard from "@/components/fafsa/SchoolAidStatusCard";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import { useSchoolAidTracker } from "@/hooks/useSchoolAidTracker";
import { useAidActions } from "@/hooks/useAidActions";
import AidActionCard from "@/components/aid-actions/AidActionCard";
import { getFollowUpRelatedActions } from "@/lib/aid-actions/getAidActions";

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "10px 18px",
  borderRadius: 12,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  fontSize: 14,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "10px 16px",
  borderRadius: 999,
  textDecoration: "none",
} as const;

export default function FafsaFollowUpClient() {
  const {
    authReady,
    userId,
    loading,
    statuses,
    tasksBySchool,
    loadError,
    actionError,
    savingId,
    addSchool,
    updateSchool,
    markPortalCheckedToday,
    updateTaskStatus,
  } = useSchoolAidTracker();
  const { actions: aidActions } = useAidActions();
  const relatedActions = getFollowUpRelatedActions(aidActions).slice(0, 3);

  const [showAddForm, setShowAddForm] = useState(false);

  if (!authReady || loading) {
    return <PageLoading message="Loading your school follow-up tracker..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/fafsa" style={{ ...secondaryBtn, marginBottom: 18, display: "inline-flex" }}>
            ← Back to FAFSA guide
          </Link>
          <h1
            className="font-display"
            style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-.8px", margin: "0 0 8px", color: "#15212E" }}
          >
            Aid Follow-Up Tracker
          </h1>
          <PageErrorBanner message="Sign in to track school portals, verification, and aid offers after FAFSA." />
          <Link href="/login" style={primaryBtn}>
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/fafsa" style={{ ...secondaryBtn, marginBottom: 18, display: "inline-flex" }}>
          ← Back to FAFSA guide
        </Link>

        <div style={{ marginBottom: 20 }}>
          <h1
            className="font-display"
            style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E", lineHeight: 1.1 }}
          >
            Aid Follow-Up Tracker
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Track what each school still needs after FAFSA.
          </p>
        </div>

        <ProductCard
          style={{
            padding: 18,
            marginBottom: 16,
            background: "#EAF3FF",
            border: "1px solid #D7E7FB",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: "#1E3A5F", margin: 0, lineHeight: 1.6 }}>
            Submitting FAFSA is not always the final step. Schools may post document requests, verification tasks, or aid
            offers in their own portals.
          </p>
        </ProductCard>

        <ProductCard
          style={{
            padding: 18,
            marginBottom: 18,
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            AidPilot can remind you what to check, but never enter school portal passwords, SSNs, tax returns, or bank
            account numbers here.
          </p>
        </ProductCard>

        {loadError && <PageErrorBanner message={loadError} />}
        {actionError && <PageErrorBanner message={actionError} />}

        {relatedActions.length > 0 ? (
          <ProductCard style={{ padding: 20, marginBottom: 18 }}>
            <h2 className="font-display" style={{ fontSize: 17, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
              Related aid actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {relatedActions.map((action) => (
                <AidActionCard key={action.id} action={action} compact />
              ))}
            </div>
          </ProductCard>
        ) : null}

        {statuses.length === 0 && !showAddForm ? (
          <ProductCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Add the schools you applied to or are considering. AidPilot will help you track whether each school has
              received your FAFSA, requested documents, selected you for verification, or posted an aid offer.
            </p>
            <button type="button" style={primaryBtn} onClick={() => setShowAddForm(true)}>
              Add a school
            </button>
          </ProductCard>
        ) : null}

        {(showAddForm || statuses.length > 0) && (
          <ProductCard style={{ padding: 22, marginBottom: 20 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
              {statuses.length === 0 ? "Add your first school" : "Add another school"}
            </h2>
            <AddSchoolAidStatusForm
              saving={savingId === "new"}
              onSubmit={async (input) => {
                const created = await addSchool(input);
                if (created) setShowAddForm(false);
                return created;
              }}
            />
          </ProductCard>
        )}

        {statuses.map((status) => (
          <SchoolAidStatusCard
            key={status.id}
            status={status}
            tasks={tasksBySchool[status.id] ?? []}
            saving={savingId === status.id}
            savingTaskId={savingId}
            onUpdate={(statusId, updates) => void updateSchool(statusId, updates)}
            onMarkPortalChecked={(statusId) => void markPortalCheckedToday(statusId)}
            onUpdateTaskStatus={(taskId, statusValue) => void updateTaskStatus(taskId, statusValue)}
          />
        ))}
      </div>
    </AppShell>
  );
}
