import { fateDropPostgres } from "@/lib/postgres";
import { runProductionMigrations } from "@/lib/production-migrations";

const LOCAL_RADAR_MIGRATION_ID = "2026-08-31-local-radar-location-evidence.sql";

const LOCAL_RADAR_MIGRATION_STATEMENTS = [
  `ALTER TABLE fatedrop_retailer_locations
  ADD COLUMN IF NOT EXISTS retailer_category TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS store_format TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS operational_status TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS tcg_seller_status TEXT NOT NULL DEFAULT 'candidate',
  ADD COLUMN IF NOT EXISTS tcg_seller_confidence SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS identity_status TEXT NOT NULL DEFAULT 'canonical',
  ADD COLUMN IF NOT EXISTS last_verified_at BIGINT`,
  `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fatedrop_retailer_locations_category_check') THEN
    ALTER TABLE fatedrop_retailer_locations ADD CONSTRAINT fatedrop_retailer_locations_category_check
      CHECK (retailer_category IN ('book_stationery','entertainment','general_retail','hobby_store','specialist_tcg','supermarket','toy_store','value_retail','warehouse_club','other')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fatedrop_retailer_locations_operational_check') THEN
    ALTER TABLE fatedrop_retailer_locations ADD CONSTRAINT fatedrop_retailer_locations_operational_check
      CHECK (operational_status IN ('open','opening_soon','closed','unknown')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fatedrop_retailer_locations_seller_check') THEN
    ALTER TABLE fatedrop_retailer_locations ADD CONSTRAINT fatedrop_retailer_locations_seller_check
      CHECK (tcg_seller_status IN ('verified','likely','candidate','excluded','conflicted')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fatedrop_retailer_locations_confidence_check') THEN
    ALTER TABLE fatedrop_retailer_locations ADD CONSTRAINT fatedrop_retailer_locations_confidence_check
      CHECK (tcg_seller_confidence BETWEEN 0 AND 100) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fatedrop_retailer_locations_identity_check') THEN
    ALTER TABLE fatedrop_retailer_locations ADD CONSTRAINT fatedrop_retailer_locations_identity_check
      CHECK (identity_status IN ('canonical','provisional','conflicted')) NOT VALID;
  END IF;
END $$`,
  `ALTER TABLE fatedrop_retailer_locations VALIDATE CONSTRAINT fatedrop_retailer_locations_category_check`,
  `ALTER TABLE fatedrop_retailer_locations VALIDATE CONSTRAINT fatedrop_retailer_locations_operational_check`,
  `ALTER TABLE fatedrop_retailer_locations VALIDATE CONSTRAINT fatedrop_retailer_locations_seller_check`,
  `ALTER TABLE fatedrop_retailer_locations VALIDATE CONSTRAINT fatedrop_retailer_locations_confidence_check`,
  `ALTER TABLE fatedrop_retailer_locations VALIDATE CONSTRAINT fatedrop_retailer_locations_identity_check`,
  `CREATE INDEX IF NOT EXISTS fatedrop_retailer_locations_bounds_idx
  ON fatedrop_retailer_locations (latitude, longitude)`,
  `CREATE INDEX IF NOT EXISTS fatedrop_retailer_locations_postcode_idx
  ON fatedrop_retailer_locations (UPPER(REPLACE(postcode, ' ', '')))
  WHERE postcode IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS fatedrop_retailer_locations_radar_eligibility_idx
  ON fatedrop_retailer_locations (operational_status, identity_status, tcg_seller_status, retailer_category)`,
  `CREATE TABLE IF NOT EXISTS fatedrop_retailer_location_sources (
  evidence_id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES fatedrop_retailer_locations(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_id TEXT,
  source_url TEXT,
  observed_at BIGINT NOT NULL,
  checked_at BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted'
    CHECK (status IN ('accepted','rejected','superseded')),
  confidence SMALLINT NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (location_id, provider, provider_id)
)`,
  `CREATE INDEX IF NOT EXISTS fatedrop_retailer_location_sources_location_idx
  ON fatedrop_retailer_location_sources (location_id, status, checked_at DESC)`,
  `CREATE TABLE IF NOT EXISTS fatedrop_retailer_location_conflicts (
  conflict_id TEXT PRIMARY KEY,
  location_id TEXT REFERENCES fatedrop_retailer_locations(id) ON DELETE CASCADE,
  conflicting_location_id TEXT REFERENCES fatedrop_retailer_locations(id) ON DELETE CASCADE,
  canonical_key TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  conflicting_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at BIGINT NOT NULL,
  resolved_at BIGINT,
  resolution JSONB NOT NULL DEFAULT '{}'::jsonb,
  CHECK (location_id IS NOT NULL OR conflicting_location_id IS NOT NULL)
)`,
  `CREATE INDEX IF NOT EXISTS fatedrop_retailer_location_conflicts_open_idx
  ON fatedrop_retailer_location_conflicts (status, created_at DESC)
  WHERE status='open'`,
] as const;

const EXPECTED_COLUMNS = [
  "retailer_category",
  "store_format",
  "operational_status",
  "tcg_seller_status",
  "tcg_seller_confidence",
  "identity_status",
  "last_verified_at",
] as const;

