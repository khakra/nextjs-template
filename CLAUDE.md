# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- **Start dev server**: `pnpm dev` (uses Turbopack)
- **Build production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint code**: `pnpm lint` (uses Biome)
- **Format code**: `pnpm format` (uses Biome)

### Database (Prisma + PostgreSQL)
- **Generate Prisma client**: `pnpm postinstall` (runs automatically)
- **Run migrations (dev)**: `pnpm db:migrate`
- **Deploy migrations (prod)**: `pnpm db:migrate:prod`
- **Push schema to dev DB**: `pnpm dbpush:dev`
- **Push schema to prod DB**: `pnpm dbpush:prod`
- **Seed database**: `pnpm db:seed`
- **Note**: Prisma client is generated to `./generated/prisma` (custom output path)
- **Configuration**: `prisma.config.ts` defines schema paths and migration settings

### Stripe
- **Listen to webhooks locally**: `pnpm stripe:listen`

## Architecture Overview

### Authentication (BetterAuth)
- **Server config**: `src/lib/auth.ts` - Main BetterAuth configuration with Prisma adapter
- **Client config**: `src/lib/auth-client.ts` - React client with hooks like `useSubscription()`
- **API routes**: `src/app/(auth)/api/auth/[...all]/route.ts` - Catch-all auth endpoints
- **Plugins enabled**:
  - Email OTP (via AWS SES)
  - Stripe integration (subscriptions)
  - Email Harmony
  - Google OAuth
- **Auth protection**: Dashboard layout (`src/app/dashboard/layout.tsx`) checks session and redirects to `/login` if not authenticated
- **User model**: Extended with `credits` (default: 4) and `usage` (default: 0) fields

### Database (Prisma + PostgreSQL)
- **Schema**: `prisma/schema.prisma`
- **Models**: User, Session, Account, Verification, Subscription
- **Connection**: PostgreSQL database
- **Client location**: Generated to `./generated/prisma` (imported from `@/lib/prisma`)
- **Adapter**: BetterAuth uses Prisma adapter configured for PostgreSQL compatibility mode

### Stripe Integration
- **Config**: Defined in `src/lib/auth.ts` within BetterAuth setup
- **Plans**: Three tiers (starter/pro/expert) with different credit limits
- **Price IDs**: Switch between dev/prod based on `NODE_ENV`
- **Utility functions**: `src/lib/stripe.ts`

### Email (AWS SES)
- **Config**: `src/lib/mail.ts`
- **Templates**: React Email components in `src/emails/`
- **OTP emails**: Sent via `sendVerificationOTP` in auth config

### File Storage (AWS S3)
- **Config**: `src/lib/s3.ts`
- **Environment**: Requires S3 credentials and bucket configuration

### Blog System
- **Content**: MDX files in `src/app/blog/posts/`
- **Parser**: `src/app/blog/utils.ts` - Reads MDX files with `gray-matter`; frontmatter is validated with Zod at build time (invalid frontmatter fails the build)
- **Frontmatter fields**: title, description, publishedAt (required); updatedAt, image ({src, alt}), tags, canonical, draft, noindex, author (optional)
- **Drafts**: Posts with `draft: true` are excluded from listings, RSS, and sitemap
- **Related posts**: Computed from shared tags (`getRelatedBlogPosts`), shown below each post
- **SEO**: Each post emits BreadcrumbList + BlogPosting JSON-LD, canonical URL, OG/Twitter tags
- **Rendering**: Uses `next-mdx-remote` with `remark-gfm`; custom components in `src/components/mdx.tsx` (incl. `YouTubeEmbed`)
- **RSS feed**: Auto-generated at `/rss` route
- **Syntax highlighting**: Included via `sugar-high`

### Docs System
- **Content**: Markdown files in `src/app/docs/content/` (guides in `content/guides/`)
- **Frontmatter fields**: title, description
- **Navigation**: New pages must be registered in `src/app/docs/config.ts` (drives sidebar, breadcrumbs, guides index, and sitemap)
- **Parser**: `src/lib/mdx-utils.ts` - Shared frontmatter/heading utilities; `src/app/docs/utils.ts` reads doc pages
- **Layout**: `src/app/docs/layout.tsx` - Sidebar + mobile nav; per-page table of contents from h2/h3 headings
- **Routes**: `/docs`, `/docs/[slug]`, `/docs/guides`, `/docs/guides/[slug]`

### UI Components
- **Shadcn/ui**: Component library in `src/components/ui/`
- **Config**: `components.json`
- **Styling**: Tailwind v4 with custom theme
- **Icons**: Heroicons, Lucide React, Tabler Icons
- **Dark mode**: `next-themes` with ThemeProvider in root layout
- **Code quality**: Biome (linting/formatting) configured in `biome.json`

### Path Aliases
- `@/*` → `./src/*`
- `@/prisma/*` → `./prisma/*`
- `@/generated/*` → `./generated/*`

## Environment Variables

See `.env.sample` for complete list. Key variables:

**App Config**:
- `NEXT_PUBLIC_PROJECT_NAME`: App name displayed in metadata
- `NEXT_PUBLIC_BASE_URL`: Base URL for the app
- `NEXT_PUBLIC_META_DESCRIPTION`: SEO description
- `NEXT_PUBLIC_GOOGLE_ANALYTICS`: GA tracking ID (optional)

**Database**:
- `DATABASE_URL`: PostgreSQL connection string

**Auth (BetterAuth)**:
- `BETTER_AUTH_SECRET`: Generate with `pnpx @better-auth/cli@latest secret`
- `BETTER_AUTH_URL`: Auth callback URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth credentials

**AWS Services**:
- `AWS_SES_*`: Email sending via SES
- `AWS_S3_*`: File storage in S3
- `NEXT_PUBLIC_AWS_S3_BUCKET_URL`: Public S3 URL

**Stripe**:
- `STRIPE_SECRET_KEY`: Stripe API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret

## Key Architectural Patterns

### Route Groups
- `(auth)`: Contains auth-related routes, including API routes
- Protected routes (e.g., `/dashboard`) use server-side session checks in layout

### Server-Side Auth
- Use `auth.api.getSession({ headers: await headers() })` in server components
- Check session in layouts to protect entire route groups
- Redirect to `/login` if unauthenticated

### Client-Side Auth
- Import `authClient` from `@/lib/auth-client`
- Use `useSubscription()` hook for subscription state
- Type exports: `Session` and `User` types available from auth-client

### Subscription Flow
1. BetterAuth Stripe plugin handles checkout session creation
2. Webhooks update subscription status in database
3. Client fetches active subscriptions via `authClient.subscription.list()`
4. Plans have associated credit limits enforced server-side

### MDX Blog Content
- Place `.mdx` files in `src/app/blog/posts/`
- Include YAML frontmatter with required fields
- Use `getBlogPosts()` utility to fetch all posts
- Dynamic routes in `[slug]` folder handle individual posts
