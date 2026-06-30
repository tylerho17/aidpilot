import type { AidOfferCalculation } from "@/lib/aid-letter/calculateAidOffer";
import type { UserAidOffer } from "@/lib/types";

export type AidOfficeDraft = {
  questions: string[];
  emailSubject: string;
  emailBody: string;
  emailText: string;
};

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function buildAidOfficeQuestions(offer: UserAidOffer, calc: AidOfferCalculation): string[] {
  const questions: string[] = [];

  if (calc.remainingGapAfterAllAid > 0) {
    questions.push(
      "Are there additional institutional grants or emergency aid options available to help reduce my remaining gap?"
    );
  }

  if (offer.grants_and_scholarships > 0) {
    questions.push("Are my grants and scholarships renewable for future years?");
  }

  if (offer.federal_student_loans > 0) {
    questions.push("What loan amount am I expected to accept, and are there alternatives before borrowing?");
  }

  if (offer.work_study > 0) {
    questions.push("Is work-study guaranteed, or do I need to find an eligible campus job first?");
  }

  if (offer.offer_status === "draft") {
    questions.push("What steps do I need to complete before this aid offer is finalized?");
  }

  if (!offer.academic_year?.trim()) {
    questions.push("Which academic year does this aid offer apply to?");
  }

  return questions;
}

export function buildAidOfficeEmailBody(
  offer: UserAidOffer,
  calc: AidOfferCalculation,
  questions: string[]
): string {
  const emailQuestions = questions.slice(0, 5);
  const lines: string[] = [
    "Dear Financial Aid Office,",
    "",
    `I am writing to ask a few questions about my financial aid offer from ${offer.school_name}.`,
  ];

  if (offer.academic_year?.trim()) {
    lines.push(`This offer is for ${offer.academic_year}.`);
  }

  if (calc.remainingGapAfterAllAid > 0) {
    lines.push(
      `After reviewing my offer, I understand I may still have a remaining gap of ${money(calc.remainingGapAfterAllAid)}.`
    );
  }

  lines.push("", "I would appreciate your help with the following questions:", "");

  if (emailQuestions.length > 0) {
    emailQuestions.forEach((question, index) => {
      lines.push(`${index + 1}. ${question}`);
    });
  } else {
    lines.push("1. Can you help me understand the aid listed on my current offer?");
  }

  lines.push("", "Thank you for your time and guidance.", "", "Sincerely,", "[Your name]");

  return lines.join("\n");
}

export function buildAidOfficeDraft(offer: UserAidOffer, calc: AidOfferCalculation): AidOfficeDraft {
  const questions = buildAidOfficeQuestions(offer, calc);
  const emailSubject = "Questions about my financial aid offer";
  const emailBody = buildAidOfficeEmailBody(offer, calc, questions);
  const emailText = `Subject: ${emailSubject}\n\n${emailBody}`;

  return {
    questions,
    emailSubject,
    emailBody,
    emailText,
  };
}
