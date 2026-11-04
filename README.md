# Movexa

Website for Movexa, a creative digital agency. Next.js (App Router), TypeScript, Tailwind CSS, GSAP, Motion and Lenis.

Project status, TODOs and decisions are in [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).

## Run it

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill it in. Then, in one terminal:

```bash
npm run db:dev
```

The first time only, in a second terminal:

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

Then:

```bash
npm run dev
```

Open http://localhost:3000. The admin sign-in is at `/admin/login`, using the `SEED_OWNER_*` values from `.env.local`. The database must also be running for `npm run build`.

## Scripts

| Command              | What it does               |
| -------------------- | -------------------------- |
| `npm run dev`        | Development server         |
| `npm run build`      | Production build           |
| `npm start`          | Serve the production build |
| `npm run lint`       | ESLint                     |
| `npm run typecheck`  | TypeScript                 |
| `npm run format`     | Prettier                   |
| `npm run db:dev`     | Local PostgreSQL           |
| `npm run db:migrate` | Create a migration (dev)   |
| `npm run db:deploy`  | Apply migrations           |
| `npm run db:seed`    | Add the Owner and samples  |
| `npm run db:studio`  | Browse the database        |

## Content

All projects, logos, quotes, team profiles and media are currently labelled samples, through each record's `isSample` field.
