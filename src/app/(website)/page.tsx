import type { Metadata } from "next";
import { AgencyIntro } from "@/components/home/AgencyIntro";
import { ClientLogos } from "@/components/home/ClientLogos";
import { FinalCta } from "@/components/layout/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Services } from "@/components/home/Services";
import { Showreel } from "@/components/home/Showreel";
import { Testimonials } from "@/components/home/Testimonials";
import { getSiteSettings, getTestimonials } from "@/lib/data/public";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, testimonials] = await Promise.all([getSiteSettings(), getTestimonials()]);

  return (
    <>
      <Hero />
      {settings.showreelPoster && (
        <Showreel
          src={settings.showreelUrl}
          poster={settings.showreelPoster}
          sample={settings.showreelSample}
        />
      )}
      <SelectedWork />
      <Services />
      <AgencyIntro />
      <Process />
      <ClientLogos />
      <Testimonials items={testimonials} />
      <FinalCta label="06 / Your turn" />
    </>
  );
}
