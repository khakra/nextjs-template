# Repository Guidelines

## Project Structure & Module Organization

- `src/app`: Next.js App Router pages, layouts, and metadata endpoints (`sitemap.ts`, `robots.ts`, RSS, OG image route).
- `src/components`: shared UI and feature components. Base UI primitives live in `src/components/ui`.
- `src/lib`: integrations and helpers (auth, Prisma, Stripe, S3, SES, utilities).
- `src/emails`: transactional email templates.
- `prisma`: database schema, migrations, and service helpers.
- `public`: static assets.
- `generated`: generated artifacts; avoid manual edits unless regeneration is not possible.

## Build, Test, and Development Commands

- `pnpm dev`: start local development server with Turbopack.
- `pnpm build`: create a production build (primary compile check).
- `pnpm start`: run the production build locally.
- `pnpm lint`: run Ultracite/Biome checks.
- `pnpm format`: apply automatic formatting and safe fixes.
- `pnpm db:migrate` / `pnpm db:migrate:prod`: run Prisma migrations with `.env.development` or `.env.production`.
- `pnpm db:seed`: seed development data.
- `pnpm stripe:listen`: forward Stripe webhooks to local auth webhook endpoint.

## Coding Style & Naming Conventions

- Stack: TypeScript (`strict: true`), React 19, Next.js App Router.
- Formatting: 2-space indentation, spaces (not tabs), Biome via Ultracite.
- Use path aliases where helpful: `@/*`, `@/prisma/*`, `@/generated/*`.
- File names are typically kebab-case (for example, `email-auth-form.tsx`); React component exports remain PascalCase.
- Hook files/functions should use the `use-` / `useX` pattern.

## Testing Guidelines

- No dedicated automated test suite is configured yet.
- Required pre-PR checks: `pnpm lint` and `pnpm build`.
- For auth, billing, or DB changes, include manual test steps and outcomes in the PR.
- If adding tests, prefer `*.test.ts`/`*.test.tsx` near the feature or in a local `__tests__` folder.

## Commit & Pull Request Guidelines

- Keep commits focused and written in imperative style (for example, `fix redirect after login issue`).
- For new features, follow `feat: summary of the feature` pattern.
- For dependency updates, follow `Bump <package> from <old> to <new>` when applicable.
- PRs should include: concise summary, linked issue (if any), screenshots for UI changes, and notes on env/schema/migration impact.
