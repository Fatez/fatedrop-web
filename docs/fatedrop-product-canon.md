# FateDrop Product Canon

_Last established: 27 August 2026_

## Purpose

This document preserves **why FateDrop is the product it is**, not only what the current code happens to do.

It is the long-term record of deliberate product decisions made while designing FateDrop: major features, sub-features, behaviours, evidence rules, naming, boundaries, relationships, UX intent, commercial intent and important edge cases.

`docs/fatedrop-product-truth.md` remains the implementation-facing product authority for what current Web/App/Cloud/Discord surfaces are allowed to claim. This Product Canon is the design-and-intent authority used to explain **why those rules exist and what must not drift when the implementation evolves**.

When the two appear to disagree:

1. do not silently redefine the product;
2. identify whether the implementation changed, the product decision genuinely changed, or one document is stale;
3. record the new explicit decision;
4. reconcile the implementation-facing Product Truth deliberately.

---

# 1. Canon granularity rule

**Every deliberate product decision matters, including decisions inside a larger feature.**

A main feature is not represented by one paragraph and then treated as finished. Its meaningful component decisions are canonical too.

The hierarchy is:

**FateDrop → product pillar → feature → sub-feature → individual behaviour/rule → rationale → edge case/boundary → implementation status**

Examples:

- FateFind is a feature.
- Configuration-aware comparison is a FateFind sub-feature.
- Keeping a single booster pack distinct from a four-pack is a rule inside that sub-feature.
- The reason is that smallest checkout price is not equivalent to strongest value.
- The boundary is that FateDrop must not manufacture equivalence between unlike configurations.

All of those levels belong in the canon.

A decision must not be discarded as an “implementation detail” when changing it would change the user promise, evidence standard, product meaning, trust model, commercial model or intended experience.

---

# 2. Decision-trace rule

For meaningful decisions, preserve this chain wherever practical:

**Idea / problem → reasoning → decision → canonical definition → child rules → public explanation → implementation status**

The purpose is not to archive every casual sentence. The purpose is to preserve the decisions that shaped FateDrop so they can be reconstructed later without relying on memory or scattered conversations.

When a later thought conflicts with an earlier locked decision, the newest sentence does **not** automatically replace the old one. First determine whether it is:

- a clearer way of explaining the same intent;
- a genuine product improvement;
- an implementation workaround;
- an experiment;
- or an accidental contradiction.

Only a genuine deliberate product change should update the canon.

---

# 3. FateDrop core philosophy

## FD-CORE-001 — What FateDrop is

FateDrop is a **TCG intelligence network**: a signal-intelligence, buying-intelligence and discovery layer that observes fragmented retailer and hobby activity, turns evidence into understandable meaning, and helps a collector decide what to do next.

It is not merely a stock-alert app.

Stock alerts are one output of the underlying intelligence system.

### Why this matters

The product has grown beyond “tell me when Pokémon is in stock.” Its value comes from connecting multiple questions:

- What is moving?
- Is it real?
- What is it worth?
- Where is the strongest buying opportunity?
- Can FateDrop watch until my conditions are met?
- What shops, physical locations and events are around me?
- How do independent retailers participate in the same network?

The product should therefore be explained as one connected intelligence network, not as a pile of unrelated mini apps.

## FD-CORE-002 — Current market scope

Pokémon TCG in the UK is the launch focus.

The architecture may support additional TCGs later, but wider TCG coverage must not be marketed as current reality until it is genuinely supported.

## FD-CORE-003 — Precision over noise

FateDrop deliberately prefers **fewer useful signals over lots of weak or misleading alerts**.

A notification should earn the right to interrupt the collector.

This principle applies to:

- lifecycle signals;
- personal alerts;
- FateMatch;
- retailer monitoring;
- Local Radar;
- RRP claims;
- event/vendor evidence;
- future trading intelligence.

## FD-CORE-004 — Unknown stays unknown

Missing evidence must never be converted into a convenient assumption.

Examples:

