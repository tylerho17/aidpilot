"use client";

import Link from "next/link";
import { useState } from "react";
import { AppChrome } from "@/components/app/AppChrome";
import { Button, Card, StatusPanel } from "@/components/ui";
import { Greeting, SectionTitle } from "@/components/app/screens/shared";
import AddSchoolAidStatusForm from "@/components/fafsa/AddSchoolAidStatusForm";
import SchoolAidStatusCard from "@/components/fafsa/SchoolAidStatusCard";
import { useSchoolAidTracker } from "@/hooks/useSchoolAidTracker";
import { useAidActions } from "@/hooks/useAidActions";
import AidActionCard from "@/components/aid-actions/AidActionCard";
import { getFollowUpRelatedActions } from "@/lib/aid-actions/getAidActions";

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
    return (
      <AppChrome>
        <p style={{ color: "var(--gray-400)", fontSize: 15, fontWeight: 500 }}>Loading your school follow-up tracker...</p>
      </AppChrome>
    );
  }

  if (!userId) {
    return (
      <AppChrome>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/fafsa" style={{ textDecoration: "none", display: "inline-block", marginBottom: 18 }}>
            <Button variant="ghost" size="sm" iconLeft="chevron-left" style={{ paddingLeft: 4 }}>
              Back to FAFSA guide
            </Button>
          </Link>
          <Greeting
            title="Aid Follow-Up Tracker"
            subtitle="Sign in to track school portals, verification, and aid offers after FAFSA."
          />
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="clay">Sign in</Button>
          </Link>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/fafsa" style={{ textDecoration: "none", display: "inline-block", marginBottom: 18 }}>
          <Button variant="ghost" size="sm" iconLeft="chevron-left" style={{ paddingLeft: 4 }}>
            Back to FAFSA guide
          </Button>
        </Link>

        <Greeting
          title="Aid Follow-Up Tracker"
          subtitle="Track what each school still needs after FAFSA."
        />

        <StatusPanel
          tone="blue"
          icon="clipboard"
          title="Submitting FAFSA is not always the final step"
          style={{ marginBottom: 16 }}
        >
          Schools may post document requests, verification tasks, or aid offers in their own portals.
        </StatusPanel>

        <StatusPanel
          tone="amber"
          icon="shield-check"
          eyebrow="Stay safe"
          title="Never enter portal passwords or sensitive numbers"
          style={{ marginBottom: 18 }}
        >
          AidPilot can remind you what to check, but never enter school portal passwords, SSNs, tax returns, or bank
          account numbers here.
        </StatusPanel>

        {loadError && (
          <StatusPanel tone="coral" icon="shield" title="Something needs your attention" style={{ marginBottom: 18 }}>
            {loadError}
          </StatusPanel>
        )}
        {actionError && (
          <StatusPanel tone="coral" icon="shield" title="Something needs your attention" style={{ marginBottom: 18 }}>
            {actionError}
          </StatusPanel>
        )}

        {relatedActions.length > 0 ? (
          <Card variant="clay" padding={20} style={{ marginBottom: 18 }}>
            <h2 className="font-display" style={{ fontSize: 17, fontWeight: 900, margin: "0 0 12px", color: "var(--ink-900)", letterSpacing: "-.2px" }}>
              Related aid actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {relatedActions.map((action) => (
                <AidActionCard key={action.id} action={action} compact />
              ))}
            </div>
          </Card>
        ) : null}

        {statuses.length === 0 && !showAddForm ? (
          <Card variant="clay" padding={24} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-500)", margin: "0 0 18px", lineHeight: 1.65 }}>
              Add the schools you applied to or are considering. AidPilot will help you track whether each school has
              received your FAFSA, requested documents, selected you for verification, or posted an aid offer.
            </p>
            <Button variant="clay" iconLeft="plus" onClick={() => setShowAddForm(true)}>
              Add a school
            </Button>
          </Card>
        ) : null}

        {(showAddForm || statuses.length > 0) && (
          <Card variant="clay" padding={22} style={{ marginBottom: 20 }}>
            <SectionTitle>{statuses.length === 0 ? "Add your first school" : "Add another school"}</SectionTitle>
            <AddSchoolAidStatusForm
              saving={savingId === "new"}
              onSubmit={async (input) => {
                const created = await addSchool(input);
                if (created) setShowAddForm(false);
                return created;
              }}
            />
          </Card>
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
    </AppChrome>
  );
}
