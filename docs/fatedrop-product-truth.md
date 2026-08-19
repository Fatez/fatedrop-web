# FateDrop Product Spec v1

_Last reviewed: 19 August 2026_

This document is the canonical product authority for FateDrop Web and the reference point for the mobile app, Cloud and Discord workstreams. When old marketing copy, dashboard labels or internal implementation names disagree with this file, the public product should be reconciled to this specification without destructive schema changes.

## Status vocabulary

- **LIVE** — production-connected and safe to present as available now.
- **BETA** — implemented and usable, but still being validated, expanded or hardened.
- **DEMO** — illustrative data or UI only. It must never look live.
- **FOUNDATION** — architecture/data model/integration path exists, but the complete user promise is not live.
- **HOLD** — keep the implementation/concept, but do not make it a launch pillar.
- **PLANNED** — future direction only.

## Core product promise

FateDrop searches the TCG market for collectors, compares the real delivered price against verified RRP where known, watches for wanted products, and alerts users when something worth knowing happens — while connecting collectors with independent retailers, local stores and events.

Pokémon TCG is the launch focus. The product and retailer architecture should remain capable of expanding to other TCGs later.

## Consumer navigation model

The mobile product is built around five durable destinations:

1. **Home** — network activity and personal hunt highlights.
2. **Search** — product-first catalogue search, offer comparison and purchase hand-off.
3. **Indies** — retailer discovery, storefronts and local discovery.
4. **Alerts** — personal FateFinds, alert preferences and notification history.
5. **More** — Wishlist, Events, Local Radar, Companion/account/membership and genuinely secondary tools.

The website dashboard can expose more destinations, but it should preserve the same mental model rather than creating a new top-level screen for every feature.

## Core consumer jobs

| Job | Features |
| --- | --- |
| Find | Search / Catalogue |
| Compare | Compare Offers, True Price, RRP context |
| Watch | FateFind, Universal Wishlist |
| Detect | Echo, Manifested, Vanished, Drop Pulse |
| Discover | Indies, Local Radar, Events / Fate Encounters |
| Receive | Alerts, Companion, Discord extension |

## Search / Catalogue — CORE

Search is the primary engine. The user journey should remain brutally simple:

**search → product → offers → compare → buy**

Search should be product-first rather than retailer-first. Duplicate retailer listings should group beneath a product identity where the evidence allows it.

Current web status: **BETA**. Dashboard Search queries the canonical Signal Engine `/api/catalogue` endpoint server-side with observed stock, price, RRP and delivery context.

## True Price — CORE / major USP

True Price is a pricing layer across FateDrop, not merely a standalone tool.

Where evidence permits show:

1. item price;
2. verified/official RRP;
3. item £ / % difference from RRP;
4. mandatory delivery/fees;
5. delivered True Price;
6. delivered £ / % difference from RRP.

Unknown delivery is **unknown**, never free. Unknown RRP is **unknown**, never inferred from a reseller price.

The dashboard True Price experience now uses the canonical Signal Engine `/api/true-price` offer groups rather than the old direct-Shopify lab as its primary comparison source.

## Compare Offers — CORE

Group the same product across retailers and let the collector compare price, delivery, stock and True Price transparently.

Do not call this retailer ranking. Objective sorting by known delivered cost, item price, availability or distance is acceptable. Paid placement must never masquerade as objective ordering.

## RRP comparison — CORE / major USP

Verified RRP context should be pervasive in Search, offer comparison, FateFind and alerts whenever the evidence exists.

Example: `£79.99 · +33% above RRP`.

## Public signal model

The public lifecycle is deliberately simple:

### Echo — early intelligence

**Public status: BETA/FOUNDATION depending evidence source.**

Echo means FateDrop observed meaningful early movement worth watching, but confirmed purchasable stock is not established by that signal alone.

Possible evidence includes queue/security/traffic condition changes, catalogue movement, metadata appearance, launch changes or other corroborating precursor activity.

**Echo does not mean a drop is guaranteed.**

Internal engine terminology may continue to include `whisper`, queue/security kinds or other low-level observations. Those names do not need to become major consumer states.

### Manifested — confirmed

**Public status: BETA.**

Manifested means a meaningful event is confirmed in the observed evidence source, most commonly confirmed purchasable availability or a confirmed restock.

An internal legacy `echo` restock lifecycle event should be presented publicly as **Manifested / restock confirmed**, not as early Echo.

### Vanished — availability lost

**Public status: BETA / contextual.**

Vanished means previously confirmed availability is no longer observed. It is useful in activity/history but is not a launch feature that needs its own destination.

### Whisper — internal

Whisper remains available as internal engine terminology where useful, but it should not be a headline consumer lifecycle state.

## Drop Pulse — contextual

**Status: FOUNDATION/BETA.**

Drop Pulse answers a simple question such as “how active is this right now?” using observable evidence. It should be a small contextual badge/summary, not a standalone screen.

Prefer explainable evidence such as `High activity · 4 meaningful changes in 12 min` over unexplained urgency scores.

