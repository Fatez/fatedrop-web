# FateDrop ID, Membership and Discord Foundation

This document tracks the account/membership work added after the initial visual-identity pass.

## What exists now

### FateDrop ID

- Email/password registration and login.
- Passwords use salted `scrypt` hashes; readable passwords are never stored.
- HttpOnly `fd_session` cookie backed by a server-side session record.
- Generated network ID such as `FD-7A91C4E2F0`.
- Editable display name, network handle, bio, avatar URL, primary TCG, collector style, region and visual signal theme.
- Permanent `created_at` timestamp used for Member Since and Network Age.
- No XP, coins, reward points or reward economy has been introduced.

### Collector membership

Membership state is stored separately from the profile so the same entitlement can eventually be consumed by the website, FateDrop app and Discord bot.

Supported tiers:

- `free`
- `plus`
- `pro`

Supported states:

- `free`
- `trialing`
- `active`
- `past_due`
- `paused`
- `canceled`

The website considers Plus/Pro `trialing` or `active` memberships Premium-entitled.

### Stripe

The source includes:

- Hosted subscription Checkout Session creation.
- 14-day collector trial.
- Optional card-required or no-card trial configuration.
- Stripe customer portal hand-off.
- Signed webhook verification.
- Idempotent webhook event audit records (event ID/type/customer/subscription references only; no card data).
- Subscription status updates into the FateDrop membership record.
- Automatic Discord role resync after membership changes.

Checkout does not become live until the Stripe environment variables and Price IDs are supplied.

Required production variables:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PLUS
STRIPE_PRICE_PRO
FATEDROP_TRIAL_REQUIRE_CARD=true|false
```

Webhook URL:

```text
https://YOUR-DOMAIN/api/billing/webhook
```

Recommended subscription events include `checkout.session.completed`, `customer.subscription.*`, `customer.subscription.trial_will_end`, `invoice.paid` and `invoice.payment_failed`. Subscription state remains authoritative for access; invoice events are retained for traceability.

Official Stripe references used for this implementation:

- https://docs.stripe.com/payments/checkout/free-trials
- https://docs.stripe.com/billing/subscriptions/webhooks
- https://docs.stripe.com/api/checkout/sessions/create

### Discord

Permanent community invite:

```text
https://discord.gg/QK9ahpYSFk
```

The source includes:

- Discord OAuth2 code flow using the `identify` scope.
- A state cookie to protect the OAuth callback.
- Storage of Discord user ID/name/avatar reference only; the temporary OAuth access token is not retained.
- Premium role assignment/removal using a Discord bot with Manage Roles permission.
- Manual `Sync Discord role` action for users who connect their identity before joining the server.
- Webhook-driven role resync when Stripe membership changes.

Required production variables:

```text
NEXT_PUBLIC_DISCORD_ENABLED=true
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_BOT_TOKEN
DISCORD_GUILD_ID
DISCORD_PREMIUM_ROLE_ID
```

Keep `NEXT_PUBLIC_DISCORD_ENABLED=false` until the server is ready to be advertised publicly. OAuth/bot setup can be completed before that switch is enabled.

OAuth redirect URI:

```text
https://YOUR-DOMAIN/api/discord/callback
```

The bot's role must sit above the FateDrop Premium role in Discord's role hierarchy.

Official Discord references used for this implementation:

- https://docs.discord.com/developers/topics/oauth2
- https://docs.discord.com/developers/resources/guild#add-guild-member-role

## Storage

Development defaults to:

```text
FATEDROP_ACCOUNT_STORE=file
FATEDROP_ACCOUNT_FILE=data/accounts.json
```

The file is Git-ignored.

Production should use:

```text
FATEDROP_ACCOUNT_STORE=postgres
DATABASE_URL=...
```

Run `database/postgres.sql` before enabling production account registration.

## App access

The website now has a single membership entitlement model suitable for app access, plus an authenticated `GET /api/account/entitlement` endpoint for the current web session. The mobile app still needs to authenticate against the same account service or FateDrop Cloud and consume this entitlement. Do not duplicate Premium state inside the app as a separate source of truth.

Recommended next integration contract:

1. FateDrop ID authenticates with FateDrop Cloud.
2. Cloud resolves the same `user_id`/FateDrop ID.
3. Cloud returns current tier/status and `premium=true|false`.
4. Mobile features gate on that entitlement.
5. Stripe remains the billing source; Cloud remains the product-access source.

## Public-launch blockers

- Add email verification and password-reset delivery through the chosen transactional email provider.

Before taking real payments at scale:

- Complete the final privacy/terms legal review.
- Set the data-controller and privacy contact details.
- Configure production PostgreSQL and backups.
- Add production-grade auth rate limiting / abuse monitoring.
- Configure Stripe products, prices, customer portal and webhook destination.
- Decide whether the 14-day trial requires a payment card.
- Configure Discord application, bot, guild and Premium role.
- Test cancellation, failed payment, trial expiry, Discord join-after-link and role removal paths.
- Connect the mobile app to the same entitlement source.


## Dashboard integration

The authenticated `/dashboard` consumes the same membership record, so Stripe trial/active/cancel state is reflected without a second billing truth. Personal usage metrics and network lifecycle counts are stored separately in the dashboard ledger. See `docs/dashboard-metrics.md`.
