# FateDrop Release Readiness

_Last reviewed: 22 August 2026_

This is the cross-platform release gate for FateDrop. It exists to stop completed work being rediscovered as “pending” and to stop stale architecture being mistaken for current product truth.

A green CI build is necessary but does not by itself prove deployment, browser/device behaviour, billing, Discord or push delivery.

## Current audit snapshot

| Area | Status | Evidence / remaining proof |
| --- | --- | --- |
| Signal Engine reliability | **GREEN FOUNDATION** | Core retailer monitoring architecture exists; continue measuring source health rather than redesigning stable paths without evidence. |
| Final signal vocabulary | **GREEN IN WEB CODE** | Whisper → Echo → Manifested → Vanished is the locked public contract. Drop Pulse remains supporting context only. |
| Web companion architecture | **GREEN RENDERER / ASSET HANDOFF OPEN** | Final roster is Koru, Fenn, Aeris, Nyxen and Solix. Aeris/Nyxen/Solix are registered on the web renderer. Fenn's supplied reaction pack is verified but its web binaries still need the final repo handoff. Koru retains the approved 2D fallback until the correct Koru GLB is recovered and verified. |
| Web public visual approval | **GREEN DESKTOP / MOBILE QA REMAINS** | Final Collectors, Retailers, Events, Trust and About PNG heroes are committed and the current public desktop direction has been visually approved. Mobile crop/runtime smoke remains a release check. |
| Web security baseline | **VALIDATING** | Security headers and private/no-store handling exist in source; deployed response/header smoke still required. |
| Production database schema | **GREEN FOUNDATION** | Account, Wishlist, notification preference, FateMatch and related additive storage exists; operational usage still needs production proof per feature. |
| True Price / RRP logic | **GREEN FOUNDATION** | RRP-first comparison and unknown-delivery fail-closed behaviour are implemented. Broader authoritative RRP coverage remains a data task. |
| Mobile code | **OUTSIDE CURRENT WEB PASS** | Mobile reconciliation is intentionally separate from this website release branch. Companion parity must be proven before a mobile release claims the same five-character experience. |
| Native/EAS project link | **BLOCKER FOR STANDALONE MOBILE** | Standalone iOS/Android proof requires the real EAS project link and signed builds. |
| Production push | **BLOCKER IF ADVERTISED LIVE** | Real device endpoint registration and end-to-end delivery must be proven before push is advertised as operational. |
| Discord | **CONDITIONAL BLOCKER** | Treat as a blocker only if Premium Discord is advertised as live. Production send/entitlement proof is required. |
| Paid Stripe launch | **BLOCKER FOR PAID LAUNCH** | Do not claim live paid subscriptions until live-mode price/webhook/entitlement/cancellation behaviour is proven. |
| Website production smoke | **BLOCKER** | Must be checked against the deployed release candidate after the final web asset handoff. |

## 1. Canonical release lines

### Website

The current release candidate is isolated on:

`agent/web-koru-final-revamp-2026-08-21`

Draft PR #24 remains unmerged. `main` must stay untouched until exact-head CI and final runtime/visual QA are green and explicit merge approval is given.

### Mobile

Mobile is not being modified by the current website pass. Before companion parity is claimed there, reconcile and prove these exact active IDs:

- `koru`
- `fenn`
- `aeris`
- `nyxen`
- `solix`

Koru remains the mascot and signal voice regardless of personal companion selection.

### Cloud

Cloud remains the canonical source for retailer/product/offer observations, lifecycle signals and network snapshots.

Remaining Cloud work should focus on retailer/source coverage, RRP provenance, health and end-to-end delivery proof rather than reopening solved architecture without evidence.

## 2. Final signal contract — LOCKED

Never drift from these public meanings:

1. **Whisper** — product/catalogue/metadata movement; something may be coming.
2. **Echo** — queue/traffic/security/access readiness changed; get ready; stock is not confirmed.
3. **Manifested** — confirmed purchasable live stock.
4. **Vanished** — previously confirmed availability is gone or no longer verified.

**Drop Pulse** is supporting evidence/context, not a fifth lifecycle stage.

Exact event cause remains separate from lifecycle state. A queue or restock cause must not replace the lifecycle grouping.

## 3. Koru & Friends companion contract — FINAL FIVE

The active companion roster is exactly:

1. **Koru**
2. **Fenn**
3. **Aeris**
4. **Nyxen**
5. **Solix**

Kael (`K-01`) and Nyra (`N-02`) are archive-only references. Retired Scout, Warden, Droid, radar-drone, signal-orb and mini-beacon concepts are not active companion architecture.

The current web renderer supports the final roster without introducing a heavyweight 3D dependency. Registered GLBs render through `components/companion-webgl-model.tsx`; unavailable models retain an honest fallback instead of blocking account functionality.

A character may use either:

- one approved GLB registered at its stable character path; or
- an approved reaction-specific GLB pack registered through the same companion contract.

See `docs/companion-model-slots.md` for the exact asset boundary.

### Current web model state

- **Koru** — approved 2D mascot fallback active; correct production GLB still needs recovery/verification before registration.
- **Fenn** — source reaction pack verified, including exact state animation names; optimized web binaries still need the final repository handoff before registration.
- **Aeris** — GLB registered.
- **Nyxen** — GLB registered.
- **Solix** — GLB registered.

The web companion page now provides a large selected-character preview plus Idle, Whisper, Echo, Manifested, Vanished and FateMatch preview controls. A green build proves the rendering code compiles; browser visual QA still proves that the actual mesh/texture framing is acceptable.

### Model proof required per character

