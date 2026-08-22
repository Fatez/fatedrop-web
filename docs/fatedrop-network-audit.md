# FateDrop Network Consistency Audit

_Date: 22 August 2026_

Branch: `agent/web-koru-final-revamp-2026-08-21`

Scope: FateDrop Web public site, authenticated dashboard, account surfaces, public product language and the website-side boundary to FateDrop Cloud, mobile and Discord.

The canonical product authority remains `docs/fatedrop-product-truth.md`. This audit records the final website direction and the inconsistencies that have now been resolved around it.

## Executive summary

FateDrop Web is being consolidated around one product story instead of a collection of separately named experiments.

The durable public proposition is:

**FateDrop is a TCG signal-intelligence and discovery layer that helps collectors understand what changed, what a product really costs, and which participating retailer can actually serve the demand — while sending the collector back to the retailer to complete the purchase.**

The final website brand layer is Koru & Friends: mature, dusk-toned, character-led and memorable without replacing the serious product underneath it.

The launch focus remains Pokémon TCG in the UK. Wider TCG expansion is a future direction, not a homepage promise.

## FINAL — public signal lifecycle

The public network language is permanently:

**Whisper → Echo → Manifested → Vanished**

These are evidence states, not marketing urgency labels. A product does not have to pass through every stage.

### Whisper — product / catalogue movement

Whisper is a real public state.

Use it when FateDrop observes meaningful product, catalogue or metadata movement that may be worth watching. Something may be coming, but purchasable stock is not confirmed.

Examples include new catalogue objects, product appearances and meaningful metadata changes.

**Whisper is not Echo and must never be collapsed into Echo.**

### Echo — access readiness

Echo means queue, traffic, security or access behaviour changed in a way that tells the collector to get ready.

Stock is still not confirmed merely because an Echo exists.

### Manifested — confirmed availability

Manifested means purchasable availability has been confirmed from the observed evidence.

### Vanished — confirmed availability lost

Vanished means previously confirmed availability has gone, sold out or is no longer verified.

Drop Pulse may summarise activity, but it is contextual evidence and not a fifth lifecycle state.

## RESOLVED — FateFind / FateMatch naming collision

The final product meaning is:

- **FateFind = the hunt the collector creates.**
- **FateMatch = the successful observed result that satisfies a FateFind.**
- **Universal Wishlist = a separate simple product save.**

Existing internal compatibility keys may remain where removing them would break clients, but public copy must preserve this distinction.

## FINAL — True Price

True Price is a major FateDrop USP and should appear as context across Search, comparisons, FateFind/FateMatch and alerts where evidence supports it.

The hierarchy is:

1. observed item price;
2. authoritative/official RRP where known;
3. £ / % difference from RRP where valid;
4. known mandatory delivery/fees;
5. delivered True Price where delivery is known.

Unknown delivery remains unknown. Unknown RRP remains unknown. Neither is guessed.

## FINAL — collector ↔ independent retailer bridge

FateDrop is not being positioned as a marketplace.

The intended journey is:

**collector intent → FateDrop intelligence/discovery → independent retailer → retailer checkout**

The retailer keeps:

- its identity and brand;
- its own product page;
- pricing and checkout;
- payments;
- fulfilment and returns;
- the customer relationship.

FateDrop helps the collector find and understand the offer. It does not pretend to be the stockist.

## FINAL — public website information architecture

### Home

The homepage is intentionally short and product-led:

1. approved Koru dusk hero;
2. core FateDrop value: Signals, True Price, FateFind → FateMatch and independent discovery;
3. Koru & Friends / merch bridge after the product explanation;
4. collector ↔ FateDrop ↔ indie retailer bridge;
5. Events/Fate Encounters entry point;
6. membership/final join CTA.

The interactive phone is deliberately kept off Home and lives on the dedicated `/demo` page. Roadmap, speculative future features and long-form product explanations do not belong on Home.

### Collectors

Explains the collector job: detect, compare, create FateFind hunts, receive FateMatch results, discover independents and use supporting Wishlist/Local Radar/Events tools.

### Retailers

Explains relevant discovery, catalogue connection and direct hand-off to retailer checkout. Commercial placement must never purchase better verification or stronger evidence.

### Events

The existing Events/Fate Encounters structure remains intentionally intact. It focuses on source-backed events, locations, organisers/vendors and evidence-safe event inventory.

### Trust

Explains the final four-stage lifecycle, True Price evidence rules and the principle that trust cannot be bought. FateScore remains planned rather than presented as a finished score.

### About / Vision

Holds the wider multi-TCG direction and planned concepts so future thinking remains visible without burying the current product.

### Demo

Holds the controlled interactive phone/product demonstration. Sample content remains visibly labelled and cannot masquerade as live network activity.

### Merch

Supports FateDrop and Koru & Friends culture without becoming a second product or weakening the signal-intelligence proposition.

### Free Drops

Retired from public discovery. The old route redirects home and is absent from navigation and sitemap.

## FINAL — Koru & Friends companion system

The old generic Companion/loadout/Droid architecture has been removed from the active companion experience.

The active roster is exactly:

1. **Koru** — FateDrop mascot and network voice;
2. **Fenn**;
3. **Aeris**;
4. **Nyxen**;
5. **Solix**.

Each has one stable character slot behind the shared renderer contract. A character may use one approved GLB or a verified reaction-specific GLB pack without creating another companion identity.

