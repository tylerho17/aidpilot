export type AidActionPriority = "urgent" | "high" | "medium" | "low";

export type AidActionSource =
  | "fafsa_step"
  | "school_follow_up"
  | "verification"
  | "aid_offer"
  | "deadline"
  | "document";

export type AidAction = {
  id: string;
  title: string;
  description: string;
  priority: AidActionPriority;
  source: AidActionSource;
  href: string;
  ctaLabel: string;
};
