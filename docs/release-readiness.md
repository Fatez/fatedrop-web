# FateDrop Release Readiness

_Last reviewed: 19 August 2026_

This is the canonical cross-platform release gate for FateDrop. It exists to prevent repeated re-audits and to keep the remaining work focused on operational readiness rather than redesign.

## Release definition

FateDrop is **release ready** only when all BLOCKER items below are complete and proven in a production-like environment. A green CI build is necessary but does not by itself prove subscriptions, database persistence, push delivery, Discord delivery, or device behaviour.

## 1. Canonical branch consolidation — BLOCKER

### Website

Required merge order:

1. `fatedrop-network-consistency-audit` (Product Spec v1 reconciliation)
2. `launch-foundation-v1` (homepage phone, dashboard showcase, FateDrop ID/mobile sync, entitlements)

Do not merge the second branch before its base is reconciled.

### Mobile

Required merge order:

1. `fatedrop-mobile-product-spec-v1`
2. `launch-foundation-v1`

The older Railway-native app PR must be compared/reconciled rather than blindly merged because some runtime/dependency work overlaps later architecture.

### Cloud

Open workstreams must be reconciled into one canonical release line before production activation:

- Pokémon Center continuous collector
- RRP provenance
- UK retailer intelligence registry
- hosted FateFind/FateMatch notifications

No production rollout should depend on mutually diverged Cloud branches.

## 2. Database readiness — BLOCKER

No migration is applied automatically by build/deploy jobs.

Review and deliberately apply the required additive migrations to the intended Neon production database only after backup/rollback review.

Website/account persistence:

- `database/2026-08-19-user-preferences.sql`
  - Universal Wishlist
  - shared notification preferences

Cloud hosted FateFind/notification persistence:

- `signal-engine/database/hosted-fatefind-notifications.sql`
  - hosted FateMatch ledger
  - Expo push endpoints
  - notification outbox
  - notification delivery attempts

Retailer intelligence persistence when that runtime is promoted:

- `signal-engine/database/uk-retailer-registry.sql`
  - retailer registry
  - discovery evidence
  - monitoring state/run history

Release proof:

- migrations execute cleanly against the intended database
- existing FateDrop account tables remain intact
- rollback/restore procedure is documented
- website and Cloud both use the same intended Neon environment

## 3. Stripe live subscriptions — BLOCKER FOR PAID LAUNCH

Current connected Stripe configuration is sandbox/test mode. Do not claim FateDrop accepts real subscriptions until the live flow is proven.

Required production path:

1. live Plus and Pro prices created/confirmed in Stripe
2. production `STRIPE_SECRET_KEY`
3. production `STRIPE_WEBHOOK_SECRET`
4. production `STRIPE_PRICE_PLUS`
5. production `STRIPE_PRICE_PRO`
6. production webhook URL configured
7. one real low-risk subscription completed
8. webhook changes `fatedrop_memberships` to `active`/`trialing` as expected
9. `/api/mobile/sync` returns the resulting effective tier/capabilities
10. website/app paid gates unlock from backend membership truth
11. cancellation / failed payment / expiry returns the account to the correct effective entitlement

Client-side flags are never payment authority.

## 4. Shared entitlement consistency — BLOCKER

The website entitlement contract is authoritative.

Current capability vocabulary shared by website and app:

- `browse_network`
- `selected_signals`
- `retailer_discovery`
- `true_price`
- `advanced_fate_match`
- `priority_alerts`
- `advanced_filters`
- `premium_discord`
- `fate_lock_eligibility`

Before release:

- website and app capability vocabularies must remain identical
- all paid UI gates must call the shared entitlement layer rather than infer tier locally
- final Plus-vs-Pro commercial differentiation must be deliberately chosen and then encoded centrally

## 5. Mobile FateDrop ID credential storage — BLOCKER FOR PUBLIC STORE RELEASE

Non-sensitive offline identity/sync cache may remain in AsyncStorage.

The opaque bearer session token must move from AsyncStorage to OS-protected credential storage before public App Store / Play Store release:

- iOS: Keychain
- Android: Keystore-backed storage
- Expo path: `expo-secure-store` using the SDK-compatible version installed via `npx expo install expo-secure-store`

After migration:

- sign-in stores only the bearer token in SecureStore
- cached snapshot remains separate
- sign-out removes both secure token and cached snapshot
- 401/session-expiry clears both stores
- app CI remains green
- real iPhone and Android login/logout/session-expiry are tested

## 6. Hosted FateFind / FateMatch — BLOCKER FOR PREMIUM HUNTS

Code foundation exists behind `FATEDROP_HOSTED_FATEFIND_ENABLED=false`.

Required activation sequence:

1. hosted notification migration applied
2. website/account API deployed
3. Cloud evaluator deployed with feature flag still OFF
4. paid test account creates a FateFind
5. known qualifying offer creates exactly one hosted FateMatch event
6. repeated scan of identical offer does not duplicate the notification
7. unknown delivery fails closed for delivered-price rules
8. master FateMatch preference suppresses delivery when disabled
9. quiet hours defer push/Discord rather than failing/sending immediately
10. hosted FateMatch remains visible in personal history
11. only after all tests pass: deliberately enable hosted evaluator

