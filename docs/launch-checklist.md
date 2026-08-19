# FateDrop Web Launch Checklist

_Last reviewed: 19 August 2026_

This checklist is intentionally conservative. A green build is necessary but is not by itself permission to publish commercial claims or enable integrations whose production credentials have not been verified.

## 1. Product truth

- [ ] `docs/fatedrop-product-truth.md` reviewed against the current app/Cloud/Discord state.
- [ ] Public lifecycle uses **Echo / Manifested / Vanished**; `Whisper` is not promoted as a headline consumer state.
- [ ] FateFind = saved hunt; FateMatch = successful qualifying result.
- [ ] Universal Wishlist remains distinct from FateFind.
- [ ] FateWindow / FateScore / FateFair remain HOLD/PLANNED unless a later evidence review promotes them.
- [ ] Demo/static/event/storefront data is labelled as such.

## 2. Required production environment

### Canonical URL

Set:

`NEXT_PUBLIC_SITE_URL=https://fatedrop.co.uk`

until the custom domain is active, the code safely falls back to the current Worker URL for production metadata. The custom domain should become canonical before SEO promotion.

### Signal Engine

Set or verify:

`FATEDROP_SIGNAL_ENGINE_URL=https://fatedrop-cloud-production.up.railway.app`

Search and True Price depend on the public `/api/catalogue`, `/api/true-price` and `/api/status` endpoints.

### PostgreSQL / Neon

Production should use persistent PostgreSQL rather than local files:

- `FATEDROP_LEAD_STORE=postgres`
- `FATEDROP_ACCOUNT_STORE=postgres`
- `FATEDROP_METRIC_STORE=postgres`
- `DATABASE_URL=<protected Neon connection string>`

Run the current `database/postgres.sql` against the intended production database before enabling writes.

### Cloud → website metric publishing

Set a long random secret in the website environment:

`FATEDROP_METRICS_INGEST_SECRET=<secret>`

The matching Cloud website publisher must use the same secret. Never commit or paste the value into documentation.

### Stripe

Only advertise paid checkout/trials as live when all required values are verified:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PLUS`
- `STRIPE_PRICE_PRO`
- `FATEDROP_TRIAL_REQUIRE_CARD`

The final Plus-vs-Pro capability split remains an owner decision. Do not create marketing differentiation that the entitlement model does not enforce.

### Discord

Keep:

`NEXT_PUBLIC_DISCORD_ENABLED=false`

until the actual community integration is ready. When enabling, also verify:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_PREMIUM_ROLE_ID`
- OAuth callback exactly matches `<NEXT_PUBLIC_SITE_URL>/api/discord/callback`

## 3. Required validation

Run:

```bash
npm ci
npm run verify
npx opennextjs-cloudflare build
```

Required result:

- ESLint green
- TypeScript green
- automated tests green
- Next.js production build green
- OpenNext Cloudflare build green

Do not merge a branch whose final head has not passed both the normal verification and OpenNext build after its last code edit.

## 4. Runtime smoke test

Before deployment/merge approval verify representative routes in an OpenNext preview or production-like environment:

Public:

- `/`
- `/collectors`
- `/businesses`
- `/events`
- `/subscriptions`
- `/trust`
- `/privacy`
- `/terms`

Account/dashboard:

- account create/login/logout
- `/dashboard`
- `/dashboard/search?q=elite+trainer+box`
- `/dashboard/true-price?q=elite+trainer+box`
- `/dashboard/watchlist`
- `/dashboard/alerts`
- `/dashboard/stores`
- `/dashboard/local-radar`
- `/dashboard/events`
- `/dashboard/avatar`
- `/dashboard/discord`
- `/dashboard/membership`

API:

- `/api/network-status`
- `/api/events`
- authenticated account/profile routes
- FateFind create/list route
- Stripe/Discord routes only when configured

## 5. Evidence / pricing checks

- [ ] Unknown delivery never renders as free.
- [ ] Unknown delivery never produces a delivered True Price.
- [ ] Unknown RRP never gets fabricated from a reseller price.
- [ ] Compare Offers uses transparent objective ordering.
- [ ] Cloud-monitored retailer status is not presented as partner/Verified status.
- [ ] Direct Shopify storefront lab feeds are not presented as the complete FateDrop network.
- [ ] Retailer checkout remains final purchase confirmation.

## 6. Privacy / security

- [ ] Production secrets exist only in protected environment variables.
- [ ] No `.env.local`, account JSON, lead files or database exports are committed.
- [ ] Privacy notice receives final UK legal/data-controller/contact/retention review before scaled public acquisition.
- [ ] Security headers are present in production responses.
- [ ] `/api`, `/account` and `/dashboard` remain excluded from crawlers.
- [ ] Local Radar uses location only on demand; no unadvertised coordinate persistence is introduced.

## 7. Companion

The current persistent loadout is safe to launch as a foundation if desired. The real 3D launch additionally requires:

- production GLB character asset
- production GLB droid asset
- approved animation clip names/states
- performance budget for mobile/WebGL
- fallback behaviour when WebGL/model loading fails
- accessible reduced-motion behaviour
- cross-platform mapping to the same account loadout schema

`lib/companion-contract.ts` is the web-side renderer boundary. Do not redesign account persistence merely to insert the final model.

## 8. Events

`/api/events` now provides the canonical website migration path from persisted Cloud `upcomingEvents` data. The existing dashboard static-sourced directory must remain labelled static until Cloud ingestion actually publishes events.

## 9. Owner decisions that do not belong in an autonomous code guess

- final Plus vs Pro pricing and capability split
- final FateScore policy and inputs
- whether/when FateWindow returns from HOLD
- Universal Wishlist persistence/notification rules across app and web
- final retailer paid-plan structure
- final 3D Companion cosmetic/progression economy
- final Event Vendor Mode commercial rules
- final UK legal text
- production deployment approval
