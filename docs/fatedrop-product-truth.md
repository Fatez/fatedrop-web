# FateDrop Product Spec v1

_Last reviewed: 22 August 2026_

This document is the canonical product authority for FateDrop Web and the reference point for the mobile app, FateDrop Cloud and Discord workstreams. When older marketing copy, tests, dashboard labels or implementation aliases disagree with this file, reconcile the surface to this specification without destructive schema changes unless a migration is genuinely required.

## Status vocabulary

- **LIVE** — production-connected and safe to present as available now.
- **BETA** — implemented and usable, but still being validated, expanded or hardened.
- **DEMO** — illustrative data or UI only. It must never look live.
- **FOUNDATION** — architecture/data model/integration path exists, but the complete user promise is not yet proven live.
- **HOLD** — keep the implementation/concept, but do not make it a launch pillar.
- **PLANNED** — future direction only.

## Core product promise

FateDrop is a TCG signal-intelligence and discovery layer.

It helps collectors:

- understand meaningful product, access and stock movement;
- compare observed offers against authoritative RRP where known;
- understand True Price when mandatory delivery is known;
- create structured FateFind hunts and receive qualifying FateMatch results;
- discover participating independent retailers, local businesses and real-world events;
- continue to the retailer to complete the purchase.

It helps independent retailers become visible inside relevant collector journeys without asking them to surrender their brand, checkout or customer relationship.

Pokémon TCG in the UK is the launch focus. The architecture may support additional TCGs later, but wider expansion remains a future direction rather than a current-network claim.

## Product hierarchy

### Launch pillars

1. **Signal Intelligence** — Whisper → Echo → Manifested → Vanished.
2. **Search / Catalogue** — product-first discovery across canonical observed offers.
3. **True Price + RRP context** — transparent price context rather than a bare sticker price.
4. **FateFind → FateMatch** — structured collector intent and successful qualifying results.
5. **Independent Discovery** — connect collector demand with participating independent retailers while preserving retailer checkout.

### Supporting network tools

- Universal Wishlist;
- Local Radar;
- Events / Fate Encounters;
- Drop Pulse as contextual evidence;
- Koru & Friends companion layer;
- membership and Discord extension.

Supporting tools must reinforce the core product rather than compete with it for top-level prominence.

## Consumer navigation model

The mobile product should preserve five durable destinations:

1. **Home** — network activity and relevant personal highlights.
2. **Search** — catalogue search, offer comparison and retailer hand-off.
3. **Indies** — retailer discovery and storefronts.
4. **Alerts** — personal signal delivery, FateFind/FateMatch history and preferences.
5. **More** — Wishlist, Events, Local Radar, Koru & Friends/account/membership and genuinely secondary tools.

The website dashboard may expose more destinations, but it should preserve the same mental model rather than creating a new top-level product for every idea.

## Public website model

The public website should explain the product quickly rather than reproduce the entire roadmap on Home.

### Home

Home should remain short:

1. approved Koru hero;
2. Signals, True Price, FateFind → FateMatch and independent discovery;
3. Koru & Friends / merch bridge after the product explanation;
4. collector ↔ FateDrop ↔ independent retailer bridge;
5. Events/Fate Encounters entry point;
6. membership/final CTA.

The interactive phone does **not** belong in the homepage hero or core landing flow. It lives on the dedicated `/demo` page so the landing page can explain FateDrop before asking someone to explore a sample interface.

### Collectors

Explain how FateDrop helps a collector detect, compare, hunt and discover.

### Retailers

Explain relevant discovery, catalogue connection and direct retailer checkout. FateDrop is not the merchant of record.

### Events

Preserve the Fate Encounters structure around source-backed dates, venues, organiser/vendor evidence and evidence-safe event inventory.

### Trust

Explain the signal lifecycle, True Price evidence rules and the separation between commercial promotion and trust/evidence.

### About / Vision

Hold planned concepts and wider TCG expansion so the future remains visible without burying the current product.

### Demo

The `/demo` page may use controlled sample data to explain the product journey. It must remain visibly labelled as an interactive preview/sample and must never masquerade as current network activity.

### Merch

Merch is a supporter/culture layer around FateDrop and Koru & Friends, not a second product or a substitute for the signal-intelligence proposition.