## FateFind and FateMatch

### FateFind — KEEP / premium candidate

**FateFind is the hunt the collector creates.**

Example:

- Destined Rivals ETB
- max £65 delivered
- max +10% above verified RRP
- sealed
- UK
- any eligible retailer
- in stock

FateDrop monitors qualifying network opportunities against the saved rule.

### FateMatch — KEEP

**FateMatch is the successful result.**

When a real observed offer satisfies a FateFind, FateDrop can raise a FateMatch and explain why it matched.

Existing internal `fate_match` storage/API names therefore remain useful and do not need destructive migration merely for branding.

## Universal Wishlist — KEEP

Wishlist is intentionally simpler than FateFind:

> “I want / like this product.”

It should survive sold-out states and retailer changes. It is not an active price/availability rule and should remain conceptually distinct from FateFind.

## Alerts — CORE

Alerts is personal, not the global activity feed.

It should contain:

- active FateFinds;
- FateMatch / stock / price notifications sent to the user;
- notification history;
- preferences for Echo, Manifested, price conditions and delivery channels;
- Discord/push/web preferences where available.

Global network activity belongs primarily on Home.

## Network Activity — KEEP on Home

Home is the heartbeat of FateDrop: recent confirmed Manifested activity, meaningful Echo intelligence, useful stock/price movement, a relevant FateFind result and perhaps one upcoming event/local card.

It should answer: **“Anything worth knowing right now?”**

## Indies — CORE to the business model

Independent retailer discovery is one of the features that prevents FateDrop becoming merely another stock notifier.

Users should be able to discover retailers, browse clean storefront/catalogue experiences and hand off to the retailer to complete purchase.

FateDrop is not the merchant of record. The retailer keeps checkout, fulfilment, returns, support and the customer relationship.

## Verified retailer status — KEEP

A FateDrop Verified badge should mean an objective identity/catalogue relationship was verified. It must not automatically mean cheapest, best service, fastest delivery or permanent trustworthiness.

## Local Radar — KEEP / secondary

Discover nearby TCG businesses/events from location or postcode when the provider is configured. External Places discovery is not proof of stock or partnership.

## Events / Fate Encounters — KEEP

Use **Events** as the functional label and **Fate Encounters** as the branded experience title.

Current dashboard directory: **BETA / static-sourced** until automated event ingestion is connected.

Event Vendor Mode remains **HOLD / FOUNDATION** until enough real vendors justify its standard shopper exposure.

## FateDrop Companion — KEEP / FOUNDATION

The Companion is a presentation and identity layer for the intelligence, not a replacement for it.

Intended reactions include:

- Echo — scanner/droid awareness state;
- Manifested — stronger confirmed-drop animation;
- FateMatch — personal “found it” reaction;
- Vanished — quiet lost-signal state;
- major precursor activity — cinematic surge without implying guaranteed stock.

The account already persists a Companion/avatar loadout. `lib/companion-contract.ts` now defines a renderer/asset boundary so the current illustrated fallback can later be replaced by a GLB/WebGL 3D character + floating droid without changing account identity storage.

## Membership / Discord

Membership should remain simple: Free has meaningful value; paid membership unlocks stronger monitoring/alerts/FateFind/early intelligence according to the final commercial split.

Current code still has one shared Premium capability envelope across paid tiers, so the final Plus-vs-Pro distinction remains an owner decision rather than a claim to invent in code.

Discord extends FateDrop through role/alert delivery. It should not become a competing primary UI.

## Retailer-facing / backend systems

Keep these, but do not clutter consumer navigation with them:

- retailer outbound tracking;
- retailer analytics;
- retailer plans/entitlements;
- Shopify/WooCommerce/CSV/feed onboarding;
- automatic monitoring and monitor health;
- catalogue health;
- feature flags;
- RRP provenance;
- product identity resolution;
- offer matching;
- event ingestion;
- privacy-safe demand aggregation.

## HOLD / future

Keep architecture or concepts where useful, but do not promote them as launch pillars:

- FateScore;
- FateFair;
- FateWindow;
- Reserve & Collect;
- Optimise Basket / Basket Breaker;
- Demand Signal consumer UI;
- Priority One / Bounties;
- Passport;
- XP / tokens / progression;
- Event Vendor Mode expansion.

Basket optimisation is particularly strong as a future extension of True Price: compare the cheapest single-retailer basket against the cheapest split basket using delivered cost.

## Safety and evidence rules

- Incomplete catalogue walks never replace the last verified complete state.
- Retailer access controls are not bypassed.
- Queue/security observations are context, not a promise that stock is imminent.
- A retailer listing is not guaranteed checkout success.
- A click is not a sale.
- A Places result is not verified stock.
- Unknown delivery is not free delivery.
- Unknown RRP is not guessed RRP.
- Demo data is visibly demo data.
- Static sourced data carries source/freshness context.
- No product statistic, retailer count, user count, revenue number, reliability percentage or performance claim appears without a current evidence source.
