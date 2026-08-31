BEGIN;

CREATE TABLE IF NOT EXISTS fatedrop_push_recovery_checkpoint (
  id text PRIMARY KEY,
  last_completed_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

COMMIT;
