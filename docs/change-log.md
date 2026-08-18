# FateDrop Working Change Log

This file exists so design and product work can be reviewed as a batch before deployment.

## Baseline already applied: visual identity pass

Files touched by the abstract FateDrop visual pass:

- `app/page.tsx`
- `app/businesses/page.tsx`
- `app/collectors/page.tsx`
- `app/events/page.tsx`
- `app/globals.css`
- `components/fate-signal-field.tsx`
- `components/page-shell.tsx`
- `components/signal-icon.tsx`
- `components/stock-lifecycle.tsx`

## Held separately: Wear the Signal improvement

The previously prepared merch patch is deliberately **not folded into this account/membership pass yet** so the wider website review can decide the final merch direction first.

Held patch would touch:

- `app/page.tsx`
- `app/globals.css`

## Current account / membership pass

### New files

- `app/account/page.tsx`
- `app/account/login/page.tsx`
- `app/account/register/page.tsx`
- `app/api/account/entitlement/route.ts`
- `app/api/account/profile/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/billing/portal/route.ts`
- `app/api/billing/webhook/route.ts`
- `app/api/discord/callback/route.ts`
- `app/api/discord/link/route.ts`
- `app/api/discord/connect/route.ts`
- `app/api/discord/sync/route.ts`
- `components/account-auth-form.tsx`
- `components/account-signout.tsx`
- `components/discord-sync-button.tsx`
- `components/discord-unlink-button.tsx`
- `components/membership-actions.tsx`
- `components/profile-editor.tsx`
- `lib/account-storage.ts`
- `lib/auth.ts`
- `lib/billing.ts`
- `lib/discord.ts`
- `lib/membership.ts`
- `docs/membership-foundation.md`
- `tests/account-foundation.test.mjs`

### Existing files modified

- `.env.example`
- `.gitignore`
- `app/cookies/page.tsx`
- `app/collectors/page.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/privacy/page.tsx`
- `app/subscriptions/page.tsx`
- `app/terms/page.tsx`
- `components/footer.tsx`
- `components/nav.tsx`
- `database/postgres.sql`
- `README.md`

### Product behaviour added

- FateDrop ID registration/login/logout.
- Editable collector profile.
- Permanent Member Since and Network Age.
- Free / Plus / Pro membership model.
- 14-day collector trial path.
- Stripe Checkout + customer portal foundation.
- Stripe webhook membership sync.
- Discord permanent invite link.
- Discord identity linking.
- Discord Premium role automation and manual resync.
- Discord public launch gate via `NEXT_PUBLIC_DISCORD_ENABLED`; invite is wired but hidden until ready.
- Homepage membership/network-identity teaser.
- Subscription page rewritten around one cross-product membership.
- Privacy/cookie/terms placeholders updated to reflect account, Stripe and Discord architecture.

### Explicitly not included

- XP.
- Coins/tokens.
- Reward marketplace.
- Level system.
- Achievement economy.
- Public profile directory.
- Live Stripe credentials or products.
- Live Discord credentials or bot installation.
- Mobile-app authentication wiring.

## Current dashboard / metrics / branding pass

### New files

- `app/dashboard/page.tsx`
- `app/api/dashboard/activity/route.ts`
- `app/api/dashboard/network-snapshot/route.ts`
- `lib/dashboard.ts`
- `lib/dashboard-storage.ts`
- `docs/dashboard-metrics.md`
- `public/assets/fatedrop-logo-mark.png`

### Existing files modified

- `.env.example`
- `.gitignore`
- `app/api/billing/webhook/route.ts`
- `app/globals.css`
- `app/account/login/page.tsx`
- `app/account/register/page.tsx`
- `components/account-auth-form.tsx`
- `components/brand-mark.tsx`
- `components/nav.tsx`
- `database/postgres.sql`
- `tests/source-contract.test.mjs`
- `README.md`

### Behaviour added

- Authenticated `/dashboard` based on the approved dashboard concept.
- Exact FateDrop logo mark cropped from the supplied canonical brand artwork; the invented mockup logo is not used.
- Personal metrics are derived from an append-only activity ledger.
- Network lifecycle metrics are derived from timestamped FateDrop Cloud snapshots.
- Metric provenance and freshness are displayed in the dashboard.
- Existing beta catalogue figures are kept visibly separate from live metrics.
- Stripe membership status appears directly in the dashboard.
- Stripe webhook events now have an idempotent minimal audit ledger.
- FateDrop Cloud/app ingestion endpoints are ready for real signal/activity data.
- Dashboard registration/login defaults now land on `/dashboard`.


## FateDrop avatar identity pass

### New files

- `components/avatar-picker.tsx`
- `lib/avatar.ts`
- `public/assets/avatars/*.webp` (12 FateDrop preset avatars)

### Existing files modified

- `app/account/page.tsx`
- `app/api/account/profile/route.ts`
- `app/dashboard/page.tsx`
- `app/globals.css`
- `app/privacy/page.tsx`
- `components/profile-editor.tsx`

### Behaviour added

- Twelve built-in FateDrop avatar presets.
- Avatar preview and one-click preset selection on My FateDrop ID.
- JPG/PNG/WEBP upload up to 5MB.
- Browser-side square crop and WebP compression before persistence.
- Custom avatar data is stored on the existing FateDrop profile record; the original upload is not retained.
- Remove/change avatar controls.
- FateDrop ID card edit shortcut jumps directly to avatar controls.
- Dashboard automatically reflects the profile avatar because it reads the same FateDrop ID account record.

### Still deliberately deferred

- Public profile directory.
- Avatar cosmetics unlocked by future reward progression.
- Advanced manual crop/position controls.
