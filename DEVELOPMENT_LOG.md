# Movexa: Development Log

## Status

| Phase                        | State                                       |
| ---------------------------- | ------------------------------------------- |
| 1. Foundation                | Done                                        |
| 2. Public website            | Done, using labelled sample content         |
| 3. Animations                | Partly done; see TODO for the rest          |
| 4. Database and backend      | Done locally; no production database yet    |
| 5. Admin dashboard           | Done, except real Cloudinary uploads        |
| 6. Production and deployment | Not started. Do not deploy without approval |

## Development plan

1. **Foundation and homepage** (done).
2. **Public pages** (done): `/work`, `/work/[slug]`, `/services`, `/services/[slug]`, `/about`, `/contact` (UI),
   `/privacy-policy`, `/terms`. Content stays in `src/content` until the database exists.
3. **Remaining animation:** page transitions, horizontal case-study gallery, custom cursor (only if it helps).
4. **Backend** (done): PostgreSQL, Prisma, Better Auth, roles, Zod, contact form saved to the database, rate limiting, spam protection.
5. **Admin dashboard** (done, except real uploads): all routes in the brief, on top of the data layer and permissions built in Phase 4. Cloudinary here.
6. **Production:** sitemap, robots, structured data, OG images, security audit, Core Web Vitals, deployment on approval.

## TODO

### Needed from the client (no invented values are used in their place)

- [ ] Business email, WhatsApp number, location, social links (`src/config/site.ts`; hidden or "coming soon" until set)
- [ ] Real showreel and project media (all current media is procedurally generated sample art)
- [ ] Real projects, client logos and testimonials
- [ ] Review of draft marketing copy, especially the "Our story" note in `AgencyIntro.tsx` and the promises in
      `processSteps` (`src/content/home.ts`). They were drafted for layout, not taken from a brief.
