export const AID_STAGE_OPTIONS = [
  { value: "applying_for_fafsa", label: "Applying for FAFSA" },
  { value: "waiting_for_offer", label: "Waiting for aid offer" },
  { value: "comparing_offers", label: "Comparing aid offers" },
  { value: "closing_gap", label: "Trying to close a remaining gap" },
] as const;

export type AidStage = (typeof AID_STAGE_OPTIONS)[number]["value"];

export const ACADEMIC_YEAR_OPTIONS = ["2025-2026", "2026-2027", "2027-2028"] as const;

export const HOUSING_STATUS_OPTIONS = [
  { value: "on_campus", label: "On-campus housing" },
  { value: "off_campus", label: "Off-campus / apartment" },
  { value: "commuter", label: "Living at home / commuter" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const FIRST_OFFER_SCHOOL_STORAGE_KEY = "aidpilot_prefill_offer_school";

export function goalsForAidStage(stage: AidStage): string[] {
  switch (stage) {
    case "applying_for_fafsa":
      return ["Protect my aid", "Catch deadlines"];
    case "waiting_for_offer":
      return ["Understand my offer", "Protect my aid"];
    case "comparing_offers":
      return ["Understand my offer"];
    case "closing_gap":
      return ["Find scholarships", "Understand my offer"];
    default:
      return ["Understand my offer"];
  }
}

export function dashboardHintForAidStage(stage: AidStage | null | undefined): string {
  switch (stage) {
    case "applying_for_fafsa":
      return "Start with your FAFSA plan, then add an aid offer when your school sends one.";
    case "waiting_for_offer":
      return "Add your first aid offer as soon as it arrives to see your real cost and gap.";
    case "comparing_offers":
      return "Add each school's offer, then compare them side by side.";
    case "closing_gap":
      return "Add an aid offer to see your Scholarship Gap Plan and next steps.";
    default:
      return "Add one financial aid offer and AidPilot will turn it into a report, action plan, and scholarship gap plan.";
  }
}
