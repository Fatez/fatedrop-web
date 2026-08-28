-- FateDrop P0 lifecycle notification parity repair.
-- All four public lifecycle stages are enabled by default.
--
-- Historical issue: the original preference table created Vanished with
-- DEFAULT false while Echo and Manifested defaulted true. Whisper was added
-- later with DEFAULT true. That asymmetric default could persist Vanished=false
-- for otherwise fully-enabled lifecycle accounts.

ALTER TABLE fatedrop_notification_preferences
  ALTER COLUMN vanished_enabled SET DEFAULT true;

-- Repair the exact legacy asymmetric state produced by the old default while
-- leaving broader user opt-outs intact. Users who disabled multiple lifecycle
-- stages are not changed by this migration.
UPDATE fatedrop_notification_preferences
SET vanished_enabled = true
WHERE vanished_enabled = false
  AND COALESCE(whisper_enabled, true) = true
  AND echo_enabled = true
  AND manifested_enabled = true;
