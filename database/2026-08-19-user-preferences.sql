-- FateDrop collector preference foundation
-- Additive only: existing production tables are intentionally untouched.

CREATE TABLE IF NOT EXISTS fatedrop_wishlist_items (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  product_identity_id text,
  query_text text NOT NULL,
  display_title text NOT NULL,
  tcg text,
  image_url text,
  source text NOT NULL DEFAULT 'website',
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS fatedrop_wishlist_user_identity_uidx
  ON fatedrop_wishlist_items(user_id, product_identity_id)
  WHERE product_identity_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS fatedrop_wishlist_user_query_uidx
  ON fatedrop_wishlist_items(user_id, lower(query_text))
  WHERE product_identity_id IS NULL;
CREATE INDEX IF NOT EXISTS fatedrop_wishlist_user_updated_idx
  ON fatedrop_wishlist_items(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_notification_preferences (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  echo_enabled boolean NOT NULL DEFAULT true,
  manifested_enabled boolean NOT NULL DEFAULT true,
  vanished_enabled boolean NOT NULL DEFAULT false,
  price_change_enabled boolean NOT NULL DEFAULT true,
  fate_match_enabled boolean NOT NULL DEFAULT true,
  web_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  discord_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start text,
  quiet_hours_end text,
  timezone text NOT NULL DEFAULT 'Europe/London',
  updated_at bigint NOT NULL
);
