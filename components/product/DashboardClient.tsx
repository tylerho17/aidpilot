"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PillBadge, ProgressBar } from "@/components/ProductUI";
import {
  PrimaryButtonLink,
  SecondaryButtonLink,
  SecondaryButton,
  SoftButtonLink,
  SectionCard,
  MetricCard,
} from "@/components/ui";
import { H2, H3, Body, BodyMuted, BodyStrong, Label, MetricValue } from "@/components/ui/Typography";
import { buttons, colors, layout, taskRowStyle, text } from "@/lib/design-tokens";
import { PageLoading, friendlyActionError, runSafe } from "@/components/product/PageSafety";
import { FafsaDemoBanner } from "@/components/product/FafsaDemoBanner";
import { useUserData } from "@/hooks/useUserData";
import { getProfileFullName, getProfileSchoolName } from "@/lib/profile-fields";
import { getTopAttentionItems } from "@/lib/attention";
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
import { getAidOfferReportHref, getOpenAidOfferActionTasks } from "@/lib/aid-letter/buildAidHealthReport";
import { AID_OFFER_COMPARE_HREF } from "@/lib/aid-letter/buildAidOfferComparison";
import WeeklyAidCheckInSection from "@/components/product/WeeklyAidCheckInSection";
import { buildWeeklyAidCheckIn } from "@/lib/weekly-aid-checkin";
import ProductPageHeader, { ProductFlowNav } from "@/components/product/ProductPageHeader";
import DashboardFirstTimeEmpty from "@/components/product/DashboardFirstTimeEmpty";
import BetaTesterChecklist from "@/components/product/BetaTesterChecklist";
import BetaFeedbackBox from "@/components/product/BetaFeedbackBox";
import TrustDisclaimer from "@/components/product/TrustDisclaimer";
import { SAMPLE_AID_REPORT_HREF } from "@/lib/aid-letter/sampleAidOffer";
import { getProfileAidStage } from "@/lib/profile-aid-stage";

