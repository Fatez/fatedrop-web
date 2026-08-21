# FateDrop security & legal release gate

This checklist is a production-readiness control, not legal advice. Paid/public launch must not be treated as approved merely because the application builds.

## P0 — required before scaled paid launch

### Security
- [ ] All authentication and account mutation routes are reviewed for authorization and same-origin/CSRF controls.
- [ ] Cloudflare rate limiting protects login, registration, password/account and other abuse-sensitive endpoints.
- [ ] Turnstile or equivalent challenge is available for abusive authentication/registration traffic, with server-side verification.
- [ ] Production secrets exist only in protected environment/secrets storage and have been checked against repository history.
- [ ] PostgreSQL production credentials use least privilege and encrypted transport.
- [ ] Private account/dashboard/API responses are not publicly cached or indexed.
- [ ] Security headers/CSP are verified against the deployed site and all required integrations.
- [ ] Stripe webhook signatures and duplicate-event handling are verified in production configuration.
- [ ] Backup/restore and incident-response procedures are documented and tested.

### Privacy / UK data protection
- [ ] Final data-controller identity and contact details are published.
- [ ] Dedicated privacy/data-rights contact route is published.
- [ ] Purposes and lawful bases are documented for each processing activity.
- [ ] Retention periods or defensible retention criteria are documented.
- [ ] Processor/recipient inventory is maintained (hosting, database, payments, Discord, location/search providers, email/push services as applicable).
- [ ] International-transfer position and safeguards are documented where applicable.
- [ ] Access, correction, deletion, objection/restriction and consent-withdrawal workflows are operational where applicable.
- [ ] ICO complaint route is included in the final privacy information.
- [ ] Optional marketing consent remains separate from service/contact consent.
- [ ] Location collection remains user-triggered and no location history is introduced without updating privacy information first.

### Consumer / subscription
- [ ] Final UK consumer Terms replace the beta placeholder before scaled paid subscriptions.
- [ ] Checkout clearly states price, billing frequency, trial terms, renewal, cancellation and material feature limitations before purchase.
- [ ] Cancellation is straightforward and entitlement/end-date behaviour is documented.
- [ ] Refund/cooling-off/statutory-rights wording receives appropriate UK legal review.
- [ ] Plus/Pro feature promises match the actual production feature gates; undefined paid tiers are not sold.
- [ ] Upcoming UK subscription-law changes are tracked so the subscription UX can be updated before they apply.

### Marketplace / signal claims
- [ ] FateDrop is consistently described as intelligence/discovery unless it actually becomes merchant of record for a transaction.
- [ ] Retailer checkout, fulfilment, returns and customer-service responsibility are clearly attributed to the retailer where applicable.
- [ ] Stock, RRP, postage and price observations are described as observed/current-to-source rather than guaranteed.
- [ ] Echo/Manifested/Vanished/FateMatch claims map to evidence-backed definitions.
- [ ] Demo/sample/planned data is visually distinguishable from live network data.
- [ ] Public terminology does not expose internal-only states such as Whisper unless deliberately productised.

## P1 — required before wider beta acquisition
- [ ] Homepage clearly communicates the collector value proposition before introducing secondary FateDrop terminology.
- [ ] Companion wording consistently describes its real current production state.
- [ ] Interactive demo controls either work or are clearly non-interactive examples.
- [ ] Accessibility review covers keyboard navigation, focus visibility, semantic labels and reduced-motion behaviour.
- [ ] Mobile/responsive QA covers current iPhone/Android viewport classes.
- [ ] Canonical production domain, metadata, sitemap, OpenGraph and robots behaviour are verified.

## Operational rule
No P0 item should be marked complete without evidence (configuration, test, deployed response, documented procedure or professional legal review as appropriate). Security and legal readiness are ongoing controls, not a one-time launch checkbox.
