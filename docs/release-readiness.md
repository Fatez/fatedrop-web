# FateDrop Release Readiness

_Last reviewed: 21 August 2026_

This is the canonical cross-platform release gate for FateDrop. It exists to stop completed work being rediscovered as “pending” and to keep beta work focused on production proof rather than redesign.

A green CI build is necessary but does not by itself prove deployment, device behaviour, billing, Discord or push delivery.

## Current audit snapshot

| Area | Status | Evidence / remaining proof |
| --- | --- | --- |
| Signal Engine reliability | **GREEN** | Core specialist retailer scans were production-proven healthy after lock, bulk-write/read and worker-pool fixes. |
| Final signal vocabulary | **GREEN IN CODE** | Whisper → Echo → Manifested → Vanished is preserved across canonical web alerts/push and the protected mobile beta. Drop Pulse remains supporting context. |
| Web lifecycle surfaces | **GREEN IN CI** | Lifecycle consistency PR and internal visualiser follow-up merged to web `main`. |
| Web security baseline | **VALIDATING** | Fresh current-main CSP/HSTS/private-cache/Sec-Fetch hardening PR is in CI/deployed-proof flow; old stale draft is not the merge candidate. |
| Production database schema | **GREEN** | Wishlist, notification preferences, hosted FateMatch, push/outbox and retailer-registry tables exist in the intended Neon database. |
| True Price / RRP logic | **GREEN FOUNDATION** | RRP-first comparison and unknown-delivery fail-closed behaviour are implemented. Pokémon Center UK authoritative RRP data exists; broader Asmodee provenance remains unproven. |
| Protected mobile beta code | **GREEN IN CI** | Companion beta branch has final lifecycle reconciliation, RRP-first True Price and stable native app identifiers. |
| Native/EAS project link | **BLOCKER** | iOS/Android IDs and EAS build profiles exist, but Expo must issue and persist the real `extra.eas.projectId`. |
| Production push | **BLOCKER** | Production currently has 0 push endpoints, 0 outbox rows and 0 delivery attempts. Real-device registration/delivery is not yet proven. |
| Discord | **CONDITIONAL BLOCKER** | Treat as a blocker only if Premium Discord is advertised as live. Production send/entitlement proof must be captured before that claim. |
| Paid Stripe launch | **BLOCKER FOR PAID LAUNCH** | Do not claim live paid subscriptions until live-mode price/webhook/entitlement/cancellation behaviour is proven. |
| Website production smoke | **BLOCKER** | Must be checked against the deployed release candidate, including effective headers and account flows. |
| Physical mobile QA | **BLOCKER** | Expo Go boot is not a substitute for standalone EAS build, fresh install, notification and Android/iPhone proof. |
| Local Radar / Fate Encounters | **SEPARATE WORKSTREAM** | Explicitly excluded from this audit pass; do not alter from this release checklist workstream. |

## 1. Canonical release lines

### Website

Current `main` is the release source. Lifecycle consistency is reconciled. Do not resurrect old three-stage copy or the retired “Whisper is internal” contract.

### Mobile

The protected beta line is:

`agent/mobile-production-companion-rescue`

It intentionally contains richer Companion/canonical-alert work than mobile `main`. Before an App Store/Play Store release, reconcile this protected beta into the chosen release branch with CI and physical-device proof. Do not blindly replace its canonical alert inbox with the older network-feed implementation from `main`.

Current protected-beta release candidate includes:

- direct `three` + `expo-gl` Companion renderer;
- KAEL/NYRA Companion path;
- final four-stage lifecycle semantics;
- Whisper notification preference and development test notification;
- RRP-first True Price;
- stable `fatedrop` scheme/slug;
- iOS bundle identifier `uk.co.fatedrop`;
- Android application ID `uk.co.fatedrop`;
- EAS preview/production build profiles.

### Cloud

Reliability fixes are merged/deployed. Do not reopen the solved deadlock/starvation/read-amplification work unless production evidence regresses.