const EXPECTED_CONSTRAINTS = [
  "fatedrop_retailer_locations_category_check",
  "fatedrop_retailer_locations_operational_check",
  "fatedrop_retailer_locations_seller_check",
  "fatedrop_retailer_locations_confidence_check",
  "fatedrop_retailer_locations_identity_check",
] as const;

const EXPECTED_INDEXES = [
  "fatedrop_retailer_locations_bounds_idx",
  "fatedrop_retailer_locations_postcode_idx",
  "fatedrop_retailer_locations_radar_eligibility_idx",
  "fatedrop_retailer_location_sources_location_idx",
  "fatedrop_retailer_location_conflicts_open_idx",
] as const;

async function verifyLocalRadarSchema(sql: Awaited<ReturnType<typeof fateDropPostgres>>) {
  const columnRows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='fatedrop_retailer_locations'
      AND column_name = ANY(${EXPECTED_COLUMNS as unknown as string[]})`;
  const columns = new Set(columnRows.map((row) => String(row.column_name)));
  if (columns.size !== EXPECTED_COLUMNS.length) {
    throw new Error(`Local Radar production migration verification failed: expected ${EXPECTED_COLUMNS.length} location evidence columns, found ${columns.size}.`);
  }

  const tableRows = await sql`
    SELECT
      to_regclass('public.fatedrop_retailer_location_sources')::text AS sources_table,
      to_regclass('public.fatedrop_retailer_location_conflicts')::text AS conflicts_table`;
  if (!tableRows[0]?.sources_table || !tableRows[0]?.conflicts_table) {
    throw new Error("Local Radar production migration verification failed: evidence/conflict tables are missing.");
  }

  const constraintRows = await sql`
    SELECT conname
    FROM pg_constraint
    WHERE conname = ANY(${EXPECTED_CONSTRAINTS as unknown as string[]})`;
  const constraints = new Set(constraintRows.map((row) => String(row.conname)));
  if (constraints.size !== EXPECTED_CONSTRAINTS.length) {
    throw new Error(`Local Radar production migration verification failed: expected ${EXPECTED_CONSTRAINTS.length} location constraints, found ${constraints.size}.`);
  }

  const indexRows = await sql`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname='public'
      AND indexname = ANY(${EXPECTED_INDEXES as unknown as string[]})`;
  const indexes = new Set(indexRows.map((row) => String(row.indexname)));
  if (indexes.size !== EXPECTED_INDEXES.length) {
    throw new Error(`Local Radar production migration verification failed: expected ${EXPECTED_INDEXES.length} indexes, found ${indexes.size}.`);
  }
}

async function runLocalRadarProductionMigration() {
  const sql = await fateDropPostgres();
  await sql`CREATE TABLE IF NOT EXISTS fatedrop_schema_migrations (migration_id text PRIMARY KEY, applied_at bigint NOT NULL)`;

  const beforeRows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_retailer_locations`;
  const beforeLocationCount = Number(beforeRows[0]?.count ?? -1);
  if (!Number.isFinite(beforeLocationCount) || beforeLocationCount < 0) {
    throw new Error("Local Radar production migration preflight could not count canonical retailer locations.");
  }

  const appliedRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations WHERE migration_id=${LOCAL_RADAR_MIGRATION_ID} LIMIT 1`;
  let newlyApplied = false;

  if (!appliedRows[0]) {
    for (const statement of LOCAL_RADAR_MIGRATION_STATEMENTS) await sql.query(statement);
    await verifyLocalRadarSchema(sql);

    const afterMigrationRows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_retailer_locations`;
    const afterMigrationLocationCount = Number(afterMigrationRows[0]?.count ?? -1);
    if (afterMigrationLocationCount !== beforeLocationCount) {
      throw new Error(`Local Radar production migration changed canonical retailer location count (${beforeLocationCount} -> ${afterMigrationLocationCount}).`);
    }

    await sql`INSERT INTO fatedrop_schema_migrations (migration_id,applied_at)
      VALUES (${LOCAL_RADAR_MIGRATION_ID},${Math.floor(Date.now()/1000)})
      ON CONFLICT (migration_id) DO NOTHING`;
    newlyApplied = true;
  }

  await verifyLocalRadarSchema(sql);
  const finalRows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_retailer_locations`;
  const finalLocationCount = Number(finalRows[0]?.count ?? -1);
  if (finalLocationCount !== beforeLocationCount) {
    throw new Error(`Local Radar production migration verification detected a retailer location count change (${beforeLocationCount} -> ${finalLocationCount}).`);
  }

  const ledgerRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations WHERE migration_id=${LOCAL_RADAR_MIGRATION_ID} LIMIT 1`;
  if (!ledgerRows[0]) throw new Error("Local Radar production migration verification failed: migration ledger entry is missing.");

  return {
    localRadarMigrationId: LOCAL_RADAR_MIGRATION_ID,
    localRadarMigrationApplied: newlyApplied,
    localRadarSchemaVerified: true,
    localRadarLocationCountBefore: beforeLocationCount,
    localRadarLocationCountAfter: finalLocationCount,
  };
}

export async function runProductionMigrationsWithLocalRadar() {
  const base = await runProductionMigrations();
  const localRadar = await runLocalRadarProductionMigration();
  return { ...base, ...localRadar };
}
