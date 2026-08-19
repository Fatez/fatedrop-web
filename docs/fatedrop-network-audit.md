# FateDrop Network Consistency Audit

_Date: 19 August 2026_

Branch: `fatedrop-network-consistency-audit`

Scope: `Fatez/fatedrop-web` with read-only comparison against `Fatez/Fatedrop-Cloud`. The mobile app repository is deliberately out of scope because it is being worked on separately.

## Executive summary

FateDrop already has a substantial working foundation, but rapid feature development has created several places where the public website, dashboard terminology and actual backend capability no longer describe the same product.

The highest-risk issue is not visual consistency; it is **truth consistency**. A small number of hard-coded metrics and strong status labels currently make the website sound more final than the underlying implementation warrants. At the same time, some real backend capabilities (notably catalogue and True Price API endpoints) are under-described by older dashboard copy.

This pass prioritises evidence integrity, canonical naming, navigation hierarchy and Companion readiness without deleting working storage or rewriting the product.

## Audit findings

### P0 — hard-coded network proof is labelled as validated

`lib/site-data.ts` contains fixed values for products tracked, products in stock, catalogue retailers and healthy monitors. `components/network-proof.tsx` renders those values as a “Validated beta snapshot”. `lib/dashboard.ts` also builds a published baseline from those fixed values.

The Cloud Signal Engine already publishes current network metrics to the website metric ledger. Fixed numbers therefore create avoidable stale-data risk.

**Action:** replace public network proof with the latest persisted network snapshot. If no snapshot exists, show an explicit waiting/unavailable state rather than old numbers. Remove the dashboard numeric fallback.

### P0 — FateFind / FateMatch / Watchlist naming collision

Current dashboard `/dashboard/watchlist` calls the saved-intent feature **FateMatch**, while older public copy calls saved searches **FateFind** and the current product brief reserves Watchlist/FateFind for wanted items/search intent. This makes “FateMatch” mean different things depending on surface.

Current internal files/storage use `fate-match-*` names and should not be destructively migrated during a consistency pass.

**Action:** make public dashboard language FateFind / Watchlist while retaining legacy internal storage/type names. Reserve FateMatch publicly for future cross-retailer matching/comparison until a safe schema migration is deliberately designed.

### P0 — Plus and Pro marketing exceeds the entitlement model

`lib/entitlements.ts` currently has a Free set and one Premium set. Any active non-free tier receives the same Premium capabilities. Public plan copy, however, presents Plus and Pro as materially different feature envelopes.

**Action:** do not invent new gates. Make public wording clear that the higher-tier split is under product review while the current code enforces a shared Premium capability envelope.

### P1 — Avatar terminology has already evolved into Companion

The dashboard route and internal modules use `avatar`, while the page copy and alert/FateFind experiences already describe a companion. The product direction is now a persistent, customisable 3D FateDrop Companion with signal reactions and a floating droid/familiar.

**Action:** move user-facing labels to **FateDrop Companion**. Keep internal route/module/storage names for compatibility. Describe final 3D renderer/animation as foundation/planned until real assets are integrated.

### P1 — Search is a real route but absent from dashboard navigation

`/dashboard/search` exists, but the dashboard navigation omits it. The route itself says live catalogue connection is still required, although the Signal Engine already exposes `/api/catalogue`.

**Action:** add Search to the dashboard hierarchy immediately. Keep the route honestly labelled FOUNDATION until its result rendering is wired to the canonical Cloud/API path.

### P1 — FateWindow is disproportionately prominent

A working heuristic exists and the True Price experience can evaluate evidence into Buy Window / No Rush / Watch / Wait. The dashboard home and True Price page currently make FateWindow look like a central finished product pillar.

This feature was not part of the canonical product brief and its thresholds are product-policy choices rather than immutable facts.

**Action:** preserve the implementation, label it **experimental beta**, reduce its prominence on the dashboard home and ensure wording is evidence context rather than purchase advice.

### P1 — FateScore is described as validated without a verified backend score implementation

Public Home/Trust/business FAQ copy describes FateScore as a validated beta trust model. This audit found principles and copy, but did not verify a production scoring engine in the inspected backend.

**Action:** downgrade public status to foundation/planned evidence model. Preserve the important “no pay-to-trust” rule.

### P1 — FateFair is stronger in marketing than implementation evidence supports

FateFair appears in trust/plan/roadmap copy, but this audit did not verify a production implementation.

**Action:** use PLANNED consistently.

### P1 — Public event surface and dashboard event surface disagree

The public Events page deliberately uses clearly labelled demonstration entries. The dashboard contains a large static list of real-looking sourced UK events and calls them verified/sourced.

Static source references can become stale, and the Cloud website publisher currently sends an empty `upcomingEvents` list.

**Action:** keep dashboard event discovery as BETA / STATIC-SOURCED, surface a freshness/source warning and tell users to verify organiser details before travelling. Do not describe it as the live Cloud event feed.

