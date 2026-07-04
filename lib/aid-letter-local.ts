import type { AidLetter } from "@/lib/types";
import type { AidOfferInput } from "@/lib/aid-letter-decode";
import { decodeAidOffer } from "@/lib/aid-letter-decode";

export const AID_LETTER_LOCAL_STORE_KEY = "aidpilot_aid_letter_local_store";
export const AID_LETTER_LOCAL_MODE_KEY = "aidpilot_aid_letter_local_mode";

export const AID_LETTER_LOCAL_BANNER_MESSAGE =
  "Saved on this device only. Your decoder still works — account syncing will catch up when save is available.";

export type AidLetterLocalStore = {
  userId: string;
  aid_year: string;
  input: AidOfferInput;
  savedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function isAidLetterLocalMode(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(AID_LETTER_LOCAL_MODE_KEY) === "true";
}

export function setAidLetterLocalMode(enabled: boolean) {
  if (!canUseStorage()) return;
  if (enabled) {
    window.localStorage.setItem(AID_LETTER_LOCAL_MODE_KEY, "true");
  } else {
    window.localStorage.removeItem(AID_LETTER_LOCAL_MODE_KEY);
  }
}

export function clearAidLetterLocalStore() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AID_LETTER_LOCAL_STORE_KEY);
  setAidLetterLocalMode(false);
}

export function saveAidLetterLocal(userId: string, aidYear: string, input: AidOfferInput) {
  if (!canUseStorage()) return;
  const store: AidLetterLocalStore = {
    userId,
    aid_year: aidYear,
    input,
    savedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(AID_LETTER_LOCAL_STORE_KEY, JSON.stringify(store));
  setAidLetterLocalMode(true);
}

export function loadAidLetterLocal(userId: string): AidLetterLocalStore | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(AID_LETTER_LOCAL_STORE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AidLetterLocalStore;
    if (parsed.userId !== userId || !parsed.input) return null;
    return parsed;
  } catch (error) {
    console.error("Failed to parse aid letter local store", error);
    return null;
  }
}

export function aidLetterFromLocalStore(userId: string, store: AidLetterLocalStore): AidLetter {
  const decoded = decodeAidOffer(store.input);
  const now = store.savedAt;
  return {
    id: `local-aid-letter-${userId}`,
    created_at: now,
    updated_at: now,
    user_id: userId,
    school_name: store.input.school_name,
    aid_year: store.aid_year,
    cost_of_attendance: store.input.cost_of_attendance,
    grants_amount: store.input.grants,
    scholarships_amount: store.input.scholarships,
    loans_amount: decoded.totalLoans,
    work_study_amount: store.input.work_study,
    estimated_net_cost: decoded.estimatedGapAfterAllAid,
    status: "entered",
    notes: "Saved locally on this device. Verify all amounts with your school financial aid office.",
    subsidized_loans_amount: store.input.subsidized_loans,
    unsubsidized_loans_amount: store.input.unsubsidized_loans,
    parent_plus_loans_amount: store.input.parent_plus_loans,
    private_loans_amount: store.input.private_loans,
  };
}

export function resolveAidLetterFromSources(
  userId: string,
  remote: AidLetter | null
): { letter: AidLetter | null; localMode: boolean } {
  const local = loadAidLetterLocal(userId);

  if (!remote && local) {
    return { letter: aidLetterFromLocalStore(userId, local), localMode: true };
  }

  if (remote && local) {
    if (!isLocalNewerThanRemote(remote, local)) {
      clearAidLetterLocalStore();
      return { letter: remote, localMode: false };
    }

    return {
      letter: mergeRemoteWithLocal(remote, local),
      localMode: true,
    };
  }

  if (remote) {
    return { letter: remote, localMode: false };
  }

  return { letter: null, localMode: false };
}

function timestampMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isLocalNewerThanRemote(remote: AidLetter, local: AidLetterLocalStore): boolean {
  const localSavedAt = timestampMs(local.savedAt);
  const remoteUpdatedAt = timestampMs(remote.updated_at);

  if (!localSavedAt) return false;
  if (!remoteUpdatedAt) return isAidLetterLocalMode();
  return localSavedAt > remoteUpdatedAt;
}

function mergeRemoteWithLocal(remote: AidLetter, local: AidLetterLocalStore): AidLetter {
  return {
    ...remote,
    school_name: local.input.school_name || remote.school_name,
    cost_of_attendance: local.input.cost_of_attendance || remote.cost_of_attendance,
    grants_amount: local.input.grants,
    scholarships_amount: local.input.scholarships,
    work_study_amount: local.input.work_study,
    subsidized_loans_amount: local.input.subsidized_loans,
    unsubsidized_loans_amount: local.input.unsubsidized_loans,
    parent_plus_loans_amount: local.input.parent_plus_loans,
    private_loans_amount: local.input.private_loans,
    loans_amount:
      local.input.subsidized_loans +
      local.input.unsubsidized_loans +
      local.input.parent_plus_loans +
      local.input.private_loans,
  };
}
