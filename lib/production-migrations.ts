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
    id: "2026-08-29-fatefind-evaluation-capabilities.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities (
  token_hash text PRIMARY KEY,
  fate_find_id text NOT NULL,
  expires_at bigint NOT NULL,
  created_at bigint NOT NULL
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities_expiry_idx
  ON fatedrop_fatefind_evaluation_capabilities (expires_at)`,
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

  if (!vanishedDefault.includes("true")) {
    throw new Error("Production migration verification failed: Vanished default is not enabled.");
  }
  if (historicalAsymmetryCount !== 0) {
    throw new Error(`Production migration verification failed: ${historicalAsymmetryCount} legacy asymmetric lifecycle preference row(s) remain.`);
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
  };
}
