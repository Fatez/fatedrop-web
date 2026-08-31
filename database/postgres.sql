CREATE TABLE IF NOT EXISTS beta_leads (
  id text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('collector', 'business', 'event')),
  email text NOT NULL,
  contact_name text NOT NULL,
  region text,
  primary_tcg text,
  wanted_feature text,
  business_name text,
  website text,
  ecommerce_platform text,
  product_count text,
  business_type text,
  catalogue_method text,
  attends_events text,
  event_name text,
  event_location text,
  event_date text,
  vendor_count text,
  ticket_link text,
  event_vendor_mode boolean NOT NULL DEFAULT false,
  message text,
  contact_consent boolean NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'website',
  created_at bigint NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS beta_leads_role_email_unique
  ON beta_leads (role, email);

-- FateDrop identity + membership foundation.
CREATE TABLE IF NOT EXISTS fatedrop_users (
  id text PRIMARY KEY,
  fate_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  username text NOT NULL UNIQUE,
  bio text,
  avatar_url text,
  primary_tcg text,
  selected_tcg_codes jsonb NOT NULL DEFAULT '["pokemon"]'::jsonb,
  tcg_onboarding_completed boolean NOT NULL DEFAULT false,
  tcg_alert_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  collector_style text,
  region text,
  profile_theme text NOT NULL DEFAULT 'signal' CHECK (profile_theme IN ('signal', 'cyan', 'violet', 'magenta')),
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS fatedrop_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_sessions_user_idx ON fatedrop_sessions (user_id);
CREATE INDEX IF NOT EXISTS fatedrop_sessions_expiry_idx ON fatedrop_sessions (expires_at);

CREATE TABLE IF NOT EXISTS fatedrop_memberships (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'pro')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'trialing', 'active', 'past_due', 'paused', 'canceled')),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  trial_started_at bigint,
  trial_ends_at bigint,
  current_period_end bigint,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  updated_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS fatedrop_discord_links (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  discord_user_id text NOT NULL UNIQUE,
  discord_username text NOT NULL,
  discord_avatar text,
  connected_at bigint NOT NULL,
  role_synced_at bigint
);

-- Dashboard activity ledger. These events are the source of personal dashboard
-- counts; stats are derived from rows rather than stored as mutable counters.
CREATE TABLE IF NOT EXISTS fatedrop_activity_events (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  source_event_id text UNIQUE,
  event_type text NOT NULL CHECK (event_type IN ('signal_seen', 'wishlist_hit', 'store_tracked', 'market_saving')),
  signal_state text CHECK (signal_state IS NULL OR signal_state IN ('whisper', 'manifested', 'vanished', 'echo')),
  title text,
  subtitle text,
  retailer text,
  store_id text,
  amount_pence bigint,
  source text NOT NULL CHECK (source IN ('website', 'app', 'cloud', 'import')),
  occurred_at bigint NOT NULL,
  recorded_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_activity_user_time_idx ON fatedrop_activity_events (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS fatedrop_activity_type_idx ON fatedrop_activity_events (event_type, occurred_at DESC);

-- Append-only network snapshots from FateDrop Cloud. Keeping the history means
-- every network number shown on the dashboard has a source and measurement time.
CREATE TABLE IF NOT EXISTS fatedrop_network_snapshots (
  id text PRIMARY KEY,
  source_event_id text NOT NULL UNIQUE,
  source text NOT NULL,
  measured_at bigint NOT NULL,
  recorded_at bigint NOT NULL,
  metrics_json jsonb NOT NULL,
  recent_signals_json jsonb NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS fatedrop_network_snapshot_time_idx ON fatedrop_network_snapshots (measured_at DESC);

-- Minimal Stripe audit ledger. We deliberately retain event identifiers and
-- entitlement-relevant metadata, not full payment payloads or card data.
CREATE TABLE IF NOT EXISTS fatedrop_billing_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  user_id text REFERENCES fatedrop_users(id) ON DELETE SET NULL,
  customer_id text,
  subscription_id text,
  stripe_created_at bigint,
  processed_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS fatedrop_billing_user_idx ON fatedrop_billing_events (user_id, processed_at DESC);
ALTER TABLE fatedrop_network_snapshots
  ADD COLUMN IF NOT EXISTS upcoming_events_json jsonb NOT NULL DEFAULT '[]'::jsonb;
