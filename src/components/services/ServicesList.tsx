"use client";

import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

export type ServiceRow = { slug: string; title: string; summary: string; preview: string };

// Only mouse users get the preview, so Motion downloads on their first hover, never on a phone
const ServicePreview = dynamic(() => import("./ServicePreview"), { ssr: false });

/** Rows of services; on mouse devices, a preview image follows the cursor over the list. */
export function ServicesList({ services }: { services: ServiceRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  return (
    <div onPointerLeave={() => setActive(null)}>
      <ul className="border-b border-line">
        {services.map((service, i) => (
          <li key={service.slug} data-reveal className="border-t border-line">
            <Link
              href={`/services/${service.slug}`}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                if (active === null) setOrigin({ x: e.clientX, y: e.clientY });
                setActive(i);
              }}
              className="group grid grid-cols-[2rem_1fr_auto] items-center gap-x-2 py-5 md:grid-cols-12 md:gap-x-6 lg:py-7"
            >
              <span className="slate text-muted md:col-span-1">0{i + 1}</span>
              <span className="display text-[2rem] transition-[color,translate] duration-500 ease-studio group-hover:translate-x-2 group-hover:text-accent sm:text-4xl md:col-span-6 lg:text-6xl lg:group-hover:translate-x-5">
                {service.title}
              </span>
              <span className="col-start-2 row-start-2 mt-2 text-sm text-muted md:col-span-4 md:col-start-auto md:row-start-auto md:mt-0 lg:text-base">
                {service.summary}
              </span>
              <ArrowUpRight
                aria-hidden
                className="col-start-3 row-start-1 size-5 justify-self-end transition-all duration-500 ease-studio group-hover:text-accent md:col-span-1 md:col-start-auto md:row-start-auto lg:size-7 lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1"
              />
            </Link>
          </li>
        ))}
      </ul>

      {origin && (
        <ServicePreview origin={origin} image={active === null ? null : services[active].preview} />
      )}
    </div>
  );
}
