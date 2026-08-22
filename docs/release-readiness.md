# FateDrop Release Readiness

_Last reviewed: 22 August 2026_

This is the cross-platform release gate for FateDrop. It exists to stop completed work being rediscovered as “pending” and to stop stale architecture being mistaken for current product truth.

A green CI build is necessary but does not by itself prove deployment, browser/device behaviour, billing, Discord or push delivery.

## Current audit snapshot

| Area | Status | Evidence / remaining proof |
| --- | --- | --- |
| Signal Engine reliability | **GREEN FOUNDATION** | Core retailer monitoring architecture exists; continue measuring source health rather than redesigning stable paths without evidence. |
| Final signal vocabulary | **GREEN IN WEB CODE** | Whisper → Echo → Manifested → Vanished is the locked public contract. Drop Pulse remains supporting context only. |
| Web companion architecture | **GREEN IN BRANCH / MODEL ASSETS PENDING** | Active roster is Koru, Fenn, Aeris, Nyxen and Solix. Old Droid/Scout/layered-avatar companion paths are removed from active web code. |
| Web public visual approval | **BLOCKER** | Exact approved Koru hero PNG and Koru & Friends section PNG still need final branch sync and visual QA. |
| Web security baseline | **VALIDATING** | Security headers and private/no-store handling exist in source; deployed response/header smoke still required. |
| Production database schema | **GREEN FOUNDATION** | Account, Wishlist, notification preference, FateMatch and related additive storage exists; operational usage still needs production proof per feature. |
| True Price / RRP logic | **GREEN FOUNDATION** | RRP-first comparison and unknown-delivery fail-closed behaviour are implemented. Broader authoritative RRP coverage remains a data task. |
| Mobile code | **PRODUCT RECONCILIATION REQUIRED** | Existing protected mobile work may still contain Kael/Nyra and older companion rendering. It must be reconciled to the final five Koru & Friends IDs before companion parity is claimed. |
| Native/EAS project link | **BLOCKER** | Standalone iOS/Android proof requires the real EAS project link and signed builds. |
| Production push | **BLOCKER** | Real device endpoint registration and end-to-end delivery must be proven before push is advertised as operational. |
| Discord | **CONDITIONAL BLOCKER** | Treat as a blocker only if Premium Discord is advertised as live. Production send/entitlement proof is required. |
| Paid Stripe launch | **BLOCKER FOR PAID LAUNCH** | Do not claim live paid subscriptions until live-mode price/webhook/entitlement/cancellation behaviour is proven. |
| Website production smoke | **BLOCKER** | Must be checked against the deployed release candidate after final asset sync. |
| Physical mobile QA | **BLOCKER** | Expo Go is not a substitute for standalone EAS build, fresh install, notification and Android/iPhone proof. |

## 1. Canonical release lines

### Website

The current release candidate is isolated on:

`agent/web-koru-final-revamp-2026-08-21`

Draft PR #24 remains unmerged. `main` must stay untouched until exact-head CI, final artwork sync and visual QA are green.

### Mobile

The historical protected mobile line contains valuable stable work, but its companion implementation is no longer the canonical brand model if it still exposes Kael/Nyra or TCG-specific/legacy characters.

Before mobile companion parity is claimed, reconcile it to these exact active IDs:

- `koru`
- `fenn`
- `aeris`
- `nyxen`
- `solix`

Koru remains the mascot and signal voice regardless of personal companion selection.

Do not throw away stable Expo/renderer work merely because the model roster changed. Replace the character/model registry and reaction mapping behind a clean boundary, then prove the new assets on physical devices.

### Cloud

Cloud remains the canonical source for retailer/product/offer observations, lifecycle signals and network snapshots.

Remaining Cloud work should focus on retailer/source coverage, RRP provenance, health and end-to-end delivery proof rather than reopening solved architecture without evidence.

## 2. Final signal contract — LOCKED

Never drift from these public meanings:

1. **Whisper** — product/catalogue/metadata movement; something may be coming.
2. **Echo** — queue/traffic/security/access readiness changed; get ready.
3. **Manifested** — confirmed purchasable live stock.
4. **Vanished** — previously confirmed availability is gone or no longer verified.

**Drop Pulse** is supporting evidence/context, not a fifth lifecycle stage.

A legacy internal event name must not be trusted blindly. Normalise by the evidence it actually represents.

## 3. Koru & Friends companion contract — FINAL FIVE

The active companion roster is exactly:

1. **Koru**
2. **Fenn**
3. **Aeris**
4. **Nyxen**
5. **Solix**

Kael (`K-01`) and Nyra (`N-02`) are archive-only references on web. Retired Scout, Warden, Droid, radar-drone, signal-orb and mini-beacon concepts are not active companion architecture.

The web contract owns one stable model slot per active character. See `docs/companion-model-slots.md`.

A character may change visual personality or animation. It may not change lifecycle meaning, evidence or confidence.

