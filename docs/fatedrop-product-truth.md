# FateDrop Product Truth

_Last reviewed: 19 August 2026_

This document is the canonical wording and status reference for FateDrop website work. It exists to stop marketing copy, dashboard labels, cloud capability and future product ideas drifting apart.

## Status vocabulary

Every public feature should use one of these meanings:

- **LIVE** — production-connected and safe to present as available now.
- **BETA** — implemented and usable, but still being validated, expanded or hardened.
- **DEMO** — illustrative data or UI only. It must never look like live data.
- **FOUNDATION** — architecture/data model/integration path exists, but the complete user promise is not yet live.
- **PLANNED** — product direction only. Do not sell or imply present availability.

Runtime configuration can move a feature between FOUNDATION, BETA and LIVE. Copy must reflect the deployed environment rather than the most optimistic code path.

## Core product position

FateDrop is a TCG discovery and stock-intelligence network. Pokémon TCG is the first focus; the data model is intended to support additional TCGs later.

For collectors, the core job is to reduce fragmented hunting: detect useful catalogue movement, find stock, compare the real cost, save wanted intent, discover independent retailers and surface relevant local/event opportunities.

For retailers, FateDrop is a discovery layer. The retailer remains the seller and keeps its own brand, website, checkout, fulfilment, returns, support and customer relationship.

FateDrop must not turn paid placement into trust, or subjective commercial preference into a retailer ranking. Objective sorting such as delivered cost, availability and distance is acceptable when the underlying evidence is known.

## Canonical signal lifecycle

The Signal Engine currently implements four lifecycle states. These names are canonical across website, dashboard, app terminology and Discord messaging:

| Feature | Status | Canonical definition | Implementation source | Public wording guidance |
| --- | --- | --- | --- | --- |
| **Whisper** | BETA | A new or changed catalogue record appears before verified purchasable availability. | `Fatedrop-Cloud/signal-engine/src/core/signals.mjs` | Early evidence, not confirmed stock. Never imply guaranteed release timing. |
| **Manifested** | BETA | An offer is verified as purchasable and is either newly discovered or has become available for the first verified time. | Signal Engine | Confirmed availability within the connected evidence source; retailer checkout remains final confirmation. |
| **Vanished** | BETA | A previously purchasable offer is no longer verified purchasable. | Signal Engine | Availability was lost/sold out in the observed source; avoid claiming the retailer has zero physical inventory beyond the evidence. |
| **Echo** | BETA | A previously available offer returns to a purchasable state. | Signal Engine | Restock/return signal supported by prior availability history. |

### Drop Pulse

**Status: FOUNDATION**

Drop Pulse is not a fifth lifecycle state. It is an evidence-backed summary/urgency/context layer derived from observed transitions, timestamps or history. Cloud/web schemas can carry `drop_pulse`, but the core Signal Engine lifecycle derivation currently creates Whisper, Manifested, Vanished and Echo.

Public copy should say Drop Pulse **summarises observed movement**; it must not manufacture confidence or urgency where evidence is absent.

### Queue / security / traffic intelligence

**Status: FOUNDATION**

The website ingestion schema can represent queue/security signal kinds and the Cloud website publisher understands them. This is early network context only. FateDrop must never claim that it bypasses retailer access controls, defeats queues, automates checkout or guarantees a drop.

## Collector discovery and price features