- unknown delivery is not free delivery;
- unknown RRP is not inferred from an ordinary selling price;
- nearby branch does not mean branch stock;
- online stock does not mean physical stock;
- vendor attendance does not imply event inventory;
- a failed observation does not automatically mean Vanished.

## FD-CORE-005 — Cloud owns business truth

Canonical product identity, retailer identity, RRP/reference truth, stock truth, lifecycle state, matching logic, confidence/evidence and other business intelligence belong to shared Cloud contracts.

Web, App and Discord consume that truth. They must not invent independent interpretations that cause the same evidence to mean different things on different surfaces.

## FD-CORE-006 — The collector journey

A useful shorthand for FateDrop is:

**Detect → Understand → Compare → Watch → Find → Act**

This is not a rigid navigation sequence. It is the connected job the network performs.

## FD-CORE-007 — Brand motto

**“Fate is what you’re searching for. The Drop is the moment you find it.”**

This is the implied brand meaning and should guide product and marketing language without being forced into every screen.

---

# 4. Signal Intelligence

## FD-SIG-001 — Signal Engine

The Signal Engine is the intelligence infrastructure beneath FateDrop, not merely a feed shown to users.

It observes retailer and network evidence, normalises it, resolves identity, evaluates meaningful change and emits evidence-backed product states and supporting context.

Its job includes, where applicable:

- retailer observation;
- canonical product resolution;
- retailer identity resolution;
- stock/purchasability evaluation;
- price observation;
- RRP/reference resolution;
- delivery/True Price evidence;
- preparation/readiness evidence;
- signal lifecycle evaluation;
- persistence/history;
- notification eligibility;
- channel delivery inputs;
- local versus online truth separation.

### Canonical public idea

“FateDrop doesn’t just watch for the words ‘In Stock.’ It watches the movement around the drop.”

## FD-SIG-010 — Four-stage public lifecycle

The public lifecycle is:

**Whisper → Echo → Manifested → Vanished**

These are evidence states, not four unrelated features and not a mandatory sequence every product must travel through.

### FD-SIG-011 — Whisper

Whisper means early or weaker meaningful movement worth watching.

User meaning:

**“Something is moving.”**

It can represent credible product/catalogue/metadata precursor evidence but must not imply confirmed access or purchasable stock.

### FD-SIG-012 — Echo

Echo means stronger preparation/readiness/access evidence that justifies telling the collector to pay attention and get ready.

User meaning:

**“Pay attention. Get ready.”**

Qualifying evidence may include strong retailer preparation, official listing/readiness evidence, queue/access/security behaviour or equivalent evidence supported by the canonical Cloud classifier.

Echo is intentionally more important/rarer than generic movement.

Echo is **not a promise that stock will definitely arrive** and is not checkout confirmation.

### FD-SIG-013 — Manifested

Manifested means genuine verified purchasable availability has been established.

User meaning:

**“It’s real. You can act.”**

This is the strongest ordinary availability state and deserves the strongest confirmed-stock presentation.

### FD-SIG-014 — Vanished

Vanished means previously verified availability is no longer verified/observed, sold out or otherwise lost according to sufficient evidence.

It must not be generated merely because one observation temporarily failed.

### FD-SIG-015 — Stages need not all occur

A product does not need to pass through every stage.

The lifecycle describes what the evidence currently supports, not a theatrical sequence FateDrop must artificially force.

## FD-SIG-020 — Cause and state are separate

Lifecycle state answers **what the evidence now means**.

Cause/context answers **why FateDrop thinks it changed**.

Queue activity, security changes, new listing presence, restock, sold-out behaviour and other causes should not be blurred merely because they can lead to similar user attention.

## FD-SIG-030 — Drop Pulse

Drop Pulse is contextual activity evidence around a product/signal. It is **not a fifth lifecycle stage**.

It should favour explainable evidence such as:

“High activity · 4 meaningful changes in 12 min”

rather than unexplained urgency numbers such as “Drop Score 98/100”.

