import { fateDropPostgres } from "@/lib/postgres";

const MIGRATION_ID = "2026-08-29-beta-owner-access.sql";
const OWNER_EMAIL = "hello@fatedrop.co.uk";

export async function runOwnerProductionMigration() {
  const sql = await fateDropPostgres();
  const ledger = await sql`SELECT migration_id FROM fatedrop_schema_migrations WHERE migration_id = ${MIGRATION_ID} LIMIT 1`;

  if (!ledger[0]) {
    await sql.query(`CREATE TABLE IF NOT EXISTS fatedrop_admin_roles (
      user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('owner')),
      granted_at bigint NOT NULL,
      granted_by text NOT NULL
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS fatedrop_admin_role_audit (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
      role text NOT NULL CHECK (role IN ('owner')),
      action text NOT NULL CHECK (action IN ('grant', 'revoke')),
      operator text NOT NULL,
      changed_at bigint NOT NULL
    )`);
    await sql.query(`CREATE OR REPLACE FUNCTION fatedrop_grant_owner(p_user_id text, p_operator text)
      RETURNS TABLE(user_id text, role text, granted_at bigint, granted_by text)
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
      BEGIN
        IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
        IF NOT EXISTS (SELECT 1 FROM fatedrop_users u WHERE u.id = p_user_id) THEN RAISE EXCEPTION 'unknown FateDrop user'; END IF;
        INSERT INTO fatedrop_admin_roles (user_id, role, granted_at, granted_by)
        VALUES (p_user_id, 'owner', v_now, BTRIM(p_operator))
        ON CONFLICT (user_id) DO UPDATE SET role='owner', granted_at=EXCLUDED.granted_at, granted_by=EXCLUDED.granted_by;
        INSERT INTO fatedrop_admin_role_audit (user_id, role, action, operator, changed_at)
        VALUES (p_user_id, 'owner', 'grant', BTRIM(p_operator), v_now);
        PERFORM fatedrop_set_beta_access(p_user_id, 'approved', BTRIM(p_operator));
        RETURN QUERY SELECT r.user_id, r.role, r.granted_at, r.granted_by FROM fatedrop_admin_roles r WHERE r.user_id=p_user_id;
      END;
      $$`);
    await sql.query(`CREATE OR REPLACE FUNCTION fatedrop_revoke_owner(p_user_id text, p_operator text)
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      DECLARE
        v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
      BEGIN
        IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
        IF EXISTS (SELECT 1 FROM fatedrop_admin_roles r WHERE r.user_id=p_user_id AND r.role='owner') THEN
          DELETE FROM fatedrop_admin_roles WHERE user_id=p_user_id;
          INSERT INTO fatedrop_admin_role_audit (user_id, role, action, operator, changed_at)
          VALUES (p_user_id, 'owner', 'revoke', BTRIM(p_operator), v_now);
        END IF;
      END;
      $$`);

    const ownerRows = await sql`
      SELECT id FROM fatedrop_users
      WHERE lower(email) = ${OWNER_EMAIL}
    `;
    if (ownerRows.length !== 1) {
      throw new Error(`Owner bootstrap requires exactly one canonical ${OWNER_EMAIL} FateDrop account.`);
    }
    const ownerUserId = String(ownerRows[0].id);
    const ownerExists = await sql`SELECT user_id FROM fatedrop_admin_roles WHERE user_id=${ownerUserId} AND role='owner' LIMIT 1`;
    if (!ownerExists[0]) {
      await sql`SELECT * FROM fatedrop_grant_owner(${ownerUserId}, ${"migration:hello-owner-bootstrap"})`;
    }
    await sql`
      INSERT INTO fatedrop_schema_migrations (migration_id, applied_at)
      VALUES (${MIGRATION_ID}, ${Math.floor(Date.now() / 1000)})
      ON CONFLICT (migration_id) DO NOTHING
    `;
  }

  const verification = await sql`
    SELECT u.id, u.email, r.role, b.status AS beta_status
    FROM fatedrop_users u
    JOIN fatedrop_admin_roles r ON r.user_id = u.id AND r.role = 'owner'
    LEFT JOIN fatedrop_beta_access b ON b.user_id = u.id
    WHERE lower(u.email) = ${OWNER_EMAIL}
  `;
  if (verification.length !== 1 || String(verification[0].role) !== "owner" || String(verification[0].beta_status) !== "approved") {
    throw new Error("Owner migration verification failed.");
  }

  return {
    migrationId: MIGRATION_ID,
    verified: true,
    ownerUserId: String(verification[0].id),
  };
}
