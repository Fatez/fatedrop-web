-- FateDrop P0 production push health heartbeat.
-- Records only dispatcher health metadata; never stores push tokens.

CREATE TABLE IF NOT EXISTS fatedrop_push_dispatch_health (
  id text PRIMARY KEY,
  last_started_at bigint,
  last_completed_at bigint,
  last_status text NOT NULL DEFAULT 'unknown',
  last_queued integer NOT NULL DEFAULT 0,
  last_claimed integer NOT NULL DEFAULT 0,
  last_sent integer NOT NULL DEFAULT 0,
  last_failed integer NOT NULL DEFAULT 0,
  last_error text,
  updated_at bigint NOT NULL
);
