CREATE TABLE IF NOT EXISTS fatedrop_account_deletion_requests (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'cancelled')),
  source text NOT NULL DEFAULT 'mobile_app',
  requested_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS fatedrop_account_deletion_requests_status_time_idx
  ON fatedrop_account_deletion_requests (status, requested_at ASC);
