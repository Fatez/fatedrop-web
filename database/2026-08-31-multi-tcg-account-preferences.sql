BEGIN;

ALTER TABLE fatedrop_users
  ADD COLUMN IF NOT EXISTS selected_tcg_codes jsonb NOT NULL DEFAULT '["pokemon"]'::jsonb,
  ADD COLUMN IF NOT EXISTS tcg_onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tcg_alert_preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE fatedrop_users
SET selected_tcg_codes = '["pokemon"]'::jsonb
WHERE jsonb_typeof(selected_tcg_codes) <> 'array' OR jsonb_array_length(selected_tcg_codes) = 0;

ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS manifested_reminders_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manifested_reminders_max_per_day integer NOT NULL DEFAULT 1
    CHECK (manifested_reminders_max_per_day BETWEEN 0 AND 3);

COMMIT;
