import { z } from "zod";

/* Budget bands are drafts for the agency to confirm. Ids are stable, labels can change. */
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

const ids = (options: readonly { id: string }[]) => options.map((option) => option.id);
const oneOf = (allowed: string[], message: string) =>
  z.string().refine((value) => allowed.includes(value), { message });

/** Runs in the browser for quick feedback, and again on the server, which is what counts. */
export const inquirySchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(120, "That name is too long."),
    email: z.email("Please enter a valid email address.").max(200),
    company: z.string().trim().max(160, "That company name is too long."),
    country: z.string().trim().min(2, "Please enter your country.").max(80, "That is too long."),
    service: z.string().min(1, "Please choose a service.").max(120),
    currency: z.enum(["USD", "BDT"], { message: "Please choose a currency." }),
    budget: z.string().min(1, "Please choose a budget."),
    timeline: oneOf(ids(timelineOptions), "Please choose a timeline."),
    description: z
      .string()
      .trim()
      .min(20, "Please tell us a little more, at least 20 characters.")
      .max(5000, "Please keep this under 5,000 characters."),
    referenceUrl: z
      .string()
      .trim()
      .max(500, "That link is too long.")
      .refine((value) => value === "" || /^https?:\/\/[^\s]+\.[^\s]+$/i.test(value), {
        message: "Please enter a full link, starting with https://",
      }),
  })
  .refine((data) => ids(budgetOptions[data.currency]).includes(data.budget), {
    path: ["budget"],
    message: "Please choose a budget.",
  });

export type InquiryValues = z.infer<typeof inquirySchema>;

export type InquiryState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Partial<Record<keyof InquiryValues, string>> }
  | { status: "rate_limited" }
  | { status: "saved" }
  | { status: "error" };
