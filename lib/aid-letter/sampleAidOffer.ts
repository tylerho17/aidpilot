import type { UserAidOffer } from "@/lib/types";

export const SAMPLE_AID_REPORT_HREF = "/aid-letter/sample/report";

export const SAMPLE_OFFER: UserAidOffer = {
  id: "sample-uci",
  user_id: "sample",
  school_name: "UC Irvine",
  offer_status: "draft",
  academic_year: "2026-27",
  cost_of_attendance: 42000,
  tuition_and_fees: 15000,
  housing_and_food: 18000,
  books_and_supplies: 1200,
  transportation: 1500,
  personal_expenses: 2300,
  grants_and_scholarships: 18000,
  work_study: 2000,
  federal_student_loans: 5500,
  parent_plus_loans: 0,
  private_loans: 0,
  other_aid: 0,
  renewal_notes: "Sample data for demonstration only.",
  notes: "This is a read-only sample. Numbers are illustrative.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
