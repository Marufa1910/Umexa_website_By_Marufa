import { z } from "zod";

import { budgetOptions, NOT_SURE, timelineOptions } from "./inquiry-options";

export { budgetOptions, NOT_SURE, timelineOptions };
export type { Currency, InquiryState, InquiryValues } from "./inquiry-options";

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
