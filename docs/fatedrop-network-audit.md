# FateDrop Network Consistency Audit

_Date: 19 August 2026_

Branch: `fatedrop-network-consistency-audit`

Scope: `Fatez/fatedrop-web` with read-only comparison against `Fatez/Fatedrop-Cloud`. The mobile app repository remains deliberately out of scope because it is being repaired and will be reconciled against `docs/fatedrop-product-truth.md` afterwards.

## Executive summary

The website has now moved from a collection of rapidly-added features toward one coherent FateDrop product model.

The canonical authority is now **FateDrop Product Spec v1** in `docs/fatedrop-product-truth.md`.

The highest-value changes in this branch are not cosmetic. They remove stale/fakeable proof, move Search and True Price toward canonical Cloud data, reconnect Search → Compare → FateFind, preserve FateMatch as the successful result, simplify public signal language, make Alerts personal rather than a duplicate global feed, separate Cloud retailer runtime state from storefront experiments, and create a stable renderer boundary for the real 3D Companion.

## Resolved findings

### RESOLVED — hard-coded network proof

Old fixed catalogue/in-stock/retailer/monitor figures are no longer used as live proof.

Public network proof reads the latest persisted Cloud snapshot. If there is no measured snapshot, FateDrop says the measurement is unavailable instead of falling back to retired values.

### RESOLVED — FateFind / FateMatch naming collision

The final product meaning is now:

- **FateFind = the hunt the collector creates.**
- **FateMatch = the successful observed result that satisfies a FateFind.**
- **Universal Wishlist = a separate simple product save.**

Existing `fate_match` storage/API/types are retained for compatibility. The public FateFind API now returns both new and legacy response keys so old clients are not broken merely for branding.

### RESOLVED — Search disconnected from the canonical network

Dashboard Search now uses the Signal Engine `/api/catalogue` endpoint and supports product-first grouping, availability/category/price filters, pagination, RRP context, known-delivery True Price context and direct hand-off to True Price or FateFind.

No sample results are substituted when Cloud has no result.

### RESOLVED — True Price depended on the storefront lab

The main dashboard True Price comparison now uses Signal Engine `/api/true-price` groups rather than treating the two direct Shopify storefront feeds as the network.

Unknown delivery remains structurally unknown and cannot masquerade as a delivered total.

The current Cloud `/api/true-price` group response does not yet expose all RRP fields available in `/api/catalogue`; adding full RRP provenance to the Cloud True Price response is a future Cloud enhancement rather than a reason to fabricate it on the website.

### RESOLVED — public signal terminology was too complex

The public model is now deliberately simpler:

- **Echo** = meaningful early/precursor intelligence; not confirmed stock.
- **Manifested** = confirmed meaningful availability/restock event.
- **Vanished** = previously confirmed availability is lost.
- **Whisper** = internal engine terminology only.

Internal queue/security/drop-pulse/whisper observations can map to public Echo. The Signal Engine's legacy `echo` lifecycle event currently means confirmed restock and therefore maps publicly to Manifested/restock confirmed.

The underlying storage schema is not destructively renamed.

### RESOLVED — Alerts duplicated global network activity

Dashboard Alerts now focuses on the collector:

- active FateFinds;
- personal notification/hunt history;
- delivery-channel readiness;
- Premium monitoring access.

Global network activity belongs on Home. Cross-platform per-signal preference persistence is not invented; the page explicitly leaves that for a shared account model that can serve web/app/Discord.

### RESOLVED — Companion architecture was tied to the illustrated avatar

Existing account loadout persistence remains intact.

`lib/companion-contract.ts` and `components/companion-renderer.tsx` now create an explicit renderer/asset boundary for:

- current 2D fallback;
- future GLB/WebGL character;
- floating droid model;
- reaction animation clips;
- Echo / Manifested / Vanished / FateMatch / major activity reactions.

The final 3D assets are still not claimed as shipped.

### RESOLVED — retailer network and storefront lab were conflated

Static retailer metadata is now separated from Cloud runtime state.

`lib/retailer-network.ts` overlays Signal Engine `/api/status` retailer health onto known retailer metadata. The dashboard retailer page clearly distinguishes:

- canonical Cloud-monitored retailers;
- experimental direct storefront feeds;
- future/static registry candidates.

A healthy Cloud monitor is data-collection evidence, not a paid partnership or automatic FateDrop Verified badge.

### RESOLVED — Events had no canonical migration path

The existing sourced dashboard Events directory remains static/Beta because the Cloud publisher does not yet supply real event records.

A new `/api/events` endpoint now reads persisted Cloud `upcomingEvents`, providing the migration target for automated Fate Encounters ingestion once Cloud starts publishing those records.