Public idea:

**“Drop Pulse shows the movement behind the signal.”**

## FD-SIG-040 — Presentation strength follows evidence strength

The strongest celebratory companion animation/reaction should be reserved for Manifested or a genuine FateMatch-found result.

Whisper and Echo should use anticipation, notice, scan, readiness or equivalent restrained reactions.

Presentation must not overstate evidence.

---

# 5. Search / Canonical Catalogue

## FD-SEARCH-001 — Core question

Search answers:

**“What does FateDrop currently know about this product?”**

Search is factual discovery, not the place that has to decide the best buying option.

## FD-SEARCH-002 — Product-first journey

The durable model is:

**search → canonical product → observed retailer offers → compare → retailer**

The same real-world product should be grouped under canonical identity where evidence permits rather than displayed as a meaningless pile of duplicate retailer pages.

## FD-SEARCH-003 — Search evidence

Where known, Search may expose:

- current observed retailer offers;
- stock state;
- item price;
- RRP/reference context;
- delivery context;
- retailer identity;
- retailer handoff.

Unknown fields stay unknown.

## FD-SEARCH-004 — Search does not invent “best”

Search can show factual offers without pretending the smallest raw price is the best deal.

The “strongest value now” decision belongs to FateFind.

Public language:

**“One search. The network answers.”**

---

# 6. RRP Intelligence

## FD-RRP-001 — Purpose

RRP/reference intelligence gives the observed selling price meaning.

A price is more useful when the collector can see whether it is below, at or above a legitimate reference.

Public idea:

**“A price means more when you know what it should have cost.”**

## FD-RRP-002 — Provenance matters

An ordinary reseller price must never silently become “official RRP.”

A legitimate reference must preserve sufficient provenance/authority.

## FD-RRP-003 — Unknown RRP

If the system cannot establish a legitimate RRP/reference, it stays unknown.

FateDrop must not manufacture confidence for a cleaner UI.

## FD-RRP-004 — RRP context should travel with the opportunity

Where evidence exists, RRP context should be available across relevant buying-intelligence surfaces including Search, FateFind, FateMatch and Alerts rather than living in one isolated page.

## FD-RRP-005 — Self-healing is evidence repair, not magical certainty

RRP reconciliation/resolution can progressively repair missing or conflicting evidence, but public claims must reflect what is actually established now.

The system should never imply “AI knows the RRP” when the evidence has not been resolved.

---

# 7. True Price

## FD-TP-001 — Definition

True Price is the observed item price plus **known mandatory delivery/fees**.

Example:

£49.99 item + £4.99 mandatory delivery = £54.98 True Price.

## FD-TP-002 — True Price is a metric, not a separate flagship product

True Price belongs inside FateFind and other qualifying buying-intelligence surfaces.

It should not fragment the product into another unrelated top-level destination merely because it is an important calculation.

## FD-TP-003 — Unknown delivery is unknown

If delivery cannot be established, FateDrop must not assume £0.

RRP-first item-price comparison can still be useful while delivery remains unknown.

## FD-TP-004 — Shelf price versus cost to buy

Public idea:

**“The shelf price isn’t always the price you pay. True Price includes known mandatory delivery so you can compare what the purchase really costs.”**

---

# 8. FateFind

## FD-FIND-001 — Canonical public name

The public product name is **FateFind**.

Do not create a separate public “Fate Finder” concept with a different definition.

## FD-FIND-002 — Core question

FateFind answers:

**“What is the strongest-value option I can buy right now?”**

FateFind = **NOW**.

## FD-FIND-003 — Not a cheapest-price sorter

FateFind must not rank purely by the smallest checkout number.

A £9 single pack can cost less to buy than a £16 four-pack while still being much worse value.

FateFind exists to explain that difference.

## FD-FIND-004 — Comparable configurations remain distinct

Genuinely different quantities/configurations must remain visible and correctly normalised for comparison.

FateDrop must not pretend unlike offers are equivalent merely because their names look similar.

