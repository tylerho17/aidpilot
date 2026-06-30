"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CheckSVG, PillBadge, ProductCard, StatCard, ProgressBar } from "@/components/ProductUI";
import { PageLoading, friendlyActionError, runSafe } from "@/components/product/PageSafety";
import { FafsaDemoBanner } from "@/components/product/FafsaDemoBanner";
import { useUserData } from "@/hooks/useUserData";
import { getProfileFullName, getProfileSchoolName } from "@/lib/profile-fields";
import { getTopAttentionItems, getSeverityLabel, attentionSeverityToTone } from "@/lib/attention";
import {
  getFafsaBlockers,
  getNextFafsaAction,
  getChecklistOnlyTasks,
} from "@/lib/fafsa-plan";
import { fafsaStepHref } from "@/lib/fafsa-step-url";
import { getTopRecommendations } from "@/lib/intelligence/recommendations";
import {
  getDashboardSummary,
  getScholarshipStatsFromDb,
  getUrgentTasksFromDb,
  getAttentionCountFromTasks,
  getChecklistProgressFromTasks,
  getCompletedTaskCount,
  getMissingDocumentCountFromDocs,
  formatDueDate,
  statusToTone,
  getUpcomingDeadlines,
  getNextDeadlineFromDeadlines,
  deadlineStatusToTone,
} from "@/lib/data-helpers";
import {
  buildWeeklyFocus,
  calculateAidProtectionScore,
  summarizeAidOffer,
} from "@/lib/dashboard-command-center";
import { PROFILE_OPTIONAL_SAVE_NOTICE_KEY } from "@/lib/onboarding-profile";
import { useAidActions } from "@/hooks/useAidActions";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useProtectHub } from "@/hooks/useProtectHub";
import { AID_ACTION_EMPTY_MESSAGE } from "@/components/aid-actions/AidActionList";
import ProtectRiskBadge from "@/components/protect/ProtectRiskBadge";
import { calculateAidOfferFromRecord } from "@/lib/aid-letter/calculateAidOffer";
import { getAidOfferReportHref } from "@/lib/aid-letter/buildAidHealthReport";

const primaryBtn = {
  display: "inline-flex",
  fontSize: 15,
  fontWeight: 700,
  color: "#fff",
  background: "#0B5CAD",
  padding: "12px 22px",
  borderRadius: 13,
  textDecoration: "none",
  boxShadow: "0 10px 20px rgba(11,92,173,.22)",
} as const;

const secondaryBtn = {
  display: "inline-flex",
  fontSize: 14,
  fontWeight: 700,
  color: "#0B5CAD",
  background: "#EAF3FF",
  padding: "10px 16px",
  borderRadius: 999,
  textDecoration: "none",
} as const;