### RESOLVED — Plus/Pro marketing exceeded the entitlement implementation

Public copy now acknowledges that the current code has one shared Premium capability envelope. The final Plus-vs-Pro commercial split remains an owner decision rather than an invented entitlement difference.

### RESOLVED — FateWindow / FateScore / FateFair prominence

- FateWindow: **HOLD / experimental**.
- FateScore: **PLANNED** until explainable evidence inputs exist.
- FateFair: **PLANNED**.

None should compete with Search, True Price, RRP, FateFind, Alerts or Indies for launch prominence.

### RESOLVED — baseline production hardening gaps

The branch now includes:

- constant-time Cloud→website ingest-secret comparison;
- same-origin enforcement and bounded numeric validation on FateFind writes;
- production security headers;
- a route-level recovery error boundary;
- private-surface crawler exclusions;
- canonical site URL handling;
- privacy copy for Companion and Local Radar;
- a conservative launch checklist.

A strict Content Security Policy has not been blindly added because the existing site uses substantial inline styles and applying a CSP without a nonce/hash migration could break production rendering.

## Actual Cloud capability verified in source

The inspected Signal Engine supports:

- Pokémon Center UK, Smyths UK and Chaos Cards retailer configuration when enabled;
- product / offer / observation persistence;
- official-RRP provenance fields;
- internal Whisper / Manifested / Vanished / Echo lifecycle derivation;
- baseline signal suppression;
- Discord signal dispatch foundations;
- network snapshot persistence;
- public `/api/catalogue` search with filters/pagination;
- public `/api/true-price` grouped offer comparison;
- public `/api/status` including retailer runtime health;
- website snapshot publishing with measured metrics/signals/RRP references/opportunities;
- queue/security/drop-pulse website signal schema;
- upcoming-event schema, although the current publisher does not yet populate real upcoming events.

Configured retailers are not automatically healthy monitors. Healthy monitors are not automatically verified/partner retailers.

## Transitional architecture that remains intentionally visible

### Direct Shopify storefront lab

Cob & Pip and Wishlist Collectables remain direct website catalogue experiments. They are useful for developing the Indie storefront UX, but they are not the canonical network source.

The target architecture is:

**Cloud owns product/offer/stock/RRP/True Price network truth. Retailer storefronts present participating retailer identity/catalogue data.**

Do not add dozens more one-off website catalogue integrations if the same feed can be onboarded into the canonical retailer/offer model.

### Dashboard Home

The data helper now maps the simplified public signal model, but some static Home copy may still contain older lifecycle wording. This is a remaining presentation cleanup item, not a data-model blocker.

### Universal Wishlist

Product Spec v1 deliberately separates Wishlist from FateFind. The website does not yet have the final persistent cross-retailer Universal Wishlist implementation. Existing historical `wishlist_hit` activity is not equivalent to a full Wishlist product model.

This should be built deliberately alongside the app reconciliation rather than disguised as complete in this branch.

### Shared notification preferences

The final account-level Echo / Manifested / price / push / web / Discord preference model is not yet persisted cross-platform. Alerts states this honestly.

## Cloudflare / deployment readiness

The repository uses Next.js + OpenNext Cloudflare. Validation gates include:

1. `npm run verify`
   - ESLint
   - TypeScript
   - automated tests
   - Next production build
2. `npx opennextjs-cloudflare build`

The live target remains `https://fatedrop-web.fatedrop-web.workers.dev`.

No production deploy is performed by this audit branch.

## Remaining owner/product decisions

These should not be silently guessed in code:

- final Plus vs Pro prices/capability split;
- final FateScore evidence model/publication policy;
- whether/when FateWindow returns from HOLD;
- final Universal Wishlist cross-platform persistence/notification behaviour;
- final retailer paid plans;
- Companion cosmetic/progression economy;
- Event Vendor Mode commercial rules;
- exact multi-TCG rollout order;
- final UK privacy/consumer/legal text;
- production merge/deployment approval.

## Remaining engineering work after this website pass

The next shared web/app phase should cover:

- persistent Universal Wishlist;
- shared cross-platform alert preferences;
- app reconciliation against Product Spec v1;
- richer Cloud True Price/RRP response where needed;
- production event ingestion;
- bringing experimental Indie storefront feeds into canonical Cloud onboarding;
- final 3D Companion assets/renderer integration;
- production browser smoke test on the final deployed Worker/custom domain.

## Non-goals / safety invariants

This branch does not:

- edit the mobile app repository;
- delete user/business data;
- deploy production;
- expose secrets;
- invent retailer partnerships or verification;
- invent stock, RRP, delivery or network metrics;
- bypass retailer access controls.
