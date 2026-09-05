CREATE TABLE IF NOT EXISTS fatedrop_operator_echo_retractions (
  target_event_id text PRIMARY KEY CHECK (target_event_id ~ '^local-radar-operator:[1-9][0-9]*$'),
  retraction_event_id text NOT NULL UNIQUE CHECK (retraction_event_id ~ '^local-radar-operator-retraction:[1-9][0-9]*$'),
  original_operator_issue bigint NOT NULL CHECK (original_operator_issue > 0),
  retraction_issue bigint NOT NULL UNIQUE CHECK (retraction_issue > 0),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  operator_login text NOT NULL,
  requested_at bigint NOT NULL,
  retracted_at bigint NOT NULL,
  payload_json jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS fatedrop_operator_echo_retractions_time_idx
  ON fatedrop_operator_echo_retractions (retracted_at DESC);

CREATE TABLE IF NOT EXISTS fatedrop_operator_echo_retraction_audit (
  request_event_id text PRIMARY KEY CHECK (request_event_id ~ '^local-radar-operator-retraction:[1-9][0-9]*$'),
  target_event_id text NOT NULL REFERENCES fatedrop_operator_echo_retractions(target_event_id),
  outcome text NOT NULL CHECK (outcome IN ('effective', 'already_retracted')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  operator_login text NOT NULL,
  requested_at bigint NOT NULL,
  recorded_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS fatedrop_operator_echo_retraction_audit_target_time_idx
  ON fatedrop_operator_echo_retraction_audit (target_event_id, recorded_at DESC);