Remaining Cloud work should focus on source coverage/health, RRP provenance and end-to-end delivery proof rather than reliability redesign.

## 2. Production database readiness — GREEN

The intended Neon production database contains the additive release tables that the old 19 August checklist incorrectly described as missing, including:

- `fatedrop_wishlist_items`
- `fatedrop_notification_preferences`
- `fatedrop_hosted_fate_matches`
- `fatedrop_push_endpoints`
- `fatedrop_notification_outbox`
- `fatedrop_notification_delivery_attempts`
- `fatedrop_retailer_registry`
- `fatedrop_retailer_discovery_evidence`
- `fatedrop_retailer_monitor_runs`

Table existence is not the same as operational proof. In particular, the push tables currently contain no registered device or delivery history.

## 3. Final signal contract — LOCKED

Never drift from these public meanings:

1. **Whisper** — product/catalogue/metadata movement; something may be coming.
2. **Echo** — queue/traffic/security/access readiness changed; get ready.
3. **Manifested** — confirmed purchasable live stock.
4. **Vanished** — confirmed availability has gone.

**Drop Pulse** is supporting evidence/context, not a fifth lifecycle stage.

A legacy internal `echo` value must not automatically be interpreted as Manifested. Normalise legacy sources by their evidence meaning.

## 4. True Price / RRP — BETA READY, COVERAGE EXPANDING

Release rules:

- ordinary reseller price is never guessed as RRP;
- RRP is shown only when an authoritative/approved observation exists;
- item price can be compared with RRP even when delivery is unknown;
- unknown delivery remains unknown and is never treated as free;
- delivered True Price is shown only when mandatory delivery/fees are known;
- percentage deltas use the authoritative RRP reference.

Production has Pokémon Center UK authoritative RRP coverage. Asmodee UK provenance remains a coverage task, not permission to weaken matching rules merely to create rows.

## 5. Mobile EAS / standalone build — BLOCKER

Repository identity is now prepared, but the Expo account must create/link the actual project.

Required proof sequence:

1. link/create FateDrop in EAS from the `mobile` directory;
2. confirm Expo writes the real `extra.eas.projectId` into app configuration;
3. run verification again;
4. produce an internal iOS preview build;
5. install it on a physical iPhone;
6. produce an Android preview build and install on a physical Android device;
7. confirm cold start, sign-in and Companion rendering outside Expo Go.

Do not invent the project UUID in source control.

## 6. Production push — BLOCKER

Current production state at this review:

- enabled push endpoints: **0**
- total push endpoints: **0**
- notification outbox rows: **0**
- delivery attempts: **0**

The code path exists but has not been operationally exercised.

Required proof:

1. EAS project ID is present;
2. signed-in physical device explicitly grants notification permission;
3. Expo push token registers to the authenticated FateDrop ID;
4. production `fatedrop_push_endpoints` contains that enabled endpoint;
5. one controlled eligible signal queues exactly one push;
6. Expo returns a successful ticket/provider identifier;
7. delivery-attempt telemetry records the result;
8. the physical device receives it;
9. tapping it opens the exact FateDrop alert/product context;
10. duplicate signal processing does not duplicate delivery;
11. revoked/dead tokens disable safely.

Repeat core proof on Android before wider beta.

## 7. Discord — CONDITIONAL BLOCKER

Discord is not allowed to become a second membership authority.

Before advertising Premium Discord as live, prove:

- required production bot token/channel configuration is present;
- one controlled FateDrop message is recorded as sent with provider message ID;
- message visibly arrives in the intended channel;
- bot permissions are least-privilege for required channel actions;
- user/account link and premium entitlement behaviour work as advertised;
- cancellation/expiry removes premium access where role gating is used;
- Discord failure cannot break web/push delivery.

## 8. Stripe — BLOCKER FOR PAID LAUNCH ONLY

Do not open paid subscriptions solely because checkout code exists.

Required live proof:

