# FateDrop Web

Standalone, maintainable source for the current FateDrop website. This project preserves the existing pages, navigation, visual system, responsive behaviour, animations, assets, copy and interactive phone demonstration while replacing the ChatGPT Sites-specific build layer with a conventional Next.js application.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 processing plus the existing handcrafted FateDrop stylesheet
- Next.js route handler for beta lead capture
- Local-file storage for development
- Optional managed PostgreSQL storage for hosted deployments

## Requirements

- Node.js 20.9 or newer; Node 22 is recommended
- npm 10 or newer

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The default example environment stores validated form submissions in `data/beta-leads.ndjson`. That file is ignored by Git and must not be committed.

## Quality checks

```bash
npm run verify
```

This runs linting, TypeScript checking, source and lead-storage tests, and a full production build.

## Project structure

```text
app/                  Routes, layouts, metadata and API handlers
components/           Reusable FateDrop interface components
database/             PostgreSQL schema and retained Cloudflare D1 schema
docs/                 Lead-storage and Sites migration notes
lib/                  Analytics event helper, site data and storage adapter
public/assets/        FateDrop artwork and current app reference images
tests/                Source-contract and storage tests
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical deployment URL used by metadata, robots and sitemap. |
| `FATEDROP_LEAD_STORE` | `file` for local development, `postgres` for managed hosted storage, or omitted/`disabled` to reject submissions honestly. |
| `FATEDROP_LEAD_FILE` | Local NDJSON path used by `file` mode. |
| `DATABASE_URL` | PostgreSQL connection string used only by `postgres` mode. |

Never commit `.env.local`, database exports or the local lead file.

## Lead database setup

For a hosted project:

1. Create a managed PostgreSQL database.
2. Run `database/postgres.sql` against it.
3. Set `FATEDROP_LEAD_STORE=postgres`.
4. Set `DATABASE_URL` as a protected hosting-provider environment variable.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.

Without configured hosted storage, the form returns a `503` and explicitly says nothing was saved.

## GitHub

```bash
git init
git add .
git commit -m "Initial FateDrop website source"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/fatedrop-web.git
git push -u origin main
```

Review the staged files before the first commit—particularly environment files and anything under `data/`. Git is a marvellous servant and an extremely efficient accomplice.

## Deploying

### Vercel

Import the GitHub repository as a Next.js project. Vercel detects the framework and uses `npm run build`; add the production environment variables before enabling the live forms.

Official guide: <https://vercel.com/docs/frameworks/full-stack/nextjs>

### Cloudflare Workers

Cloudflare supports existing Next.js projects through its current Next.js/OpenNext workflow. Run the adapter's production preview before publishing because the deployed runtime differs from local Node.js development.

Official guide: <https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/>

If reusing Cloudflare D1 rather than PostgreSQL, use `database/cloudflare-d1.sql` and add a D1 implementation to `lib/lead-storage.ts`. The former Sites-managed binding is not available outside that project.

## Migration details

See [docs/sites-migration.md](docs/sites-migration.md) for the exact Sites-specific pieces removed or replaced. The existing public ChatGPT Sites deployment is not altered by this repository export.
