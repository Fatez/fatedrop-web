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

A read-only production Neon audit on 19 August 2026 confirmed the existing FateDrop account/market tables are present and the new release tables below are not yet installed. No production mutation was performed.

No migration is applied automatically by build/deploy jobs.

Review and deliberately apply the required additive migrations to the intended Neon production database only after backup/rollback review.

Website/account persistence:

- `database/2026-08-19-user-preferences.sql`
  - `fatedrop_wishlist_items`
  - `fatedrop_notification_preferences`

Cloud hosted FateFind/notification persistence:

- `signal-engine/database/hosted-fatefind-notifications.sql`
  - `fatedrop_hosted_fate_matches`
  - `fatedrop_push_endpoints`
  - `fatedrop_notification_outbox`
  - `fatedrop_notification_delivery_attempts`

Retailer intelligence persistence when that runtime is promoted:

- `signal-engine/database/uk-retailer-registry.sql`
  - `fatedrop_retailer_registry`
  - `fatedrop_retailer_discovery_evidence`
  - `fatedrop_retailer_monitor_runs`

Release proof:

- migrations execute cleanly against the intended database
- existing FateDrop account/market tables remain intact
- rollback/restore procedure is documented
- website and Cloud both use the same intended Neon environment

## 3. Stripe live subscriptions — BLOCKER FOR PAID LAUNCH

Current connected Stripe configuration is sandbox/test mode. Plus (£4.99/month) and Pro (£14.99/month) test prices exist, but they are not live-mode prices. Do not claim FateDrop accepts real subscriptions until the live flow is proven.

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

## 4. Shared entitlement consistency — CODE COMPLETE / COMMERCIAL SPLIT PENDING

The website entitlement contract is authoritative and the mobile client uses the same capability vocabulary:

- `browse_network`
- `selected_signals`
- `retailer_discovery`
- `true_price`
- `advanced_fate_match`
- `priority_alerts`
- `advanced_filters`
- `premium_discord`
- `fate_lock_eligibility`

The current implementation deliberately gives active Plus/Pro accounts the shared premium capability set until the final Plus-vs-Pro commercial differentiation is chosen. Do not invent UI-only tier differences.

Before paid release:

- choose final Plus-vs-Pro capability split
- encode it centrally in the authoritative entitlement layer
- verify web/app/Discord consume those capabilities rather than infer tier locally

## 5. Mobile FateDrop ID credential storage — CODE COMPLETE / DEVICE PROOF PENDING

The opaque bearer session token now uses `expo-secure-store` (`~15.0.8`, SDK-54 compatible):

- iOS uses OS-protected Keychain storage
- Android uses Keystore-backed secure storage
- non-sensitive offline sync snapshot remains in AsyncStorage
- legacy development installs migrate an existing AsyncStorage token into SecureStore once and immediately delete the legacy token
- sign-out removes secure token + legacy token + cached snapshot
- 401/session expiry clears the full local session state

Exact hardened mobile head `04875a85f8bd2b49c743b5d51d3ce6def58fd581` passed GitHub Actions run `32278608243`.

Still required before public App Store / Play Store release:

- real iPhone sign-in/sign-out/session-expiry proof
- real Android sign-in/sign-out/session-expiry proof

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

## 10. Website code/security verification — GREEN

Website release CI now validates stacked launch-foundation PRs as well as `main` and includes a high-severity production dependency audit.

The release branch was upgraded from Next 16.2.11 to Next 16.3.0 and `eslint-config-next` 16.3.0 after the audit identified vulnerable PostCSS/Sharp versions in the older Next dependency tree.

Exact hardened website head `78c9506bcd6ec1fd4f4284a73a09c9bb1f1f93fb` passed GitHub Actions run `32278645111` including:

- clean dependency install
- production dependency audit at high severity
- ESLint
- TypeScript
- automated tests
- Next.js production build
- OpenNext/Cloudflare build

## 11. Website production QA — BLOCKER

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

## 12. Mobile production QA — BLOCKER

Mobile exact hardened head `04875a85f8bd2b49c743b5d51d3ce6def58fd581` passed its repository tests plus mobile lint/typecheck workflow.

CI is not a substitute for device proof. Test on physical iPhone and Android:

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

## 13. Cloud code/security verification — GREEN

Hosted FateFind/FateMatch Cloud CI now includes a high-severity production dependency audit before the complete Signal Engine test suite.

Exact hardened hosted-notification head `34475bb0430e3382f6ab88c76b7d1aab0eab54d7` passed GitHub Actions run `32278708384`.

The hosted evaluator remains OFF by default and no notification migration has been applied to production.

## 14. Remaining dependency/security review — BLOCKER

Production Web and hosted Signal Engine now have enforced high-severity audit gates.

Still required:

- review/document the residual upstream Expo/Metro `image-size` advisory and patch when a compatible fixed version exists
- no secrets or production database exports in Git
- production account/session endpoints remain no-store where appropriate
- security headers verified on deployed website
- actual deployed versions rechecked immediately before release

Do not blindly run forced major dependency upgrades.

## 15. Runtime / rollback — BLOCKER

Before opening to customers:

- Railway Signal Engine health endpoint checked from public network
- Cloudflare/website health checked
- Neon connection failure produces controlled error states
- Signal Engine outage does not fabricate stock/price data
- hosted evaluator can be disabled immediately with feature flag
- retailer registry runtime remains separately disable-able
- rollback target/previous known-good deployment identified for website and Cloud

## 16. Product areas safe to defer

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

## 17. Intelligence Centre handoff

After the release blockers above are green, feature churn should stop and the main engineering programme becomes the FateDrop Intelligence Centre:

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

**Web code/security gate:** GREEN

**Mobile code/security gate:** GREEN; physical-device proof pending

**Hosted Signal Engine code/security gate:** GREEN

**Commercial production:** not yet active

**Confirmed remaining release blockers:** canonical branch consolidation, reviewed production migrations, live Stripe proof, hosted notification end-to-end activation, real iPhone/Android + deployed browser QA, residual Expo advisory review, deployment/rollback proof.

Do not reopen completed product design unless a release test demonstrates a real functional or consistency defect.
