CREATE TABLE IF NOT EXISTS fatedrop_admin_roles (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner')),
  granted_at bigint NOT NULL,
  granted_by text NOT NULL
);

CREATE TABLE IF NOT EXISTS fatedrop_admin_role_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner')),
  action text NOT NULL CHECK (action IN ('grant', 'revoke')),
  operator text NOT NULL,
  changed_at bigint NOT NULL
);

CREATE OR REPLACE FUNCTION fatedrop_grant_owner(p_user_id text, p_operator text)
RETURNS TABLE(user_id text, role text, granted_at bigint, granted_by text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN
    RAISE EXCEPTION 'operator is required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM fatedrop_users u WHERE u.id = p_user_id) THEN
    RAISE EXCEPTION 'unknown FateDrop user';
  END IF;

  INSERT INTO fatedrop_admin_roles (user_id, role, granted_at, granted_by)
  VALUES (p_user_id, 'owner', v_now, BTRIM(p_operator))
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'owner',
    granted_at = EXCLUDED.granted_at,
    granted_by = EXCLUDED.granted_by;

  INSERT INTO fatedrop_admin_role_audit (user_id, role, action, operator, changed_at)
  VALUES (p_user_id, 'owner', 'grant', BTRIM(p_operator), v_now);

  PERFORM fatedrop_set_beta_access(p_user_id, 'approved', BTRIM(p_operator));

  RETURN QUERY
  SELECT r.user_id, r.role, r.granted_at, r.granted_by
  FROM fatedrop_admin_roles r
  WHERE r.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION fatedrop_revoke_owner(p_user_id text, p_operator text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN
    RAISE EXCEPTION 'operator is required';
  END IF;

  IF EXISTS (SELECT 1 FROM fatedrop_admin_roles r WHERE r.user_id = p_user_id AND r.role = 'owner') THEN
    DELETE FROM fatedrop_admin_roles WHERE user_id = p_user_id;
    INSERT INTO fatedrop_admin_role_audit (user_id, role, action, operator, changed_at)
    VALUES (p_user_id, 'owner', 'revoke', BTRIM(p_operator), v_now);
  END IF;
END;
$$;

DO $$
DECLARE
  v_owner_id text;
  v_count integer;
BEGIN
  SELECT COUNT(*)::int, MIN(id)
  INTO v_count, v_owner_id
  FROM fatedrop_users
  WHERE lower(email) = 'hello@fatedrop.co.uk';

  IF v_count <> 1 OR v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Owner bootstrap requires exactly one canonical hello@fatedrop.co.uk FateDrop account';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM fatedrop_admin_roles
    WHERE user_id = v_owner_id AND role = 'owner'
  ) THEN
    PERFORM fatedrop_grant_owner(v_owner_id, 'migration:hello-owner-bootstrap');
  END IF;
END;
$$;
