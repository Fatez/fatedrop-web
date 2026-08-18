# FateDrop Dashboard Metrics and Audit Contract

The dashboard is deliberately built around **stored events and timestamped snapshots**, not presentation-only counters. If there is no evidence for a number, the UI shows `0`, `—`, or an explicit "not connected" state.

## Metric registry

| Dashboard value | Calculation | Persistent source | Freshness |
| --- | --- | --- | --- |
| Member Since | `fatedrop_users.created_at` formatted in UK time | `fatedrop_users` | Permanent account history |
| Network Age | `now - fatedrop_users.created_at` | `fatedrop_users` | Calculated at render |
| Membership / trial | Current membership tier + Stripe-backed status | `fatedrop_memberships` | Updated by verified Stripe webhooks |
| Signals seen | Count of `signal_seen` events for the current user | `fatedrop_activity_events` | Event time + recorded time retained |
| Wishlist hits | Count of `wishlist_hit` events for the current user | `fatedrop_activity_events` | Event time + recorded time retained |
| Stores tracked | Count of unique `store_id`/retailer keys in `store_tracked` events | `fatedrop_activity_events` | Derived at render |
| Saved vs market | Sum of positive `amount_pence` on `market_saving` events | `fatedrop_activity_events` | Derived at render |
| 30-day activity chart | Daily count of stored `signal_seen` + `wishlist_hit` events | `fatedrop_activity_events` | Derived at render |
| Whisper / Manifested / Vanished / Echo | Latest submitted network snapshot | `fatedrop_network_snapshots.metrics_json` | `measured_at` is displayed |
| Recent lifecycle signals | Latest snapshot `recentSignals` collection | `fatedrop_network_snapshots.recent_signals_json` | Snapshot `measured_at` |
| Published beta snapshot | Existing validated public-site values | `lib/site-data.ts` | Clearly labelled static, never "live" |

## Network snapshot ingestion

FateDrop Cloud can post a network snapshot to:

```text
POST /api/dashboard/network-snapshot
Authorization: Bearer <FATEDROP_METRICS_INGEST_SECRET>
Content-Type: application/json
```

Example contract:

```json
{
  "sourceEventId": "cloud-snapshot-2026-08-18T09:45:00Z",
  "source": "FateDrop Cloud / production monitors",
  "measuredAt": 1787042700,
  "metrics": {
    "whisper": 8,
    "manifested": 4,
    "vanished": 11,
    "echo": 3,
    "changes24h": 142,
    "productsTracked": 6332,
    "inStock": 2592,
    "catalogueRetailers": 4,
    "healthyMonitors": 3
  },
  "upcomingEvents": [
    {
      "id": "event-123",
      "name": "Example event",
      "venue": "Example venue",
      "location": "Birmingham",
      "startsAt": 1788000000,
      "ticketUrl": "https://retailer-or-organiser.example/event",
      "vendorCount": 120
    }
  ],
  "recentSignals": [
    {
      "id": "signal-123",
      "state": "manifested",
      "title": "Product title",
      "retailer": "Retailer name",
      "detail": "Evidence-backed stock confirmation",
      "deliveredPricePence": 5495,
      "occurredAt": 1787042650
    }
  ]
}
```

`sourceEventId` is idempotent. Replaying the same snapshot does not inflate history.

## Personal activity ingestion

Authenticated website sessions can write activity for themselves. FateDrop Cloud/app services can write events for a resolved `userId` using the ingestion secret.

```text
POST /api/dashboard/activity
```

Supported types:

- `signal_seen`
- `wishlist_hit`
- `store_tracked`
- `market_saving`

Service events should include a stable `sourceEventId`; duplicate imports are ignored.

## Stripe auditability

Stripe is the billing source of truth. FateDrop stores only the subscription/access fields needed by the product plus a minimal webhook audit ledger:

- Stripe event ID
- event type
- resolved FateDrop user ID when known
- customer ID
- subscription ID
- Stripe event timestamp
- FateDrop processing timestamp

The full Stripe payment payload and card data are **not** copied into the FateDrop database. Webhook event IDs are idempotent so retries cannot double-process a billing event.

The dashboard reads membership state only after the verified webhook has updated `fatedrop_memberships`.

## Data retention / backup

Production should use PostgreSQL for accounts and metrics. The schema deliberately keeps activity and network snapshots append-only so trend reconstruction and metric auditing remain possible.

The database provider should have automated point-in-time backups enabled before public launch. GitHub is **not** a backup for production customer/activity data and local JSON files are development-only.

## No-fake-data rule

- Never hard-code personal achievements into the dashboard.
- Never present the public beta snapshot as real-time.
- Missing personal events produce zero values.
- Missing network snapshots produce `—` lifecycle counters.
- Every live network snapshot exposes its source and measurement time in the UI.