## FD-FIND-005 — RRP/reference first

Where legitimate, item price versus the correct authoritative RRP/reference is the headline value context.

The reference must be legitimate before FateDrop claims an RRP-based winner.

## FD-FIND-006 — Delivery remains explicit

Known mandatory delivery is kept visible and feeds True Price.

Unknown delivery stays unknown.

## FD-FIND-007 — Shared comparison truth

FateFind Web and App must consume the same canonical Cloud comparison behaviour.

A client must not independently reinterpret “best value.”

## FD-FIND-008 — Explain the result

The user should be able to understand **why** an offer is considered strong value through its configuration, price, RRP/reference position, delivery/True Price and availability evidence.

## FD-FIND-009 — Retailer handoff

FateDrop identifies the opportunity; the purchase continues with the retailer.

FateDrop is not merchant of record for ordinary retailer purchases.

### Public language

**“FateFind doesn’t just find the lowest price. It finds the strongest value.”**

**“Ready to buy? FateFind compares the live market and shows you where your money goes furthest.”**

---

# 9. FateMatch

## FD-MATCH-001 — Core question

FateMatch answers:

**“Tell me when this product becomes buyable on my terms.”**

FateMatch = **WHEN**.

## FD-MATCH-002 — Monitoring versus searching

FateFind is an immediate buying comparison.

FateMatch persists intent and keeps watching while the user is away.

## FD-MATCH-003 — Simple watch remains valid

The simplest FateMatch can simply require the product to become genuinely in stock.

The feature must not become needlessly complicated before it is useful.

## FD-MATCH-004 — Optional qualifying conditions

A watch may include supported conditions such as:

- stock required;
- RRP only / at or below RRP;
- maximum percentage above RRP;
- maximum item price;
- maximum True Price;
- eligible retailers;
- excluded retailers.

## FD-MATCH-005 — A match requires a real qualifying offer

A FateMatch result matters only when a genuine observed offer satisfies the user’s stored rules.

Generic network movement must not be relabelled as a personal match.

## FD-MATCH-006 — Match explanation

A qualifying result should preserve enough context to explain why it matched, including where available:

- product;
- retailer;
- stock;
- item price;
- valid RRP/reference and percentage;
- known delivery;
- True Price;
- qualification reason;
- retailer route.

## FD-MATCH-007 — Companions do not change truth

A chosen Koru & Friends companion may present/react to the result, but the match evaluator remains one shared Cloud truth.

### Public language

**“Set the conditions. FateMatch watches the network.”**

**“Don’t chase the product. Tell FateMatch what you’re waiting for and let FateDrop come back when the opportunity is real.”**

---

# 10. Universal Wishlist

## FD-WISH-001 — Core meaning

Wishlist means:

**“I want / like this product.”**

It is memory/intent, not active monitoring.

## FD-WISH-002 — Wishlist survives retailer/stock changes

A saved product should remain useful even if a particular retailer sells out or disappears.

## FD-WISH-003 — Saving does not silently create notifications

Putting something on the Wishlist must not automatically create a FateMatch or notification promise.

### Canonical onboarding distinction

**Wishlist = Save it.**

**FateFind = Find it now.**

**FateMatch = Watch for your moment.**

---

# 11. Alerts and Notification Preferences

## FD-ALERT-001 — Alerts is not the Signal Engine

The Signal Engine creates/evaluates shared intelligence.

Alerts is the collector-facing delivery/history layer for relevant evidence and personal matches.

## FD-ALERT-002 — Evidence ledger

Alerts should help answer:

**“What happened that matters to me?”**

It should preserve enough evidence/context to understand the change rather than acting as a disposable push-notification list.

## FD-ALERT-003 — Personal versus global

Global network movement belongs primarily on Home/network activity.

Personal delivery/history belongs primarily in Alerts.

## FD-ALERT-004 — Precision objective

The objective is not maximum notification volume.

The desired trust relationship is:

