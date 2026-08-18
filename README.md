# FateDrop Web

Standalone, maintainable source for the current FateDrop website. This project preserves the existing pages, navigation, visual system, responsive behaviour, animations, assets, copy and interactive phone demonstration while replacing the ChatGPT Sites-specific build layer with a conventional Next.js application.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 processing plus the existing handcrafted FateDrop stylesheet
- Next.js route handlers for beta lead capture, FateDrop ID authentication, billing and Discord linking
- FateDrop ID profiles with permanent member-since history
- Collector membership entitlement with Stripe-ready 14-day trials
- Discord OAuth + Premium-role sync foundation
- Authenticated FateDrop dashboard with auditable personal/network metrics
- Append-only activity, network-snapshot and Stripe webhook audit ledgers
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

The default example environment stores validated form submissions in `data/beta-leads.ndjson`, development FateDrop IDs/sessions in `data/accounts.json`, and local dashboard metric/audit records in `data/dashboard-metrics.json`. All are ignored by Git and must not be committed.

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
lib/                  Analytics, account/auth, membership, Stripe/Discord helpers and storage adapters
public/assets/        FateDrop artwork and current app reference images
tests/                Source-contract and storage tests
```

## Environment variables

The safe template is documented in `.env.example`. Core groups are:

| Group | Variables | Purpose |
| --- | --- | --- |
| Public URL | `NEXT_PUBLIC_SITE_URL` | Canonical deployment URL and OAuth/checkout redirects. |
| Leads | `FATEDROP_LEAD_STORE`, `FATEDROP_LEAD_FILE` | Beta enquiry storage. |
| Accounts | `FATEDROP_ACCOUNT_STORE`, `FATEDROP_ACCOUNT_FILE`, `DATABASE_URL` | FateDrop ID, sessions, membership and Discord-link storage. |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO`, `FATEDROP_TRIAL_REQUIRE_CARD` | Collector subscription checkout, trial and entitlement sync. |
| Discord | `NEXT_PUBLIC_DISCORD_ENABLED`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_PREMIUM_ROLE_ID` | Public community launch gate, Discord identity link and Premium role automation. |
| Dashboard metrics | `FATEDROP_METRIC_STORE`, `FATEDROP_METRIC_FILE`, `FATEDROP_METRICS_INGEST_SECRET` | Persistent personal activity, network snapshots, Stripe audit trail and FateDrop Cloud ingestion. |

Never commit `.env.local`, database exports, account files, session data or the local lead file.

## Lead database setup

For a hosted project:

1. Create a managed PostgreSQL database.
2. Run `database/postgres.sql` against it.
3. Set `FATEDROP_LEAD_STORE=postgres`.
4. Set `DATABASE_URL` as a protected hosting-provider environment variable.
5. Set `FATEDROP_ACCOUNT_STORE=postgres` if FateDrop IDs are enabled.
6. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.

Without configured hosted storage, write endpoints reject the operation rather than pretending data was saved.

## FateDrop ID + membership

See [docs/membership-foundation.md](docs/membership-foundation.md) for the account model, Stripe trial flow, Discord linking, production environment variables and app-entitlement handoff.

See [docs/dashboard-metrics.md](docs/dashboard-metrics.md) for the exact source/calculation behind every dashboard metric, ingestion contracts and the no-fake-data rule.

See [docs/change-log.md](docs/change-log.md) for the working file-by-file change log, including the separately held Wear the Signal design patch.

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
