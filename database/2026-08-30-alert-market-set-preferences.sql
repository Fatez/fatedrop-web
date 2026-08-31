-- FateDrop collector market and set alert preferences.
-- Additive only. Unknown values stay independently selectable so incomplete
-- classification never gets silently rewritten as a known language or set.

ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS english_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS japanese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS korean_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS simplified_chinese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS traditional_chinese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS other_languages_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS unknown_language_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lifecycle_market_preferences jsonb NOT NULL DEFAULT '{"whisper":"all","echo":"all","manifested":"all","vanished":"all"}'::jsonb,
  ADD COLUMN IF NOT EXISTS all_sets_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS selected_set_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unknown_sets_enabled boolean NOT NULL DEFAULT true;