export default function DashboardClient() {
  const {
    loading,
    authReady,
    profile,
    tasks,
    documents,
    scholarships,
    deadlines,
    weeklyReport,
    recommendations,
    userFafsaSteps,
    workflowSteps,
    fafsaIntake,
    fafsaDemoMode,
    aidLetter,
    refreshRecommendations,
    generateWeeklyReport,
  } = useUserData();
  const { topAction, loading: aidActionsLoading, loadError: aidActionsLoadError } = useAidActions();
  const { offers: aidOffers, userId: aidOffersUserId, loading: aidOffersLoading } = useAidOffers();
  const {
    snapshot: protectSnapshot,
    loading: protectLoading,
    loadError: protectLoadError,
    userId: protectUserId,
  } = useProtectHub();
  const [refreshing, setRefreshing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [actionError, setActionError] = useState("");
  const [profileNotice] = useState(() => {
    if (typeof window === "undefined") return "";
    const notice = sessionStorage.getItem(PROFILE_OPTIONAL_SAVE_NOTICE_KEY);
    if (notice) {
      sessionStorage.removeItem(PROFILE_OPTIONAL_SAVE_NOTICE_KEY);
      return notice;
    }
    return "";
  });

  if (!authReady && loading) {
    return <PageLoading message="Loading your aid check-in..." />;
  }

  const { data: view } = runSafe(
    "Dashboard",
    () => {
      const checklistTasks = getChecklistOnlyTasks(tasks ?? []);
      const summary = getDashboardSummary(profile, checklistTasks, deadlines ?? [], weeklyReport);
      const attention = getAttentionCountFromTasks(checklistTasks);
      const progress = getChecklistProgressFromTasks(checklistTasks);
      const completed = getCompletedTaskCount(checklistTasks);
      const totalTasks = checklistTasks.length;
      const missingDocs = getMissingDocumentCountFromDocs(documents ?? []);
      const scholarshipStats = getScholarshipStatsFromDb(scholarships ?? []);
      const protectItems = getTopAttentionItems(
        {
          tasks: checklistTasks,
          documents: documents ?? [],
          deadlines: deadlines ?? [],
          userFafsaSteps: userFafsaSteps ?? [],
          workflowSteps: workflowSteps ?? [],
          scholarships: scholarships ?? [],
        },
        5
      );
      const fafsaNextAction = getNextFafsaAction(tasks ?? []);
      const fafsaBlockers = getFafsaBlockers(tasks ?? []);
      const aidProtection = calculateAidProtectionScore({
        fafsaIntake: fafsaIntake ?? null,
        tasks: tasks ?? [],
        aidLetter: aidLetter ?? null,
      });
      const aidOfferSummary = summarizeAidOffer(aidLetter ?? null);
      const weeklyFocus = buildWeeklyFocus({
        fafsaIntake: fafsaIntake ?? null,
        tasks: tasks ?? [],
        fafsaBlockers,
        attentionCount: attention,
        scholarshipNewCount: scholarshipStats.newCount,
      });
      const urgent = getUrgentTasksFromDb(checklistTasks, 3).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? "",
        status: t.status,
        dueDate: formatDueDate(t.due_date, t.status),
        category: t.category ?? "",
        priority: t.priority ?? "Medium",
      }));
      const upcomingDeadlines = getUpcomingDeadlines(deadlines ?? [], 3);
      const nextDeadlineLabel = getNextDeadlineFromDeadlines(deadlines ?? []);
      const topActions = getTopRecommendations(recommendations ?? [], 3);

      return {
        checklistTasks,
        summary,
        attention,
        progress,
        completed,
        totalTasks,
        missingDocs,
        scholarshipStats,
        protectItems,
        fafsaNextAction,
        fafsaBlockers,
        aidProtection,
        aidOfferSummary,
        weeklyFocus,
        urgent,
        upcomingDeadlines,
        nextDeadlineLabel,
        topActions,
      };
    },
    {
      checklistTasks: [],
      summary: {
        aidStatus: "Needs attention",
        aidAtRisk: "$2,400",
        nextDeadline: "No deadlines yet",
        weeklyCheckIn: "Getting started",
        protectedMessage: "Your aid needs a little attention this week.",
      },
      attention: 0,
      progress: 0,
      completed: 0,
      totalTasks: 0,
      missingDocs: 0,
      scholarshipStats: getScholarshipStatsFromDb([]),
      protectItems: [],
      fafsaNextAction: null,
      fafsaBlockers: [],
      aidProtection: calculateAidProtectionScore({ fafsaIntake: null, tasks: [], aidLetter: null }),
      aidOfferSummary: null,
      weeklyFocus: [],
      urgent: [],
      upcomingDeadlines: [],
      nextDeadlineLabel: "No deadlines yet",
      topActions: [],
    }
  );

  const firstName = getProfileFullName(profile) || "there";
  const schoolLabel = getProfileSchoolName(profile) || "Your school";
  const {
    attention,
    progress,
    completed,
    totalTasks,
    missingDocs,
    scholarshipStats,
    protectItems,
    fafsaBlockers,
    aidProtection,
    aidOfferSummary,
    weeklyFocus,
    urgent,
    upcomingDeadlines,
    nextDeadlineLabel,
    topActions,
    summary,
  } = view;

  if (loading) {
    return <PageLoading message="Loading your aid check-in..." />;
  }

  const report = weeklyReport
    ? {
        aid_status: weeklyReport.aid_status,
        summary: weeklyReport.summary ?? "",
        tasks_due_count: weeklyReport.tasks_due_count,
        missing_documents_count: weeklyReport.missing_documents_count,
        scholarship_count: weeklyReport.scholarship_count,
        potential_scholarship_amount: weeklyReport.potential_scholarship_amount,
      }
    : null;

  const toneFn = (status: string) => statusToTone(status);

  async function handleRefreshRecommendations() {
    setRefreshing(true);
    setActionError("");
    try {
      await refreshRecommendations();
    } catch (err) {
      console.error("Failed to refresh recommendations:", err);
      setActionError(friendlyActionError(err, "Could not refresh recommendations. Please try again."));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleGenerateReport() {
    setGeneratingReport(true);
    setActionError("");
    try {
      await generateWeeklyReport();
    } catch (err) {
      console.error("Failed to generate weekly report:", err);
      setActionError(friendlyActionError(err, "Could not generate your weekly report. Please try again."));
    } finally {
      setGeneratingReport(false);
    }
  }

  const priorityTone = (priority: string): "green" | "amber" | "coral" | "blue" | "gray" => {
    if (priority === "high") return "coral";
    if (priority === "medium") return "amber";
    return "blue";
  };

  const reportStatusTone =
    (report?.aid_status ?? summary.aidStatus) === "Protected"
      ? "green"
      : (report?.aid_status ?? summary.aidStatus) === "At risk"
        ? "coral"
        : "amber";

  const protectionColor =
    aidProtection.score >= 80 ? "#15885A" : aidProtection.score >= 40 ? "#0B5CAD" : "#B7791F";

  const aidOfferStats = (() => {
    if (!aidOffersUserId || aidOffers.length === 0) return null;
    const withCalc = aidOffers.map((offer) => ({ offer, calculation: calculateAidOfferFromRecord(offer) }));
    const lowestNet = [...withCalc].sort((a, b) => a.calculation.netCostAfterGiftAid - b.calculation.netCostAfterGiftAid)[0];
    const highestGap = [...withCalc].sort(
      (a, b) => b.calculation.remainingGapAfterAllAid - a.calculation.remainingGapAfterAllAid
    )[0];
    return { count: aidOffers.length, lowestNet, highestGap };
  })();

  return (
    <AppShell>
      {profileNotice && (
        <ProductCard style={{ padding: 18, marginBottom: 22, background: "#EAF3FF", border: "1px solid #D7E7FB" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#0B5CAD", margin: 0, lineHeight: 1.6 }}>{profileNotice}</p>
        </ProductCard>
      )}

      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#9AA4B2", margin: "0 0 6px" }}>
          Good morning, {firstName}.
        </p>
        <h1 className="font-display" style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 6px", color: "#15212E", lineHeight: 1.1 }}>
          Your aid command center
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          {schoolLabel} · Here is what to do next for FAFSA, blockers, and your aid offer.
        </p>
      </div>

      {fafsaDemoMode && (
        <div style={{ marginBottom: 20 }}>
          <FafsaDemoBanner />
        </div>
      )}

      {actionError && (
        <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{actionError}</p>
      )}

      <ProductCard
        style={{
          padding: 28,
          marginBottom: 20,
          background: "linear-gradient(135deg,#F4FBF7,#F4F8FE)",
          border: "1px solid #D5F0E2",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#15212E" }}>
            Protect your aid
          </h2>
          {protectUserId && !protectLoading ? <ProtectRiskBadge status={protectSnapshot.overallStatus} /> : null}
        </div>
        {protectLoadError ? (
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.65 }}>
            {protectLoadError}
          </p>
        ) : protectLoading ? (
          <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: "0 0 14px", lineHeight: 1.65 }}>
            Loading your protection status...
          </p>
        ) : protectUserId ? (
          <>
            <p className="font-display" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#15212E", lineHeight: 1.35 }}>
              {protectSnapshot.headline}
            </p>
            {topAction ? (
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
                Most important: <span style={{ fontWeight: 700, color: "#15212E" }}>{topAction.title}</span>
              </p>
            ) : (
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
                {protectSnapshot.description}
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
            Track FAFSA, school portals, verification, and aid offers in one place.
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/protect" style={primaryBtn}>
            Open Protect Hub
          </Link>
          {topAction ? (
            <Link href={topAction.href} style={secondaryBtn}>
              {topAction.ctaLabel}
            </Link>
          ) : (
            <Link href="/actions" style={secondaryBtn}>
              View all actions
            </Link>
          )}
        </div>
      </ProductCard>

      <ProductCard
        style={{
          padding: 28,
          marginBottom: 20,
          background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)",
          border: "1px solid #D7E7FB",
        }}
      >
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
          Your next aid action
        </h2>
        {aidActionsLoadError ? (
          <p style={{ fontSize: 14, fontWeight: 500, color: "#78350F", margin: "0 0 14px", lineHeight: 1.65 }}>
            {aidActionsLoadError}
          </p>
        ) : aidActionsLoading ? (
          <p style={{ fontSize: 14, fontWeight: 500, color: "#9AA4B2", margin: "0 0 14px", lineHeight: 1.65 }}>
            Loading your aid actions...
          </p>
        ) : topAction ? (
          <>
            <p style={{ fontSize: 17, fontWeight: 800, color: "#15212E", margin: "0 0 8px", lineHeight: 1.4 }}>
              {topAction.title}
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              {topAction.description}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={topAction.href} style={primaryBtn}>
                {topAction.ctaLabel}
              </Link>
              <Link href="/actions" style={secondaryBtn}>
                View all actions
              </Link>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              {AID_ACTION_EMPTY_MESSAGE}
            </p>
            <Link href="/actions" style={secondaryBtn}>
              View all actions
            </Link>
          </>
        )}
      </ProductCard>

      <ProductCard style={{ padding: 28, marginBottom: 20 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>
          Compare your aid offers
        </h2>
        {aidOffersUserId && !aidOffersLoading && aidOfferStats ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2" }}>Saved offers</div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "#15212E" }}>
                  {aidOfferStats.count}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 6px", lineHeight: 1.65 }}>
              Lowest net after gift aid:{" "}
              <span style={{ fontWeight: 700, color: "#15885A" }}>
                {aidOfferStats.lowestNet.offer.school_name} ($
                {aidOfferStats.lowestNet.calculation.netCostAfterGiftAid.toLocaleString()})
              </span>
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
              Highest remaining gap:{" "}
              <span style={{ fontWeight: 700, color: "#C04E57" }}>
                {aidOfferStats.highestGap.offer.school_name} ($
                {aidOfferStats.highestGap.calculation.remainingGapAfterAllAid.toLocaleString()})
              </span>
            </p>
          </>
        ) : (
          <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.65 }}>
            Enter aid offers manually to compare gift aid, loans, and remaining cost across schools.
          </p>
        )}
        <Link href={aidOfferStats ? getAidOfferReportHref(aidOfferStats.lowestNet.offer.id) : "/aid-letter"} style={primaryBtn}>
          {aidOfferStats ? "View Aid Health Report" : "Open Aid Offer Decoder"}
        </Link>
      </ProductCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginBottom: 20,
        }}
      >
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
            Aid Protection Score
          </h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <span className="font-display" style={{ fontSize: 40, fontWeight: 900, color: protectionColor }}>
              {aidProtection.score}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#9AA4B2" }}>/ {aidProtection.maxScore}</span>
            <PillBadge tone={aidProtection.score >= 80 ? "green" : aidProtection.score >= 40 ? "blue" : "amber"}>
              {aidProtection.label}
            </PillBadge>
          </div>
          <ProgressBar pct={aidProtection.score} color={`linear-gradient(90deg,${protectionColor},#37A0E0)`} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {aidProtection.pillars.map((pillar) => (
              <div key={pillar.id} style={{ fontSize: 13, fontWeight: 500, color: pillar.earned ? "#15885A" : "#6B7280", lineHeight: 1.5 }}>
                {pillar.earned ? "✓" : "○"} {pillar.label}
                {!pillar.earned && (
                  <span style={{ display: "block", fontSize: 12, color: "#9AA4B2", marginTop: 2 }}>{pillar.detail}</span>
                )}
              </div>
            ))}
          </div>
        </ProductCard>

        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
            Blockers
          </h2>
          {fafsaBlockers.length === 0 ? (
            <p style={{ fontSize: 14, fontWeight: 500, color: "#15885A", margin: 0, lineHeight: 1.65 }}>
              No major blockers detected yet. Keep working through your FAFSA plan on StudentAid.gov.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fafsaBlockers.slice(0, 4).map((blocker) => (
                <div key={blocker.id} style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#78350F", marginBottom: 4 }}>{blocker.title}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>{blocker.blocking_reason}</div>
                  {blocker.plan_key && (
                    <Link href={fafsaStepHref(blocker.plan_key)} style={{ ...secondaryBtn, marginTop: 10, display: "inline-flex" }}>
                      Resolve step
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </ProductCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginBottom: 28,
        }}
      >
        <ProductCard style={{ padding: 24 }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
            Aid offer
          </h2>
          {!aidOfferStats && !aidOfferSummary ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.65 }}>
                Decode your aid offer when you receive it. AidPilot separates free money from loans — no SSNs or tax numbers needed.
              </p>
              <Link href="/aid-letter" style={primaryBtn}>
                Open aid decoder
              </Link>
            </>
          ) : aidOfferStats ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#9AA4B2", margin: "0 0 12px" }}>
                {aidOfferStats.lowestNet.offer.school_name}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#15885A" }}>Gift aid</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#15212E" }}>
                    ${aidOfferStats.lowestNet.calculation.giftAid.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B7791F" }}>Loans</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#15212E" }}>
                    ${aidOfferStats.lowestNet.calculation.loanTotal.toLocaleString()}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", margin: "0 0 16px" }}>
                Remaining gap:{" "}
                <span style={{ color: "#C04E57" }}>
                  ${aidOfferStats.highestGap.calculation.remainingGapAfterAllAid.toLocaleString()}
                </span>
              </p>
              <Link href={getAidOfferReportHref(aidOfferStats.lowestNet.offer.id)} style={secondaryBtn}>
                View Aid Health Report →
              </Link>
            </>
          ) : aidOfferSummary ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#9AA4B2", margin: "0 0 12px" }}>{aidOfferSummary.schoolName}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ padding: 12, borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#15885A" }}>Free money</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#15212E" }}>
                    ${aidOfferSummary.freeMoney.toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B7791F" }}>Loans</div>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#15212E" }}>
                    ${aidOfferSummary.loans.toLocaleString()}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", margin: "0 0 16px" }}>
                Estimated gap after aid: <span style={{ color: "#C04E57" }}>${aidOfferSummary.gap.toLocaleString()}</span>
              </p>
              <Link href="/aid-letter" style={secondaryBtn}>
                Review aid offer →
              </Link>
            </>
          ) : null}
        </ProductCard>

        <ProductCard style={{ padding: 24, background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2" }}>
          <h2 className="font-display" style={{ fontSize: 18, fontWeight: 900, margin: "0 0 12px", color: "#15212E" }}>
            This week
          </h2>
          <ul style={{ margin: "0 0 18px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyFocus.map((item) => (
              <li key={item} style={{ fontSize: 14, fontWeight: 500, color: "#374151", lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Link href="/fafsa" style={secondaryBtn}>
              FAFSA plan
            </Link>
            <Link href="/aid-letter" style={secondaryBtn}>
              Aid decoder
            </Link>
            <Link href="/documents" style={secondaryBtn}>
              Documents
            </Link>
            <Link href="/deadlines" style={secondaryBtn}>
              Deadlines
            </Link>
          </div>
        </ProductCard>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Checklist" value={`${completed} of ${totalTasks}`} color="#0B5CAD" style={{ flex: "1 1 120px" }} sub={`${progress}%`} />
        <StatCard label="Next deadline" value={nextDeadlineLabel} color="#B7791F" style={{ flex: "1 1 120px" }} />
        <StatCard label="Scholarships" value={`${scholarshipStats.newCount} new`} color="#0B5CAD" style={{ flex: "1 1 120px" }} />
      </div>

      <ProductCard style={{ padding: 26, marginBottom: 22 }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
          Protect your aid
        </h2>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px", lineHeight: 1.55 }}>
          These are items AidPilot thinks may affect your aid, deadlines, or money if left unresolved.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {protectItems.length === 0 ? (
            <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
              Nothing urgent in AidPilot right now. Keep checking your school, FAFSA, and scholarship portals for official updates.
            </p>
          ) : (
            protectItems.map((item) => (
              <div
                key={item.id}
                style={{ padding: "14px 16px", borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E" }}>{item.title}</div>
                  <PillBadge tone={attentionSeverityToTone(item.severity)}>{getSeverityLabel(item.severity)}</PillBadge>
                </div>
                {item.dueDate ? (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2", marginBottom: 8 }}>
                    Due {formatDueDate(item.dueDate)}
                  </div>
                ) : null}
                <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 6px", lineHeight: 1.55 }}>
                  {item.whyItMatters}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#5B6573", margin: "0 0 12px", lineHeight: 1.55 }}>
                  Next step: {item.nextStep}
                </p>
                <Link
                  href={item.href}
                  style={{
                    display: "inline-flex",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0B5CAD",
                    background: "#EAF3FF",
                    padding: "8px 14px",
                    borderRadius: 999,
                    textDecoration: "none",
                  }}
                >
                  {item.actionLabel}
                </Link>
              </div>
            ))
          )}
        </div>
      </ProductCard>

      <ProductCard style={{ padding: 26, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Top 3 next actions</h2>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: 0 }}>Suggested next steps based on your aid profile. Verify with your school aid office.</p>
            </div>
            <button type="button" onClick={() => handleRefreshRecommendations()} disabled={refreshing} style={{ fontSize: 13, fontWeight: 700, color: "#0B5CAD", background: "#EAF3FF", border: "none", padding: "8px 14px", borderRadius: 999, cursor: refreshing ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {refreshing ? "Refreshing..." : "Refresh recommendations"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topActions.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0 }}>No active recommendations. Click refresh to generate suggestions.</p>
            ) : (
              topActions.map((rec) => (
                <div key={rec.title} style={{ padding: "14px 16px", borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E" }}>{rec.title}</div>
                    <PillBadge tone={priorityTone(rec.priority)}>{rec.priority} priority</PillBadge>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: "0 0 8px", lineHeight: 1.55 }}>{rec.description}</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                    {rec.category}
                    {"due_date" in rec && rec.due_date ? ` · Due ${formatDueDate(rec.due_date)}` : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </ProductCard>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 22, alignItems: "start", marginBottom: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 28, background: "linear-gradient(135deg,#EAFBF1,#F4FBF7)", border: "1px solid #D5F0E2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ display: "flex", width: 24, height: 24, borderRadius: "50%", background: "#15885A", alignItems: "center", justifyContent: "center" }}>
                <CheckSVG size={13} strokeWidth={2.6} />
              </span>
              <PillBadge tone="green">Protected this week</PillBadge>
              <PillBadge tone="blue">{summary.weeklyCheckIn}</PillBadge>
            </div>
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 900, margin: "0 0 10px", color: "#15212E", lineHeight: 1.25 }}>
              Your aid is safe this week.
            </h2>
            <p style={{ fontSize: 15.5, fontWeight: 500, color: "#5B6573", margin: "0 0 22px", lineHeight: 1.65 }}>
              AidPilot is watching your eligibility, enrollment, documents, and deadlines. {attention} tasks need attention before {nextDeadlineLabel}.
            </p>
            <Link href="/checklist" style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#15885A", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(21,136,90,.22)" }}>
              Review tasks
            </Link>
          </ProductCard>

          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>What needs attention</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px" }}>Top 3 urgent tasks from your {totalTasks}-step checklist</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {urgent.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                  No urgent tasks yet. Your checklist will populate as you add tasks or run starter setup from Settings.
                </p>
              ) : (
                urgent.map((row) => (
                  <div key={row.id ?? row.title} className="animate-slide-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "14px 16px", borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{row.title}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6B7280", marginBottom: 6, lineHeight: 1.5 }}>{row.description}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                        {row.category} · Due {row.dueDate}
                      </div>
                    </div>
                    <PillBadge tone={toneFn(row.status)}>{row.status}</PillBadge>
                  </div>
                ))
              )}
            </div>
            <Link href="/checklist" style={{ display: "inline-block", marginTop: 16, fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
              View all {totalTasks} tasks
            </Link>
          </ProductCard>

          <ProductCard style={{ padding: 26 }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>Upcoming deadlines</h2>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#9AA4B2", margin: "0 0 16px" }}>Next 3 deadlines from your aid calendar</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcomingDeadlines.length === 0 ? (
                <p style={{ fontSize: 14, color: "#9AA4B2", margin: 0, lineHeight: 1.6 }}>
                  No upcoming deadlines yet. Add deadlines from the Deadlines page when you are ready.
                </p>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div key={d.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#F9FAFB", border: "1px solid #EAEEF3" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E", marginBottom: 4 }}>{d.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#9AA4B2" }}>
                        {formatDueDate(d.deadline_date)} · {d.category} · {d.priority} priority
                      </div>
                    </div>
                    <PillBadge tone={deadlineStatusToTone(d.status)}>{d.status}</PillBadge>
                  </div>
                ))
              )}
            </div>
            <Link href="/deadlines" style={{ display: "inline-block", marginTop: 16, fontSize: 14, fontWeight: 700, color: "#0B5CAD", textDecoration: "none" }}>
              View all deadlines
            </Link>
          </ProductCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <ProductCard style={{ padding: 26, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 10px", color: "#15212E" }}>This week&apos;s AidPilot report</h2>
            <div style={{ marginBottom: 14 }}>
              <PillBadge tone={reportStatusTone}>Aid status: {report?.aid_status ?? summary.aidStatus}</PillBadge>
            </div>
            <p style={{ fontSize: 14.5, fontWeight: 500, color: "#5B6573", margin: "0 0 16px", lineHeight: 1.6 }}>
              {report?.summary ?? "Your weekly report will appear here after onboarding."}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <div style={{ padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #E6EDF6" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Tasks due</div>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#0B5CAD" }}>{report?.tasks_due_count ?? attention}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #E6EDF6" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Missing documents</div>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#C04E57" }}>{report?.missing_documents_count ?? missingDocs}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #E6EDF6" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Scholarship matches</div>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "#0B5CAD" }}>{report?.scholarship_count ?? scholarshipStats.newCount}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #E6EDF6" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9AA4B2" }}>Potential amount</div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: "#15885A" }}>
                  ${(report?.potential_scholarship_amount ?? scholarshipStats.totalPotential).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/report" style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}>
                View weekly report
              </Link>
              <button type="button" onClick={() => handleGenerateReport()} disabled={generatingReport} style={{ fontSize: 15, fontWeight: 700, color: "#0B5CAD", background: "#fff", border: "1.5px solid #DCE7F5", padding: "12px 22px", borderRadius: 13, cursor: generatingReport ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {generatingReport ? "Generating..." : "Generate report"}
              </button>
            </div>
          </ProductCard>

          <ProductCard style={{ padding: 26, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 14px", color: "#15212E" }}>We found money for you this week.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {[
                { label: `${scholarshipStats.newCount} new matches`, color: "#0B5CAD" },
                { label: `${scholarshipStats.totalPotentialLabel} potential awards`, color: "#15885A" },
                { label: `${scholarshipStats.strongMatches} strong matches`, color: "#0B5CAD" },
              ].map((s) => (
                <div key={s.label} className="font-display" style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.label}</div>
              ))}
            </div>
            <Link href="/scholarships" style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}>
              View scholarship report
            </Link>
          </ProductCard>
        </div>
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: "#9AA4B2", lineHeight: 1.6 }}>
        AidPilot is an organizational and educational tool, not official financial aid advice. AidPilot does not collect FAFSA login credentials, Social Security numbers, or tax documents.{" "}
        <Link href="/disclaimer" style={{ color: "#0B5CAD", textDecoration: "underline" }}>Read disclaimer</Link>
      </p>

      <FeedbackWidget page="/dashboard" />
    </AppShell>
  );
}
