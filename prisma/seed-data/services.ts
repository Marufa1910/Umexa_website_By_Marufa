import type { Service } from "../../src/types/content";

/**
 * Service descriptions. Draft copy for review: it describes typical scope only, and
 * avoids promises on price or turnaround until the agency confirms them.
 * Used by prisma/seed.ts only.
 */

const samples = "/media/samples";

const retainerFaq = {
  question: "Can this be part of a monthly retainer?",
  answer:
    "Yes. Many clients with steady needs prefer a retainer, which gives you ongoing output from a team that already knows your brand. Tell us what a typical month looks like and we will suggest a setup.",
};

export const services: Service[] = [
  {
    slug: "graphic-design",
    title: "Graphic Design",
    summary: "Campaign art, social systems, print and packaging.",
    preview: `${samples}/halftone-press.webp`,
    intro:
      "Design that holds together across every touchpoint. We create the one-off pieces you need now, and the systems that let your team keep producing consistent work later.",
    capabilities: [
      "Campaign and key art",
      "Social media systems",
      "Print and editorial layout",
      "Packaging design",
      "Presentation design",
      "Marketing collateral",
    ],
    deliverables: [
      "Editable source files",
      "Print-ready and web-ready exports",
      "Reusable templates",
      "A short usage guide",
    ],
    workflow: [
      { title: "Brief", copy: "Align on the audience, the message and every format needed." },
      { title: "Direction", copy: "Share focused creative routes, not a pile of options." },
      { title: "Design", copy: "Develop the chosen route and adapt it across formats." },
      { title: "Handover", copy: "Deliver organized files and templates your team can use." },
    ],
    categories: ["Graphic Design", "Branding"],
    faq: [
      {
        question: "Do we receive the source files?",
        answer:
          "Yes. Editable source files are part of the handover, unless a licensed asset in the work restricts it. We flag any such restriction up front.",
      },
      {
        question: "Can you work within our existing brand guidelines?",
        answer:
          "Yes. We can follow your guidelines closely, or point out where they may need extending for a new format.",
      },
      retainerFaq,
    ],
    seoTitle: "Graphic Design Services",
    seoDescription:
      "Campaign art, social media systems, print, packaging and presentation design from UMEXA.",
  },
  {
    slug: "video-editing",
    title: "Video Editing",
    summary: "Ads, brand films and social cuts, paced to hold attention.",
    preview: `${samples}/bone-study.webp`,
    intro:
      "Good editing decides what the story is. We shape raw footage into films people watch to the end, then recut them for every placement your campaign needs.",
    capabilities: [
      "Brand films",
      "Performance ads",
      "Short-form social content",
      "Color grading",
      "Sound design and mix",
      "Subtitles and captions",
    ],
    deliverables: [
      "Master film",
      "Cutdowns in every ratio",
      "Captioned versions",
      "Project files on request",
    ],
    workflow: [
      { title: "Footage review", copy: "Log what you have and agree what the film must do." },
      { title: "Rough cut", copy: "Find the story first, before any polish is added." },
      { title: "Fine cut", copy: "Refine pacing, then add grade, sound and graphics." },
      { title: "Versions", copy: "Export the final film and every cutdown you need." },
    ],
    categories: ["Video Editing", "Digital Campaigns"],
    faq: [
      {
        question: "Do you shoot the footage as well?",
        answer:
          "Editing is our core service. Tell us if you also need footage, and we can talk through the options for your project.",
      },
      {
        question: "What do you need from us to start?",
        answer:
          "Your raw footage, any brand assets, and examples of work you like. A clear idea of where the video will run helps most.",
      },
      retainerFaq,
    ],
    seoTitle: "Video Editing Services",
    seoDescription:
      "Brand films, performance ads and short-form social edits, with color grading and sound.",
  },
  {
    slug: "motion-graphics",
    title: "Motion Graphics",
    summary: "Explainers, 2D animation, title sequences and brand motion.",
    preview: `${samples}/afterglow.webp`,
    intro:
      "When a brand moves, people remember how it feels. From 2D animation to full motion systems, we make complicated ideas easy to follow and logos worth watching.",
    capabilities: [
      "2D animation",
      "Explainer videos",
      "Logo animation",
      "Title sequences",
      "Motion guidelines",
      "Animated social content",
    ],
    deliverables: [
      "Final animations in every format",
      "Lightweight web and social loops",
      "Reusable motion templates",
      "Motion guidelines where needed",
    ],
    workflow: [
      { title: "Script", copy: "Agree on the message before anything is drawn." },
      { title: "Storyboard", copy: "Plan every scene as frames you can review and change." },
      { title: "Animate", copy: "Bring the approved boards to life, with regular check-ins." },
      { title: "Finish", copy: "Add sound, then export for each place it will appear." },
    ],
    categories: ["Motion Graphics"],
    faq: [
      {
        question: "Can you write the explainer script?",
        answer:
          "Yes. We can write it from your brief, or refine a draft you already have. It is always agreed before animation starts, as that is when changes are easiest.",
      },
      {
        question: "Can you animate our existing logo?",
        answer:
          "Yes. Send us the vector files, and we will explore motion that suits the character of your brand.",
      },
      retainerFaq,
    ],
    seoTitle: "Motion Graphics and 2D Animation Services",
    seoDescription:
      "2D animation, explainer videos, logo animation and motion systems for ambitious brands.",
  },
  {
    slug: "3d-content",
    title: "3D Content",
    summary: "Product visualization and CGI for launches and e-commerce.",
    preview: `${samples}/field-bottle.webp`,
    intro:
      "Show your product at its best, even before it exists. A single 3D model can produce imagery and animation for every channel, and stay useful for years.",
    capabilities: [
      "Product visualization",
      "CGI campaign imagery",
      "3D product animation",
      "Abstract brand visuals",
      "Packaging mockups",
      "Architectural visuals",
    ],
    deliverables: [
      "High-resolution renders",
      "Product animations",
      "Web-ready crops",
      "The 3D source model",
    ],
    workflow: [
      { title: "Reference", copy: "Collect dimensions, materials and any CAD files you have." },
      { title: "Model", copy: "Build an accurate model and confirm it with you." },
      { title: "Look", copy: "Develop lighting and materials to set the right mood." },
      { title: "Render", copy: "Produce final stills and animation for each channel." },
    ],
    categories: ["3D Content"],
    faq: [
      {
        question: "What do you need to model our product?",
        answer:
          "CAD files are ideal, but photos with measurements or a physical sample can also work. We will tell you what is enough for your project.",
      },
      {
        question: "Can the model be reused later?",
        answer:
          "Yes, that is one of the main benefits. Once built, new colors, labels or scenes take far less work than starting again.",
      },
      retainerFaq,
    ],
    seoTitle: "3D Content and Product Visualization Services",
    seoDescription:
      "Product visualization, CGI imagery and 3D animation for launches and e-commerce brands.",
  },
  {
    slug: "brand-identity",
    title: "Branding",
    summary: "Identity systems, guidelines and the thinking behind them.",
    preview: `${samples}/form-study.webp`,
    intro:
      "A logo is only the visible part. We help define what your brand stands for, then build a complete identity that makes it obvious at a glance.",
    capabilities: [
      "Brand strategy and positioning",
      "Logo and visual identity",
      "Color and type systems",
      "Brand voice",
      "Brand guidelines",
      "Rebranding",
    ],
    deliverables: [
      "Logo suite in all formats",
      "Brand guidelines",
      "Core templates",
      "A launch asset kit",
    ],
    workflow: [
      { title: "Listen", copy: "Talk with your team and study your market and competitors." },
      { title: "Position", copy: "Agree on what the brand must stand for and for whom." },
      { title: "Identity", copy: "Design the visual system and test it in real situations." },
      { title: "Roll out", copy: "Hand over guidelines and assets your team can apply." },
    ],
    categories: ["Branding"],
    faq: [
      {
        question: "We already have a logo. Can you help anyway?",
        answer:
          "Often that is the best starting point. We can refresh what you have, or build the wider system around it, rather than replacing it.",
      },
      {
        question: "Who should be involved on our side?",
        answer:
          "Ideally the people who make the final decision, from the very start. It keeps the process focused and avoids surprises late on.",
      },
      retainerFaq,
    ],
    seoTitle: "Brand Identity Services",
    seoDescription:
      "Brand strategy, logo design, identity systems and guidelines for startups and corporate brands.",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    summary: "Creative-led campaigns, planned and built for every channel.",
    preview: `${samples}/liquid-season.webp`,
    intro:
      "Media gets you seen, but creative decides whether anyone cares. We plan campaigns around a strong idea, then produce and adapt it for each channel.",
    capabilities: [
      "Campaign planning",
      "Social media content",
      "Paid social and display creative",
      "Content calendars",
      "E-commerce campaign assets",
      "Creative testing",
    ],
    deliverables: [
      "Campaign concept and plan",
      "Assets for each channel",
      "Content calendar",
      "Variations for testing",
    ],
    workflow: [
      { title: "Goal", copy: "Define who to reach and what success should look like." },
      { title: "Idea", copy: "Develop one campaign idea that works across channels." },
      { title: "Produce", copy: "Create and adapt assets for each format and placement." },
      { title: "Refine", copy: "Review what worked and feed it into the next round." },
    ],
    categories: ["Digital Campaigns"],
    faq: [
      {
        question: "Do you guarantee results?",
        answer:
          "No honest agency can guarantee results. What we can do is agree clear goals up front, and show you what is working and what we would change.",
      },
      {
        question: "Can you work with our existing media team?",
        answer:
          "Yes. We can supply creative for your team or media partner to run, and fit into the way you already work.",
      },
      retainerFaq,
    ],
    seoTitle: "Digital Marketing Services",
    seoDescription:
      "Creative-led digital campaigns, social content and paid media creative across every channel.",
  },
  {
    slug: "web-software",
    title: "Web & Software",
    summary: "Marketing sites, web apps and custom software.",
    preview: `${samples}/monolith.webp`,
    intro:
      "Design and code from the same team, so nothing gets lost in handover. We build fast marketing sites, web applications and custom software that fits how your business works.",
    capabilities: [
      "Website design and development",
      "E-commerce sites",
      "Web applications",
      "Custom software",
      "Content management systems",
      "Maintenance and support",
    ],
    deliverables: [
      "Designed and tested product",
      "Source code and documentation",
      "CMS setup and training",
      "Deployment and handover",
    ],
    workflow: [
      { title: "Scope", copy: "Agree what to build, for whom, and what comes first." },
      { title: "Design", copy: "Prototype the key screens and test them before coding." },
      { title: "Build", copy: "Develop in small steps you can see and try as we go." },
      { title: "Launch", copy: "Test on real devices, deploy and hand over properly." },
    ],
    categories: ["Web & Software"],
    faq: [
      {
        question: "Will we own the code?",
        answer:
          "Yes, on final payment, and the terms are written into the agreement. We document what we build so that you are never tied to us.",
      },
      {
        question: "Can you take over an existing website or app?",
        answer:
          "Usually, yes. We would review the code first and give you an honest view on whether to improve it or rebuild it.",
      },
      {
        question: "Do you offer support after launch?",
        answer:
          "Yes. We can agree a monthly arrangement for maintenance and improvements, so your product keeps moving after launch.",
      },
    ],
    seoTitle: "Web Design and Software Development Services",
    seoDescription:
      "Website design and development, web applications and custom software from one team.",
  },
];
