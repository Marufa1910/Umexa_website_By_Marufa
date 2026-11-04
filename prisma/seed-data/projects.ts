import type { Project } from "../../src/types/content";

/**
 * SAMPLE case studies. The brands, briefs and work are fictional, written so the design can be
 * judged with realistic content, and stored with isSample = true, which labels them on the site.
 * No results or metrics are claimed. Used by prisma/seed.ts only.
 */

export const categories = [
  "Graphic Design",
  "Video Editing",
  "Motion Graphics",
  "3D Content",
  "Branding",
  "Digital Campaigns",
  "Web & Software",
] as const;

export type Category = (typeof categories)[number];

/** isSample is set by the seed, and the rest maps onto the Project table */
type SeedProject = Omit<Project, "isSample" | "categories"> & { categories: Category[] };

const LANDSCAPE = { width: 1600, height: 1000 };
const PORTRAIT = { width: 1600, height: 2000 };
const samples = "/media/samples";

export const projects: SeedProject[] = [
  {
    slug: "afterglow",
    title: "Afterglow",
    shortDescription: "A motion language for a fictional audio brand, built from light and rhythm.",
    client: "Sample client",
    industry: "Consumer audio",
    categories: ["Motion Graphics"],
    year: 2026,
    featured: true,
    cover: `${samples}/afterglow.webp`,
    alt: "Lime and white light trails weaving across a black frame",
    video: `${samples}/clips/afterglow.mp4`,
    overview:
      "The brief imagined a headphone brand with a strong product and no visual voice. Audio is hard to show, so we made sound the subject: every shape on screen behaves like a waveform.",
    objectives: [
      "Give the brand a look people recognize with the sound off",
      "Build a system any editor can extend without starting over",
      "Work across vertical social, widescreen and in-store screens",
    ],
    strategy:
      "Rather than illustrating products, the system animates the idea of listening. A single family of light trails responds to tempo, so a slow ballad and a club track produce visibly different films from the same rules.",
    process: [
      { title: "Sound mapping", copy: "Translated tempo, pitch and volume into rules for motion." },
      { title: "Style frames", copy: "Tested the look on still frames before animating anything." },
      { title: "System build", copy: "Packaged the rules into reusable templates and loops." },
    ],
    deliverables: ["Motion guidelines", "Title and end-card system", "Social loop library"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/afterglow-3.webp`,
        alt: "Vertical frame of white light lines folding over one another",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/afterglow-2.webp`,
        alt: "Wide frame of lime light trails crossing a dark background",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/afterglow-4.webp`,
        alt: "Wide frame of red and cream light lines rising to the right",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Afterglow: sample motion graphics case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches a motion language for an audio brand.",
  },
  {
    slug: "field-bottle",
    title: "Field Bottle",
    shortDescription:
      "Product visualization for a fictional cold brew launch, no photo shoot needed.",
    client: "Sample client",
    industry: "Food and beverage",
    categories: ["3D Content", "Digital Campaigns"],
    year: 2026,
    featured: true,
    cover: `${samples}/field-bottle.webp`,
    alt: "Matte black bottle with a lime label on a warm stone backdrop",
    video: null,
    overview:
      "A new drinks brand needs launch imagery before its first production run exists. A single 3D model of the bottle became the source for every image in the campaign.",
    objectives: [
      "Produce launch imagery before physical stock was available",
      "Let label and flavor changes happen without a reshoot",
      "Keep one consistent product look across every channel",
    ],
    strategy:
      "Photograph-like restraint: one bottle, one surface, one light. Treating the model as a permanent asset means each new flavor or market only needs a label swap and a fresh render.",
    process: [
      { title: "Modeling", copy: "Built the bottle to the packaging supplier's dimensions." },
      {
        title: "Look development",
        copy: "Matched matte glass and label stock under studio light.",
      },
      { title: "Rollout", copy: "Rendered crops for store, social and paid placements." },
    ],
    deliverables: ["Reusable 3D product model", "Store and social renders", "Label variations"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/field-bottle-3.webp`,
        alt: "Close view of the bottle's black neck and cap",
        width: 600,
        height: 750,
      },
      {
        kind: "image",
        src: `${samples}/field-bottle-2.webp`,
        alt: "Close view of the lime label with its black barcode stripe",
        width: 840,
        height: 525,
      },
      {
        kind: "image",
        src: `${samples}/field-bottle-4.webp`,
        alt: "Low view of the bottle's base and its shadow on the blue surface",
        width: 1120,
        height: 700,
      },
    ],
    seoTitle: "Field Bottle: sample 3D product visualization case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches 3D product visualization for a launch.",
  },
  {
    slug: "liquid-season",
    title: "Liquid Season",
    shortDescription:
      "A seasonal campaign for a fictional fashion label, led by texture and color.",
    client: "Sample client",
    industry: "Fashion e-commerce",
    categories: ["Digital Campaigns", "Video Editing"],
    year: 2025,
    featured: true,
    cover: `${samples}/liquid-season.webp`,
    alt: "Folds of ember-orange satin with deep black shadows",
    video: `${samples}/clips/liquid-season.mp4`,
    overview:
      "An online label wants its seasonal drop to stand out in crowded feeds full of model shots. The campaign leads with fabric instead: slow, tactile close-ups in a single, unmistakable color.",
    objectives: [
      "Stop the scroll without relying on discounts",
      "Create one idea that works from a six-second ad to the homepage",
      "Give the team assets it can recut through the season",
    ],
    strategy:
      "Own one color for one season. Every placement uses the same ember palette and the same slow movement, so even a brief glimpse in a feed connects back to the campaign.",
    process: [
      { title: "Concept", copy: "Chose texture and a single color as the whole idea." },
      { title: "Production", copy: "Created fabric studies and cut them to every format." },
      { title: "Channel kit", copy: "Assembled a labeled kit for paid, social and email." },
    ],
    deliverables: ["Campaign films in all ratios", "Homepage takeover art", "Paid social kit"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/liquid-season-2.webp`,
        alt: "Vertical frame of orange satin in sweeping curves",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/liquid-season-3.webp`,
        alt: "Wide frame of dark satin folds with a bright highlight",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/liquid-season-4.webp`,
        alt: "Wide frame of cream and ember satin in slow curves",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Liquid Season: sample digital campaign case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches a seasonal digital campaign for fashion.",
  },
  {
    slug: "halftone-press",
    title: "Halftone Press",
    shortDescription: "Poster and print identity for a fictional independent publisher.",
    client: "Sample client",
    industry: "Publishing",
    categories: ["Graphic Design"],
    year: 2025,
    featured: true,
    cover: `${samples}/halftone-press.webp`,
    alt: "A sphere built from white halftone dots on black",
    video: `${samples}/clips/halftone-press.mp4`,
    overview:
      "A small press needs its titles to feel like one collection on a shelf, on a tight print budget. The answer came from the printing process itself: one ink, one screen, endless variation.",
    objectives: [
      "Make every title recognizable as part of the same press",
      "Keep print costs low with single-ink production",
      "Translate cleanly from a poster to a phone screen",
    ],
    strategy:
      "Turn the limitation into the identity. Enlarged halftone dots hold up at any size, print well on cheap stock and give each cover a distinct image inside the same strict system.",
    process: [
      { title: "Print tests", copy: "Proofed dot sizes on the actual paper stock." },
      { title: "Grid and type", copy: "Set a cover grid that any new title can follow." },
      { title: "Template kit", copy: "Handed over layouts the in-house team can reuse." },
    ],
    deliverables: ["Cover and poster system", "Print-ready templates", "Social post layouts"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/halftone-press-2.webp`,
        alt: "Wide halftone composition of a dotted sphere",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/halftone-press-3.webp`,
        alt: "Vertical poster of a sphere lit from one side, in white dots",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/halftone-press-4.webp`,
        alt: "Wide layout of a cream dotted sphere on powder blue",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Halftone Press: sample graphic design case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches a print identity for a small publisher.",
  },
  {
    slug: "form-study",
    title: "Form Study",
    shortDescription: "An identity for a fictional materials startup, shaped around a living form.",
    client: "Sample client",
    industry: "Advanced materials",
    categories: ["Branding", "3D Content"],
    year: 2025,
    featured: true,
    cover: `${samples}/form-study.webp`,
    alt: "Liquid metal form catching a lime reflection",
    video: `${samples}/clips/form-study.mp4`,
    overview:
      "A deep-tech startup has a complex product and an audience of investors and engineers. Instead of a static logo alone, the identity centers on a single form that changes shape, as the material does.",
    objectives: [
      "Make a technical company feel confident and approachable",
      "Stay distinctive in a category of blue gradients",
      "Give pitch decks, site and events one shared visual idea",
    ],
    strategy:
      "A logo that holds still, next to a brand asset that doesn't. The wordmark stays quiet and legible, while the 3D form carries the personality and can change for each context.",
    process: [
      { title: "Positioning", copy: "Defined what the brand must say before how it looks." },
      { title: "Identity", copy: "Designed the wordmark, color and type system." },
      { title: "Form system", copy: "Built the 3D form and rules for how it may change." },
    ],
    deliverables: ["Logo and wordmark", "Brand guidelines", "3D brand asset library"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/form-study-2.webp`,
        alt: "Vertical render of the metal form in warm orange light",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/form-study-3.webp`,
        alt: "Wide render of the metal form against a dark background",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/form-study-4.webp`,
        alt: "Wide render of the form in warm light",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Form Study: sample branding case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches brand identity for a technology startup.",
  },
  {
    slug: "monolith",
    title: "Monolith",
    shortDescription: "Marketing site and product UI for a fictional logistics platform.",
    client: "Sample client",
    industry: "B2B software",
    categories: ["Web & Software"],
    year: 2025,
    featured: false,
    cover: `${samples}/monolith.webp`,
    alt: "A city of cobalt blocks with a few lime blocks standing out",
    video: `${samples}/clips/monolith.mp4`,
    overview:
      "A logistics platform has outgrown a site that no longer explains what it does. The new site and product UI share one component system, so marketing and product finally look like the same company.",
    objectives: [
      "Explain a complex platform in the first screen",
      "Let the marketing team publish without a developer",
      "Share one design system between site and product",
    ],
    strategy:
      "Show the network, then the detail. A block motif stands in for warehouses and routes, while plain language and fast pages carry the actual explanation.",
    process: [
      { title: "Discovery", copy: "Mapped who visits, what they ask and what blocks them." },
      { title: "Design system", copy: "Built shared components before any full page." },
      { title: "Build", copy: "Developed the site on a CMS, tested on real devices." },
    ],
    deliverables: ["Marketing website", "Design system", "CMS and handover docs"],
    gallery: [
      {
        kind: "image",
        src: `${samples}/monolith-3.webp`,
        alt: "Wide view over rows of cobalt blocks of varying height",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/monolith-2.webp`,
        alt: "Vertical view of cobalt blocks casting long shadows",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/monolith-4.webp`,
        alt: "Wide view of blue blocks with a few red blocks among them",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Monolith: sample web and software case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches a marketing site and shared design system.",
  },
  {
    slug: "second-skin",
    title: "Second Skin",
    shortDescription: "A brand film edit for a fictional skincare company, cut to a slow pulse.",
    client: "Sample client",
    industry: "Beauty",
    categories: ["Video Editing"],
    year: 2024,
    featured: false,
    cover: `${samples}/bone-study.webp`,
    alt: "Soft folds of bone-white fabric with black shadows",
    video: `${samples}/clips/bone-study.mp4`,
    overview:
      "A skincare brand has hours of beautiful footage and no story. The edit strips it down to a calm, confident film, then recuts it for every placement the brand needs.",
    objectives: [
      "Turn existing footage into one clear brand film",
      "Hold attention without fast cuts or loud music",
      "Deliver versions for web, paid social and retail screens",
    ],
    strategy:
      "Slow down when everyone else speeds up. The edit runs to the rhythm of a resting pulse, with long holds on texture that make the product feel unhurried and premium.",
    process: [
      { title: "Footage review", copy: "Logged all footage and pulled the strongest moments." },
      { title: "Story edit", copy: "Found the structure in a rough cut before any polish." },
      { title: "Finishing", copy: "Graded, added sound design and cut each format." },
    ],
    deliverables: ["Hero brand film", "15- and 6-second cutdowns", "Vertical social versions"],
    gallery: [
      {
        kind: "video",
        src: `${samples}/clips/bone-study.mp4`,
        poster: `${samples}/bone-study-3.webp`,
        alt: "Looping film of bone-white fabric gently moving",
        ...LANDSCAPE,
      },
      {
        kind: "image",
        src: `${samples}/bone-study-2.webp`,
        alt: "Vertical frame of fabric folds in black and white",
        ...PORTRAIT,
      },
      {
        kind: "image",
        src: `${samples}/bone-study-4.webp`,
        alt: "Wide frame of pale fabric folding into shadow",
        width: 1600,
        height: 1000,
      },
    ],
    seoTitle: "Second Skin: sample video editing case study",
    seoDescription:
      "A sample case study showing how UMEXA approaches a brand film edit for a beauty company.",
  },
];
