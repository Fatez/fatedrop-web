-- FateDrop Indie retailer workspaces + privacy-safe value proof.
-- Retailer access is explicitly mapped to a FateDrop ID. Analytics remain aggregated;
-- no retailer-facing query should expose individual collector identity.

CREATE TABLE IF NOT EXISTS fatedrop_retailer_access (
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  retailer_id text NOT NULL,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'analyst')),
  created_at bigint NOT NULL,
  verified_at bigint,
  PRIMARY KEY (user_id, retailer_id)
);

CREATE INDEX IF NOT EXISTS fatedrop_retailer_access_retailer_idx
  ON fatedrop_retailer_access (retailer_id);

ALTER TABLE fatedrop_activity_events
  DROP CONSTRAINT IF EXISTS fatedrop_activity_events_event_type_check;

ALTER TABLE fatedrop_activity_events
  ADD CONSTRAINT fatedrop_activity_events_event_type_check CHECK (event_type IN (
    'signal_seen',
    'wishlist_hit',
    'store_tracked',
    'market_saving',
    'search_appearance',
    'fatefind_appearance',
    'fatefind_best_value',
    'storefront_view',
    'fatematch_handoff'
  ));

CREATE INDEX IF NOT EXISTS fatedrop_activity_retailer_value_idx
  ON fatedrop_activity_events (store_id, event_type, occurred_at DESC);
