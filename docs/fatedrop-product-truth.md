# FateDrop Product Spec v1

_Last reviewed: 21 August 2026_

This document is the canonical product authority for FateDrop Web and the reference point for the mobile app, Cloud and Discord workstreams. When old marketing copy, tests, dashboard labels or implementation aliases disagree with this file, reconcile the surface to this specification without destructive schema changes.

## Status vocabulary

- **LIVE** — production-connected and safe to present as available now.
- **BETA** — implemented and usable, but still being validated, expanded or hardened.
- **DEMO** — illustrative data or UI only. It must never look live.
- **FOUNDATION** — architecture/data model/integration path exists, but the complete user promise is not yet proven live.
- **HOLD** — keep the implementation/concept, but do not make it a launch pillar.
- **PLANNED** — future direction only.

## Core product promise

FateDrop searches the TCG market for collectors, compares observed prices against authoritative RRP where known, watches for wanted products, and alerts users when something worth knowing happens — while connecting collectors with independent retailers, local stores and events.

Pokémon TCG is the launch focus. Product identity, retailer and Companion architecture should remain capable of expanding to other TCGs later.

## Consumer navigation model

The mobile product is built around five durable destinations:

1. **Home** — network activity and personal hunt highlights.
2. **Search** — product-first catalogue search, offer comparison and purchase hand-off.
3. **Indies** — retailer discovery and storefronts.
4. **Alerts** — canonical signal inbox, FateFind/FateMatch history and notification preferences.
5. **More** — Wishlist, Events, Local Radar, Companion/account/membership and genuinely secondary tools.

The website dashboard may expose more destinations, but it should preserve the same mental model rather than creating a new top-level screen for every idea.

## Core consumer jobs

| Job | Features |
| --- | --- |
| Find | Search / Catalogue |
| Compare | Compare Offers, True Price, RRP context |
| Watch | FateFind, Universal Wishlist |
| Detect | Whisper, Echo, Manifested, Vanished; Drop Pulse as supporting context |
| Discover | Indies, Local Radar, Events / Fate Encounters |
| Receive | Alerts, Companion, push, Discord extension |

## Search / Catalogue — CORE

Search is the primary engine. The durable journey is:

**search → canonical product → offers → compare → retailer**

Search is product-first rather than retailer-first. Duplicate retailer listings should group beneath a canonical product identity where the evidence allows it.

Current web status: **BETA**. Dashboard Search queries the canonical Signal Engine `/api/catalogue` endpoint with observed stock, price, RRP and delivery context.

## True Price — CORE / major USP

True Price is a pricing layer across FateDrop, not merely a standalone screen.

Where evidence permits, show:

1. item price;
2. authoritative/official RRP;
3. item £ / % difference from RRP;
4. mandatory delivery/fees when known;
5. delivered True Price when delivery is known;
6. delivered £ / % difference from RRP when that comparison is valid.

Unknown delivery is **unknown**, never free. Unknown RRP is **unknown**, never inferred from an ordinary reseller price.

RRP-first comparison remains useful even where delivery is not yet known. Delivered True Price is an enhancement, not a prerequisite for showing a valid item-price-to-RRP comparison.

## Compare Offers — CORE

Group the same product across retailers and let the collector compare price, delivery, stock and True Price transparently.

Do not call this retailer ranking. Objective sorting by known delivered cost, item price, availability or distance is acceptable. Paid placement must never masquerade as objective ordering.

## RRP comparison — CORE / major USP

Authoritative RRP context should be pervasive in Search, offer comparison, FateFind and alerts whenever evidence exists.

Example: `£79.99 · +33.3% above RRP`.

The provenance source matters. A normal retailer selling price must never silently become “official RRP”.

## Public signal model — FINAL FOUR-STAGE CONTRACT

The public lifecycle is:

**Whisper → Echo → Manifested → Vanished**

These names describe evidence states. A product does not have to pass through every stage.

### Whisper — product / catalogue movement

**Public status: BETA.**

Whisper means FateDrop observed product, catalogue or metadata movement that may be worth watching. Something may be coming, but the evidence does **not** mean queue/access readiness changed and does **not** confirm purchasable stock.

Examples can include a new catalogue object, metadata change, product appearance or other product-level precursor evidence.

**Whisper is a real public lifecycle state. Do not collapse it into Echo.**

### Echo — access readiness

**Public status: BETA/FOUNDATION depending evidence source.**

Echo means queue, traffic, security or access behaviour changed in a way that tells the collector to get ready.

Echo is not fabricated from normal catalogue movement. Catalogue/product movement belongs to Whisper.

**Echo does not guarantee that stock is coming or that checkout will succeed.**

### Manifested — confirmed purchasable availability

**Public status: BETA.**

Manifested means purchasable live stock or another explicitly confirmed availability event has been established from observed evidence.

Do not treat an arbitrary `echo` string from legacy code as Manifested. Legacy sources must be normalised using the evidence they actually represent.

### Vanished — confirmed availability lost

**Public status: BETA / contextual.**

Vanished means previously confirmed availability is no longer observed, is sold out, or has otherwise been lost from the observed source.

It is useful in alerts and history but does not need its own top-level destination.

## Drop Pulse — contextual evidence, not a fifth lifecycle state

**Status: FOUNDATION/BETA.**

