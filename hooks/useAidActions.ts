"use client";

import { useMemo } from "react";
import { getAidActions } from "@/lib/aid-actions/getAidActions";
import type { AidAction } from "@/lib/aid-actions/types";
import { FAFSA_STEPS } from "@/lib/fafsa/steps";
import { useAidOffers } from "@/hooks/useAidOffers";
import { useFafsaProgress } from "@/hooks/useFafsaProgress";
import { useSchoolAidTracker } from "@/hooks/useSchoolAidTracker";
import { useUserData } from "@/hooks/useUserData";

export const AID_ACTIONS_LOAD_ERROR =
  "We couldn't load your aid actions right now. Please try again in a moment.";

export function useAidActions() {
  const { completedPlanKeys, syncStatus } = useFafsaProgress();
  const {
    statuses: schoolAidStatuses,
    tasks: schoolAidTasks,
    userId: schoolUserId,
    loading: schoolLoading,
    loadError: schoolLoadError,
    authReady: schoolAuthReady,
  } = useSchoolAidTracker();
  const { offers: userAidOffers, loading: offersLoading, loadError: offersLoadError } = useAidOffers();
  const {
    user,
    authReady: userAuthReady,
    loading: userLoading,
    loadError: userLoadError,
    deadlines,
    documents,
  } = useUserData();

  const authReady = userAuthReady && schoolAuthReady;
  const loading = !authReady || userLoading || (user && (schoolLoading || offersLoading));
  const userId = user?.id ?? schoolUserId ?? null;

  const loadError =
    userLoadError || (userId && (schoolLoadError || offersLoadError) ? AID_ACTIONS_LOAD_ERROR : null)
      ? AID_ACTIONS_LOAD_ERROR
      : null;

  const actions: AidAction[] = useMemo(() => {
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

  return {
    actions,
    topAction: actions[0] ?? null,
    authReady,
    loading,
    loadError,
    userId,
    fafsaSyncPending: syncStatus === "idle",
  };
}
