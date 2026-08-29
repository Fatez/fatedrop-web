CREATE TABLE IF NOT EXISTS fatedrop_password_reset_tokens (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  consumed_at bigint
);

CREATE INDEX IF NOT EXISTS fatedrop_password_reset_tokens_user_idx
  ON fatedrop_password_reset_tokens (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS fatedrop_password_reset_tokens_expiry_idx
  ON fatedrop_password_reset_tokens (expires_at);

CREATE OR REPLACE FUNCTION fatedrop_consume_password_reset(p_token_hash text, p_password_hash text)
RETURNS TABLE(user_id text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id text;
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_token_hash), '') IS NULL THEN RAISE EXCEPTION 'token hash is required'; END IF;
  IF NULLIF(BTRIM(p_password_hash), '') IS NULL THEN RAISE EXCEPTION 'password hash is required'; END IF;

  SELECT t.user_id
  INTO v_user_id
  FROM fatedrop_password_reset_tokens t
  WHERE t.token_hash = p_token_hash
    AND t.consumed_at IS NULL
    AND t.expires_at > v_now
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE fatedrop_password_reset_tokens t
  SET consumed_at = v_now
  WHERE t.user_id = v_user_id
    AND t.consumed_at IS NULL;

  UPDATE fatedrop_users u
  SET password_hash = p_password_hash,
      updated_at = v_now
  WHERE u.id = v_user_id;

  DELETE FROM fatedrop_sessions s
  WHERE s.user_id = v_user_id;

  RETURN QUERY SELECT v_user_id;
END;
$$;