### Free Drops

Retired from public discovery. Do not restore it to navigation or sitemap without a new explicit product decision.

## Search / Catalogue — CORE

**Status: BETA.**

Search is the primary discovery engine. The durable journey is:

**search → canonical product → offers → compare → retailer**

Search is product-first rather than retailer-first. Duplicate retailer listings should group beneath a canonical product identity where evidence allows it.

Dashboard Search uses the canonical FateDrop Signal Engine catalogue path rather than maintaining a second independent search truth.

No demo/sample results may substitute for real network results on a live surface.

## True Price — CORE / major USP

**Status: BETA.**

True Price is a pricing layer across FateDrop, not merely a standalone screen.

Where evidence permits, show:

1. observed item price;
2. authoritative/official RRP;
3. item £ / % difference from RRP;
4. mandatory delivery/fees when known;
5. delivered True Price when delivery is known;
6. delivered £ / % difference from RRP when that comparison is valid.

Unknown delivery is **unknown**, never free. Unknown RRP is **unknown**, never inferred from an ordinary reseller price.

RRP-first comparison remains useful even when delivery is not yet known. Delivered True Price is an enhancement, not a prerequisite for a valid item-price-to-RRP comparison.

## Compare Offers — CORE

Group the same product across retailers and let the collector compare price, delivery, stock and True Price transparently.

Do not call objective comparison a retailer ranking. Sorting by known delivered cost, item price, availability or distance is acceptable. Paid placement must never masquerade as objective ordering.

## RRP comparison — CORE / major USP

Authoritative RRP context should be pervasive in Search, offer comparison, FateFind/FateMatch and alerts whenever evidence exists.

Example: `£79.99 · +33.3% above RRP`.

The provenance source matters. A normal retailer selling price must never silently become “official RRP”.

## Public signal model — FINAL FOUR-STAGE CONTRACT

The public lifecycle is:

**Whisper → Echo → Manifested → Vanished**

These names describe evidence states. A product does not have to pass through every stage.

### Whisper — product / catalogue movement

**Public status: BETA.**

Whisper means FateDrop observed meaningful product, catalogue or metadata movement that may be worth watching. Something may be coming, but the evidence does **not** mean access readiness changed and does **not** confirm purchasable stock.

Examples can include a new catalogue object, metadata change, product appearance or another product-level precursor signal.

**Whisper is a real public lifecycle state. Do not collapse it into Echo.**

### Echo — access readiness

**Public status: BETA / FOUNDATION depending on the evidence source.**

Echo means queue, traffic, security or access behaviour changed in a way that tells the collector to get ready.

Echo is not fabricated from normal catalogue movement. Catalogue/product movement belongs to Whisper.

**Echo does not guarantee that stock is coming or that checkout will succeed.**

### Manifested — confirmed purchasable availability

**Public status: BETA.**

Manifested means purchasable live stock or another explicitly confirmed availability event has been established from observed evidence.

Legacy event labels must be normalised from the evidence they actually represent rather than trusted by name alone.

### Vanished — confirmed availability lost

**Public status: BETA / contextual.**

Vanished means previously confirmed availability is no longer observed, has sold out or is otherwise no longer verified.

Vanished is useful in alerts/history but does not need a separate top-level destination.

## Drop Pulse — contextual evidence, not a fifth lifecycle state

**Status: FOUNDATION / BETA.**

Drop Pulse summarises observable activity such as recent meaningful changes. It supports the lifecycle but remains visibly separate from Whisper/Echo/Manifested/Vanished.

Prefer explainable evidence such as `High activity · 4 meaningful changes in 12 min` over unexplained urgency scores.

## FateFind and FateMatch

### FateFind — CORE / premium candidate

**FateFind is the hunt the collector creates.**

Example criteria may include:

- Destined Rivals ETB;
- max £65 delivered;
- max +10% above authoritative RRP;
- sealed;
- UK;
- eligible retailers;
- in stock.

FateDrop evaluates qualifying observed opportunities against the saved rule.

### FateMatch — CORE result

**FateMatch is the successful result.**

When a real observed offer satisfies a FateFind, FateDrop can raise a FateMatch and explain why it matched.