### Model proof required per character

- approved GLB at the stable slot path;
- model registered in the single companion contract;
- animation clips verified against the real file;
- fallback works when 3D/WebGL fails;
- reduced motion works;
- acceptable browser/mobile performance;
- Whisper/Echo/Manifested/Vanished/FateMatch reactions remain semantically correct.

## 4. Account/profile separation — LOCKED

A collector profile picture is not a FateDrop companion.

The account may retain a normal profile image/preset system. Koru & Friends companion choice is stored separately inside the legacy-compatible companion storage record.

Saving a profile must not overwrite companion choice. Selecting a companion must not overwrite unrelated account/profile fields.

The historical table/file names containing `avatar` are compatibility names, not permission to reintroduce the deleted layered-avatar companion system.

## 5. True Price / RRP — BETA READY, COVERAGE EXPANDING

Release rules:

- ordinary reseller price is never guessed as RRP;
- RRP is shown only when an authoritative/approved observation exists;
- item price can be compared with RRP even when delivery is unknown;
- unknown delivery remains unknown and is never treated as free;
- delivered True Price is shown only when mandatory delivery/fees are known;
- percentage deltas use the authoritative RRP reference.

Broader RRP provenance is a coverage task, not permission to weaken matching/evidence rules.

## 6. Production push — BLOCKER

The code path is not enough. Required proof:

1. real EAS project ID exists;
2. signed-in physical device grants notification permission;
3. push token registers to the authenticated FateDrop ID;
4. one controlled eligible signal queues exactly one push;
5. provider returns a successful ticket/identifier;
6. delivery telemetry records the result;
7. physical device receives it;
8. tapping opens the intended FateDrop context;
9. duplicate processing does not duplicate delivery;
10. revoked/dead tokens disable safely.

Repeat core proof on Android before wider beta.

## 7. Discord — CONDITIONAL BLOCKER

Discord is not allowed to become a second membership authority.

Before advertising Premium Discord as live, prove:

- required bot/channel configuration exists;
- one controlled FateDrop message is recorded as sent and visibly arrives;
- permissions are least-privilege;
- account link and Premium entitlement work as advertised;
- cancellation/expiry removes Premium access where role gating is used;
- Discord failure cannot break web/push delivery.

## 8. Stripe — BLOCKER FOR PAID LAUNCH

Do not open paid subscriptions solely because checkout code exists.

Required live proof:

- live Plus/Pro price IDs;
- production Stripe secret/webhook configuration;
- controlled real subscription;
- signature-verified webhook updates membership;
- web/mobile effective capabilities reflect backend membership truth;
- duplicate webhook is idempotent;
- cancellation, failed payment and expiry return correct entitlement state;
- checkout clearly states price, billing frequency, trial, renewal and cancellation.

## 9. Website production QA — BLOCKER

Run against the deployed release candidate, not merely a local build:

- homepage desktop/mobile visual smoke;
- approved Koru hero PNG renders correctly;
- approved Koru & Friends section artwork renders correctly;
- interactive phone remains below the landing section;
- four-stage lifecycle wording;
- Koru/Fenn/Aeris/Nyxen/Solix selector and persistence;
- missing-model fallback for all five slots;
- account/profile picture remains separate from companion;
- interactive sample/demo labelling;
- create account / login / logout;
- dashboard private caching/noindex response;
- Search → canonical product → offers → retailer;
- True Price with known/unknown RRP and delivery;
- Wishlist create/remove/sync;
- FateFind create/list;
- Alerts and signal packs;
- notification preferences including Whisper;
- membership/error/empty/loading states;
- privacy / terms / trust routes;
- external retailer links use HTTPS and correct destination;
- CSP does not break imagery, Stripe redirects or API calls;
- canonical custom domain/metadata/robots behaviour.

## 10. Mobile physical QA — BLOCKER

Run on standalone/internal EAS builds after companion reconciliation:

- fresh install / cold start;
- sign in / sign out / expired session;
- Home / Search / Indies / Alerts / More;
- True Price and RRP-first comparison;
- canonical Whisper / Echo / Manifested / Vanished presentation;
- exactly five Koru & Friends companion slots;
- each approved 3D model loads and reacts correctly;
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

**Not ready for unrestricted public/paid launch yet.**

The remaining blockers are now mostly proof and final assets rather than another product redesign:

1. finish exact-head web CI after the companion cleanup;
2. sync and visually approve the two exact Koru PNG assets;
3. register the five GLBs as they arrive and verify them one at a time;
4. reconcile the mobile companion registry to the same five IDs;
5. produce standalone iOS/Android beta builds;
6. prove real push delivery;
7. run deployed browser and physical-device smoke tests;
8. prove Discord only if advertised as live;
9. prove live Stripe before taking real paid subscriptions;
10. complete final security/legal deployment review.

Do not reopen completed product design unless a release test demonstrates a real functional, security or consistency defect.
