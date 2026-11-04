"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProjectCard, type ProjectCardData } from "./ProjectCard";

/* An uneven rhythm that still reads well however few projects a filter leaves */
const pattern = [
  { cell: "md:col-span-7", media: "aspect-[4/3]", sizes: "(min-width: 768px) 58vw, 100vw" },
  {
    cell: "md:col-span-5 md:mt-[12vw]",
    media: "aspect-[4/5]",
    sizes: "(min-width: 768px) 42vw, 100vw",
  },
  { cell: "md:col-span-5", media: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw" },
  {
    cell: "md:col-span-7 md:mt-[8vw]",
    media: "aspect-[4/3]",
    sizes: "(min-width: 768px) 58vw, 100vw",
  },
  {
    cell: "md:col-span-9 md:col-start-2",
    media: "aspect-[16/9]",
    sizes: "(min-width: 768px) 75vw, 100vw",
  },
];

const ALL = "All";

type Props = {
  projects: ProjectCardData[];
  categories: readonly string[];
  initialCategory?: string;
  initialQuery?: string;
};

export function WorkExplorer({ projects, categories, initialCategory, initialQuery = "" }: Props) {
  const [category, setCategory] = useState(
    initialCategory && categories.includes(initialCategory) ? initialCategory : ALL,
  );
  const [query, setQuery] = useState(initialQuery);

  /** Keep the view in the URL, so a filtered view can be shared and survives going back */
  const sync = (nextCategory: string, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextCategory !== ALL) params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  };

  const chooseCategory = (next: string) => {
    setCategory(next);
    sync(next, query);
  };
  const changeQuery = (next: string) => {
    setQuery(next);
    sync(category, next);
  };
  const reset = () => {
    setCategory(ALL);
    setQuery("");
    sync(ALL, "");
  };

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (category !== ALL && !project.categories.includes(category)) return false;
      if (!needle) return true;
      return [project.title, project.client, ...project.categories]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [projects, category, query]);

  const count = (name: string) =>
    name === ALL ? projects.length : projects.filter((p) => p.categories.includes(name)).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="gutter border-y border-line py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1">
            {[ALL, ...categories].map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                onClick={() => chooseCategory(name)}
                className={`flex min-h-10 items-center gap-2 border px-3 text-sm transition-colors duration-300 ${
                  category === name
                    ? "border-lime bg-lime text-ink"
                    : "border-line text-paper hover:border-paper"
                }`}
              >
                {name}
                <span className={`slate ${category === name ? "text-ink/60" : "text-muted"}`}>
                  {count(name)}
                </span>
              </button>
            ))}
          </div>

          <div className="relative lg:w-72">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="min-h-11 w-full border-b border-line bg-transparent pr-8 pl-7 text-base outline-none placeholder:text-muted focus:border-lime [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeQuery("")}
                className="absolute top-1/2 right-0 flex size-8 -translate-y-1/2 items-center justify-center text-muted hover:text-paper"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="gutter py-12 lg:py-20">
        <p aria-live="polite" className="slate mb-8 text-muted">
          {results.length} {results.length === 1 ? "project" : "projects"}
        </p>

        {results.length === 0 ? (
          <div className="border border-line px-6 py-16 text-center">
            <p className="display text-3xl lg:text-5xl">Nothing in this cut.</p>
            <p className="mt-3 text-muted">No projects match that search and category.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 min-h-11 border border-line px-5 text-sm hover:border-paper"
            >
              Show all projects
            </button>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 md:grid-cols-12 lg:gap-x-8 lg:gap-y-24">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((project, i) => {
                const { cell, media, sizes } = pattern[i % pattern.length];
                return (
                  <motion.article
                    key={project.slug}
                    layout="position"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    className={cell}
                  >
                    <ProjectCard project={project} media={media} sizes={sizes} showFeatured />
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

/** Reads the shared filter from the URL. Must sit inside a Suspense boundary. */
export function WorkExplorerFromUrl(props: Omit<Props, "initialCategory" | "initialQuery">) {
  const params = useSearchParams();
  return (
    <WorkExplorer
      {...props}
      initialCategory={params.get("category") ?? undefined}
      initialQuery={params.get("q") ?? ""}
    />
  );
}
