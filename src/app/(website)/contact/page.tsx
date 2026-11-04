import Link from "next/link";
import { Suspense } from "react";
import { ContactForm, ContactFormFromUrl } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { getPublishedServices, getSiteSettings } from "@/lib/data/public";
import { NOT_SURE } from "@/schemas/inquiry";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell Movexa about your project. For one-off projects, monthly retainers and white-label partnerships, in Bangladesh and worldwide.",
  path: "/contact",
});

const toBeAdded = <span className="text-muted">To be added</span>;

export default async function ContactPage() {
  const [{ email, phone, whatsapp, location, socials }, services] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);
  const options = [
    ...services.map((service) => ({ id: service.slug, label: service.title })),
    { id: NOT_SURE, label: "Not sure yet" },
  ];

  return (
    <>
      <PageHero
        index="Contact"
        label="Start a project"
        lines={[
          "Tell us what",
          <span key="serif" className="accent-serif text-[1.08em] text-lime">
            you&rsquo;re making.
          </span>,
        ]}
      />

      <section className="gutter grid gap-14 pb-20 lg:grid-cols-12 lg:pb-32">
        <aside className="lg:col-span-3">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-1">
            <div>
              <dt className="slate text-muted">Email</dt>
              <dd className="mt-2 break-all">
                {email ? (
                  <a href={`mailto:${email}`} className="hover:text-lime">
                    {email}
                  </a>
                ) : (
                  toBeAdded
                )}
              </dd>
            </div>
            {phone && (
              <div>
                <dt className="slate text-muted">Phone</dt>
                <dd className="mt-2">
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-lime">
                    {phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="slate text-muted">WhatsApp</dt>
              <dd className="mt-2">
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    className="hover:text-lime"
                  >
                    {whatsapp}
                  </a>
                ) : (
                  toBeAdded
                )}
              </dd>
            </div>
            <div>
              <dt className="slate text-muted">Location</dt>
              <dd className="mt-2">{location ?? toBeAdded}</dd>
            </div>
            <div>
              <dt className="slate text-muted">Social</dt>
              <dd className="mt-2">
                {socials.length > 0 ? (
                  <ul>
                    {socials.map((social) => (
                      <li key={social.href}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-lime"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  toBeAdded
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-10 max-w-xs text-sm leading-relaxed text-muted">
            We welcome clients in Bangladesh and internationally, for projects, monthly retainers
            and white-label partnerships. See how we handle your details in our{" "}
            <Link href="/privacy-policy" className="underline hover:text-paper">
              privacy policy
            </Link>
            .
          </p>
        </aside>

        <div className="relative lg:col-span-8 lg:col-start-5">
          <Suspense fallback={<ContactForm services={options} />}>
            <ContactFormFromUrl services={options} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
