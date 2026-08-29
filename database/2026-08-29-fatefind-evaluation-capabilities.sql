CREATE TABLE IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities (
  token_hash text PRIMARY KEY,
  fate_find_id text NOT NULL,
  expires_at bigint NOT NULL,
  created_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities_expiry_idx
  ON fatedrop_fatefind_evaluation_capabilities (expires_at);