Existing internal compatibility keys may remain where changing them would break existing clients, but public meaning must stay FateFind = hunt and FateMatch = successful result.

## Universal Wishlist — KEEP

**Status: BETA.**

Wishlist means:

> “I want / like this product.”

It survives sold-out states and retailer changes. It is not an active price/availability rule and remains distinct from FateFind.

Wishlist persistence must not silently create monitoring/notification promises.

## Alerts — CORE

**Status: BETA.**

Alerts is personal and may contain:

- Whisper / Echo / Manifested / Vanished delivery relevant to the user;
- active FateFinds;
- FateMatch / stock / price notifications;
- notification history;
- RRP/True Price context where entitlement and evidence allow;
- web/push/Discord preferences.

Global network activity belongs primarily on Home. Personal delivery/history belongs in Alerts.

### Shared notification preferences

One persisted account model may store separate Whisper, Echo, Manifested and Vanished choices plus price-change/FateMatch and web/push/Discord delivery settings.

A saved preference does **not** prove every delivery channel is operational. Push and Discord still depend on their actual connected integrations.

## Network Activity — KEEP on Home

Home is the heartbeat of FateDrop. It can show meaningful Whisper product movement, Echo access-readiness context, confirmed Manifested activity, price movement and relevant personal FateMatch context.

It should answer:

**“Anything worth knowing right now?”**

## Indies — CORE to the business model

Independent retailer discovery prevents FateDrop becoming merely another stock notifier.

Users should be able to discover participating retailers, understand relevant offers and hand off to the retailer to complete purchase.

FateDrop is not the merchant of record. The retailer keeps:

- identity and brand;
- product page;
- checkout and payments;
- fulfilment and returns;
- support;
- customer relationship.

The intended flow is:

**collector demand → FateDrop discovery/intelligence → retailer → retailer checkout**

## Verified retailer status — KEEP

A FateDrop Verified badge means an objective identity/catalogue relationship was verified. It must not automatically mean cheapest, best service, fastest delivery or permanent trustworthiness.

Commercial placement cannot purchase stronger verification or a better evidence state.

## Local Radar — KEEP / secondary

**Status: BETA / provider-dependent.**

Discover nearby TCG businesses/events from user-triggered location or postcode when the provider is configured. External Places discovery is not proof of stock or partnership.

## Events / Fate Encounters — KEEP

**Status: BETA / FOUNDATION depending on source coverage.**

Use **Events** as the functional label and **Fate Encounters** as the branded experience title.

Event listings should preserve source/freshness evidence. A confirmed vendor/table does not prove physical stock unless explicit event-inventory evidence exists.

Event Vendor Mode remains **HOLD / FOUNDATION** until enough real organiser/vendor evidence justifies broader shopper exposure.

## Koru & Friends — BRAND + COMPANION LAYER

**Status: BETA presentation / BETA Web renderer / asset handoff ongoing.**

Koru & Friends is the character, culture and companion layer around FateDrop. It must strengthen the product identity rather than replace the serious intelligence platform underneath it.

### Active companion roster — FINAL FIVE

The active selectable roster is exactly:

1. **Koru**;
2. **Fenn**;
3. **Aeris**;
4. **Nyxen**;
5. **Solix**.

Koru remains FateDrop's mascot and network voice regardless of which personal companion a collector selects.

Kael (`K-01`) and Nyra (`N-02`) remain legacy/archive character references only. They do not occupy active companion slots.

Retired Droid, Scout, radar-drone, signal-orb and mini-beacon companion concepts are not part of the active companion architecture.

### Five stable character slots

Each active companion owns one stable character slot behind the shared renderer contract. A character may use one approved GLB or an approved reaction-specific GLB pack. The stable paths and registration process are documented in `docs/companion-model-slots.md`.

The selector and account persistence work independently of model availability. A missing or failed model renders an honest fallback/placeholder rather than inventing a shipped 3D asset or blocking account functionality.

On Web, registered assets render their real mesh and texture through the lightweight WebGL boundary. Aeris, Nyxen and Solix are currently registered; Fenn's verified reaction pack still requires its final binary handoff/registration, and Koru keeps the approved 2D mascot fallback until the correct production GLB is recovered and verified.