**“When FateDrop interrupts me, I should probably look.”**

## FD-NOTIFY-001 — Control interruption, not observation

Notification preferences determine what should interrupt the user and through which supported channel.

They do not require the underlying network to stop observing everything else.

Public language:

**“FateDrop watches broadly. You decide what deserves your attention.”**

## FD-NOTIFY-002 — Saved setting is not proof of live channel delivery

A preference may exist before a channel is fully connected/operational.

The UI must not equate “preference saved” with “delivery path production-verified.”

---

# 12. Home / Network Activity

## FD-HOME-001 — Home is the heartbeat

Home answers:

**“Anything worth knowing right now?”**

It should provide a fast picture of meaningful network activity, relevant personal context and routes into the deeper tools.

## FD-HOME-002 — Home is not the entire manual

The homepage/dashboard must not become a wall of every feature and roadmap idea.

The product should be understood through a coherent journey rather than an ever-growing feature-card grid.

Recommended public journey:

1. **See it coming** — Whisper / Echo.
2. **Know when it’s real** — Manifested.
3. **Know what it’s worth** — RRP + True Price.
4. **Find the strongest option** — FateFind.
5. **Let FateDrop keep watching** — FateMatch.
6. **Discover the wider network** — Indies + Local Radar + Fate Encounters.

---

# 13. Independent Retailer Network

## FD-INDIE-001 — Strategic purpose

Independent discovery is a core differentiator and prevents FateDrop becoming only another national-retailer stock notifier.

## FD-INDIE-002 — Collector value

The network gives collectors more relevant places to discover products, prices and stock opportunities, including smaller retailers they may not already know.

## FD-INDIE-003 — Retailer value

Participating independents can gain relevant product visibility and collector demand without surrendering their own business identity.

Potential measurable surfaces include, where genuinely supported:

- product appearances;
- FateFind visibility;
- best-value wins;
- storefront views;
- retailer visits;
- FateMatch handoffs;
- privacy-safe demand intelligence.

## FD-INDIE-004 — Retailer owns the transaction

The retailer keeps:

- identity and brand;
- own website/product page;
- checkout/payments;
- fulfilment/returns;
- support;
- customer relationship.

Canonical flow:

**collector demand → FateDrop discovery/intelligence → retailer → retailer checkout**

## FD-INDIE-005 — Do not invent sales attribution

A retailer visit/handoff is not a verified sale unless FateDrop genuinely receives conversion evidence.

## FD-INDIE-006 — National and independent roles can coexist

National/RRP retailers can provide useful reference and availability context while independent retailers expand discovery and commercial network value.

### Public language

Collector:

**“Discover more than the biggest retailers. FateDrop connects the wider TCG network.”**

Retailer:

**“Keep your shop. Keep your checkout. Keep your customers. Let FateDrop help them find you.”**

---

# 14. FateDrop Verified

## FD-VERIFY-001 — Meaning

A FateDrop Verified badge means an objective retailer identity/catalogue relationship has been verified to the level the badge specifies.

It does **not** automatically mean:

- cheapest retailer;
- best customer service;
- fastest delivery;
- permanent trustworthiness;
- guaranteed inventory.

## FD-VERIFY-002 — Trust cannot be bought

Commercial placement/promotion must never purchase a stronger evidence state or a misleading trust designation.

---

# 15. Local Radar

## FD-LOCAL-001 — Core purpose

Local Radar connects FateDrop intelligence to the physical TCG world around the collector.

Public idea:

**“See what is around you — and what FateDrop actually knows about it.”**

## FD-LOCAL-002 — Two separate layers

Local Radar contains two fundamentally different forms of information:

1. **location discovery** — relevant physical branches/stores/events near a chosen location;
2. **local intelligence** — what FateDrop can genuinely establish about that exact physical location.

They must never be collapsed into one claim.

## FD-LOCAL-003 — Nearby does not equal stock

A branch being geographically nearby is useful discovery evidence only.

It does not mean that branch carries a particular product.

