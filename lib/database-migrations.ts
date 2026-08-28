import { fateDropPostgres } from "@/lib/postgres";

export const REQUIRED_DATABASE_MIGRATIONS = [
  "2026-08-28-unify-lifecycle-notification-defaults",
] as const;

type MigrationId = (typeof REQUIRED_DATABASE_MIGRATIONS)[number];

async function ensureMigrationLedger() {
  const sql = await fateDropPostgres();
  await sql`
    CREATE TABLE IF NOT EXISTS fatedrop_schema_migrations (
      id text PRIMARY KEY,
      applied_at bigint NOT NULL
    )`;
  return sql;
}

async function appliedMigrationIds() {
  const sql = await ensureMigrationLedger();
  const rows = await sql`
    SELECT id
    FROM fatedrop_schema_migrations`;
  return new Set(rows.map((row) => String(row.id)));
}

async function applyLifecycleNotificationDefaultParity() {
  const sql = await fateDropPostgres();

  await sql`
    ALTER TABLE fatedrop_notification_preferences
      ALTER COLUMN vanished_enabled SET DEFAULT true`;

  const repaired = await sql`
    UPDATE fatedrop_notification_preferences
    SET vanished_enabled = true
    WHERE vanished_enabled = false
      AND COALESCE(whisper_enabled, true) = true
      AND echo_enabled = true
      AND manifested_enabled = true
    RETURNING user_id`;

  return repaired.length;
}

async function recordMigration(id: MigrationId) {
  const sql = await fateDropPostgres();
  const appliedAt = Math.floor(Date.now() / 1000);
  await sql`
    INSERT INTO fatedrop_schema_migrations (id, applied_at)
    VALUES (${id}, ${appliedAt})
    ON CONFLICT (id) DO NOTHING`;
}

export async function databaseMigrationStatus() {
  const applied = await appliedMigrationIds();
  const pending = REQUIRED_DATABASE_MIGRATIONS.filter((id) => !applied.has(id));
  return {
    required: REQUIRED_DATABASE_MIGRATIONS.length,
    applied: REQUIRED_DATABASE_MIGRATIONS.length - pending.length,
    pending,
    ready: pending.length === 0,
  };
}

export async function applyRequiredDatabaseMigrations() {
  const applied = await appliedMigrationIds();
  const appliedNow: string[] = [];
  let repairedLifecyclePreferenceRows = 0;

  for (const id of REQUIRED_DATABASE_MIGRATIONS) {
    if (applied.has(id)) continue;

    if (id === "2026-08-28-unify-lifecycle-notification-defaults") {
      repairedLifecyclePreferenceRows += await applyLifecycleNotificationDefaultParity();
    }

    await recordMigration(id);
    appliedNow.push(id);
  }

  const status = await databaseMigrationStatus();
  return {
    ...status,
    appliedNow,
    repairedLifecyclePreferenceRows,
  };
}