The current WebGL viewer may use restrained rotation, bob and state tinting as presentation. It does **not** make skeletal animation playback a shipped claim. A source GLB containing clips is not enough: skeletal clip playback must be implemented and visually verified for the character before public copy describes that animation as active.

Reduced-motion preference must retain the real model while stopping continuous presentation motion; it must not hide the companion or substitute false content.

### Shared reaction rule

All five characters consume the same evidence contract:

- Whisper — anticipation / notice / watch;
- Echo — readiness / get-ready posture;
- Manifested — confirmed-stock reaction;
- Vanished — quiet/lost-signal reaction;
- FateMatch — personal “found it” reaction;
- major confirmed activity — stronger presentation only when justified.

Character personality may change the visual reaction. It must never change the underlying signal meaning, confidence or evidence.

Do not spend the strongest victory animation on ordinary Whisper or Echo activity.

### Profile separation

Collector profile/avatar presentation is separate from Koru & Friends companion choice.

Saving profile presentation must preserve the selected companion. Selecting a companion must update only the companion identity and must not overwrite unrelated account/profile data.

## Membership / Discord

**Status: FOUNDATION / BETA depending deployment configuration.**

Membership should remain simple: Free has meaningful value; paid membership unlocks stronger monitoring/alerts/FateFind/intelligence according to the final commercial split.

The entitlement layer remains the authority. Do not create client-only paid-access truth.

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
- privacy-safe aggregate demand insight.

## FateScore — PLANNED

FateScore remains a planned evidence-led retailer trust model. It is not a live final score.

Any future model must be explainable, evidence-led and separated from commercial placement. A retailer cannot purchase a stronger verification/trust result.

## HOLD / future

Keep architecture or concepts where useful, but do not promote them as launch pillars:

- FateScore;
- FateFair;
- FateWindow;
- Reserve & Collect;
- Optimise Basket / Basket Breaker;
- Demand Signal consumer UI;
- Bounties / Priority One concepts;
- Passport;
- XP/tokens/progression;
- Event Vendor Mode expansion;
- wider multi-TCG rollout.

Basket optimisation remains a strong **PLANNED** extension of True Price: compare the cheapest single-retailer basket with the cheapest split basket using delivered cost.

## Merch / Koru & Friends IP

Merch is a supporter/culture layer, not a second product.

Koru & Friends may support original artwork, apparel and future collectibles while FateDrop remains focused on signals, price intelligence, discovery and the collector↔indie network.

The Koru & Friends visual identity should remain mature, restrained and consistent with the approved dusk/editorial brand direction.

## DEMO rule

Anything marked **DEMO** or sample must be visibly labelled. Demo signal buttons, sample phone content and local test notifications must never be presented as real network activity.

## Safety and evidence rules

- Incomplete catalogue walks never replace the last verified complete state.
- Retailer access controls are not bypassed.
- Whisper product/catalogue movement is not Echo access readiness.
- Echo queue/security/traffic observations are context, not a promise that stock is imminent.
- Manifested requires confirmed availability evidence.
- Vanished describes previously confirmed availability that is no longer observed/verified.
- A retailer listing is not guaranteed checkout success.
- A click is not a sale.
- A Places result is not verified stock.
- Unknown delivery is not free delivery.
- Unknown RRP is not guessed RRP.
- Drop Pulse is context, not a fifth lifecycle stage.
- Demo data is visibly demo data.
- Static sourced data carries source/freshness context.
- Commercial placement cannot purchase stronger evidence or trust status.
- No product statistic, retailer count, user count, revenue number, reliability percentage or performance claim appears without a current evidence source.

## Release discipline

- Public/site copy must use the same meanings as app/Discord/Cloud normalization.
- Stable systems are not redesigned merely for novelty.
- Risky changes remain isolated until tests and visual QA pass.
- Main is not merged/deployed merely because a branch builds.
- The approved Koru hero, Koru & Friends artwork and final market-story PNGs must be visually verified on the final branch before public merge.
- Companion assets are registered one character at a time through the shared five-slot contract; a character may use one GLB or a verified reaction-specific pack.
- Source animation clips must never be advertised as active Web animation until playback is implemented and visually verified.