| Feature | Status | Canonical purpose | Notes |
| --- | --- | --- | --- |
| **Network Search / Unified Search** | BETA | Search connected catalogue offers from one product query. | The dashboard Search route now queries the canonical Signal Engine `/api/catalogue` endpoint server-side and renders observed offer, availability, price, RRP and known-delivery context without sample-result fallback. |
| **True Price** | BETA | Keep item price, official RRP, mandatory delivery/fees and delivered total separate; compare delivered premium/discount where evidence exists. | `lib/true-price.ts` withholds delivered total when delivery is unknown and the low-level delivery helper now returns a structurally null delivered total when delivery is unknown. |
| **RRP context** | BETA | Show official/verified RRP only when a supported reference exists. | Pokémon Center is configured as an official RRP source in the Signal Engine; website persists Cloud RRP references. |
| **FateFind** | FOUNDATION/BETA | A saved wanted search/intent rule: product plus constraints such as max True Price/RRP premium and online/local scope. | Current storage/classes still use legacy `FateMatch` internal naming. Preserve storage compatibility while public naming is reconciled. |
| **Watchlist** | FOUNDATION | A simple saved-product list. | Keep conceptually distinct from a structured FateFind rule even if both later share storage or UI. |
| **FateMatch** | PLANNED / RESERVED NAME | Cross-retailer product/offer matching and comparison, not the name of the saved-search feature. | Do not migrate/delete existing `fate_match` storage yet. Treat current code naming as legacy/internal until a safe migration is designed. |
| **Local Radar** | BETA when provider configured; otherwise FOUNDATION | Discover nearby TCG businesses through an approved Places provider, while keeping external discovery separate from verified FateDrop-network stock. | External map discovery is not proof of live stock. |
| **Retailer storefronts / Indie Stores** | BETA LAB | Browse experimental retailer catalogue feeds inside FateDrop before handing purchase to the retailer. | Current website directly reads two Shopify catalogue feeds; the UI must not imply formal partner/verification status unless retailer participation is confirmed. |

### True Price rules

Where evidence permits, show:

1. item price;
2. verified/official RRP;
3. £ and % item difference from RRP;
4. mandatory postage/fees;
5. delivered True Price;
6. £ and % delivered difference from RRP.

Unknown delivery is **unknown**, never free. Unknown RRP is **unknown**, never inferred from a reseller price without evidence.

### FateWindow

**Status: BETA EXPERIMENT — not a core product pillar**

A working heuristic exists in `lib/fate-window.ts` and can label evidence as Buy Window / No Rush / Watch / Wait. It is useful experimental decision context, but it should not dominate public positioning or sound like financial/purchase advice. Keep it clearly labelled experimental and evidence-dependent until product policy and thresholds are deliberately approved.

## Retailer features

| Feature | Status | Canonical purpose |
| --- | --- | --- |
| Catalogue onboarding | BETA / GUIDED | Assess feed, API, CSV, sitemap, Shopify/WooCommerce or manual routes rather than promising one-click support for every shop. |
| Verified retailer profile/storefront | FOUNDATION/BETA | Preserve retailer identity and direct purchasing journey. Verification is separate from performance. |
| Tracked outbound journeys | FOUNDATION/BETA | Measure clicks/referrals where implemented. Never call a click a sale without conversion attribution. |
| Catalogue health | FOUNDATION | Detect stale/broken catalogue information where supported. |
| Aggregated demand intelligence | PLANNED | Privacy-conscious aggregate interest, not individual collector surveillance. |
| Retailer analytics | PLANNED/FOUNDATION | Search visibility and referral/click reporting only when real data exists. |
| Paid promotion | PLANNED | Must always be labelled and cannot purchase trust or FateScore. |

## Trust features

| Feature | Status | Canonical purpose |
| --- | --- | --- |
| **Evidence model / verification** | FOUNDATION/BETA | Separate retailer identity verification, observed catalogue evidence and promotional placement. |
| **FateScore** | PLANNED | A future evidence-led retailer trust model. No current backend scoring implementation has been verified in this audit, so do not call it a validated live score. “Not enough data” remains the correct future fallback. |
| **FateFair** | PLANNED | Future price/context guidance requiring comparable offers, condition/grade, delivery, freshness and sample size. |

## Events

| Feature | Status | Canonical purpose |
| --- | --- | --- |
| Public Fate Encounters examples | DEMO | Demonstrate intended event format. |
| Dashboard sourced event directory | BETA / STATIC-SOURCED | Current code contains sourced UK event references. It shows review/source context and tells users to verify details before travel. It is not yet the Cloud live event feed. |
| Event Vendor Mode | PLANNED / FOUNDATION | Temporary, clearly labelled event inventory that must not survive as ordinary shop stock after an event. |
| Cloud event feed | FOUNDATION | Network snapshot schema supports upcoming events, but the current Signal Engine website publisher sends an empty event list. |

