import { siteConfig } from "@/config/site";
import type { SiteSettings } from "@/types/content";

/** Organization and WebSite data for search engines. Only includes details that have been set. */
export function StructuredData({ settings }: { settings: SiteSettings }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: settings.agencyName,
        url: siteConfig.url,
        description: settings.seoDescription ?? siteConfig.description,
        ...(settings.logoUrl ? { logo: settings.logoUrl } : {}),
        ...(settings.email ? { email: settings.email } : {}),
        ...(settings.phone ? { telephone: settings.phone } : {}),
        ...(settings.socials.length > 0
          ? { sameAs: settings.socials.map((social) => social.href) }
          : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: settings.agencyName,
        url: siteConfig.url,
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Admin-entered text ends up in here, so "<" is escaped to stop it closing the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
