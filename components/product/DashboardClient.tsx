"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CheckSVG, PillBadge, ProductCard, StatCard, ProgressBar } from "@/components/ProductUI";
import { PageErrorBanner, PageLoading, friendlyActionError, runSafe } from "@/components/product/PageSafety";
import { useUserData } from "@/hooks/useUserData";
import { getProfileFullName, getProfileSchoolName } from "@/lib/profile-fields";
import { getTopAttentionItems, getSeverityLabel, attentionSeverityToTone } from "@/lib/attention";
import {
  getCurrentFafsaStage,
  getFafsaBlockers,
  getFafsaPlanProgress,
  getNextFafsaAction,
  getChecklistOnlyTasks,
} from "@/lib/fafsa-plan";
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
  getDeadlinesThisMonthCount,
  getNextDeadlineFromDeadlines,
  deadlineStatusToTone,
} from "@/lib/data-helpers";
import {
  PROFILE_OPTIONAL_SAVE_NOTICE_KEY,
} from "@/lib/onboarding-profile";

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
    loadError,
    fafsaIntake,
    refreshRecommendations,
    generateWeeklyReport,
  } = useUserData();
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

  const { data: view, error: viewError } = runSafe(
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
      const fafsaPlanProgress = getFafsaPlanProgress(tasks ?? []);
      const fafsaCurrentStage = getCurrentFafsaStage(tasks ?? []);
      const fafsaNextAction = getNextFafsaAction(tasks ?? []);
      const fafsaBlockers = getFafsaBlockers(tasks ?? []);
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
      const deadlinesThisMonth = getDeadlinesThisMonthCount(deadlines ?? []);
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
        fafsaPlanProgress,
        fafsaCurrentStage,
        fafsaNextAction,
        fafsaBlockers,
        urgent,
        upcomingDeadlines,
        deadlinesThisMonth,
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
      fafsaPlanProgress: 0,
      fafsaCurrentStage: null,
      fafsaNextAction: null,
      fafsaBlockers: [],
      urgent: [],
      upcomingDeadlines: [],
      deadlinesThisMonth: 0,
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
    fafsaPlanProgress,
    fafsaCurrentStage,
    fafsaNextAction,
    fafsaBlockers,
    urgent,
    upcomingDeadlines,
    deadlinesThisMonth,
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

  const fafsaLabel =
    profile?.fafsa_status === "Yes"
      ? "Submitted"
      : profile?.fafsa_status === "Not yet"
        ? "Not started"
        : profile?.fafsa_status ?? "Unknown";

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

  return (
    <AppShell>
      <PageErrorBanner message={loadError ?? viewError} />

      {profileNotice && (
        <ProductCard style={{ padding: 18, marginBottom: 22, background: "#EAF3FF", border: "1px solid #D7E7FB" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#0B5CAD", margin: 0, lineHeight: 1.6 }}>{profileNotice}</p>
        </ProductCard>
      )}

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#9AA4B2", margin: "0 0 6px" }}>
          Good morning, {firstName}.
        </p>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", margin: "0 0 6px", color: "#15212E", lineHeight: 1.1 }}>
          {summary.protectedMessage}
        </h1>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#0B5CAD", margin: "0 0 8px" }}>{schoolLabel}</p>
        <p style={{ fontSize: 17, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
          {attention} tasks need attention before {nextDeadlineLabel}. AidPilot is watching the rest.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="Aid Status" value={report?.aid_status ?? summary.aidStatus} color="#15885A" style={{ flex: "1 1 140px" }} />
        <StatCard label="FAFSA Status" value={fafsaLabel} color="#0B5CAD" style={{ flex: "1 1 140px" }} />
        <StatCard label="Missing Documents" value={String(missingDocs)} color="#C04E57" style={{ flex: "1 1 140px" }} />
        <StatCard label="Checklist Progress" value={`${completed} of ${totalTasks}`} color="#0B5CAD" style={{ flex: "1 1 140px" }} sub={`${progress}% complete`} />
        <StatCard label="Next Deadline" value={nextDeadlineLabel} color="#B7791F" style={{ flex: "1 1 140px" }} sub={`${deadlinesThisMonth} this month`} />
        <StatCard label="Scholarships" value={`${scholarshipStats.newCount} new matches`} color="#0B5CAD" style={{ flex: "1 1 160px" }} />
      </div>

      {actionError && (
        <p style={{ color: "#C04E57", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{actionError}</p>
      )}

      <ProductCard style={{ padding: 26, marginBottom: 22, background: "linear-gradient(135deg,#EAF3FF,#F4F8FE)", border: "1px solid #D7E7FB" }}>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", color: "#15212E" }}>
          Your FAFSA journey
        </h2>
        {!fafsaIntake ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
              Let&apos;s build your FAFSA plan in 3 minutes.
            </p>
            <Link
              href="/fafsa/readiness"
              style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}
            >
              Start FAFSA Readiness Wizard
            </Link>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6 }}>
              Aid year {fafsaIntake.aid_year} · Current stage: {fafsaCurrentStage ?? "Complete"}
            </p>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6B7280" }}>FAFSA plan progress</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0B5CAD" }}>{fafsaPlanProgress}%</span>
              </div>
              <ProgressBar pct={fafsaPlanProgress} />
            </div>
            {fafsaNextAction ? (
              <div style={{ padding: "14px 16px", borderRadius: 14, background: "#fff", border: "1px solid #EAEEF3", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9AA4B2", marginBottom: 4 }}>Next best action</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#15212E", marginBottom: 6 }}>{fafsaNextAction.title}</div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", margin: 0, lineHeight: 1.55 }}>
                  {fafsaNextAction.instructions ?? fafsaNextAction.description}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#15885A", fontWeight: 600, margin: "0 0 14px" }}>
                Your FAFSA plan steps are complete. Keep checking StudentAid.gov and your school portal.
              </p>
            )}
            {fafsaBlockers.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#B7791F", marginBottom: 8 }}>Needs attention</div>
                {fafsaBlockers.slice(0, 2).map((blocker) => (
                  <div key={blocker.id} style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>
                    · {blocker.blocking_reason}
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/fafsa"
              style={{ display: "inline-flex", fontSize: 15, fontWeight: 700, color: "#fff", background: "#0B5CAD", padding: "12px 22px", borderRadius: 13, textDecoration: "none", boxShadow: "0 10px 20px rgba(11,92,173,.22)" }}
            >
              Continue FAFSA plan
            </Link>
          </>
        )}
      </ProductCard>

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
