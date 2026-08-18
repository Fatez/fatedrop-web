-- FateDrop Fate Network additive migration
-- Existing production tables are intentionally untouched.

CREATE TABLE IF NOT EXISTS fatedrop_retailers (
  id text PRIMARY KEY,
  name text NOT NULL,
  website text,
  verification text NOT NULL DEFAULT 'external',
  catalogue_connected boolean NOT NULL DEFAULT false,
  updated_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS fatedrop_retailer_locations (
  id text PRIMARY KEY,
  retailer_id text REFERENCES fatedrop_retailers(id),
  provider text NOT NULL,
  provider_id text,
  name text NOT NULL,
  address text,
  postcode text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  website text,
  phone text,
  opening_details_json jsonb,
  verification text NOT NULL DEFAULT 'external',
  updated_at bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS fatedrop_locations_provider_uidx ON fatedrop_retailer_locations(provider, provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS fatedrop_locations_retailer_idx ON fatedrop_retailer_locations(retailer_id);
CREATE INDEX IF NOT EXISTS fatedrop_locations_postcode_idx ON fatedrop_retailer_locations(postcode);

CREATE TABLE IF NOT EXISTS fatedrop_product_identities (
  id text PRIMARY KEY,
  tcg text NOT NULL,
  canonical_key text NOT NULL,
  title text NOT NULL,
  product_type text,
  set_name text,
  edition text,
  official_rrp_pence bigint,
  rrp_source text,
  rrp_verified_at bigint,
  updated_at bigint NOT NULL,
  UNIQUE(tcg, canonical_key)
);
CREATE INDEX IF NOT EXISTS fatedrop_product_identity_tcg_idx ON fatedrop_product_identities(tcg);

CREATE TABLE IF NOT EXISTS fatedrop_products (
  id text PRIMARY KEY,
  retailer_id text NOT NULL REFERENCES fatedrop_retailers(id),
  product_identity_id text NOT NULL REFERENCES fatedrop_product_identities(id),
  retailer_sku text,
  title text NOT NULL,
  url text NOT NULL,
  image_url text,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS fatedrop_products_retailer_sku_uidx ON fatedrop_products(retailer_id, retailer_sku) WHERE retailer_sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS fatedrop_products_identity_idx ON fatedrop_products(product_identity_id);

CREATE TABLE IF NOT EXISTS fatedrop_offers (
  id text PRIMARY KEY,
  product_id text REFERENCES fatedrop_products(id),
  retailer_id text NOT NULL REFERENCES fatedrop_retailers(id),
  location_id text REFERENCES fatedrop_retailer_locations(id),
  product_identity_id text NOT NULL REFERENCES fatedrop_product_identities(id),
  retailer_sku text,
  title text NOT NULL,
  url text NOT NULL,
  channel text NOT NULL,
  item_price_pence bigint NOT NULL,
  mandatory_postage_pence bigint,
  mandatory_fees_pence bigint,
  delivery_known boolean NOT NULL DEFAULT false,
  stock_state text NOT NULL,
  stock_quantity bigint,
  observed_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_offers_identity_idx ON fatedrop_offers(product_identity_id, stock_state, observed_at DESC);
CREATE INDEX IF NOT EXISTS fatedrop_offers_retailer_idx ON fatedrop_offers(retailer_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS fatedrop_offers_location_idx ON fatedrop_offers(location_id, observed_at DESC) WHERE location_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS fatedrop_inventory (
  id text PRIMARY KEY,
  offer_id text NOT NULL REFERENCES fatedrop_offers(id),
  location_id text REFERENCES fatedrop_retailer_locations(id),
  source_event_id text,
  stock_state text NOT NULL,
  quantity bigint,
  observed_at bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS fatedrop_inventory_source_uidx ON fatedrop_inventory(source_event_id) WHERE source_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS fatedrop_inventory_offer_idx ON fatedrop_inventory(offer_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_signal_events (
  id text PRIMARY KEY,
  kind text NOT NULL,
  product_identity_id text REFERENCES fatedrop_product_identities(id),
  offer_id text REFERENCES fatedrop_offers(id),
  retailer_id text REFERENCES fatedrop_retailers(id),
  location_id text REFERENCES fatedrop_retailer_locations(id),
  occurred_at bigint NOT NULL,
  evidence_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS fatedrop_signal_product_idx ON fatedrop_signal_events(product_identity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS fatedrop_signal_retailer_idx ON fatedrop_signal_events(retailer_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_fate_matches (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id),
  query_text text NOT NULL,
  product_identity_id text REFERENCES fatedrop_product_identities(id),
  max_item_price_pence bigint,
  max_true_price_pence bigint,
  max_percent_above_rrp double precision,
  scope text NOT NULL DEFAULT 'either',
  radius_km double precision,
  postcode text,
  latitude double precision,
  longitude double precision,
  preferred_retailers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded_retailers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  stock_requirement text NOT NULL DEFAULT 'in_stock',
  notification_preferences_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_matches_user_idx ON fatedrop_fate_matches(user_id, enabled, updated_at DESC);
CREATE INDEX IF NOT EXISTS fatedrop_matches_product_idx ON fatedrop_fate_matches(product_identity_id, enabled) WHERE product_identity_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS fatedrop_fate_match_hits (
  id text PRIMARY KEY,
  match_id text NOT NULL REFERENCES fatedrop_fate_matches(id),
  signal_event_id text REFERENCES fatedrop_signal_events(id),
  offer_id text NOT NULL REFERENCES fatedrop_offers(id),
  reasons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  occurred_at bigint NOT NULL,
  UNIQUE(match_id, offer_id, signal_event_id)
);
CREATE INDEX IF NOT EXISTS fatedrop_match_hits_match_idx ON fatedrop_fate_match_hits(match_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_demand_snapshots (
  id text PRIMARY KEY,
  product_identity_id text NOT NULL REFERENCES fatedrop_product_identities(id),
  demand_count bigint NOT NULL,
  online_demand_count bigint NOT NULL,
  local_demand_count bigint NOT NULL,
  price_tolerance_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  radius_bands_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  trend_direction text,
  measured_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_demand_product_idx ON fatedrop_demand_snapshots(product_identity_id, measured_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_stock_allocations (
  id text PRIMARY KEY,
  retailer_id text NOT NULL REFERENCES fatedrop_retailers(id),
  location_id text REFERENCES fatedrop_retailer_locations(id),
  product_identity_id text NOT NULL REFERENCES fatedrop_product_identities(id),
  quantity_allocated bigint NOT NULL,
  quantity_reserved bigint NOT NULL DEFAULT 0,
  per_user_limit bigint NOT NULL DEFAULT 1,
  state text NOT NULL DEFAULT 'closed',
  opens_at bigint,
  closes_at bigint,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  CHECK (quantity_allocated >= 0),
  CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_allocated),
  CHECK (per_user_limit > 0)
);
CREATE INDEX IF NOT EXISTS fatedrop_allocations_product_idx ON fatedrop_stock_allocations(product_identity_id, state);

CREATE TABLE IF NOT EXISTS fatedrop_reservations (
  id text PRIMARY KEY,
  allocation_id text NOT NULL REFERENCES fatedrop_stock_allocations(id),
  user_id text NOT NULL REFERENCES fatedrop_users(id),
  quantity bigint NOT NULL,
  state text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  reserved_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS fatedrop_reservations_allocation_idx ON fatedrop_reservations(allocation_id, state);
CREATE INDEX IF NOT EXISTS fatedrop_reservations_user_idx ON fatedrop_reservations(user_id, state, reserved_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_reservation_events (
  id text PRIMARY KEY,
  reservation_id text NOT NULL REFERENCES fatedrop_reservations(id),
  event_type text NOT NULL,
  from_state text,
  to_state text,
  occurred_at bigint NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS fatedrop_reservation_events_idx ON fatedrop_reservation_events(reservation_id, occurred_at);
