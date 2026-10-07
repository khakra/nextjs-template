# Next.js SaaS Template

A production-shaped starting point for a SaaS app: authentication, subscriptions,
a database, transactional email, a blog and a docs site — wired together and
building green.

- **Auth** — BetterAuth with email OTP and Google OAuth
- **Admin** — user list and impersonation at `/dashboard/admin`
- **Payments** — Stripe subscriptions with per-plan credit allowances
- **Database** — Prisma 7 + PostgreSQL
- **Email** — React Email templates sent through AWS SES
- **Storage** — S3 / Cloudflare R2 uploads, downloads and presigned URLs
- **Content** — MDX blog and Markdown docs, with RSS and syntax highlighting
- **SEO** — sitemap, robots, JSON-LD, dynamic OG images
- **UI** — Tailwind v4, shadcn/ui, dark mode, Geist

## Quick start

You need **Node 20.9+** (CI uses 22), **pnpm 10**, and a **PostgreSQL** database.
No AWS or Stripe account is required to run it locally — see below.

```bash
# 1. Create your project from this template
pnpm create next-app --example https://github.com/khakra/nextjs-template my-app
cd my-app

# 2. Create your environment file
#    Next reads .env.development in dev, and the db scripts load the same file
cp .env.sample .env.development

# 3. Generate a real auth secret and put it in .env.development
pnpm dlx @better-auth/cli@latest secret

# 4. Point DATABASE_URL at your Postgres, then create the schema
pnpm db:migrate

# 5. Optional: add a demo user
pnpm db:seed

# 6. Run it
pnpm dev
```

Open http://localhost:3000.

At minimum `.env.development` needs `DATABASE_URL` and `BETTER_AUTH_SECRET`.
The app throws a clear error at startup if `DATABASE_URL` is missing.

### Signing in locally

Outside production the app **does not send email** — it prints the message body
to the terminal running `pnpm dev`. So to sign in: enter any email on `/login`,
then copy the six-digit code out of your terminal. No AWS account needed.

## Optional integrations

Each is inert until you configure it, so you can add them one at a time.

| Integration | What to set | Notes |
| --- | --- | --- |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_STARTER` / `_PRO` / `_EXPERT` | Run `pnpm stripe:listen` to forward webhooks locally. The app refuses to start if the secret key is set without a webhook secret, because subscriptions would silently fail. |
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | The Google button renders either way; it errors until these are set. |
| **AWS SES** | `EMAIL_FROM`, `AWS_SES_*` | Only used when `NODE_ENV=production`. |
| **S3 / R2 storage** | `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, optional `S3_PUBLIC_URL` | For R2, set `S3_ENDPOINT` to `https://<account-id>.r2.cloudflarestorage.com` and `S3_REGION` to `auto`. For AWS, leave the endpoint empty. Browser uploads need a CORS rule on the bucket that allows `PUT` from your app's origin. |

Plans, prices and credit allowances are defined once in `src/lib/plans.ts` —
both the pricing page and the Stripe config read from it.

## File storage

`src/lib/storage.ts` wraps the AWS SDK for any S3-compatible bucket: AWS S3,
Cloudflare R2, MinIO and others. Use it from server code only (server
components, server actions, route handlers).

```ts
import { createFileKey, getDownloadUrl, getUploadUrl } from "@/lib/storage";

// Server: after checking the session, sign a direct-to-bucket upload
const key = createFileKey(file.name, "avatars", session.user.id);
const { url } = await getUploadUrl(key, { contentType: file.type });

// Browser: upload straight to the bucket, skipping your server's body limit
await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

// Later: a temporary link to the private file
const downloadUrl = await getDownloadUrl(key);
```

It also has `uploadFile`, `getFile`, `getFileInfo`, `fileExists`, `listFiles`,
`copyFile`, `moveFile`, `deleteFile`, `deleteFiles`, `deleteFolder` and
`getPublicUrl`. Create keys on the server with `createFileKey`. Never accept a
key from the client.

## Admin dashboard

`/dashboard/admin` lists every user with email search and pagination. From there
an admin can **impersonate** any non-admin user to see the app as they do. A
banner at the top of the dashboard shows who you are impersonating and has a
**Stop impersonating** button that returns you to your own session.
Impersonation sessions expire after an hour.

Admins are users whose `role` is `admin`. There is no env var or UI for this, so
promote someone directly in the database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

Users can't change their own role. Admins can't impersonate other admins.
Everyone else gets a 404 at `/dashboard/admin`. This uses BetterAuth's
[admin plugin](https://better-auth.com/docs/plugins/admin), which also has ban,
role and session APIs on `authClient.admin` that you can build on.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` / `pnpm format` | Ultracite (Biome) check and autofix |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate` | Create and apply a migration (dev) |
| `pnpm db:migrate:prod` | Apply migrations (production) |
| `pnpm db:seed` | Seed a demo user |
| `pnpm stripe:listen` | Forward Stripe webhooks to the local app |

CI runs lint, typecheck and build on every push and pull request.

## Before you launch

This template ships with placeholder content. Replace it:

- **Branding** — `NEXT_PUBLIC_PROJECT_NAME` covers most of it, but `Acme Inc.` in
  `src/components/app-sidebar.tsx` and the GitHub link in
  `src/components/site-header.tsx` are hardcoded.
- **Marketing copy** — `src/components/{hero,feature,cta,stats}.tsx` are lorem
  ipsum, and the figures in `stats.tsx` are invented.
- **Pricing** — the tiers in `src/lib/plans.ts` are examples.
- **Legal** — `src/app/(legal)/*` contain `[DATE]` and `[CONTACT EMAIL]`
  placeholders and no governing-law clause. They are linked from the signup
  consent checkbox, so they matter. Have a lawyer look at them.
- **Content** — the sample posts in `src/app/blog/posts/` and the docs in
  `src/app/docs/content/` ship into your sitemap and RSS feed.
- **Dashboard demo data** — `src/app/dashboard/data.json` and the chart and card
  components are shadcn's example data.
- **Nav and footer** — `src/lib/nav.ts` and `src/components/footer.tsx`, where
  most links point at `#`.

Before going to production, also set a real `BETTER_AUTH_SECRET` (the one in
`.env.sample` is a placeholder published in this repo), point `DATABASE_URL` at a
connection pooler, and review the rate limiting in `src/lib/auth.ts` — the
defaults are in-memory and do not hold across multiple instances.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/khakra/nextjs-template&project-name=my-app&repository-name=my-app&env=DATABASE_URL,BETTER_AUTH_SECRET,BETTER_AUTH_URL,NEXT_PUBLIC_PROJECT_NAME,NEXT_PUBLIC_BASE_URL,NEXT_PUBLIC_META_DESCRIPTION&envDescription=Database%20connection%20string%2C%20auth%20secret%20and%20public%20app%20config&envLink=https://github.com/khakra/nextjs-template/blob/main/.env.sample)

The build itself needs no database, so a deploy will succeed even with the
environment misconfigured — the app then fails at runtime on the first auth
request. Set the variables above when prompted.

Run `pnpm db:migrate:prod` against your production database before the first
real request.

## Contributing and conventions

Project structure, architecture notes and coding conventions live in
[AGENTS.md](./AGENTS.md), which is also what AI coding agents read.

## License

MIT — see [LICENSE](./LICENSE).