- approved GLB(s) at the stable character path;
- model registered only in the single companion contract;
- real file structure/clip names verified rather than inferred from filenames;
- fallback works when WebGL/model loading fails;
- acceptable browser/device performance;
- Whisper/Echo/Manifested/Vanished/FateMatch presentation remains semantically correct;
- visual QA confirms the correct character, texture, crop and orientation.

The strongest victory treatment belongs to FateMatch/major confirmed moments, not ordinary Whisper or Echo activity.

## 4. Account/profile separation — LOCKED

A collector profile picture is not a FateDrop companion.

The account may retain a normal profile image/preset system. Koru & Friends companion choice is stored separately inside the legacy-compatible companion storage record.

Saving a profile must not overwrite companion choice. Selecting a companion must not overwrite unrelated account/profile fields.

Historical table/file names containing `avatar` are compatibility names, not permission to reintroduce the deleted layered-avatar companion system.

## 5. True Price / RRP — BETA READY, COVERAGE EXPANDING

Release rules:

- ordinary reseller price is never guessed as RRP;
- RRP is shown only when an authoritative/approved observation exists;
- item price can be compared with RRP even when delivery is unknown;
- unknown delivery remains unknown and is never treated as free;
- delivered True Price is shown only when mandatory delivery/fees are known;
- percentage deltas use the authoritative RRP reference.

Broader RRP provenance is a coverage task, not permission to weaken matching/evidence rules.

## 6. Website production QA — BLOCKER

Run against the final release candidate or production-like preview, not merely a source build.

Public surfaces:

- Home desktop/mobile;
- Collectors;
- Retailers;
- Events;
- Trust;
- About;
- Demo;
- Merch;
- Membership/subscriptions;
- Privacy / Terms / Cookies.

Functional/account surfaces:

- create account / login / logout;
- dashboard private caching/noindex response;
- Koru/Fenn/Aeris/Nyxen/Solix selector and persistence;
- live GLB rendering for every registered character;
- honest fallback for any unregistered/failed model;
- account/profile picture remains separate from companion;
- Search → canonical product → offers → retailer;
- True Price with known/unknown RRP and delivery;
- Wishlist create/remove/sync;
- FateFind create/list;
- Alerts, signal lifecycle and exact-cause presentation;
- notification preferences;
- membership/error/empty/loading states;
- external retailer links use HTTPS and the correct destination;
- CSP does not break imagery, redirects, GLBs, textures or API calls;
- canonical custom domain/metadata/robots behaviour.

## 7. Production push — CONDITIONAL BLOCKER

The code path is not enough. If push is advertised as live, prove on real signed builds:

1. real EAS project ID exists;
2. physical device grants notification permission;
3. push token registers to the authenticated FateDrop ID;
4. one controlled eligible signal queues exactly one push;
5. provider returns a successful ticket/identifier;
6. delivery telemetry records the result;
7. physical device receives it;
8. tapping opens the intended FateDrop context;
9. duplicate processing does not duplicate delivery;
10. revoked/dead tokens disable safely.

## 8. Discord — CONDITIONAL BLOCKER

Discord is not allowed to become a second membership authority.

Before advertising Premium Discord as live, prove:

- required bot/channel configuration exists;
- one controlled FateDrop message is recorded as sent and visibly arrives;
- permissions are least-privilege;
- account link and Premium entitlement work as advertised;
- cancellation/expiry removes Premium access where role gating is used;
- Discord failure cannot break web/push delivery.

## 9. Stripe — BLOCKER FOR PAID LAUNCH

Do not open paid subscriptions solely because checkout code exists.

Required live proof:

- final owner-approved Plus/Pro commercial split;
- live price IDs and production secret/webhook configuration;
- controlled real subscription;
- signature-verified webhook updates membership;
- effective capabilities reflect backend membership truth;
- duplicate webhook is idempotent;
- cancellation, failed payment and expiry return correct entitlement state;
- checkout clearly states price, billing frequency, trial, renewal and cancellation.

## 10. Mobile physical QA — SEPARATE RELEASE GATE

Run on standalone/internal builds only after mobile companion reconciliation:

- fresh install / cold start;
- sign in / sign out / expired session;
- Home / Search / Indies / Alerts / More;
- True Price and RRP-first comparison;
- canonical Whisper / Echo / Manifested / Vanished presentation;
- exactly five Koru & Friends companion slots;
- each approved mobile 3D model loads and reacts correctly;
- notification permission allowed/denied;
- push register / receive / tap-through;
- retailer external checkout;
- background/foreground recovery;
- iPhone and Android core pass.

## 11. Safe-to-defer product areas

These do not block the first solid beta unless marketed as live promises:

- FateScore public scoring policy;
- FateFair;
- FateWindow;
- basket optimisation;
- Reserve & Collect;
- Passport;
- XP/tokens/progression;
- broad multi-TCG expansion;
- richer event/vendor expansion.

## Current release decision

**The website branch is materially closer to visual beta readiness, but unrestricted public/paid launch is not approved yet.**

The remaining website-specific gates are primarily proof and final binary handoff rather than another redesign:

1. keep the final PR head green after every remaining web edit;
2. complete the Fenn optimized-binary handoff and register it;
3. recover and visually verify the correct Koru GLB before replacing its safe 2D fallback;
4. visually inspect the registered 3D models and companion reaction stage in-browser;
5. run final desktop/mobile public-route smoke and core logged-in journeys;
6. run deployed security/header/CSP/canonical-domain smoke;
7. prove Stripe only before taking real paid subscriptions;
8. prove Discord/push only if those channels are advertised live;
9. complete final UK legal/data-controller/retention review before scaled acquisition;
10. obtain explicit user approval before merging PR #24.

Do not reopen completed product design unless a release test demonstrates a real functional, security or consistency defect.
