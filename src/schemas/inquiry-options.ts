/**
 * Form choices, kept apart from the Zod schema so the contact page can show them without
 * downloading Zod. Budget bands are drafts for the agency to confirm. Ids stay stable.
 */

export const budgetOptions = {
  USD: [
    { id: "usd-under-1k", label: "Under $1,000" },
    { id: "usd-1k-5k", label: "$1,000 to $5,000" },
    { id: "usd-5k-15k", label: "$5,000 to $15,000" },
    { id: "usd-15k-plus", label: "$15,000 or more" },
    { id: "usd-retainer", label: "Monthly retainer, to discuss" },
  ],
  BDT: [
    { id: "bdt-under-100k", label: "Under ৳100,000" },
    { id: "bdt-100k-500k", label: "৳100,000 to ৳500,000" },
    { id: "bdt-500k-1500k", label: "৳500,000 to ৳1,500,000" },
    { id: "bdt-1500k-plus", label: "৳1,500,000 or more" },
    { id: "bdt-retainer", label: "Monthly retainer, to discuss" },
  ],
} as const;

export type Currency = keyof typeof budgetOptions;

export const timelineOptions = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-month", label: "Within a month" },
  { id: "1-3-months", label: "1 to 3 months" },
  { id: "3-months-plus", label: "More than 3 months" },
  { id: "ongoing", label: "Ongoing work" },
] as const;

/** The "Not sure yet" choice. Real services are offered from the database. */
export const NOT_SURE = "not-sure";

export type InquiryValues = {
  fullName: string;
  email: string;
  company: string;
  country: string;
  service: string;
  currency: Currency;
  budget: string;
  timeline: string;
  description: string;
  referenceUrl: string;
};

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Partial<Record<keyof InquiryValues, string>> }
  | { status: "rate_limited" }
  | { status: "saved" }
  | { status: "error" };
