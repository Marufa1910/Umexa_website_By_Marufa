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

Create a PostgreSQL database and copy two connection strings:

- **Pooled** (on Neon, the host contains `-pooler`): this is `DATABASE_URL`.
- **Direct:** this is `DIRECT_URL`, used only for migrations.

Put both in `.env.deploy`, with your Owner email. This file is not in git. Don't share it.

## 2. Set up the database, before the first deploy

Pages are prerendered from the database during the build, so it needs its tables and content first. This runs the migrations, then creates the Owner account and the labelled sample content:

```bash
npx dotenv -e .env.deploy -- npx prisma migrate deploy
```

```bash
npx dotenv -e .env.deploy -- npx prisma db seed
```

## 3. Create the Vercel project

Import the GitHub repository. `vercel.json` runs any new migrations and then builds. Before deploying, add these environment variables:

| Variable             | Value                                          |
| -------------------- | ---------------------------------------------- |
| `DATABASE_URL`       | The pooled string                              |
| `DIRECT_URL`         | The direct string                              |
| `BETTER_AUTH_SECRET` | From `.env.deploy`. Never reuse the local one. |

The site uses its Vercel address automatically. The server refuses to start if a required value is missing or too weak. That is deliberate.

## 4. Add later

- **Custom domain:** add it in Vercel, then set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com`, and redeploy.
- **Cloudinary:** set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`, and redeploy.

Sign in, and change the Owner password under **My account**. Delete the sample content in the admin before going public, or replace it with real work.

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
