"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductUI";
import AddScholarshipForm from "@/components/scholarships/AddScholarshipForm";
import ScholarshipTrackerList from "@/components/scholarships/ScholarshipTrackerList";
import { PageErrorBanner, PageLoading } from "@/components/product/PageSafety";
import { useScholarshipTracker, type AddCustomScholarshipInput } from "@/hooks/useScholarshipTracker";
import {
  catalogToTrackerItem,
  countScholarshipsDueWithinDays,
  matchToTrackerItem,
  resolveMatchName,
} from "@/lib/scholarships/tracker-helpers";
import type { UserScholarshipMatch } from "@/lib/types";

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
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
} as const;

function PageIntro() {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 8px", color: "#15212E" }}>
          Scholarship Tracker
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          Track outside scholarships, deadlines, and applications in one place.
        </p>
      </div>

      <ProductCard
        style={{
          padding: 18,
          marginBottom: 18,
          background: "#EAF3FF",
          border: "1px solid #D7E7FB",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#1E3A5F", margin: 0, lineHeight: 1.65 }}>
          Scholarships can reduce what you need to pay out of pocket. AidPilot helps you track opportunities, deadlines,
          and application status.
        </p>
      </ProductCard>
    </>
  );
}

export default function ScholarshipTrackerClient() {
  const {
    authReady,
    userId,
    loading,
    matches,
    catalog,
    trackedScholarshipIds,
    loadError,
    actionError,
    savingId,
    saveCatalogScholarship,
    addCustomScholarship,
    updateMatch,
    removeMatch,
    reload,
  } = useScholarshipTracker();

  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<UserScholarshipMatch | null>(null);

  const trackedItems = useMemo(() => matches.map(matchToTrackerItem), [matches]);

  const sampleItems = useMemo(
    () =>
      catalog
        .filter((scholarship) => !trackedScholarshipIds.has(scholarship.id))
        .map((scholarship) => catalogToTrackerItem(scholarship, false)),
    [catalog, trackedScholarshipIds]
  );

  const dueWithin7 = useMemo(() => countScholarshipsDueWithinDays(matches, 7), [matches]);

  if (!authReady || loading) {
    return <PageLoading message="Loading your scholarships..." />;
  }

  if (!userId) {
    return (
      <AppShell>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <PageIntro />
          {catalog.length > 0 ? (
            <>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
                Sample opportunities
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
                These are clearly labeled sample scholarships for demonstration. Log in to save them to your tracker.
              </p>
              <ScholarshipTrackerList items={sampleItems.slice(0, 4)} />
            </>
          ) : null}
          <ProductCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Log in to save and track scholarships, deadlines, and application status.
            </p>
            <Link href="/login" style={primaryBtn}>
              Sign in
            </Link>
          </ProductCard>
        </div>
      </AppShell>
    );
  }

  async function handleFormSubmit(input: AddCustomScholarshipInput, matchId?: string) {
    if (matchId) {
      const saved = await updateMatch(matchId, {
        custom_name: input.name,
        custom_provider: input.provider,
        custom_amount: input.amount,
        custom_deadline: input.deadline ?? null,
        custom_application_url: input.application_url,
        match_reason: input.match_reason,
        priority: input.priority,
        notes: input.notes,
      });
      if (saved) {
        setShowForm(false);
        setEditingMatch(null);
      }
      return saved;
    }

    const saved = await addCustomScholarship(input);
    if (saved) {
      setShowForm(false);
      setEditingMatch(null);
    }
    return saved;
  }

  function openEdit(matchId: string) {
    const match = matches.find((item) => item.id === matchId) ?? null;
    setEditingMatch(match);
    setShowForm(true);
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <PageIntro />

        {loadError ? (
          <ProductCard style={{ padding: 18, marginBottom: 18, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.6 }}>
              {loadError}
            </p>
            <button type="button" style={secondaryBtn} onClick={() => void reload()}>
              Try again
            </button>
          </ProductCard>
        ) : null}
        {actionError ? <PageErrorBanner message={actionError} /> : null}

        {matches.length > 0 ? (
          <ProductCard style={{ padding: 18, marginBottom: 18 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Tracked</div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "#15212E" }}>
                  {matches.length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Due within 7 days</div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: dueWithin7 > 0 ? "#C04E57" : "#15212E" }}>
                  {dueWithin7}
                </div>
              </div>
            </div>
          </ProductCard>
        ) : null}

        {!loadError && matches.length === 0 && !showForm ? (
          <ProductCard style={{ padding: 24, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Add scholarships you find from your school, local community, or trusted scholarship databases. AidPilot will
              help you track deadlines and application status.
            </p>
            <button type="button" style={primaryBtn} onClick={() => setShowForm(true)}>
              Add scholarship
            </button>
          </ProductCard>
        ) : null}

        {!loadError && (showForm || matches.length > 0) ? (
          <ProductCard style={{ padding: 22, marginBottom: 20 }}>
            <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
              {editingMatch ? `Edit ${resolveMatchName(editingMatch)}` : showForm ? "Add scholarship" : "Add another scholarship"}
            </h2>
            {showForm ? (
              <AddScholarshipForm
                initialMatch={editingMatch}
                saving={Boolean(savingId)}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMatch(null);
                }}
              />
            ) : (
              <button type="button" style={primaryBtn} onClick={() => setShowForm(true)}>
                Add scholarship
              </button>
            )}
          </ProductCard>
        ) : null}

        {!loadError && trackedItems.length > 0 ? (
          <>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
              Your scholarships
            </h2>
            <ScholarshipTrackerList
              items={trackedItems}
              savingId={savingId}
              onSaveToTracker={(id) => void saveCatalogScholarship(id)}
              onMarkApplying={(id) => void updateMatch(id, { status: "applying" })}
              onMarkSubmitted={(id) => void updateMatch(id, { status: "submitted" })}
              onEdit={openEdit}
              onRemove={(id) => void removeMatch(id)}
            />
          </>
        ) : null}

        {!loadError && sampleItems.length > 0 ? (
          <>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 8px", color: "#15212E" }}>
              Sample opportunities
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.6 }}>
              Clearly labeled demo scholarships you can save to your tracker for practice. Verify real scholarships with
              each provider before applying.
            </p>
            <ScholarshipTrackerList
              items={sampleItems}
              savingId={savingId}
              onSaveToTracker={(id) => void saveCatalogScholarship(id)}
            />
          </>
        ) : null}

        <p style={{ fontSize: 12, color: "#9AA4B2", lineHeight: 1.6, marginTop: 8 }}>
          AidPilot does not submit applications for you. Verify eligibility and deadlines with each provider.{" "}
          <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>
            Read disclaimer
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