- live Plus/Pro price IDs;
- production Stripe secret/webhook configuration;
- real low-risk subscription;
- signature-verified webhook changes membership state;
- web/mobile effective capabilities reflect backend membership truth;
- duplicate webhook is idempotent;
- cancellation, failed payment and expiry return correct entitlement state;
- checkout clearly states price, billing frequency, trial, renewal and cancellation.

## 9. Web security / legal gate — VALIDATING

Current code already uses scrypt password hashing, opaque sessions and HttpOnly/SameSite/Secure production cookies. Sampled auth/account mutation routes use the shared same-origin guard.

Fresh hardening is being validated against current `main`, not the stale early draft:

- CSP;
- HSTS;
- explicit private no-store/noindex headers;
- API no-store baseline;
- Sec-Fetch-Site cross-site rejection before Origin fallback;
- automated regression coverage;
- tracked UK security/legal launch gate.

Still required outside source code:

- Cloudflare auth rate limiting;
- Turnstile/equivalent abuse challenge if required;
- deployed header/CSP inspection;
- secret-history review;
- backup/restore and incident-response procedure;
- final privacy/controller/retention/processor information;
- final UK consumer Terms and subscription-law review.

## 10. Website production QA — BLOCKER

Run against the deployed release candidate, not a local build:

- homepage desktop/mobile visual smoke;
- four-stage lifecycle wording;
- interactive sample/demo labelling;
- create account / login / logout;
- dashboard private caching/noindex response;
- Search → canonical product → offers → retailer;
- True Price with known/unknown RRP and delivery;
- Wishlist create/remove/sync;
- FateFind create/list;
- Alerts and signal packs;
- notification preference persistence including Whisper;
- membership/error/empty/loading states;
- privacy / terms / trust routes;
- external retailer links use HTTPS and correct destination;
- CSP does not break Companion, imagery, Stripe redirects or API calls;
- canonical custom domain/metadata/robots behaviour.

## 11. Mobile physical QA — BLOCKER

Run on standalone/internal EAS builds:

- fresh install / cold start;
- sign in / sign out / expired session;
- offline cached identity and online recovery;
- Home / Search / Indies / Alerts / More;
- True Price and RRP-first comparison;
- canonical Whisper / Echo / Manifested / Vanished presentation;
- Companion selection and reactions;
- notification permission allowed/denied;
- push register / receive / tap-through;
- retailer external checkout;
- background/foreground recovery;
- iPhone and Android core pass.

## 12. Retailer health — BETA COVERAGE TASK

Healthy specialist coverage has been production-proven for the core Shopify/specialist group after reliability fixes.

Known inaccessible/unhealthy retailers must remain explicit and fail safely. Do not bypass security/access controls. Prefer public/approved feeds, APIs or partnerships for blocked national retailers.

A retailer being inaccessible is a coverage limitation, not permission to fabricate stock state.

## 13. Safe-to-defer product areas

These do not block the first solid beta unless marketed as live promises:

- FateScore public scoring policy;
- FateFair;
- FateWindow;
- Basket Breaker / basket optimisation;
- Reserve & Collect;
- Passport;
- XP/tokens/progression;
- broad multi-TCG expansion;
- richer event/vendor expansion.

Local Radar / Fate Encounters are handled in a separate active workstream and are intentionally not modified by this audit.

## Current release decision

**Not ready for unrestricted public/paid launch yet.**

The codebase is substantially closer than the old 19 August checklist suggested. The remaining blockers are now mostly operational proof rather than feature architecture:

1. merge/deploy/verify current web security hardening;
2. link the mobile app to a real EAS project;
3. produce standalone iOS/Android beta builds;
4. register the first production push endpoint and prove end-to-end delivery;
5. run deployed browser and physical-device smoke tests;
6. prove Discord only if it will be advertised as live;
7. prove live Stripe only before taking real paid subscriptions;
8. complete final security/legal deployment controls and review.

Do not reopen completed product design unless a release test demonstrates a real functional, security or consistency defect.
