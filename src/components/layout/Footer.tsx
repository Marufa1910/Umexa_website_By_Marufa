import { cacheLife } from "next/cache";
import Link from "next/link";
import { legalNav, primaryNav } from "@/config/site";
import { getSiteSettings } from "@/lib/data/public";
import { Wordmark } from "./Logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export async function Footer() {
  const { agencyName, email, whatsapp, socials } = await getSiteSettings();

  return (
    <footer className="gutter overflow-clip pt-16 lg:pt-24">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-6">
          <p className="max-w-sm font-display text-2xl leading-tight tracking-tight">
            A creative production studio for ambitious brands, in Bangladesh and worldwide.
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="slate mb-4 text-muted">Studio</p>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="block py-1 text-sm hover:text-accent">
                Home
              </Link>
            </li>
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-1 text-sm hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="slate mb-4 text-muted">Contact</p>
          <ul className="space-y-1 text-sm">
            {email && (
              <li>
                <a href={`mailto:${email}`} className="block py-1 break-all hover:text-accent">
                  {email}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  className="block py-1 hover:text-accent"
                >
                  WhatsApp
                </a>
              </li>
            )}
            <li>
              <Link href="/contact" className="block py-1 hover:text-accent">
                Start a project
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="slate mb-4 text-muted">Social</p>
          {socials.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block py-1 hover:text-accent"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-1 text-sm text-muted">Links coming soon</p>
          )}
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-line pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between lg:mt-24">
        <p>
          &copy; <CopyrightYear /> {agencyName}. All rights reserved.
        </p>
        <ul className="flex gap-6">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block py-1 hover:text-fg">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden
        className="mt-8 -mb-[0.06em] text-[26.6vw] leading-[0.8] whitespace-nowrap select-none"
      >
        <Wordmark className="block" />
      </div>
    </footer>
  );
}