- [ ] Confirm the "Bangladesh / Worldwide" hero label and the wordmark (typeset placeholder, not a final logo)
- [ ] Review draft copy in `src/content/services.ts` (including FAQ promises such as code ownership) and `src/content/about.ts`
- [ ] Confirm the budget bands and timelines in `src/schemas/inquiry.ts`
- [ ] Confirm role rules in `src/lib/auth/permissions.ts` (Editors can't see inquiries; Admins can only create Editors)
- [ ] Real team members (the About page shows labelled placeholders)
- [ ] Legal review of `/privacy-policy` and `/terms`, shown as drafts. They need the legal entity name and contact
      details, and the privacy text describes database storage that only exists from Phase 4.

### Build work

- [ ] Test real Cloudinary uploads once credentials exist: upload, register, picker, delete. Only the signing has been tested.
- [ ] Restore or permanently purge soft-deleted items (no screen for this yet; rows stay in the database)
- [ ] Clear expired `RateLimit` rows on a schedule
- [ ] Production database, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and a strong Owner password, set at deployment
- [ ] Email notification when an inquiry arrives (not in the brief, but inquiries are only visible in the database for now)
- [ ] Page transitions (needs more than one route to test)
- [ ] Horizontal project gallery on case-study pages
- [ ] Custom cursor (desktop only, only if it helps usability)
- [ ] SEO: sitemap, robots.txt, Organization structured data, Open Graph image
- [ ] Content-Security-Policy header (basic security headers are already set in `next.config.ts`)
- [ ] Lighthouse / Core Web Vitals measurement (not measured yet)
- [ ] Real-device testing: all tests so far ran in headless Chrome with emulated viewports
- [ ] Firefox and Safari testing

## Decisions worth knowing

- **TypeScript 5 and ESLint 9, not the newest majors:** these are what the Next 16.4 template pins. TypeScript 7 and
  ESLint 10 are available but not adopted by the template.
- **Prisma 7.10.1:** npm's `latest` tag points at an 8.0 release candidate, so the stable 7.x line is used on purpose.
  Ignore the upgrade notice Prisma prints until 8.0 is final.
- **Better Auth, not Auth.js:** Auth.js v5 is still tagged beta and v4 predates this Next version. Better Auth 1.7 is stable and
  maintained. Its `/api/auth` route has rate limiting, so login must go through it, not through `auth.api` in a server action.
- **Local database:** `embedded-postgres` runs real PostgreSQL without Docker. It is a dev dependency, published only under
  a beta tag, and never used in production.
- **Rate limiting trusts `x-forwarded-for`:** right on Vercel, which sets it. Re-check this if hosting changes.
- **Cache Components and Partial Prefetching are on** (Next 16 template default). `new Date()` must sit in a
  `"use cache"` scope, see `CopyrightYear` in `Footer.tsx`. Hidden routes stay mounted through React `<Activity>`, so
  effects must clean up properly.
- **Hero text reveal is CSS, not GSAP:** it starts on first paint, cannot flash during hydration, and works without
  JavaScript. GSAP handles scroll-driven work; Motion handles UI state (menu, quotes, cursor preview).
- **Sample media:** `scripts/generate-sample-media.mjs` renders it. It is a dev tool and is not used at runtime.
  Encoding the reel needs an `FFMPEG` path; ffmpeg is deliberately not a project dependency.
- **Replacing a file in `public/` under the same name:** clear `.next/cache/images` or the optimizer serves the old one.
- **Project folder name:** `create-next-app` rejects capitals, so it was scaffolded in a temp folder and copied here.
- **Real 404s need Proxy:** case-study and service pages stream from a prerendered shell, so `notFound()` alone returns
  a 200 with `noindex`. `dynamicParams` is not allowed with Cache Components, so `src/proxy.ts` checks slugs first, from a
  one-minute in-memory list. A newly published page can 404 for up to a minute.
- **`forbidden()` not used:** it needs an experimental flag, so denied pages redirect to the dashboard instead.
- **Building needs the database:** public pages are prerendered from it, so `DATABASE_URL` must be reachable at build time.
- **Service list:** the brief's 9 services appear as 7 pages, matching the homepage list. 2D Animation sits inside Motion
  Graphics, and Web Design and Software Development share Web & Software.
- **Git:** the folder is not a repository yet. Nothing has been committed.

## Admin notes

- **Every admin form action** goes through `runForm` or `attempt` in `src/lib/admin/action.ts`: permission, then validation, then work.
- **Every content change** calls `updateTag`, so the public site updates at once.
- **`ensureStatic = "navigation"`** on case-study and service pages: otherwise the first visit after any edit sends an empty shell that only fills in with JavaScript, and crawlers would see no content.
- **`/admin/services/new`, `/admin/services/[id]/edit`, `/admin/inquiries/[id]`, `/admin/account`** are additions to the brief's route list, because those screens needed somewhere to live.
- **`/admin/team` vs `/admin/users`:** Team is public profiles for the About page. Users is sign-in accounts and roles.
- **Client-side fields:** admin forms validate on the server and show errors there. React Hook Form is used only on the public contact form.

## Session log

### 2026-11-03: Foundation and homepage

**Environment:** Node 24.15.0, npm 11.12.1. The project folder was empty.

**Completed**

- Next.js 16.4.4, React 19, TypeScript strict, Tailwind 4, ESLint, Prettier
- Design tokens, fluid type, fonts (Geist, Space Grotesk, Instrument Serif), favicon, branded 404, `.env.example`
- Header with hide-on-scroll, rolling link hover, scroll timecode and playhead; full-screen mobile menu
- Footer with config-driven contact details (hidden until supplied)
- Homepage: Hero, Showreel, Selected Work, Services, Agency Intro, Process, Client Logos, Testimonials, Final CTA
- Lenis synced with GSAP ScrollTrigger; scroll reveals, parallax, word scrub, pinned Process timeline on desktop
- Sample media set (8 stills and a 13 s, 933 KB reel), all visibly labelled as samples on the page

**Files**

- Config: `package.json`, `next.config.ts`, `.prettierrc.json`, `.prettierignore`, `.env.example`, `.gitignore`,
  `.claude/launch.json`
- App: `src/app/{layout,not-found}.tsx`, `src/app/globals.css`, `src/app/icon.svg`, `src/app/(website)/{layout,page}.tsx`
- Components: `src/components/{ui,layout,home,animations}/*`
- Other: `src/config/site.ts`, `src/content/home.ts`, `src/lib/animations/*`, `scripts/generate-sample-media.mjs`,
  `public/media/samples/*`

**Commands**

- `npx create-next-app@latest` (in a temp folder), `npm install`
- `npm install gsap @gsap/react motion lenis lucide-react`, `npm install -D prettier prettier-plugin-tailwindcss`
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `npx next start`
- `node scripts/generate-sample-media.mjs stills|reel`

**Tests** (production build, headless Chrome; test scripts were throwaway and are not in the repo)

- Typecheck, lint and production build pass; `npm audit --omit=dev` reports 0 vulnerabilities
- No element overflow or horizontal page scroll at 1440, 1024, 768, 390, 360 (screenshots reviewed at each)
- Showreel: no video bytes requested before click; play, pause, auto-pause when scrolled away; poster and
  "Reel unavailable" shown when the file returns 404
- Mobile menu: opens, closes on Escape, returns focus to the button, links navigate (390 and 360)
- Quote switcher changes the visible quote; service preview follows the cursor
- Reduced motion: Lenis off, no pinning, hero animation off, no content left hidden
- JavaScript disabled: headline still renders
- Console: the only errors are 404s from link prefetches to pages not built yet; no page errors

**Errors fixed**

- Hero buttons overflowed at mid widths; footer wordmark clipped at the right edge
- Failed video left a blank frame: status flipped to "playing" on `play()`, now uses the `playing` event and keeps errors sticky
- Service preview flew in from the corner of the screen on first hover
- Hero headline text ran together for crawlers and screen readers ("boldideas")
- Hero ring overlapped the headline on mobile; showreel title unreadable on bright frames
- First-pass sample renders had banding and marching artefacts

**Remaining:** see TODO.

**Next recommended step:** Phase 2, starting with `/work` and `/work/[slug]`, which remove most of the homepage's dead links.

### 2026-11-03: Phase 2, public website

**Completed**

- `/work`: category filter with counts, search, shareable filter URLs, empty state, hover video loaded only on hover
- `/work/[slug]`: 7 sample case studies with hero media, overview, objectives, strategy, process, deliverables, gallery,
  related projects, next project and per-page SEO metadata
- `/services` and 7 `/services/[slug]` pages: capabilities, deliverables, workflow, relevant work, FAQ, contact CTA
- `/about`: story, mission, vision, philosophy, placeholder team, process, collaboration approach
- `/contact`: all brief fields, BDT and USD budgets, client and server validation with a shared Zod schema, honeypot,
  fill-time check, rate limiting, service preselected from service pages. Not saved until Phase 4.
- `/privacy-policy`, `/terms`: drafts, labelled as such
- Shared `VideoPlayer`, `PageHero`, `ProjectCard`, `FinalCta`; active state in navigation; extra sample images and clips

**Files**

- Pages: `src/app/(website)/{work,services,about,contact,privacy-policy,terms}/**`, `src/app/(website)/not-found.tsx`
- Components: `src/components/{portfolio,services,contact}/*`, `src/components/ui/{PageHero,VideoPlayer}.tsx`,
  `src/components/layout/{LegalPage,NotFoundMessage,FinalCta}.tsx`, `src/components/animations/ParallaxImage.tsx`
- Logic and content: `src/content/{projects,services,about}.ts`, `src/schemas/inquiry.ts`, `src/actions/inquiry.ts`,
  `src/lib/seo.ts`, `src/lib/utils/rate-limit.ts`, `src/proxy.ts`
- Changed: homepage sections, `Header`, `SmoothScroll`, `src/config/site.ts`, `scripts/generate-sample-media.mjs`

**Commands**

- `npm install zod react-hook-form @hookform/resolvers`
- `node scripts/generate-sample-media.mjs stills|crops|clips`
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build`, `npx next start`

**Tests** (production build, headless Chrome; test scripts were throwaway and are not in the repo)

- Crawled every internal link from `/`: all 200, one h1 each, description, canonical and Open Graph present, no page or
  console errors. Unknown `/work/*` and `/services/*` return a real 404.
- No overflow at 1440, 1024, 768, 390, 360 on 9 page types; all 7 case studies rechecked after the gallery change
- Portfolio: filter, search, reset, deep link; no clip requested before hover, clip plays on hover
- Navigation: client navigation lands at the top; back restores scroll; pinned Process works after returning and on `/about`
- Video: hero and gallery players play
- Form: empty submit shows 7 errors; `javascript:` reference link rejected; valid submit shows the "nothing was sent"
  notice; repeat submits are rate limited; with JavaScript off the server returns the same 7 errors; honeypot gets the normal response
- Reduced motion: no pinning, no hidden content on 4 inner pages

**Not tested**

- Real phones, Firefox and Safari. Core Web Vitals not measured.
- The fill-time spam check and hover clips other than the first project's were not exercised directly.

**Errors fixed**

- Unknown URLs returned status 200 instead of 404
- Case-study gallery repeated images and left large empty areas
- Form field lines and placeholder text were too low in contrast
- Video scrim was too tall when a player has no caption

**Next recommended step:** Phase 3 (page transitions, horizontal gallery), or go straight to Phase 4, since the contact form
cannot take real inquiries until the database exists.

### 2026-11-03: Phase 4, database and backend

**Completed**

- PostgreSQL with Prisma: all models in the brief, plus auth tables, inquiry notes and status history; first migration; indexes, unique slugs, soft deletion
- Idempotent seed: Owner account from environment variables, and samples marked `isSample`. Re-seeding never overwrites edits.
- Login with Better Auth: hashed passwords, HTTP-only SameSite cookies, 5 attempts a minute, no public sign-up
- Server-side roles in `src/lib/auth/permissions.ts`, checked by every admin API route and page; origin check on changing requests
- Contact form saves to the database, with server validation, honeypot, fill-time check and a shared database rate limit (hashed keys)
- Public site reads the database through `src/lib/data/public.ts`: published, non-deleted records only, cached with tags. Sample labels now follow each record's `isSample`.
- Audit log for sign-ins, inquiries and staff changes, without personal details
- API: `/api/auth/*`, `/api/admin/stats`, `/api/admin/inquiries`, `/api/admin/inquiries/[id]`, `/api/admin/users`
- `/admin/login` and a basic `/admin/dashboard` with live numbers. This is not the Phase 5 dashboard: no sidebar, no content editing.

**Not done, on purpose:** Cloudinary is Phase 5 (media library), so no credentials were needed. No production database yet.

**Files**

- Database: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts`, `prisma/seed-data/*` (moved from `src/content`), `prisma.config.ts`, `scripts/db-dev.mjs`
- Backend: `src/lib/db.ts`, `src/lib/audit.ts`, `src/lib/auth/*`, `src/lib/data/*`, `src/lib/utils/rate-limit.ts`, `src/actions/inquiry.ts`, `src/schemas/*`, `src/app/api/**`, `src/proxy.ts`
- Admin: `src/app/admin/**`, `src/components/admin/*`
- Changed: every public page and homepage section that showed sample data; `src/types/content.ts` added; `src/config/site.ts` trimmed

**Commands**

- `npm install prisma@7.10.1 @prisma/client@7.10.1 @prisma/adapter-pg@7.10.1 pg better-auth server-only`
- `npm install -D embedded-postgres @types/pg tsx dotenv`
- `npm run db:dev`, `npx prisma migrate dev --name init`, `npx prisma generate`, `npx prisma db seed`

**Tests** (production build against local PostgreSQL; 85 checks, script not in the repo; test accounts and rows removed afterwards)

- Anonymous and forged-cookie access to every admin page and API is refused
- Public sign-up refused; role can't be set through sign-up or profile update; password stored hashed
- Login: same response for wrong password and unknown email; rate limited after 5 tries; cookie is HttpOnly and SameSite=Lax
- Roles: Editor refused on inquiries and users; Admin can't create Owners or Admins; role changes and sign-out apply on the next request
- CSRF: other-site and missing origins refused. Mass assignment and bad input return 400.
- Form: row saved with correct fields; honeypot saves nothing; server rejects an empty form; 6th submit limited
- Inquiry API: search, filter, status change with history, notes, audit entry without personal details
- Drafts: 404 and absent from the portfolio. Dashboard numbers match the database.
- Secrets: no secret values and no database client in browser files. The name `BETTER_AUTH_SECRET` appears in Better Auth's client code, with no value.

**Not tested**

- A real managed database or HTTPS, so the `Secure` cookie flag is unverified until deployment
- The redirect for a role denied an admin page: every role can open the only page so far. Phase 5 pages will exercise it.

**Errors fixed**

- The security check flagged the `BETTER_AUTH_SECRET` name in a browser file: checked, a false alarm
- Replaced experimental `forbidden()` with a redirect

**Next recommended step:** Phase 5, the admin dashboard. Cloudinary credentials are needed for its media library.

### 2026-11-04: Phase 5, admin dashboard

**Completed**

- Shell: sidebar (a drawer on phones), top bar, role-filtered navigation, toasts, confirmation dialogs, loading, empty and error states
- Dashboard: live numbers and readable recent activity
- Projects: create, edit, soft delete, publish, drafts, feature, reorder, gallery editor, video URL, categories, client, case-study fields, SEO, search and filters
- Services, categories, clients, testimonials, team: full management, with order, publish and sample labels where they apply
- Inquiries: search, status filter, status changes with history, internal notes, archive and restore
- Settings: agency details, logo, contact, socials, showreel, SEO defaults, all connected to the public site
- Users: create, change role, reset password, delete, with last-Owner protection. My account: change own password.
- Media library: signed direct upload to Cloudinary, server-side file checks, preview, description, delete blocked while a file is in use. **Real uploads are untested: no credentials yet.**

**Files**

- Pages: `src/app/admin/(panel)/**` (`dashboard` moved here)
- Components: `src/components/admin/*`
- Logic: `src/actions/admin/*`, `src/lib/admin/action.ts`, `src/lib/cloudinary/index.ts`, `src/lib/data/admin-content.ts`, `src/lib/data/staff.ts`, `src/schemas/admin.ts`, `src/types/admin.ts`, `src/app/api/admin/media/sign/route.ts`
- Database: `MediaAsset` model, migration `media_assets`
- Changed: `src/proxy.ts`, `src/lib/data/slugs.ts`, public layout, header, logo, footer, contact, client logos, testimonials, root metadata

**Commands**

- `npm install cloudinary`, `npx prisma migrate dev --name media_assets`, `npx prisma generate`

**Tests** (production build, real browser, local PostgreSQL; test rows removed afterwards; scripts not in the repo)

- 112 admin checks: every create, edit, publish, reorder and delete above, each confirmed in the database and on the public site
- Security: captured real server actions and replayed them as Editor and anonymously; swapped the model name to `user`; changed a captured request to ask for the Owner role as an Admin. All refused, with a control proving the same replay works when allowed.
- Editors are redirected away from inquiries, settings and users. HTML in an inquiry is shown as text, not run.
- No page overflow on 14 admin routes at 1440, 1024, 768, 390, 360; mobile drawer works
- Cloudinary with placeholder keys: upload button appears, signatures are issued, SVG refused, limits correct, secret never returned
- Phase 4 security suite and Phase 2 public checks rerun on the final build

**Not tested**

- Real uploads to Cloudinary, including `registerMedia` and deleting from Cloudinary
- Real phones, Firefox and Safari

**Errors fixed**

- Build failed: `usePathname` outside `Suspense` on routes with no prerendered params
- First visit after an edit returned a shell with no content, and a deleted page returned 200 once (`ensureStatic`)
- A newly published page could 404 for a minute: the proxy now rechecks the database on a miss
- "Note added" toast was lost because the form remounted before showing it
- Server actions took a model name that could be tampered with: added a runtime allow-list
- Filter dropdowns stretched to full width

**Next recommended step:** Phase 3 polish (page transitions, horizontal gallery), then Phase 6: SEO files, security audit, performance and deployment. Add Cloudinary credentials to test uploads.