## FD-LOCAL-004 — Online does not equal physical

**Online stock must NEVER become exact-branch physical Manifested.**

This is a hard trust boundary.

## FD-LOCAL-005 — Exact branch identity matters

Physical availability claims must be associated with the actual branch/location when the claim is branch-specific.

Retailer-wide or website-wide evidence is insufficient for an exact-branch stock claim.

## FD-LOCAL-010 — Local lifecycle

Where local intelligence is shown through lifecycle language:

- **Local Whisper** — credible early/manual/general local intelligence worth watching;
- **Local Echo** — strong retailer/staff/official preparation evidence relevant to a branch/location;
- **Local Manifested** — verified physical availability at the exact branch;
- **Local Vanished** — previously verified exact-branch availability has disappeared.

## FD-LOCAL-011 — Local unknown remains unknown

A lack of local stock data should be displayed honestly rather than converted into “out of stock” or “available”.

## FD-LOCAL-020 — Imperfect retailer data may use curated support

Some retailers expose poor/opaque branch data. Curated/hard-coded branch directories or manual intelligence can be used as an interim evidence source when handled explicitly and kept distinct from verified live inventory.

Do not waste disproportionate engineering time trying to manufacture live certainty from a retailer that does not expose it.

## FD-LOCAL-030 — Navigation intent

The Local Radar experience is organised around:

- Overview;
- Local Stores;
- Events.

This is one physical-world intelligence area, not three unrelated products.

### Public language

**“From online signals to the shops on your doorstep. Local Radar brings the FateDrop network into the real world.”**

---

# 16. Events / Fate Encounters

## FD-EVENT-001 — Naming

Use **Events** as the functional navigation label and **Fate Encounters** as the branded experience title.

## FD-EVENT-002 — Core question

Events answers:

**“Where can I experience the hobby in person?”**

## FD-EVENT-003 — Evidence-backed listings

Dates, venues, organisers and vendor attendance should preserve source/freshness evidence where available.

## FD-EVENT-004 — Vendor attendance does not equal inventory

A vendor confirmed at an event does not imply that vendor will carry a particular product.

An event-inventory claim requires explicit evidence.

## FD-EVENT-005 — Vendor Mode is not a launch promise until proven

Event Vendor Mode can remain foundation/hold until enough reliable organiser/vendor evidence exists to justify the full user promise.

### Public language

**“The hobby doesn’t end at checkout. Discover shows, card fairs, venues and the people behind the community with Fate Encounters.”**

---

# 17. FateDrop ID

## FD-ID-001 — One collector identity

FateDrop ID is the identity that ties the collector experience together across supported FateDrop surfaces.

It can carry/relate to:

- username/profile;
- membership entitlement;
- companion selection;
- Wishlist;
- FateMatch watches;
- notification preferences;
- connected delivery surfaces.

## FD-ID-002 — Discord is linked, not separate identity truth

Discord consumes the linked FateDrop identity/entitlement rather than creating an independent subscription/account authority.

### Public language

**“One collector. One FateDrop ID.”**

**“One FateDrop ID. Your collection journey follows you across the network.”**

---

# 18. Koru & Friends

## FD-KF-001 — Role

Koru & Friends is the character, culture, story and companion layer around FateDrop.

It gives the product personality without replacing the serious intelligence underneath it.

## FD-KF-002 — Evidence remains shared

Characters consume the same Cloud evidence and may vary in presentation/personality only.

They must never alter signal meaning, confidence, price truth, stock truth or match eligibility.

## FD-KF-003 — Koru remains the network mascot

Koru remains FateDrop’s mascot/network voice/default even when a collector chooses another selectable companion.

## FD-KF-004 — Selectable companion roster

The current canonical selectable five are:

- Koru;
- Fenn;
- Aeris;
- Nyxen;
- Solix.

## FD-KF-005 — Oru is distinct

Oru is a separate FateDrop-world character used in brand/app/FateFinder contexts and is **not** silently added as a sixth selectable signal companion.