Koru remains FateDrop's mascot and signal voice regardless of which personal companion a collector selects.

Current Web model state is explicit:

- Koru — approved 2D fallback active while the correct production GLB is recovered/verified;
- Fenn — source reaction pack verified and optimized for Web; final binary repository handoff/registration remains;
- Aeris — GLB registered;
- Nyxen — GLB registered;
- Solix — GLB registered.

Registered Web assets render their real mesh/texture through the lightweight WebGL boundary. Reduced-motion preference keeps the real model visible but stops continuous presentation motion. Skeletal animation playback is not claimed merely because source GLBs contain clips; it must be implemented and visually verified before public copy describes those animations as active.

All five use the same underlying reaction contract:

- Whisper — notice / anticipation;
- Echo — readiness / get ready;
- Manifested — confirmed-stock reaction;
- Vanished — lost-signal reaction;
- FateMatch — personal successful-hunt reaction.

Character personality may affect presentation or verified animation. It must never change the evidence, confidence or meaning of the underlying signal.

### Legacy archive

Kael (`K-01`) and Nyra (`N-02`) remain legacy/archive FateDrop character references only. They do not occupy active Koru & Friends slots and are not selectable in the final five-character system.

Retired Droid, Scout, radar-drone, signal-orb and mini-beacon companion concepts are not active product architecture.

Model handoff is documented in `docs/companion-model-slots.md`.

## RESOLVED — profile and companion were conflated

Collector profile presentation and Koru & Friends companion choice are now separate concepts.

The profile editor may change account presentation. It must preserve the stored companion choice.

The companion selector changes only the selected Koru & Friends character and must not overwrite unrelated profile/account data.

## RESOLVED — interactive phone taught the wrong lifecycle

The public phone demonstration previously used Echo for catalogue movement. It now uses:

- Whisper for catalogue/product movement;
- Echo for queue/access readiness;
- Manifested for confirmed availability;
- Vanished for lost confirmed availability.

The phone also now introduces the same five Koru & Friends slots as the authenticated dashboard rather than a generic signal droid.

## RESOLVED — Search and True Price use canonical network paths

Dashboard Search consumes the canonical Signal Engine catalogue path rather than creating a second search truth.

Main dashboard True Price comparison consumes the canonical network comparison path. Experimental direct storefront integrations are not treated as the entire network.

## RESOLVED — Alerts is personal

Global network activity belongs primarily on Home.

Alerts focuses on the collector's own FateFinds, FateMatches, notification history and delivery preferences. The four lifecycle states remain distinct in notification settings.

## RESOLVED — mutable network proof is not hard-coded

Old fixed retailer/product/in-stock figures are not used as live public proof.

When current measured network state is unavailable, FateDrop reports unavailable state rather than substituting a retired static snapshot.

## Retailer / backend systems that should remain behind the consumer story

Keep these systems, but do not clutter public navigation with them:

- retailer outbound attribution;
- retailer analytics;
- retailer plan/entitlement foundations;
- Shopify/WooCommerce/CSV/feed onboarding;
- monitor health;
- catalogue health;
- feature flags;
- RRP provenance;
- canonical product identity resolution;
- offer matching;
- event ingestion;
- privacy-safe aggregate demand insight.

## HOLD / PLANNED — do not promote as current launch pillars

- FateScore;
- FateFair;
- FateWindow;
- Reserve & Collect;
- basket optimisation / Basket Breaker;
- consumer Demand Signal UI;
- Bounties / Priority One concepts;
- Passport/progression/token systems;
- expanded Event Vendor Mode;
- wider multi-TCG rollout.

These concepts can remain documented and architecturally possible without competing with the product that exists now.

## Safety and evidence invariants

- Incomplete catalogue walks never replace the last verified complete state.
- Retailer access controls are not bypassed.
- Whisper product/catalogue movement is not Echo access readiness.
- Echo queue/security/traffic evidence is not a promise that stock is imminent.
- Manifested requires confirmed availability evidence.
- Vanished applies to previously confirmed availability that is no longer observed/verified.
- A retailer listing is not guaranteed checkout success.
- A click is not a sale.
- A Places result is not verified stock.
- Unknown delivery is not free delivery.
- Unknown RRP is not guessed RRP.
- Drop Pulse is context, not a fifth lifecycle state.
- Demo data is visibly demo data.
- Commercial placement cannot buy stronger trust or stock evidence.
- No mutable product statistic or reliability claim is presented without a current evidence source.

## Remaining engineering work

The intentional remaining work after this website pass is narrow:

- complete the final Fenn binary handoff/registration and recover/verify the correct Koru GLB;
- visually QA the rebuilt public pages and dashboard on desktop/mobile;
- visually QA registered 3D companions for identity, texture, framing, fallback and reduced-motion behavior;
- implement skeletal animation playback only if/when it is deliberately promoted from the current state-presentation boundary;
- reconcile the mobile app companion implementation to the same five-slot contract before mobile parity is claimed;
- continue Cloud retailer/event/RRP coverage improvements;
- perform final production-like browser smoke testing before any production merge/deploy.

## Non-goals / release protection

This branch does not:

- merge or deploy itself;
- delete user/business data;
- expose secrets;
- invent partnerships, stock, RRP, delivery or network metrics;
- change retailer checkout ownership;
- turn Koru & Friends into a replacement for FateDrop's core product;
- add a sixth active companion without an explicit future product decision.
