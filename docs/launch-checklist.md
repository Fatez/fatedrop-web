# FateDrop Web Launch Checklist

_Last reviewed: 22 August 2026_

This checklist is intentionally conservative. A green build is necessary but is not by itself permission to publish commercial claims or enable integrations whose production credentials have not been verified.

## 1. Product truth

- [ ] `docs/fatedrop-product-truth.md` reviewed against the current app/Cloud/Discord state.
- [x] Public lifecycle uses **Whisper → Echo → Manifested → Vanished** with the final meanings preserved in Web.
- [x] Whisper = product/catalogue/metadata movement; stock not confirmed.
- [x] Echo = queue/traffic/security/access readiness; stock not confirmed.
- [x] Manifested = confirmed purchasable availability.
- [x] Vanished = previously confirmed availability no longer observed/verified.
- [x] FateFind = saved hunt; FateMatch = successful qualifying result.
- [x] Universal Wishlist remains distinct from FateFind.
- [x] Drop Pulse remains contextual evidence rather than a fifth lifecycle state.
- [x] FateWindow / FateScore / FateFair remain HOLD/PLANNED unless a later evidence review promotes them.
- [x] Demo/static/event/storefront data is labelled as such in current Web source/tests.

The checked items above are Web source-contract results. They do not by themselves certify app/Cloud/Discord deployment parity.

## 2. Required production environment

### Canonical URL

Set:

`NEXT_PUBLIC_SITE_URL=https://fatedrop.co.uk`

Until the custom domain is active, the code safely falls back to the current Worker URL for production metadata. The custom domain should become canonical before SEO promotion.

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

Run the existing production schema plus reviewed additive migrations against the intended database before enabling dependent writes. Relevant migrations include:

- `database/2026-08-18-avatar-system.sql` — historical storage table now used only for the selected Koru & Friends companion plus retained compatibility data.
- `database/2026-08-19-user-preferences.sql` — Universal Wishlist + shared notification preference tables.

Do not silently apply production migrations from a build/deploy job.

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

Run after the last code/asset edit:

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

Before deployment/merge approval verify representative routes in an OpenNext preview or production-like environment.

Public:

- `/`
- `/collectors`
- `/businesses`
- `/events`
- `/trust`
- `/about`
- `/demo`
- `/merch`
- `/subscriptions`
- `/privacy`
- `/terms`
- `/cookies`

Account/dashboard:

- account create/login/logout
- `/dashboard`
- `/dashboard/search?q=elite+trainer+box`
- `/dashboard/true-price?q=elite+trainer+box`
- `/dashboard/watchlist`
- `/dashboard/wishlist`
- `/dashboard/alerts`
- `/dashboard/notifications`
- `/dashboard/stores`
- `/dashboard/local-radar`
- `/dashboard/events`
- `/dashboard/avatar`
- `/dashboard/discord`
- `/dashboard/membership`

Companion runtime:

- Aeris, Nyxen and Solix load from their registered GLBs;
- their sibling JPEG textures resolve correctly;
- the large companion preview renders without blocking the page;
- Koru retains its approved 2D fallback until the correct GLB is verified;
- Fenn remains an honest placeholder until the verified optimized pack is committed/registered;
- WebGL/model failure falls back rather than taking down account functionality;
- selected companion persists independently from profile picture data.

API:

- `/api/network-status`
- `/api/events`
- `/api/wishlist`
- `/api/notification-preferences`
- authenticated account/profile/companion routes
- FateFind create/list route
- Stripe/Discord routes only when configured

## 5. Evidence / pricing checks

These source-level rules are guarded by automated tests:

- [x] Unknown delivery never renders as free.
- [x] Unknown delivery never produces a delivered True Price.
- [x] Unknown RRP never gets fabricated from a reseller price.
- [x] Compare Offers uses transparent objective ordering rather than a paid trust ranking.
- [x] Cloud-monitored retailer status is not presented as partner/Verified status.
- [x] Direct Shopify storefront lab feeds are not presented as the complete FateDrop network.
- [x] Retailer checkout remains final purchase confirmation.

Production data quality and live endpoint behaviour still require runtime smoke.

## 6. Privacy / security

- [ ] Production secrets exist only in protected environment variables.
- [x] Repository guards reject committed `.env.local`, account JSON, lead files and database exports.
- [ ] Privacy notice receives final UK legal/data-controller/contact/retention review before scaled public acquisition.
- [ ] Security headers are confirmed in deployed production responses.
- [x] `/api`, `/account` and `/dashboard` crawler/private-route controls exist in source.
- [x] Local Radar remains user-triggered and no new unadvertised coordinate persistence is introduced by the current Web pass.
- [ ] Wishlist and notification preference records are covered by final retention/deletion policy before scaled launch.

## 7. Koru & Friends companion system

The active companion roster is fixed to:

1. Koru
2. Fenn
3. Aeris
4. Nyxen
5. Solix

Koru remains FateDrop's mascot and signal voice regardless of the collector's selected personal companion. Kael and Nyra are archive-only references and must not appear as active selector slots.

The current Web renderer supports both an approved single GLB and a verified reaction-specific GLB pack behind the same five-slot contract. A missing model must render an honest fallback/placeholder.

Current asset state:

- Koru — approved 2D fallback active; correct production GLB still to be recovered/verified.
- Fenn — real source pack verified; web-optimized binaries prepared, final repository handoff still required.
- Aeris — GLB registered.
- Nyxen — GLB registered.
- Solix — GLB registered.

Before an individual 3D companion is treated as production-ready, verify:

- approved GLB(s) at that character's stable path from `docs/companion-model-slots.md`;
- the model is registered only in `lib/companion-contract.ts`;
- approved animation clip names/states are verified against the real asset where animation playback is claimed;
- Whisper/Echo/Manifested/Vanished meanings remain unchanged by animation personality;
- FateMatch reaction remains a successful-hunt treatment rather than a fifth lifecycle state;
- performance budget is acceptable on target browsers/devices;
- fallback behaviour works when WebGL/model loading fails;
- accessible reduced-motion behaviour works;
- account selection persists without overwriting profile data;
- mobile reconciliation maps to the same five IDs before a mobile release claims companion parity.

Do **not** add a separate Droid, Scout, TCG-themed or floating-familiar model slot. The retired layered-avatar/sprite system must stay absent from the active tree.

## 8. Exact public artwork gate

The final public visual approval is separate from code/CI approval.

Current branch proof:

- [x] approved Koru hero PNG is committed at the final stable homepage path;
- [x] approved Koru & Friends section PNG is committed at its final stable path;
- [x] final Collectors / Retailers / Events / Trust / About market heroes are direct PNG assets;
- [x] no AVIF/WebP workaround is relied on for the approved market-story hero boundary after PNG handoff;
- [x] current desktop public composition has been visually approved;
- [ ] mobile crop and responsive public-page composition are visually checked at final release head;
- [x] interactive phone remains on the dedicated `/demo` page rather than returning to the homepage hero;
- [ ] no production merge occurs until visual approval is explicit for the **complete final website release candidate**.

## 9. Events

`/api/events` provides the canonical website migration path from persisted Cloud `upcomingEvents` data. The existing dashboard static-sourced directory must remain labelled static until Cloud ingestion actually publishes events.

## 10. Owner decisions that do not belong in an autonomous code guess

- final Plus vs Pro pricing and capability split
- final FateScore policy and inputs
- whether/when FateWindow returns from HOLD
- final retailer paid-plan structure
- final Koru & Friends cosmetic/progression economy
- final Event Vendor Mode commercial rules
- final UK legal text / data retention periods
- production database migration approval
- production deployment approval
