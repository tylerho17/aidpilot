"use client";

import { useCallback, useMemo } from "react";
import { getProtectStatus } from "@/lib/protect/getProtectStatus";
import { FAFSA_STEPS } from "@/lib/fafsa/steps";
import { getAidActions } from "@/lib/aid-actions/getAidActions";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { useSchoolAidTracker } from "@/hooks/useSchoolAidTracker";
import { useUserData } from "@/hooks/useUserData";

export const PROTECT_LOAD_ERROR =
  "We couldn't load your aid protection status right now. Please try again in a moment.";

export function useProtectHub() {
  const { completedPlanKeys } = useFafsaProgress();
  const {
    authReady: schoolAuthReady,
    userId: schoolUserId,
    loading: schoolLoading,
    loadError: schoolLoadError,
    statuses: schoolAidStatuses,
    tasks: schoolAidTasks,
    reload: reloadSchool,
  } = useSchoolAidTracker();
  const {
    authReady: offersAuthReady,
    userId: offersUserId,
    loading: offersLoading,
    loadError: offersLoadError,
    offers: userAidOffers,
    reload: reloadOffers,
  } = useAidOffers();
  const {
    user,
    authReady: userAuthReady,
    loading: userLoading,
    loadError: userLoadError,
    deadlines,
    documents,
  } = useUserData();

  const userId = user?.id ?? schoolUserId ?? offersUserId ?? null;
  const authReady = userAuthReady && schoolAuthReady && offersAuthReady;
  const loading = !authReady || userLoading || (userId !== null && (schoolLoading || offersLoading));

  const loadError =
    userLoadError || (userId && (schoolLoadError || offersLoadError) ? PROTECT_LOAD_ERROR : null)
      ? PROTECT_LOAD_ERROR
      : null;

  const actions = useMemo(() => {
    if (!userId) return [];
    return getAidActions({
      fafsaSteps: FAFSA_STEPS,
      completedFafsaPlanKeys: completedPlanKeys,
      schoolAidStatuses,
      schoolAidTasks,
      userAidOffers,
      deadlines,
      documents,
    });
  }, [completedPlanKeys, deadlines, documents, schoolAidStatuses, schoolAidTasks, userAidOffers, userId]);

  const topAction = actions[0] ?? null;

  const snapshot = useMemo(
    () =>
      getProtectStatus({
        completedFafsaPlanKeys: completedPlanKeys,
        schoolAidStatuses,
        schoolAidTasks,
        userAidOffers,
        topAction,
      }),
    [completedPlanKeys, schoolAidStatuses, schoolAidTasks, topAction, userAidOffers]
  );

  const reload = useCallback(async () => {
    await Promise.all([reloadSchool(), reloadOffers()]);
  }, [reloadOffers, reloadSchool]);

  return {
    authReady,
    userId,
    loading,
    loadError,
    snapshot,
    topAction,
    reload,
  };
}
