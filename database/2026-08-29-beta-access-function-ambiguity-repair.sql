-- Forward repair for the closed-beta setter. The original closed-beta migration
-- may already be present in the production ledger, so do not edit/replay it.
-- Use the named primary-key constraint to avoid PL/pgSQL output-parameter
-- ambiguity around the RETURNS TABLE column named user_id.
CREATE OR REPLACE FUNCTION fatedrop_set_beta_access(p_user_id text, p_status text, p_operator text)
RETURNS TABLE(user_id text, status text, requested_at bigint, approved_at bigint, approved_by text, updated_at bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous text;
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
  v_requested bigint;
BEGIN
  IF p_status NOT IN ('pending', 'approved', 'revoked') THEN
    RAISE EXCEPTION 'invalid beta status';
  END IF;
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN
    RAISE EXCEPTION 'operator is required';
  END IF;

  SELECT b.status, b.requested_at INTO v_previous, v_requested
  FROM fatedrop_beta_access b
  WHERE b.user_id = p_user_id
  FOR UPDATE;

  IF v_requested IS NULL THEN
    SELECT u.created_at INTO v_requested
    FROM fatedrop_users u
    WHERE u.id = p_user_id;
    IF v_requested IS NULL THEN
      RAISE EXCEPTION 'unknown FateDrop user';
    END IF;
  END IF;

  INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
  VALUES (
    p_user_id,
    p_status,
    v_requested,
    CASE WHEN p_status = 'approved' THEN v_now ELSE NULL END,
    CASE WHEN p_status = 'approved' THEN BTRIM(p_operator) ELSE NULL END,
    v_now
  )
  ON CONFLICT ON CONSTRAINT fatedrop_beta_access_pkey DO UPDATE SET
    status = EXCLUDED.status,
    approved_at = EXCLUDED.approved_at,
    approved_by = EXCLUDED.approved_by,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO fatedrop_beta_access_audit (user_id, previous_status, next_status, operator, changed_at)
  VALUES (p_user_id, v_previous, p_status, BTRIM(p_operator), v_now);

  RETURN QUERY
  SELECT b.user_id, b.status, b.requested_at, b.approved_at, b.approved_by, b.updated_at
  FROM fatedrop_beta_access b
  WHERE b.user_id = p_user_id;
END;
$$;
