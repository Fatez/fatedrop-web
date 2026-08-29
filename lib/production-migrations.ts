import { fateDropPostgres } from "@/lib/postgres";

const MIGRATION_CUTOFF = "2026-08-28";

export const PRODUCTION_MIGRATIONS = [
  {
    id: "2026-08-28-unify-lifecycle-notification-defaults.sql",
    statements: [
      `ALTER TABLE fatedrop_notification_preferences
  ALTER COLUMN vanished_enabled SET DEFAULT true`,
      `UPDATE fatedrop_notification_preferences
SET vanished_enabled = true
WHERE vanished_enabled = false
  AND COALESCE(whisper_enabled, true) = true
  AND echo_enabled = true
  AND manifested_enabled = true`,
    ],
  },
  {
    id: "2026-08-29-push-dispatch-health.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_push_dispatch_health (
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
)`,
    ],
  },
  {
    id: "2026-08-29-closed-beta-access.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_beta_access (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'revoked')),
  requested_at bigint NOT NULL,
  approved_at bigint,
  approved_by text,
  updated_at bigint NOT NULL
)`,
      `INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
SELECT id, 'approved', created_at, EXTRACT(EPOCH FROM NOW())::bigint, 'migration:pre-closed-beta', EXTRACT(EPOCH FROM NOW())::bigint
FROM fatedrop_users
ON CONFLICT (user_id) DO NOTHING`,
      `CREATE TABLE IF NOT EXISTS fatedrop_beta_access_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  previous_status text,
  next_status text NOT NULL CHECK (next_status IN ('pending', 'approved', 'revoked')),
  operator text NOT NULL,
  changed_at bigint NOT NULL
)`,
      `CREATE OR REPLACE FUNCTION fatedrop_create_pending_beta_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
  VALUES (NEW.id, 'pending', NEW.created_at, NULL, NULL, NEW.created_at)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$`,
      `DROP TRIGGER IF EXISTS fatedrop_users_closed_beta_pending ON fatedrop_users`,
      `CREATE TRIGGER fatedrop_users_closed_beta_pending
AFTER INSERT ON fatedrop_users
FOR EACH ROW EXECUTE FUNCTION fatedrop_create_pending_beta_access()`,
      `CREATE OR REPLACE FUNCTION fatedrop_set_beta_access(p_user_id text, p_status text, p_operator text)
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
    SELECT u.created_at INTO v_requested FROM fatedrop_users u WHERE u.id = p_user_id;
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
  ON CONFLICT (user_id) DO UPDATE SET
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
$$`,
    ],
  },
] as const;

export const PRODUCTION_MIGRATION_CUTOFF = MIGRATION_CUTOFF;

async function ensureMigrationLedger() {
  const sql = await fateDropPostgres();
  await sql`
    CREATE TABLE IF NOT EXISTS fatedrop_schema_migrations (
      migration_id text PRIMARY KEY,
      applied_at bigint NOT NULL
    )`;
  return sql;
}

export async function runProductionMigrations() {
  const sql = await ensureMigrationLedger();
  const appliedRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations`;
  const applied = new Set(appliedRows.map((row) => String(row.migration_id)));
  const newlyApplied: string[] = [];

  for (const migration of PRODUCTION_MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    for (const statement of migration.statements) {
      await sql.query(statement);
    }
    await sql`
      INSERT INTO fatedrop_schema_migrations (migration_id, applied_at)
      VALUES (${migration.id}, ${Math.floor(Date.now() / 1000)})
      ON CONFLICT (migration_id) DO NOTHING`;
    newlyApplied.push(migration.id);
  }

  const ledgerRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations`;
  const ledger = new Set(ledgerRows.map((row) => String(row.migration_id)));
  const pending = PRODUCTION_MIGRATIONS.filter((migration) => !ledger.has(migration.id)).map((migration) => migration.id);

  const defaultRows = await sql`
    SELECT column_default
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='fatedrop_notification_preferences'
      AND column_name='vanished_enabled'`;
  const vanishedDefault = String(defaultRows[0]?.column_default ?? "").toLowerCase();
  const asymmetricRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM fatedrop_notification_preferences
    WHERE vanished_enabled=false
      AND COALESCE(whisper_enabled,true)=true
      AND echo_enabled=true
      AND manifested_enabled=true`;
  const historicalAsymmetryCount = Number(asymmetricRows[0]?.count ?? 0);
  const betaMissingRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM fatedrop_users u
    LEFT JOIN fatedrop_beta_access b ON b.user_id = u.id
    WHERE b.user_id IS NULL`;
  const betaAccessMissingCount = Number(betaMissingRows[0]?.count ?? 0);

  if (!vanishedDefault.includes("true")) {
    throw new Error("Production migration verification failed: Vanished default is not enabled.");
  }
  if (historicalAsymmetryCount !== 0) {
    throw new Error(`Production migration verification failed: ${historicalAsymmetryCount} legacy asymmetric lifecycle preference row(s) remain.`);
  }
  if (betaAccessMissingCount !== 0) {
    throw new Error(`Production migration verification failed: ${betaAccessMissingCount} FateDrop account(s) are missing closed-beta access state.`);
  }
  if (pending.length) {
    throw new Error(`Production migration verification failed: pending migrations: ${pending.join(", ")}`);
  }

  return {
    known: PRODUCTION_MIGRATIONS.length,
    newlyApplied,
    pending,
    vanishedDefaultVerified: true,
    historicalAsymmetryCount,
    betaAccessMissingCount,
  };
}