## FateDrop Companion

**Status: FOUNDATION**

Public name: **FateDrop Companion**.

The existing account-level avatar/loadout storage, builder and alert/FateFind preview provide a persistent personalisation foundation. Internal modules/routes may keep `avatar` names for compatibility, but user-facing language should move to Companion.

The intended product layer is:

- premium stylised 3D young-adult sci-fi collector;
- user-customisable;
- accompanied by a small floating FateDrop signal droid/familiar;
- persistent across account surfaces;
- able to react to alerts/signals;
- designed for future web/mobile continuity.

The current web builder is not proof that the final 3D renderer/assets are shipped. Treat richer 3D rendering, animation, progression and cross-platform asset delivery as **PLANNED/FOUNDATION** until integrated.

The Companion supports the intelligence product; it must not obscure the evidence, price or retailer information.

## FateDrop ID, membership and Discord

| Feature | Status | Canonical truth |
| --- | --- | --- |
| FateDrop ID/account | BETA when production DB configured | Account, session, profile and permanent member-since foundations exist. Hosted writes must use configured persistent storage. |
| Collector trial | FOUNDATION/BETA depending Stripe env | 14-day trial flow exists. Only call checkout/trial live when Stripe credentials/prices/webhook are configured in the deployed environment. |
| Plus / Pro | COMMERCIAL FOUNDATION | Prices may be presented as provisional/current product intent, but the final feature split is under review. |
| Entitlements | FOUNDATION/BETA | Code currently has a Free capability set and one shared Premium capability envelope; Plus and Pro do not yet have materially distinct capability maps. Marketing must not imply a fully enforced Plus-vs-Pro split. |
| Discord link / Premium role | FOUNDATION/BETA depending env | OAuth/role sync foundation exists. Public Discord availability is controlled by `NEXT_PUBLIC_DISCORD_ENABLED`. |
| App entitlement | FOUNDATION | Website membership is designed to become the shared entitlement source. Do not claim the mobile app is currently consuming it unless that integration is verified separately. |

## Other product concepts

- **Free Drops** — PLANNED. No active giveaway unless real prize, terms, eligibility and privacy details exist.
- **Supporter merch** — PLANNED. Current assets are concept mockups; no production/checkout claim.
- **Basket Breaker, Collection Gap Finder, Set Completion Basket, FateBounty/Demand Signal, Release Command Centre, Preorder Confidence, Indie Exclusives/Fair Drop, Shop Trails** — PLANNED unless a later audit verifies a production implementation.
- **Future multi-TCG support** — PLANNED. The Signal Engine retailer model has a TCG field, but current configured adapters are Pokémon-focused.

## Network metrics and proof

Never hard-code changing catalogue totals and label them “validated” indefinitely.

The Signal Engine can publish measured network snapshots to the website, including:

- products tracked;
- currently available/in-stock offers;
- configured/observed catalogue retailers;
- healthy monitors;
- lifecycle counts and 24h changes;
- recent signals;
- RRP reference products.

Public network proof should use the latest persisted measured snapshot. If none exists, say **Awaiting live network snapshot** rather than substituting old numbers.

Target scale may be shown separately only when explicitly labelled ambition/target, never current achievement.

## Safety and evidence rules

- Incomplete catalogue walks must never replace the last verified complete state.
- Retailer access controls must not be bypassed.
- A queue/security observation is context, not permission to defeat the control.
- A retailer listing is not a guaranteed checkout outcome.
- A click is not a sale.
- A Places result is not verified stock.
- Unknown delivery is not free delivery.
- Unknown RRP is not guessed RRP.
- Demo data must be visibly demo data.
- Static sourced data must carry source/freshness context.
- No product statistic, retailer count, user count, revenue number, reliability percentage or performance claim should appear without a current evidence source.
