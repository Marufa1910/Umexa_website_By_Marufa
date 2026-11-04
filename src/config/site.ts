/**
 * Fixed site identity. Contact details, socials and the showreel live in the SiteSetting table.
 */
export const siteConfig = {
  name: "Movexa",
  tagline: "Creative production studio",
  description:
    "Movexa is a creative studio for design, video, motion, 3D, branding, digital marketing and web. Project work, monthly retainers and white-label partnerships for ambitious brands.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const primaryNav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
] as const;
