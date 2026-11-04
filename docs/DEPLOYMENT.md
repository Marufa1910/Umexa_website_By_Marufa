# Deploying UMEXA

Target: Vercel with managed PostgreSQL. Nothing here has been run against a real host yet, so check each step as you go.

## Before you start

You need:

- This code in a private GitHub repository
- A Vercel account
- A managed PostgreSQL database, such as Neon or Supabase
- A Cloudinary account, for the media library
- Your domain, if you have one

## 1. Create the database

Create a PostgreSQL database and copy its connection string. Many hosts offer two strings:

- **Pooled:** use this for `DATABASE_URL` on Vercel.
- **Direct:** migrations may need this. If `prisma migrate deploy` fails on the pooled string, run migrations using the direct one.

## 2. Create the Vercel project

Import the GitHub repository. Vercel reads `vercel.json`, which runs migrations and then builds:

```bash
prisma migrate deploy && next build
```

The database must be reachable during the build, because public pages are prerendered from it.

## 3. Set environment variables

Set these in Vercel for Production, before the first deploy:

| Variable                                                               | Value                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                                                         | Your database connection string                                          |
| `BETTER_AUTH_SECRET`                                                   | A new random value of at least 32 characters. Never reuse the local one. |
| `BETTER_AUTH_URL`                                                      | `https://your-domain.com`                                                |
| `NEXT_PUBLIC_SITE_URL`                                                 | `https://your-domain.com`                                                |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard                                           |

The server refuses to start if `DATABASE_URL` or `BETTER_AUTH_SECRET` is missing or too weak. That is deliberate.

To generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Deploy, then add the first Owner

The first deploy works on an empty database: the site shows its fixed copy and hides empty sections.

To create the Owner account, run the seed once from your computer, using the production values. **The seed also adds the labelled sample content.** Delete it in the admin before launch, or replace it with real work.

Use a strong, unique `SEED_OWNER_PASSWORD`, and change it after first sign-in under **My account**.

## 5. Check the live site

- [ ] `/` loads, and every page in the menu opens
- [ ] Sign in at `/admin/login`
- [ ] Browser dev tools: the session cookie is named `__Secure-...` and is marked Secure and HttpOnly
- [ ] Send a test inquiry, then find it under **Inquiries**, then delete the test data
- [ ] Upload an image and a video in **Media**, use them on a draft project, then delete them
- [ ] Publish a change and confirm it appears on the public page
- [ ] `/robots.txt` and `/sitemap.xml` show your real domain
- [ ] Run Lighthouse on the live URL
- [ ] Test on a real phone, and in Safari and Firefox

## Before going public

- [ ] Replace or delete all sample projects, clients, testimonials, team profiles and media
- [ ] Add real contact details under **Settings**
- [ ] Have a lawyer review `/privacy-policy` and `/terms`, which are marked as drafts
- [ ] Confirm the draft copy, budget bands and role rules listed in `DEVELOPMENT_LOG.md`

## Changing the database later

1. Change `prisma/schema.prisma`.
2. Run `npm run db:migrate` locally, and commit the new folder in `prisma/migrations`.
3. Deploy. The build applies it.
