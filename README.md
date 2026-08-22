# FateDrop Web

Standalone, maintainable source for the FateDrop website and authenticated collector dashboard. The project preserves the established premium visual system while using a conventional Next.js application and Cloudflare/OpenNext deployment path.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4 processing plus the existing handcrafted FateDrop stylesheet
- Next.js route handlers for beta lead capture, FateDrop ID authentication, billing and Discord linking
- FateDrop ID profiles with permanent member-since history
- Koru & Friends companion selection with five stable character slots: Koru, Fenn, Aeris, Nyxen and Solix
- Collector membership entitlement with Stripe-ready 14-day trials
- Discord OAuth + Premium-role sync foundation
- Authenticated FateDrop dashboard with auditable personal/network metrics
- Canonical network Search backed by the FateDrop Signal Engine catalogue API
- Measured public network proof backed by persisted Cloud snapshots rather than hard-coded counters
- Append-only activity, network-snapshot and Stripe webhook audit ledgers
- Local-file storage for development
- Optional managed PostgreSQL storage for hosted deployments

## Product truth

FateDrop evolves quickly, so marketing copy must not become the product specification by accident.

- `docs/fatedrop-product-truth.md` is the canonical feature/status/wording reference.
- `docs/fatedrop-network-audit.md` records the current cross-surface consistency audit and deferred product decisions.
- `docs/companion-model-slots.md` defines the active five-character Koru & Friends roster and the stable GLB handoff paths.

Features should be described as **LIVE**, **BETA**, **DEMO**, **FOUNDATION** or **PLANNED** according to the deployed evidence. Never substitute stale sample metrics or optimistic copy for measured state.

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

This runs linting, TypeScript checking, source/storage tests and a full Next.js production build. Pull-request CI also runs an OpenNext Cloudflare build so Worker compatibility is checked before merge.

## Project structure

```text
app/                  Routes, layouts, metadata and API handlers
components/           Reusable FateDrop interface components
database/             PostgreSQL schema and retained Cloudflare D1 schema
docs/                 Product truth, audits, storage and migration notes
lib/                  Network client, analytics, auth, membership and storage adapters
public/assets/        FateDrop artwork, Koru & Friends assets and app reference assets
tests/                Product-truth, source-contract and storage tests
```

## Environment variables

The safe template is documented in `.env.example`. Core groups are:

| Group | Variables | Purpose |
| --- | --- | --- |
| Public URL | `NEXT_PUBLIC_SITE_URL` | Canonical deployment URL and OAuth/checkout redirects. Production safely falls back to the current Worker URL until the custom domain becomes canonical. |
| Signal Engine | `FATEDROP_SIGNAL_ENGINE_URL` | Canonical FateDrop Cloud base URL for server-side network Search. |
| Leads | `FATEDROP_LEAD_STORE`, `FATEDROP_LEAD_FILE` | Beta enquiry storage. |
| Accounts | `FATEDROP_ACCOUNT_STORE`, `FATEDROP_ACCOUNT_FILE`, `DATABASE_URL` | FateDrop ID, sessions, membership, companion choice and Discord-link storage. |
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

## FateDrop Cloud integration

The website and Cloud backend have different responsibilities:

- `Fatez/Fatedrop-Cloud` owns canonical retailer/product/offer observations, lifecycle signals and network snapshots.
- `fatedrop-web` owns the public/product experience, account/dashboard surfaces and persisted website metric ledger.
- Dashboard Search uses the Signal Engine `/api/catalogue` endpoint rather than a second search index.
- Public network proof reads the latest persisted network snapshot; if no measured snapshot exists, it reports unavailable state instead of falling back to old numbers.
- Existing direct Shopify storefront adapters are transitional laboratory integrations and should not be mistaken for the entire FateDrop network.

## Koru & Friends companion boundary

The active companion roster is deliberately limited to **Koru, Fenn, Aeris, Nyxen and Solix**. Koru remains FateDrop's mascot and signal voice regardless of the user's selected personal companion. Kael and Nyra are retained only as legacy/archive references and do not occupy active slots.

Each active character owns one stable character slot behind the shared renderer contract. A character can use one approved GLB or a verified reaction-specific GLB pack without creating extra companion identities. Registered assets render through the lightweight WebGL boundary; missing or failed assets use an honest fallback instead of breaking account functionality.

The current WebGL viewer renders the real model and texture plus restrained state presentation. Skeletal animation playback is not considered shipped merely because animation clips exist in a source GLB; clip playback must be separately implemented and visually verified before it is advertised as active. Reduced-motion preference produces a static real 3D frame instead of a continuous presentation loop.

All companions share the same Whisper → Echo → Manifested → Vanished evidence contract. Character personality may change presentation or a verified animation later; it must never change the meaning or evidence behind the signal. FateMatch remains a successful hunt result rather than a fifth lifecycle state.

See [docs/companion-model-slots.md](docs/companion-model-slots.md) for the exact paths and registration process.

## FateDrop ID + membership

See [docs/membership-foundation.md](docs/membership-foundation.md) for the account model, Stripe trial flow, Discord linking, production environment variables and app-entitlement handoff.

See [docs/dashboard-metrics.md](docs/dashboard-metrics.md) for the exact source/calculation behind every dashboard metric, ingestion contracts and the no-fake-data rule.

See [docs/fatedrop-product-truth.md](docs/fatedrop-product-truth.md) for canonical terminology and feature status.

See [docs/fatedrop-network-audit.md](docs/fatedrop-network-audit.md) for the current consistency audit.

See [docs/change-log.md](docs/change-log.md) for the working file-by-file change log.

## GitHub

Changes intended for production should be developed on a branch and reviewed through a pull request. The verification workflow blocks silent regressions in linting, TypeScript, tests, Next.js production build and OpenNext build.

## Deploying

### Cloudflare Workers

The current production target is `https://fatedrop-web.fatedrop-web.workers.dev` and the repository is configured for OpenNext/Cloudflare Workers.

Useful local commands:

```bash
npm run preview
npm run upload
npm run deploy
```

`preview` is the safe runtime validation path. `upload` and `deploy` mutate Cloudflare and should only be run with explicit production authorisation.

Set production secrets/variables in Cloudflare rather than committing them. `NEXT_PUBLIC_SITE_URL` should move to the final custom HTTPS domain when that domain becomes canonical.

If reusing Cloudflare D1 rather than PostgreSQL, use `database/cloudflare-d1.sql` and add a D1 implementation to `lib/lead-storage.ts`. The former Sites-managed binding is not available outside that project.

## Migration details

See [docs/sites-migration.md](docs/sites-migration.md) for the exact Sites-specific pieces removed or replaced. The historical Sites build is not treated as the canonical source of product truth.
