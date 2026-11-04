import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, Space_Grotesk } from "next/font/google";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/data/public";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

/** Site-wide SEO defaults come from Settings in the admin, and each page can override them. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seoTitle ?? `${settings.agencyName} — ${siteConfig.tagline}`;
  const description = settings.seoDescription ?? siteConfig.description;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s — ${settings.agencyName}` },
    description,
    openGraph: {
      type: "website",
      siteName: settings.agencyName,
      title,
      description,
      url: "/",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#84b4e6",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
