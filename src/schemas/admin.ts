import { z } from "zod";

export const inquiryStatuses = [
  "NEW",
  "CONTACTED",
  "IN_DISCUSSION",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
  "ARCHIVED",
] as const;

export const roles = ["OWNER", "ADMIN", "EDITOR"] as const;

export const inquiryFilterSchema = z.object({
  status: z.enum(inquiryStatuses).optional(),
  search: z.string().trim().max(200).optional(),
});

export const inquiryUpdateSchema = z
  .object({
    status: z.enum(inquiryStatuses).optional(),
    note: z.string().trim().min(1).max(5000).optional(),
  })
  .strict()
  .refine((data) => data.status || data.note, { message: "Nothing to update." });

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a name.").max(120),
    email: z.email("Enter a valid email.").max(200),
    password: z.string().min(12, "Use at least 12 characters.").max(128),
    role: z.enum(roles),
  })
  .strict();

// ---------- Field helpers ----------

const required = (max: number) => z.string().trim().min(1, "This is required.").max(max);
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
const checkbox = z.preprocess((value) => value === "on" || value === "true", z.boolean());
/** Text areas where each line is one item */
const lines = z.string().transform((value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);
const jsonRows = <T extends z.ZodType>(row: T) =>
  z.preprocess((value) => {
    try {
      return JSON.parse(String(value ?? "[]"));
    } catch {
      return null;
    }
  }, z.array(row));

const slug = z
  .string()
  .trim()
  .min(1, "This is required.")
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

/** Images must come from the site or Cloudinary: the image optimizer only allows those hosts. */
const isMediaUrl = (value: string) =>
  (/^\/media\/[\w./-]+$/.test(value) && !value.includes("..")) ||
  value.startsWith("https://res.cloudinary.com/");
const mediaMessage = "Use a file from the media library, or a path starting with /media/.";
const mediaUrl = required(500).refine(isMediaUrl, mediaMessage);
const optionalMediaUrl = optional(500).refine((value) => !value || isMediaUrl(value), mediaMessage);
const videoUrl = optional(500).refine(
  (value) => !value || value.startsWith("https://") || isMediaUrl(value),
  "Use a direct https:// link to a video file, or a file from the media library.",
);
const webUrl = optional(500).refine(
  (value) => !value || /^https?:\/\/\S+\.\S+$/i.test(value),
  "Enter a full link, starting with https://",
);

const status = z.enum(["DRAFT", "PUBLISHED"]);
const step = z.object({ title: required(120), copy: required(600) });

// ---------- Content ----------

const seo = { seoTitle: optional(120), seoDescription: optional(300) };

export const projectSchema = z.object({
  title: required(160),
  slug,
  shortDescription: required(300),
  fullDescription: required(8000),
  clientId: optional(60),
  categories: z.array(z.string().max(60)).min(1, "Choose at least one category.").default([]),
  year: z.coerce.number().int().min(1990, "Enter a real year.").max(2100, "Enter a real year."),
  coverUrl: mediaUrl,
  coverAlt: required(240),
  videoUrl,
  objectives: lines,
  creativeStrategy: required(4000),
  process: jsonRows(step),
  deliverables: lines,
  gallery: jsonRows(
    z.object({
      kind: z.enum(["IMAGE", "VIDEO"]),
      url: mediaUrl,
      posterUrl: z
        .string()
        .trim()
        .max(500)
        .transform((value) => value || null)
        .refine((value) => !value || isMediaUrl(value), mediaMessage)
        .default(""),
      alt: required(240),
      width: z.coerce.number().int().min(1).max(20000),
      height: z.coerce.number().int().min(1).max(20000),
    }),
  ),
  featured: checkbox,
  isSample: checkbox,
  status,
  ...seo,
});

export const serviceSchema = z.object({
  title: required(120),
  slug,
  summary: required(240),
  intro: required(2000),
  previewUrl: mediaUrl,
  capabilities: lines,
  deliverables: lines,
  workflow: jsonRows(step),
  faq: jsonRows(z.object({ question: required(240), answer: required(1500) })),
  categories: z.array(z.string().max(60)).default([]),
  status,
  ...seo,
});

export const categorySchema = z.object({ name: required(80), slug });

export const clientSchema = z.object({
  name: required(120),
  logoUrl: optionalMediaUrl,
  websiteUrl: webUrl,
  industry: optional(120),
  featured: checkbox,
  isSample: checkbox,
});

export const testimonialSchema = z.object({
  clientName: required(120),
  designation: required(120),
  company: required(160),
  quote: required(1200),
  photoUrl: optionalMediaUrl,
  status,
  isSample: checkbox,
});

export const teamMemberSchema = z.object({
  name: required(120),
  jobTitle: required(120),
  bio: optional(1200),
  photoUrl: optionalMediaUrl,
  status,
  isSample: checkbox,
});

export const settingsSchema = z.object({
  agencyName: required(120),
  logoUrl: optionalMediaUrl,
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email.")
    .transform((value) => value || null),
  phone: optional(40),
  whatsapp: optional(40),
  location: optional(200),
  socials: jsonRows(
    z.object({
      label: required(60),
      href: z
        .string()
        .trim()
        .regex(/^https:\/\/\S+$/i, "Links must start with https://"),
    }),
  ),
  seoTitle: optional(120),
  seoDescription: optional(300),
  showreelUrl: videoUrl,
  showreelPoster: optionalMediaUrl,
  showreelSample: checkbox,
});

export const noteSchema = z.object({ body: required(5000) });

export const statusSchema = z.object({ status: z.enum(inquiryStatuses) });

export const roleSchema = z.object({ role: z.enum(roles) });

export const resetPasswordSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters.").max(128),
});

export const mediaRegisterSchema = z
  .object({
    publicId: z.string().trim().min(1).max(300),
    kind: z.enum(["IMAGE", "VIDEO"]),
    alt: z.string().trim().max(240).default(""),
  })
  .strict();

export const mediaAltSchema = z.object({ alt: z.string().trim().max(240) });