### P1 — website catalogue paths are split

The website directly reads two Shopify catalogues for current indie storefront/True Price experiences. The Cloud Signal Engine separately manages its canonical offer/product network and exposes `/api/catalogue` and `/api/true-price`.

**Action:** document this as a transitional architecture. Avoid pretending the current two-store lab is the whole connected network. Longer term, converge website search/comparison onto Cloud canonical product/offer data rather than adding more one-off website adapters.

### P1 — “app + Discord ready” wording can overstate cross-platform integration

Membership code establishes a shared entitlement model and Discord foundations. The mobile app is being fixed in another workstream and was not verified here.

**Action:** say the entitlement is **designed for / intended to power** app and Premium Discord unless the deployed integration is independently verified.

### P2 — unknown-delivery helper has a risky fallback shape

`calculateDeliveredPrice` currently returns `deliveredPence: pricePence` even when delivery is unknown, paired with `known: false`. `lib/true-price.ts` correctly converts this to a null delivered True Price, but the helper shape is easy to misuse elsewhere.

**Action:** harden the helper so an unknown delivered price is structurally null, then update types/tests if safe.

### P2 — static target scale is acceptable only because it is clearly labelled ambition

100+ catalogues, ~90k offers and national coverage appear as target scale. Current `NetworkProof` explicitly says this is ambition, not achievement.

**Action:** retain only with that explicit target label; never mix with measured network proof.

## Actual Cloud capability verified in source

The current Signal Engine source verifies these foundations:

- Pokémon-focused retailer configuration for Pokémon Center UK, Smyths UK and Chaos Cards;
- product/offer/observation model with official-RRP provenance support;
- lifecycle signal derivation for Whisper, Manifested, Vanished and Echo;
- baseline signal suppression;
- Discord signal dispatch integration;
- network snapshot persistence;
- public catalogue endpoint;
- public True Price grouping endpoint;
- website snapshot publishing with measured network metrics, recent signals, RRP references and opportunities;
- website ingestion schema for queue/security/drop-pulse signal kinds;
- upcoming-event schema, though the current Cloud publisher emits an empty event list.

Configured retailers are not automatically equivalent to healthy live monitors. Public counts must come from measured state, not configuration files.

## Pokémon Center collector status

A separate browser-collector workstream has demonstrated a complete verified Pokémon Center catalogue rotation before ingest and is being validated outside `main`. The safety invariant is correct: incomplete catalogue walks do not replace the last verified Cloud state and no access-control bypass is attempted.

Do not describe that separate collector branch as merged production infrastructure until its deployment/merge state is verified.

## Cloudflare / deployment audit

Repository configuration is structurally prepared for Cloudflare OpenNext:

- `@opennextjs/cloudflare` build/preview/deploy scripts exist;
- Wrangler targets worker `fatedrop-web` and `.open-next/worker.js`;
- static assets are bound through the OpenNext assets directory;
- observability is enabled;
- GitHub Actions runs `npm run verify` for pull requests to `main`.

The live target is `https://fatedrop-web.fatedrop-web.workers.dev`.

The audit environment could not reliably fetch the rendered Worker URL during the first pass, so visual/runtime verification of the deployed site remains a separate validation item. This is not evidence that the deployment is down.

## Implementation plan for this branch

1. Replace hard-coded public network proof with latest persisted Cloud metrics.
2. Remove hard-coded dashboard network baseline fallback.
3. Add Search to dashboard navigation.
4. Move public saved-intent naming from FateMatch to FateFind/Watchlist without touching legacy storage schema.
5. Rename public Avatar labels to FateDrop Companion without changing persistence routes.
6. Reconcile Local Radar copy with FateFind terminology.
7. Reduce FateWindow to an experimental-beta layer rather than a primary dashboard promise.
8. Downgrade FateScore/FateFair marketing statuses to match implementation evidence.
9. Make membership/app/Discord wording configuration-aware and avoid implying a complete Plus-vs-Pro capability split.
10. Add source/freshness caution to the static dashboard event directory.
11. Run repository verification via pull-request CI; then inspect/fix failures.
12. Run/record OpenNext build or preview where the available environment permits it.

## Deferred owner/product decisions

These should not block safe consistency work, but they need deliberate product approval before becoming contractual marketing promises:

- final Plus vs Pro feature gates and pricing;
- whether FateWindow remains a named product feature and its final thresholds;
- final FateScore evidence inputs and publication policy;
- final FateMatch meaning and any migration from the legacy internal saved-intent naming;
- final retailer paid-plan structure;
- Companion progression/economy/cosmetic unlock model;
- production Event Vendor Mode rules;
- exact multi-TCG rollout order.

## Non-goals

This branch will not:

- redesign FateDrop from scratch;
- edit the mobile app repo;
- delete user/business data;
- rename persistent schemas merely for cosmetic consistency;
- deploy production automatically;
- expose secrets;
- invent metrics, retailers, events, users or sales;
- bypass retailer access controls.