## 7. Push notifications — BLOCKER FOR MOBILE ALERT CLAIMS

Required real-device proof:

- permission is user initiated
- Expo push token registers against authenticated FateDrop ID
- disabled/revoked endpoint is handled safely
- one FateMatch push reaches a physical iPhone
- one FateMatch push reaches a physical Android device
- tapping notification opens a valid FateDrop context / retailer URL path
- duplicate scans do not create duplicate notifications

## 8. Discord — BLOCKER ONLY IF PREMIUM DISCORD IS ADVERTISED AT LAUNCH

Required before enabling Discord marketing/capability:

- OAuth account link works
- Discord user link persists against FateDrop ID
- active entitlement maps to intended premium role/access
- cancellation/expiry removes premium access
- FateMatch Discord delivery tested
- failed/blocked DM is recorded without breaking web/push delivery
- Discord never becomes a second source of membership truth

Keep Discord disabled publicly until the above is proven.

## 9. True Price / RRP provenance — BLOCKER FOR STRONG RRP CLAIMS

True Price rules are already conservative: unknown delivery must remain unknown.

Before scaled public promotion:

- reconcile/deploy Cloud RRP provenance work
- RRP shown only when an observed/approved source exists
- source + observed timestamp exposed where available
- ordinary reseller selling price is never silently treated as official RRP
- delivered-price ordering only compares known delivery totals as known

## 10. Website production QA — BLOCKER

Current launch-foundation branch has passed lint, TypeScript, automated tests, Next production build and OpenNext/Cloudflare build.

Still required on the deployed release candidate:

- homepage desktop/mobile visual smoke test
- interactive phone journey
- dashboard showcase
- create account / login / logout
- Search → product → offers → retailer checkout
- True Price and unknown-delivery states
- Wishlist create/remove/sync
- FateFind create/list
- Alerts/FateMatch history
- membership state
- error / empty / loading states
- privacy / terms / trust routes
- custom domain/canonical metadata

## 11. Mobile production QA — BLOCKER

CI is not a substitute for device proof.

Test on physical iPhone and Android:

- cold start
- sign in / sign out
- session expiry
- offline cached identity display
- online sync recovery
- Search
- True Price
- Wishlist cross-platform sync
- hosted FateFind creation
- FateMatch history
- notification opt-in
- push delivery/open
- retailer external checkout
- Local Radar permission allowed/denied
- app background/foreground refresh

## 12. Dependency/security review — BLOCKER

Do not blindly run forced major upgrades.

Before release:

- review website high-severity npm advisory chain and patch safely where possible
- retain/document any unavoidable upstream Expo/Metro advisory only after confirming exposure and lack of safe patched version
- no secrets or production database exports in Git
- production account/session endpoints remain no-store where appropriate
- security headers verified on deployed website

## 13. Runtime / rollback — BLOCKER

Before opening to customers:

- Railway Signal Engine health endpoint checked from public network
- Cloudflare/website health checked
- Neon connection failure produces controlled error states
- Signal Engine outage does not fabricate stock/price data
- hosted evaluator can be disabled immediately with feature flag
- retailer registry runtime remains separately disable-able
- rollback target/previous known-good deployment identified for website and Cloud

## 14. Product areas safe to defer

These do not block the first solid release unless deliberately marketed as live:

- final 3D Companion GLB/animations (renderer boundary already exists)
- production Events ingestion beyond current foundation
- Event Vendor Mode
- FateScore public policy
- FateWindow
- FateFair
- Basket Breaker
- Reserve & Collect
- Passport
- XP/tokens
- full multi-TCG expansion

## 15. Intelligence Centre handoff

After Sections 1–13 are green, feature churn should stop and the main engineering programme becomes the FateDrop Intelligence Centre:

`Retailer discovery → Registry → Adapter/collector → Raw offers → Canonical product identity → RRP provenance → Delivery intelligence → True Price → Stock/price history → Signal Engine → FateFind/FateMatch → App/Web/Discord/Companion`

Primary Intelligence Centre priorities:

1. reconcile and activate retailer registry foundation
2. national/specialist UK retailer qualification
3. regional/independent retailer coverage growth
4. robust canonical product matching for variants/bundles
5. delivery-policy evidence/rules
6. stock + price history
7. RRP source coverage
8. signal confidence/quality
9. Local Radar location coverage
10. later multi-TCG expansion

## Current release status

**Product architecture:** code-complete foundation

**Commercial production:** not yet active

**Release blockers:** branch consolidation, reviewed migrations, live Stripe proof, secure mobile token storage, hosted notification E2E, real-device/browser QA, dependency/security review, deployment/rollback proof

Do not reopen completed product design unless a release test demonstrates a real functional or consistency defect.