const cardMb = { marginBottom: layout.sectionGap } as const;
const btnRow = { display: "flex", flexWrap: "wrap" as const, gap: buttons.gap, alignItems: "center" as const };
const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: layout.stackGapSm,
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

  const weeklyCheckIn = useMemo(
    () =>
      buildWeeklyAidCheckIn({
        tasks: tasks ?? [],
        documents: documents ?? [],
        deadlines: deadlines ?? [],
        aidOffers,
        scholarships: scholarships ?? [],
        fafsaIntake: fafsaIntake ?? null,
        protectAction:
          protectUserId && protectSnapshot.overallStatus !== "protected"
            ? {
                id: "protect-hub",
                label: protectSnapshot.topAction?.title ?? protectSnapshot.headline,
                href: protectSnapshot.topAction?.href ?? "/protect",
              }
            : null,
      }),
    [
      aidOffers,
      deadlines,
      documents,
      fafsaIntake,
      protectSnapshot.headline,
      protectSnapshot.overallStatus,
      protectSnapshot.topAction,
      protectUserId,
      scholarships,
      tasks,
    ]
  );

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
      const aidOfferActionTasks = getOpenAidOfferActionTasks(tasks ?? [], 3);
      const urgent = [...aidOfferActionTasks, ...getUrgentTasksFromDb(
        checklistTasks.filter((task) => task.task_source !== "aid_offer"),
        3
      )]
        .filter((task, index, list) => list.findIndex((item) => item.id === task.id) === index)
        .slice(0, 3)
        .map((t) => ({
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
        aidOfferActionTasks,
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
      aidOfferActionTasks: [],
      weeklyFocus: [],
      urgent: [],
      upcomingDeadlines: [],
      nextDeadlineLabel: "No deadlines yet",
      topActions: [],
    }
  );

  const firstName = getProfileFullName(profile)?.split(" ")[0] || "there";
  const schoolLabel = getProfileSchoolName(profile) || "Your school";
  const {
    attention,
    completed,
    totalTasks,
    missingDocs,
    scholarshipStats,
    fafsaBlockers,
    aidProtection,
    aidOfferActionTasks,
    weeklyFocus,
    urgent,
    upcomingDeadlines,
    nextDeadlineLabel,
    topActions,
    summary,
  } = view;

  const aidStage = getProfileAidStage(profile);

  const isBetaEmpty =
    aidOffersUserId &&
    !aidOffersLoading &&
    aidOffers.length === 0 &&
    (tasks ?? []).length === 0 &&
    (documents ?? []).length === 0 &&
    (deadlines ?? []).length === 0 &&
    (scholarships ?? []).length === 0 &&
    !fafsaIntake;

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
        <SectionCard style={{ ...cardMb, background: colors.softBlue, borderColor: colors.borderSoft }}>
          <Body style={{ color: colors.primary, fontWeight: 500 }}>{profileNotice}</Body>
        </SectionCard>
      )}

      <ProductPageHeader
        title={`Good morning, ${firstName}.`}
        subtitle="See what needs attention this week."
        primaryAction={{ href: "/aid-letter", label: "Add aid offer" }}
        secondaryAction={
          aidOfferStats
            ? { href: AID_OFFER_COMPARE_HREF, label: "Compare aid offers" }
            : { href: SAMPLE_AID_REPORT_HREF, label: "View sample report" }
        }
      >
        <Label>{schoolLabel}</Label>
      </ProductPageHeader>

      <ProductFlowNav
        links={[
          { href: "/aid-letter", label: "Aid Offers" },
          { href: aidOfferStats ? AID_OFFER_COMPARE_HREF : SAMPLE_AID_REPORT_HREF, label: aidOfferStats ? "Compare Offers" : "Sample Report" },
          { href: "/protect", label: "Protect Aid" },
          { href: "#feedback", label: "Feedback" },
        ]}
      />

      {isBetaEmpty ? (
        <>
          <DashboardFirstTimeEmpty aidStage={aidStage} />
          <BetaTesterChecklist />
          <BetaFeedbackBox />
          <TrustDisclaimer />
        </>
      ) : (
        <>
      {fafsaDemoMode && (
        <div style={cardMb}>
          <FafsaDemoBanner />
        </div>
      )}

      {actionError && (
        <Body style={{ color: colors.coral, marginBottom: layout.stackGap }}>{actionError}</Body>
      )}

      <WeeklyAidCheckInSection checkIn={weeklyCheckIn} />

      <SectionCard style={{ ...cardMb, background: colors.softBlue }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: layout.stackGapSm, alignItems: "center", marginBottom: layout.stackGapSm }}>
          <H3>Protect your aid</H3>
          {protectUserId && !protectLoading ? <ProtectRiskBadge status={protectSnapshot.overallStatus} /> : null}
        </div>
        {protectLoadError ? (
          <Body style={{ color: colors.amber, marginBottom: layout.stackGapSm }}>{protectLoadError}</Body>
        ) : protectLoading ? (
          <BodyMuted style={{ marginBottom: layout.stackGapSm }}>Loading your protection status...</BodyMuted>
        ) : protectUserId ? (
          <>
            <BodyStrong style={{ marginBottom: layout.stackGapXs }}>{protectSnapshot.headline}</BodyStrong>
            {topAction ? (
              <BodyMuted style={{ marginBottom: layout.stackGap }}>
                Most important: <span style={text.bodyStrong}>{topAction.title}</span>
              </BodyMuted>
            ) : (
              <BodyMuted style={{ marginBottom: layout.stackGap }}>{protectSnapshot.description}</BodyMuted>
            )}
          </>
        ) : (
          <BodyMuted style={{ marginBottom: layout.stackGap }}>
            Track FAFSA, school portals, verification, and aid offers in one place.
          </BodyMuted>
        )}
        <div style={btnRow}>
          <PrimaryButtonLink href="/protect">Open Protect Hub</PrimaryButtonLink>
          {topAction ? (
            <SecondaryButtonLink href={topAction.href}>{topAction.ctaLabel}</SecondaryButtonLink>
          ) : (
            <SecondaryButtonLink href="/actions">View all actions</SecondaryButtonLink>
          )}
        </div>
      </SectionCard>

      <SectionCard style={cardMb}>
        <H2 style={{ marginBottom: layout.stackGapSm }}>Your next aid action</H2>
        {aidActionsLoadError ? (
          <Body style={{ color: colors.amber, marginBottom: layout.stackGapSm }}>{aidActionsLoadError}</Body>
        ) : aidActionsLoading ? (
          <BodyMuted style={{ marginBottom: layout.stackGapSm }}>Loading your aid actions...</BodyMuted>
        ) : topAction ? (
          <>
            <BodyStrong style={{ marginBottom: layout.stackGapXs }}>{topAction.title}</BodyStrong>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>{topAction.description}</BodyMuted>
            <div style={btnRow}>
              <PrimaryButtonLink href={topAction.href}>{topAction.ctaLabel}</PrimaryButtonLink>
              <SecondaryButtonLink href="/actions">View all actions</SecondaryButtonLink>
            </div>
          </>
        ) : (
          <>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>{AID_ACTION_EMPTY_MESSAGE}</BodyMuted>
            <SecondaryButtonLink href="/actions">View all actions</SecondaryButtonLink>
          </>
        )}
      </SectionCard>

      <SectionCard style={cardMb}>
        <H3 style={{ marginBottom: layout.stackGapSm }}>Compare your aid offers</H3>
        {aidOffersUserId && !aidOffersLoading && aidOfferStats ? (
          <>
            <div style={{ ...metricGrid, marginBottom: layout.stackGapSm, maxWidth: 200 }}>
              <MetricCard label="Saved offers" value={String(aidOfferStats.count)} />
            </div>
            <BodyMuted style={{ marginBottom: layout.stackGapXs }}>
              Lowest net after gift aid:{" "}
              <span style={{ ...text.bodyStrong, color: colors.green }}>
                {aidOfferStats.lowestNet.offer.school_name} ($
                {aidOfferStats.lowestNet.calculation.netCostAfterGiftAid.toLocaleString()})
              </span>
            </BodyMuted>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>
              Highest remaining gap:{" "}
              <span style={{ ...text.bodyStrong, color: colors.coral }}>
                {aidOfferStats.highestGap.offer.school_name} ($
                {aidOfferStats.highestGap.calculation.remainingGapAfterAllAid.toLocaleString()})
              </span>
            </BodyMuted>
            {aidOfferActionTasks.length > 0 ? (
              <div style={{ marginBottom: layout.stackGap, paddingTop: layout.stackGapSm, borderTop: `1px solid ${colors.borderSoft}` }}>
                <Label style={{ display: "block", marginBottom: layout.stackGapSm }}>Aid Action Plan</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapXs }}>
                  {aidOfferActionTasks.map((task) => (
                    <div key={task.id} style={text.bodyStrong}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <Body style={{ marginBottom: layout.stackGap }}>
            No aid offers yet. Add your first aid offer to generate your Aid Health Report.
          </Body>
        )}
        <div style={btnRow}>
          <SecondaryButtonLink href="/aid-letter">View offers</SecondaryButtonLink>
          {aidOfferStats ? (
            <>
              <SecondaryButtonLink href={getAidOfferReportHref(aidOfferStats.lowestNet.offer.id)}>
                View Aid Health Report
              </SecondaryButtonLink>
              <SecondaryButtonLink href={AID_OFFER_COMPARE_HREF}>Compare aid offers</SecondaryButtonLink>
            </>
          ) : null}
        </div>
      </SectionCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: layout.sectionGap,
          marginBottom: layout.sectionGap,
        }}
      >
        <SectionCard>
          <H3 style={{ marginBottom: layout.stackGapSm }}>Aid Protection Score</H3>
          <div style={{ display: "flex", alignItems: "baseline", gap: layout.stackGapSm, marginBottom: layout.stackGapSm }}>
            <MetricValue color={protectionColor}>{aidProtection.score}</MetricValue>
            <Label>/ {aidProtection.maxScore}</Label>
            <PillBadge tone={aidProtection.score >= 80 ? "green" : aidProtection.score >= 40 ? "blue" : "amber"}>
              {aidProtection.label}
            </PillBadge>
          </div>
          <ProgressBar pct={aidProtection.score} color={protectionColor} />
          <div style={{ marginTop: layout.stackGap, display: "flex", flexDirection: "column", gap: layout.stackGapXs }}>
            {aidProtection.pillars.map((pillar) => (
              <Body key={pillar.id} style={{ color: pillar.earned ? colors.green : colors.textMuted }}>
                {pillar.earned ? "✓" : "○"} {pillar.label}
                {!pillar.earned ? <span style={{ display: "block", ...text.label, marginTop: 2 }}>{pillar.detail}</span> : null}
              </Body>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <H3 style={{ marginBottom: layout.stackGapSm }}>Blockers</H3>
          {fafsaBlockers.length === 0 ? (
            <Body style={{ color: colors.green }}>No major blockers detected yet. Keep working through your FAFSA plan on StudentAid.gov.</Body>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
              {fafsaBlockers.slice(0, 4).map((blocker) => (
                <div key={blocker.id} style={{ ...taskRowStyle, background: colors.softAmber, borderColor: colors.softAmber, flexDirection: "column", alignItems: "stretch" }}>
                  <BodyStrong style={{ color: colors.amber, marginBottom: 4 }}>{blocker.title}</BodyStrong>
                  <Body>{blocker.blocking_reason}</Body>
                  {blocker.plan_key ? (
                    <SoftButtonLink href={fafsaStepHref(blocker.plan_key)} style={{ marginTop: layout.stackGapSm, alignSelf: "flex-start" }}>
                      Resolve step
                    </SoftButtonLink>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard style={cardMb}>
        <H3 style={{ marginBottom: layout.stackGapSm }}>Quick links</H3>
        <ul style={{ margin: `0 0 ${layout.stackGap}px`, paddingLeft: 20, display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
          {weeklyFocus.map((item) => (
            <li key={item} style={text.body}>
              {item}
            </li>
          ))}
        </ul>
        <div style={btnRow}>
          <SecondaryButtonLink href="/fafsa">FAFSA plan</SecondaryButtonLink>
          <SecondaryButtonLink href="/aid-letter">Aid offers</SecondaryButtonLink>
          <SecondaryButtonLink href="/documents">Documents</SecondaryButtonLink>
          <SecondaryButtonLink href="/deadlines">Deadlines</SecondaryButtonLink>
          <SecondaryButtonLink href="/scholarships">Scholarships</SecondaryButtonLink>
        </div>
      </SectionCard>

      <div style={{ ...metricGrid, marginBottom: layout.sectionGap }}>
        <MetricCard label="Checklist" value={`${completed} of ${totalTasks}`} />
        <MetricCard label="Next deadline" value={nextDeadlineLabel} tone="warning" />
        <MetricCard label="Scholarships" value={`${scholarshipStats.newCount} new`} />
      </div>

      <SectionCard style={cardMb}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: layout.stackGap, marginBottom: layout.stackGap, flexWrap: "wrap" }}>
          <div>
            <H2 style={{ marginBottom: layout.stackGapXs }}>Top 3 next actions</H2>
            <BodyMuted>Suggested next steps based on your aid profile. Verify with your school aid office.</BodyMuted>
          </div>
          <SecondaryButton onClick={() => handleRefreshRecommendations()} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh recommendations"}
          </SecondaryButton>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
          {topActions.length === 0 ? (
            <BodyMuted>No active recommendations. Click refresh to generate suggestions.</BodyMuted>
          ) : (
            topActions.map((rec) => (
              <div key={rec.title} style={taskRowStyle}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: layout.stackGapSm, marginBottom: layout.stackGapXs }}>
                    <BodyStrong>{rec.title}</BodyStrong>
                    <PillBadge tone={priorityTone(rec.priority)}>{rec.priority} priority</PillBadge>
                  </div>
                  <BodyMuted style={{ marginBottom: layout.stackGapXs }}>{rec.description}</BodyMuted>
                  <Label>
                    {rec.category}
                    {"due_date" in rec && rec.due_date ? ` · Due ${formatDueDate(rec.due_date)}` : ""}
                  </Label>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: layout.sectionGap, alignItems: "start", marginBottom: layout.sectionGap }}>
        <div style={{ display: "flex", flexDirection: "column", gap: layout.sectionGap }}>
          <SectionCard>
            <H2 style={{ marginBottom: layout.stackGapXs }}>What needs attention</H2>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>Top 3 urgent tasks from your {totalTasks}-step checklist</BodyMuted>
            <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
              {urgent.length === 0 ? (
                <BodyMuted>No urgent tasks right now. Add an aid offer or complete your FAFSA plan to generate tasks.</BodyMuted>
              ) : (
                urgent.map((row) => (
                  <div key={row.id ?? row.title} className="animate-slide-in" style={taskRowStyle}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <BodyStrong style={{ marginBottom: 4 }}>{row.title}</BodyStrong>
                      <BodyMuted style={{ marginBottom: layout.stackGapXs }}>{row.description}</BodyMuted>
                      <Label>
                        {row.category} · Due {row.dueDate}
                      </Label>
                    </div>
                    <PillBadge tone={toneFn(row.status)}>{row.status}</PillBadge>
                  </div>
                ))
              )}
            </div>
            <Link href="/checklist" style={{ display: "inline-block", marginTop: layout.stackGap, ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}>
              View all {totalTasks} tasks
            </Link>
          </SectionCard>

          <SectionCard>
            <H2 style={{ marginBottom: layout.stackGapXs }}>Upcoming deadlines</H2>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>Next 3 deadlines from your aid calendar</BodyMuted>
            <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm }}>
              {upcomingDeadlines.length === 0 ? (
                <BodyMuted>No upcoming deadlines yet. Add deadlines from the Deadlines page when you are ready.</BodyMuted>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div key={d.id} style={taskRowStyle}>
                    <div>
                      <BodyStrong style={{ marginBottom: 4 }}>{d.title}</BodyStrong>
                      <Label>
                        {formatDueDate(d.deadline_date)} · {d.category} · {d.priority} priority
                      </Label>
                    </div>
                    <PillBadge tone={deadlineStatusToTone(d.status)}>{d.status}</PillBadge>
                  </div>
                ))
              )}
            </div>
            <Link href="/deadlines" style={{ display: "inline-block", marginTop: layout.stackGap, ...text.bodyStrong, color: colors.primary, textDecoration: "none" }}>
              View all deadlines
            </Link>
          </SectionCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: layout.sectionGap }}>
          <SectionCard>
            <H2 style={{ marginBottom: layout.stackGapSm }}>Weekly report</H2>
            <div style={{ marginBottom: layout.stackGapSm }}>
              <PillBadge tone={reportStatusTone}>Aid status: {report?.aid_status ?? summary.aidStatus}</PillBadge>
            </div>
            <BodyMuted style={{ marginBottom: layout.stackGap }}>
              {report?.summary ?? "Your weekly report will appear here after onboarding."}
            </BodyMuted>
            <div style={{ ...metricGrid, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginBottom: layout.stackGap }}>
              <MetricCard label="Tasks due" value={String(report?.tasks_due_count ?? attention)} />
              <MetricCard label="Missing documents" value={String(report?.missing_documents_count ?? missingDocs)} tone="alert" />
              <MetricCard label="Scholarship matches" value={String(report?.scholarship_count ?? scholarshipStats.newCount)} />
              <MetricCard
                label="Potential amount"
                value={`$${(report?.potential_scholarship_amount ?? scholarshipStats.totalPotential).toLocaleString()}`}
                tone="success"
              />
            </div>
            <div style={btnRow}>
              <PrimaryButtonLink href="/report">View weekly report</PrimaryButtonLink>
              <SecondaryButton onClick={() => void handleGenerateReport()} disabled={generatingReport}>
                {generatingReport ? "Generating..." : "Generate report"}
              </SecondaryButton>
            </div>
          </SectionCard>

          <SectionCard>
            <H2 style={{ marginBottom: layout.stackGapSm }}>Scholarship matches</H2>
            {scholarshipStats.newCount === 0 ? (
              <BodyMuted style={{ marginBottom: layout.stackGap }}>
                No scholarship matches yet. Complete your profile and visit Scholarships to review opportunities.
              </BodyMuted>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: layout.stackGapSm, marginBottom: layout.sectionGap }}>
                {[
                  { label: `${scholarshipStats.newCount} new matches`, color: colors.primary },
                  { label: `${scholarshipStats.totalPotentialLabel} potential awards`, color: colors.green },
                  { label: `${scholarshipStats.strongMatches} strong matches`, color: colors.primary },
                ].map((s) => (
                  <MetricValue key={s.label} color={s.color} style={{ fontSize: 18, lineHeight: "26px" }}>
                    {s.label}
                  </MetricValue>
                ))}
              </div>
            )}
            <PrimaryButtonLink href="/scholarships">View scholarships</PrimaryButtonLink>
          </SectionCard>
        </div>
      </div>

      <Body style={{ marginTop: layout.stackGapSm, fontSize: 13, lineHeight: "18px" }}>
        AidPilot is an organizational and educational tool, not official financial aid advice. AidPilot does not collect FAFSA login credentials, Social Security numbers, or tax documents.{" "}
        <Link href="/disclaimer" style={{ color: colors.primary, textDecoration: "underline" }}>Read disclaimer</Link>
      </Body>

      <BetaFeedbackBox />
      <TrustDisclaimer />
        </>
      )}
    </AppShell>
  );
}
