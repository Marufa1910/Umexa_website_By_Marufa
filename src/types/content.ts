/** Public-safe shapes the website renders. Mapped from database records in lib/data/public.ts. */

export type MediaItem = {
  kind: "image" | "video";
  src: string;
  /** Still shown before a video loads */
  poster?: string;
  alt: string;
  width: number;
  height: number;
};

export type Step = { title: string; copy: string };

export type Project = {
  slug: string;
  title: string;
  shortDescription: string;
  client: string;
  industry: string;
  categories: string[];
  year: number;
  featured: boolean;
  /** Fictional sample content, labelled wherever it appears */
  isSample: boolean;
  cover: string;
  alt: string;
  /** Short muted loop, loaded only on hover or in the case-study hero */
  video: string | null;
  overview: string;
  objectives: string[];
  strategy: string;
  process: Step[];
  deliverables: string[];
  gallery: MediaItem[];
  seoTitle: string;
  seoDescription: string;
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  preview: string;
  intro: string;
  capabilities: string[];
  deliverables: string[];
  workflow: Step[];
  /** Portfolio categories shown as relevant work */
  categories: string[];
  faq: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
};

export type ClientLogo = { name: string; logoUrl: string | null; isSample: boolean };

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  photo: string | null;
  isSample: boolean;
};

export type TeamProfile = {
  name: string;
  role: string;
  image: string | null;
  isSample: boolean;
};

export type SiteSettings = {
  agencyName: string;
  logoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  socials: { label: string; href: string }[];
  showreelUrl: string | null;
  showreelPoster: string | null;
  showreelSample: boolean;
};