## FD-KF-006 — Character presentation must not outrun implementation

Having a GLB/model/animation clip in source assets is not enough to claim a particular animated experience is live.

Animation/playback should be described publicly only after the relevant renderer behaviour is implemented and visually verified.

## FD-KF-007 — Profile and companion are separate data

Changing profile presentation must not accidentally overwrite companion choice, and changing companion must not overwrite unrelated account/profile fields.

## FD-KF-008 — Wider IP layer

Koru & Friends also supports the wider brand world: manga/anime lore, wallpapers, Discord culture, merchandise and collectible character identity.

That layer should deepen attachment to FateDrop while remaining original and legally distinct from unrelated established fictional universes.

### Public language

**“Serious intelligence doesn’t have to feel soulless. Choose a companion and make the FateDrop journey yours.”**

---

# 19. Discord

## FD-DISCORD-001 — Delivery/community surface

Discord is an extension of FateDrop, not a competing product.

The same underlying signal meaning, account entitlement and product truth should apply.

## FD-DISCORD-002 — One membership

A collector should not need a second independent paid identity merely because they prefer Discord delivery/community access.

### Public language

**“Website, App or Discord — the signal stays the same.”**

---

# 20. Membership

## FD-MEMBER-001 — Keep the consumer model understandable

Free access should retain meaningful discovery value.

Paid membership unlocks the deeper active monitoring/intelligence/eligible premium alert layer according to the final commercial split.

## FD-MEMBER-002 — Entitlement is canonical

Paid access must be based on shared entitlement truth, not client-only flags that can disagree between Web/App/Discord.

## FD-MEMBER-003 — One purchase should travel with the identity

The intended experience is one FateDrop ID and one relevant entitlement across supported surfaces.

### Public direction

**“FateDrop helps everyone discover. Plus lets the network actively work for you.”**

---

# 21. Fate Network

## FD-NET-001 — Umbrella, not another button

**Fate Network** is the umbrella concept connecting the broader ecosystem. It is not another customer-facing utility that needs to compete with FateFind, FateMatch or Local Radar in navigation.

The network concept connects:

- collectors;
- FateDrop intelligence;
- retailers;
- independent shops;
- physical branches;
- events;
- later collector-to-collector trade intent.

This is the conceptual glue that explains why the product extends beyond online stock alerts.

---

# 22. Fate Trader

## FD-TRADER-001 — Position today

Fate Trader is the emerging collector-to-collector layer of the Fate Network.

It must not be marketed as an equally production-proven beta pillar until the underlying end-to-end promises are actually production verified.

## FD-TRADER-002 — Ecosystem terminology

- **Fate Trader** — overall collector-to-collector trading ecosystem.
- **Fate Trade Finder** — matching across compatible trade intentions.
- **Fate Trade Found** — a successful compatible trade opportunity.
- **Fate Trade Hunt** — persistent monitoring when no current compatible opportunity exists.
- **Trade Network** — browseable network of trade intentions.

These terms must not casually collapse into FateFind/FateMatch, which belong to retailer buying intelligence.

## FD-TRADER-003 — Canonical Card Identity Graph

Trading requires precise card identity rather than loose card names.

The intended identity structure is:

**TCG → era → set → card → number → variant → language → condition/grade**

Do not fabricate card identity, pricing or market value when the evidence does not support it.

## FD-TRADER-004 — Matching begins with explainable compatibility

The first useful matching model is exact/clear reciprocal compatibility before more complex graph trades are attempted.

Multi-party graph trading can remain future direction rather than overcomplicating the first trustworthy experience.

## FD-TRADER-005 — Safety/trust features must earn public claims

Trust scoring, messaging and safe-exchange architecture can be developed in stages, but public copy must not imply end-to-end protected exchange until it is production proven.

### Vision language

**“Fate Trader is the emerging collector-to-collector layer of the Fate Network.”**

**“The Fate Network is being built to go beyond buying — connecting the cards collectors have with the cards other collectors are searching for.”**

