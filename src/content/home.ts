/** Fixed homepage copy that is the same for every engagement. Draft for review. */

export const processSteps = [
  {
    title: "Discover",
    copy: "We learn the business, the audience and what success has to look like, before anyone opens a design file.",
    output: "Brief and success measures",
  },
  {
    title: "Strategy",
    copy: "One clear idea, a creative direction and a production plan. You sign off here, so nothing later is a surprise.",
    output: "Direction and production plan",
  },
  {
    title: "Create",
    copy: "Design, edit, animate and build in short review cycles, with one person accountable for your project.",
    output: "Work in progress, reviewed often",
  },
  {
    title: "Deliver",
    copy: "Final files in every format you need, then a look at what worked, ready to feed the next round.",
    output: "Final assets and handover",
  },
] as const;

export const engagements = [
  { title: "Projects", copy: "A defined scope, price and delivery date." },
  { title: "Retainers", copy: "A monthly creative team with steady output." },
  { title: "White-label", copy: "Production for agencies, under your brand." },
] as const;
