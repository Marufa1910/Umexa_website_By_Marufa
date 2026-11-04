import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/Reveal";
import { engagements } from "@/content/home";

type Props = { label?: string; href?: string };

export function FinalCta({ label = "Your turn", href = "/contact" }: Props) {
  return (
    <section className="gutter bg-lime pt-16 pb-8 text-ink lg:pt-24">
      <Reveal>
        <p data-reveal className="slate">
          {label}
        </p>
        <Link
          data-reveal
          href={href}
          className="group mt-6 flex items-end justify-between gap-4 focus-visible:outline-ink"
        >
          <span className="display text-display">
            Let&rsquo;s make it
            <br />
            <span className="accent-serif text-[1.08em]">move.</span>
          </span>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.25}
            className="mb-[1vw] size-[clamp(3rem,11vw,11rem)] shrink-0 transition-transform duration-700 ease-studio group-hover:translate-x-2 group-hover:-translate-y-2"
          />
        </Link>

        <ul className="mt-14 grid border-t border-ink md:grid-cols-3 lg:mt-24">
          {engagements.map((item) => (
            <li
              key={item.title}
              data-reveal
              className="border-b border-ink/25 py-5 last:border-b-0 md:border-b-0 md:border-l md:px-5 md:first:border-l-0 md:first:pl-0"
            >
              <h3 className="font-display text-2xl font-medium tracking-tight">{item.title}</h3>
              <p className="mt-1 text-sm">{item.copy}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