Drop Pulse summarises observable activity such as recent meaningful changes. It supports the lifecycle but must remain visibly separate from Whisper/Echo/Manifested/Vanished.

Prefer explainable evidence such as `High activity · 4 meaningful changes in 12 min` over unexplained urgency scores.

## FateFind and FateMatch

### FateFind — KEEP / premium candidate

**FateFind is the hunt the collector creates.**

Example:

- Destined Rivals ETB
- max £65 delivered
- max +10% above authoritative RRP
- sealed
- UK
- any eligible retailer
- in stock

FateDrop evaluates qualifying network opportunities against the saved rule.

### FateMatch — KEEP

**FateMatch is the successful result.**

When a real observed offer satisfies a FateFind, FateDrop can raise a FateMatch and explain why it matched.

Existing internal `fate_match` storage/API names therefore remain useful and do not need destructive migration merely for branding.

## Universal Wishlist — KEEP

Wishlist means:

> “I want / like this product.”

It survives sold-out states and retailer changes. It is not an active price/availability rule and remains distinct from FateFind.

Current web status: **BETA**. Production persistence tables exist and the authenticated website API/list/save/remove path is implemented. A zero-row production table means no user item has been saved yet; it does not mean the persistence layer is absent.

## Alerts — CORE

Alerts is personal and may contain:

- canonical Whisper / Echo / Manifested / Vanished signals;
- active FateFinds;
- FateMatch / stock / price notifications relevant to the user;
- notification history;
- RRP/True Price context where entitlement and evidence allow;
- web/push/Discord preferences.

Global network activity belongs primarily on Home; personal delivery/history belongs in Alerts.

### Shared notification preferences

Current status: **BETA**. One persisted account model stores separate Whisper, Echo, Manifested and Vanished preferences plus price-change/FateMatch and web/push/Discord channel choices with optional quiet hours.

A saved preference does **not** claim that a delivery channel has been operationally proven. Push remains unproven until a real Expo device endpoint and delivery attempt exist.

## Network Activity — KEEP on Home

Home is the heartbeat of FateDrop. It can show meaningful Whisper product movement, Echo access-readiness context, confirmed Manifested activity, price movement, a relevant FateMatch and carefully sourced secondary discovery content.

It should answer: **“Anything worth knowing right now?”**

## Indies — CORE to the business model

Independent retailer discovery is one of the features that prevents FateDrop becoming merely another stock notifier.

Users should be able to discover retailers, browse clean storefront/catalogue experiences and hand off to the retailer to complete purchase.

FateDrop is not the merchant of record. The retailer keeps checkout, fulfilment, returns, support and the customer relationship unless a future product explicitly changes that model.

## Verified retailer status — KEEP

A FateDrop Verified badge means an objective identity/catalogue relationship was verified. It must not automatically mean cheapest, best service, fastest delivery or permanent trustworthiness.

## Local Radar — KEEP / secondary

Discover nearby TCG businesses/events from user-triggered location or postcode when the provider is configured. External Places discovery is not proof of stock or partnership.

## Events / Fate Encounters — KEEP

Use **Events** as the functional label and **Fate Encounters** as the branded experience title.

Event Vendor Mode remains **HOLD / FOUNDATION** until enough real organiser/vendor evidence justifies its standard shopper exposure.

## FateDrop Companion — KEEP / BETA

The Companion is a presentation and identity layer for the intelligence, not a replacement for it.

Current release-candidate implementation includes a live 3D path and persistent Companion selection/loadout foundations. Production asset/device QA is still required.

Reaction rule:

- Whisper — anticipation / watch / notice;
- Echo — readiness / scan / alert posture;
- Manifested — stronger confirmed-stock reaction;
- FateMatch — personal “found it” reaction;
- Vanished — quiet lost-signal state;
- Major/high-value confirmed alert — strongest celebration/cinematic state.

Do not spend the strongest victory animation on normal Whisper or Echo events.

## Membership / Discord

Membership should remain simple: Free has meaningful value; paid membership unlocks stronger monitoring/alerts/FateFind/early intelligence according to the final commercial split.

The entitlement layer remains the authority. Do not create client-only paid access truth.

Discord extends FateDrop through role/alert delivery. It must not become a competing membership authority or primary product UI.

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

Basket optimisation is a strong **PLANNED** extension of True Price: compare the cheapest single-retailer basket against the cheapest split basket using delivered cost.

## DEMO rule

Anything marked **DEMO** or sample must be visibly labelled. Demo signal buttons, sample phone content and local test notifications must never be presented as real network activity.

## Safety and evidence rules

- Incomplete catalogue walks never replace the last verified complete state.
- Retailer access controls are not bypassed.
- Whisper product/catalogue movement is not Echo access readiness.
- Echo queue/security/traffic observations are context, not a promise that stock is imminent.
- Manifested requires confirmed availability evidence.
- A retailer listing is not guaranteed checkout success.
- A click is not a sale.
- A Places result is not verified stock.
- Unknown delivery is not free delivery.
- Unknown RRP is not guessed RRP.
- Drop Pulse is context, not a fifth lifecycle stage.
- Demo data is visibly demo data.
- Static sourced data carries source/freshness context.
- No product statistic, retailer count, user count, revenue number, reliability percentage or performance claim appears without a current evidence source.
