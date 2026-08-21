-- FateDrop final four-stage signal contract
-- Existing users default to receiving Whisper alerts; they can opt out independently.

ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS whisper_enabled boolean NOT NULL DEFAULT true;
