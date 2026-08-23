# FateDrop security & legal release gate

This checklist is a production-readiness control, not legal advice. A successful build does not by itself approve FateDrop for a scaled paid/public launch.

## Current beta baseline

- ✅ Account passwords use scrypt hashing and opaque sessions.
- ✅ Browser session cookies are HttpOnly, SameSite=Lax and Secure in production.
- ✅ Sampled account/auth mutation routes use the shared same-origin guard.
- ✅ Stripe webhook verification and idempotent billing-event storage have automated coverage.
- ✅ Public signal language is Whisper → Echo → Manifested → Vanished, with Drop Pulse kept as supporting evidence/context.
- ✅ Monitoring design rule: observe public/authorised product and readiness evidence; never defeat authentication, CAPTCHA, queue or other access controls.
- 🟠 CSP, HSTS, private no-cache/noindex and Sec-Fetch-Site hardening are in this release-gate branch and require deployed verification after merge.
- 🟠 Cloudflare authentication rate limiting / bot challenge still requires edge configuration and production proof.
- 🟠 Final UK legal wording, retailer-data acquisition review and operational data-rights processes require owner/legal review before scaled paid launch.

## P0 — required before scaled paid launch

### Security
- [ ] Verify all authentication and account mutation routes for authorization and same-origin/CSRF controls.
- [ ] Configure Cloudflare rate limiting for login, registration and other abuse-sensitive endpoints.
- [ ] Configure Turnstile or an equivalent challenge for abusive authentication/registration traffic if required, including server-side verification.
- [ ] Confirm production secrets exist only in protected environment/secrets storage and check repository history for accidental exposure.
- [ ] Confirm PostgreSQL production credentials use encrypted transport and the least privilege practical for the deployed service.
- [ ] Verify private account/dashboard/API responses are not publicly cached or indexed.
- [ ] Verify CSP, HSTS and the remaining security headers against the deployed Cloudflare site and required integrations.
- [ ] Verify Stripe webhook signatures, duplicate-event handling and billing environment configuration in production.
- [ ] Document and test backup/restore and incident-response procedures.

### Retailer monitoring / data acquisition
- [ ] Maintain a source register for every monitored retailer describing the exact public or authorised pages, feeds, APIs or catalogue endpoints FateDrop uses.
- [ ] Do not build or operate functionality intended to bypass authentication, account restrictions, CAPTCHA, waiting rooms/queues, bot challenges, paywalls or other technical access controls.
- [ ] Treat queue/security/access changes as observable Echo evidence only; FateDrop may detect that a control appeared or changed but must not circumvent it.
- [ ] Prefer official APIs, feeds, sitemaps, structured public catalogue endpoints and normal public product pages over brittle or adversarial collection methods.
- [ ] Apply bounded request rates, timeouts, backoff and per-retailer kill switches so FateDrop can stop a collector quickly if a retailer objects, blocks access or collection becomes operationally unsafe.
- [ ] Review each retailer's applicable terms, robots/access signals, API/feed licence terms and any written permissions before moving that source from candidate/dry-run into scaled monitoring.
- [ ] Record source URL, retailer, observation time and evidence provenance for stock, price and RRP facts so claims can be audited and corrected.
- [ ] Keep official RRP provenance separate from retailer selling prices. Do not promote a retailer's claimed RRP, list price or was-price to canonical RRP without an eligible authoritative source.
- [ ] Minimise collection of personal data. Product titles, stock, prices, delivery terms and retailer product identifiers should be preferred over customer/user information.
- [ ] If a collector would process personal data from a public source, complete the applicable UK data-protection assessment, transparency/lawful-basis work and retention controls before enabling it.
- [ ] Review copyright/database-right exposure before systematic or high-volume extraction/re-use of a retailer or third-party catalogue, particularly where the source represents a substantially invested database.
- [ ] Provide an operational retailer contact/removal path and document how a disputed source, price, RRP or stock observation is paused, corrected or removed.
- [ ] Obtain UK legal review of the monitoring/data-acquisition model before scaled paid launch and revisit that review when adding materially different source types or jurisdictions.

Current legal reference points for this gate include the Computer Misuse Act 1990 (unauthorised computer access), UK data-protection/ICO guidance on publicly accessible personal data, and UK copyright/database-right rules. Public accessibility by itself is not treated as permission to bypass controls, process personal data without obligations, or reuse a protected database without considering the relevant rights and terms.

### Privacy / UK data protection
- [ ] Publish the final data-controller identity and contact details.
- [ ] Publish a dedicated privacy/data-rights contact route.
- [ ] Document purposes and lawful bases for each material processing activity.
- [ ] Document retention periods or defensible retention criteria.
- [ ] Maintain a processor/recipient inventory covering hosting, database, payments, Discord, location/search providers, email and push services as applicable.
- [ ] Document international-transfer safeguards where applicable.
- [ ] Make access, correction, deletion, objection/restriction and consent-withdrawal workflows operational where applicable.
- [ ] Include the ICO complaint route in final privacy information.
- [ ] Keep optional marketing consent separate from service/contact consent.
- [ ] Keep precise location user-triggered and do not introduce location history without updating privacy information and controls first.

### Consumer / subscription
- [ ] Replace beta/placeholder consumer Terms with final UK consumer Terms before scaled paid subscriptions.
- [ ] Before purchase, clearly state price, billing frequency, trial terms, renewal, cancellation and material feature limitations.
- [ ] Keep cancellation straightforward and document entitlement/end-date behaviour.
- [ ] Obtain appropriate UK legal review for refund, cooling-off and statutory-rights wording.
- [ ] Ensure Plus/Pro promises match actual production feature gates; do not sell undefined paid functionality.
- [ ] Track relevant UK subscription-law changes and update the subscription UX before they become applicable.

### Marketplace / signal claims
- [ ] Describe FateDrop consistently as intelligence/discovery unless it actually becomes merchant of record for a transaction.
- [ ] Clearly attribute retailer checkout, fulfilment, returns and customer-service responsibility to the retailer where applicable.
- [ ] Describe stock, RRP, postage and price data as observed/current-to-source rather than guaranteed.
- [ ] Keep the final lifecycle definitions consistent everywhere: Whisper = product/catalogue movement; Echo = queue/traffic/security/access readiness; Manifested = confirmed purchasable stock; Vanished = confirmed availability lost.
- [ ] Keep Drop Pulse as supporting evidence/context rather than a fifth lifecycle stage.
- [ ] Visually distinguish demo/sample/planned data from live network data.

## P1 — required before wider beta acquisition

- [ ] Homepage communicates the collector value proposition before secondary FateDrop terminology.
- [ ] Companion wording matches its actual current production state.
- [ ] Interactive demo controls either work or are clearly labelled examples.
- [ ] Accessibility review covers keyboard navigation, focus visibility, semantic labels and reduced-motion behaviour.
- [ ] Mobile/responsive QA covers current iPhone and Android viewport classes.
- [ ] Canonical production domain, metadata, sitemap, OpenGraph and robots behaviour are verified.
- [ ] Fresh-install mobile QA covers sign-in/out, notification denial, offline/API failure and outbound retailer links.

## Operational rule

No P0 item should be marked complete without evidence: configuration, automated test, deployed response, documented procedure or professional legal review as appropriate. Security and legal readiness are ongoing controls rather than a one-time launch checkbox.

A green GitHub/OpenNext build proves source compatibility only. The deployed Cloudflare response must still be inspected for effective headers, caching behaviour and integration compatibility before this gate is marked complete.
