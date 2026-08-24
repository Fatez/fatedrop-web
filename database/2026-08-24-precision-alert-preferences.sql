-- FateDrop precision alert filtering
-- Defaults keep the collector-facing feed focused on TCG products while unknown
-- listings fail open so new or ambiguous products are not silently lost.

ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS sealed_tcg_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS single_cards_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS accessories_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS merchandise_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unknown_products_enabled boolean NOT NULL DEFAULT true;