---

# 23. Website / public storytelling

## FD-WEB-001 — Do not sell a feature pile

The website should explain the connected collector journey rather than showing every internal system as an equal feature card.

The hierarchy still exists internally and in this canon even when the marketing presentation is intentionally simpler.

## FD-WEB-002 — Demo stays honest

The interactive phone/demo belongs on the dedicated demo experience and may use controlled sample data only when visibly identified as a preview/sample.

Sample activity must never masquerade as current network evidence.

## FD-WEB-003 — Merch is culture/support, not the product proposition

Merchandise and Koru & Friends culture should follow the explanation of what FateDrop actually does.

They strengthen the brand; they do not substitute for the intelligence proposition.

## FD-WEB-004 — Free Drops remains retired unless deliberately revived

Do not casually restore retired public concepts into navigation or marketing because old code/copy still exists.

A deliberate product decision is required.

---

# 24. Engineering-status language

FateDrop work should be tracked as:

**CODED → CI VERIFIED → MERGED → DEPLOYED → PRODUCTION VERIFIED**

These states are deliberately separate.

CI passing alone does not prove a feature works for real users.

A source asset existing does not prove it renders.

A database table existing does not prove the product promise is live.

A merged change does not prove production deployment.

A deployed change does not prove production behaviour.

This language protects the product from accidental overclaiming during beta hardening.

---

# 25. Canonical mental model

| Collector thought | FateDrop concept |
|---|---|
| What is happening? | Signals |
| What exists? | Search |
| Is this price actually good? | RRP Intelligence |
| What will I really pay? | True Price |
| Where is the strongest value right now? | FateFind |
| Tell me when it meets my conditions | FateMatch |
| I want to remember this | Wishlist |
| What happened that matters to me? | Alerts |
| What is near me and what do we genuinely know about it? | Local Radar |
| Where can I experience the hobby physically? | Events / Fate Encounters |
| Which retailers are part of the network? | Indies & Retailers |
| Who am I across FateDrop? | FateDrop ID |
| Who accompanies me? | Koru & Friends |
| Where else can FateDrop reach me? | Discord |
| How does the wider ecosystem fit together? | Fate Network |
| What can I eventually trade with another collector? | Fate Trader |

---

# 26. Canonical marketing spine

A consistent high-level explanation is:

> **FateDrop turns TCG retail movement into buying intelligence.**
>
> Track meaningful signals before and during a drop. Understand prices against trusted RRP references. Compare live opportunities with FateFind. Set your conditions with FateMatch. Discover retailers, local stores and events across the wider network.
>
> **Less chasing. Less noise. Better information when it matters.**

Supporting line:

**“Stop searching shop by shop. Let the network search with you.”**

---

# 27. How future decisions are added

When a new decision is made, do not merely edit a marketing sentence.

Record, at the smallest meaningful level:

1. **Problem / original thought** — what was being solved.
2. **Decision** — what is now intended.
3. **Reasoning** — why this is better for FateDrop/collectors/retailers/trust.
4. **Parent feature** — where it belongs.
5. **Child behaviour(s)** — individual rules affected.
6. **Boundaries / must-not rules** — what would violate the intent.
7. **User-facing explanation** — simple language.
8. **Implementation status** — CODED / CI VERIFIED / MERGED / DEPLOYED / PRODUCTION VERIFIED as applicable.
9. **Supersedes** — which prior decision, if any, was deliberately replaced.

Small but deliberate decisions receive the same treatment as large ones when they materially contribute to the product experience.

---

# 28. Non-drift principle

FateDrop will continue to evolve, but it should evolve **deliberately**.

Ideas can be exploratory while being discussed. Once a product decision is deliberately locked, downstream work should remain consistent with it until another explicit decision supersedes it.

The purpose of this canon is therefore not to stop new thinking. It is to make sure new thinking improves FateDrop instead of accidentally erasing the reasoning that made the existing system valuable.
